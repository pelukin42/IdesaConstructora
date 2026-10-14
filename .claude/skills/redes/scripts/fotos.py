#!/usr/bin/env python3
"""Herramientas de la habilidad /redes: preparar las fotos de IDESA para el sitio.

Solo trabaja con archivos locales que la persona ya aportó (capturas, descargas,
exportación de Instagram). No se conecta a ninguna red social.

Uso (con -I para no cargar código de la carpeta de trabajo):
  python3 -I fotos.py inventario CARPETA_O_ARCHIVOS...
  python3 -I fotos.py recortar CAPTURA.png --out CARPETA [--cols 3]
  python3 -I fotos.py ranking CARPETA_O_ARCHIVOS... [--top 20] [--con-capturas]
  python3 -I fotos.py revisar CARPETA_O_ARCHIVOS... --out CARPETA [--lado 800]
  python3 -I fotos.py optimizar ARCHIVOS... --out img/obras [--ancho 1600] [--calidad 82] [--reemplazar]
Las carpetas se recorren con sus subcarpetas.
"""
import argparse
import json
import os
import re
import sys
import unicodedata

import numpy as np
from PIL import Image, ImageOps

EXT = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".bmp", ".tif", ".tiff"}


# ---------------------------------------------------------------- utilidades
def listar(rutas):
    """Expande carpetas y archivos a una lista ordenada de imágenes."""
    out = []
    for r in rutas:
        if os.path.isdir(r):
            # recursivo: la exportación de Instagram guarda las fotos en carpetas anidadas
            for raiz, dirs, nombres in os.walk(r):
                dirs[:] = sorted(d for d in dirs if not d.startswith("."))
                for n in sorted(nombres):
                    if os.path.splitext(n)[1].lower() in EXT:
                        out.append(os.path.join(raiz, n))
        elif os.path.isfile(r):
            out.append(r)
        else:
            print(f"AVISO: no existe {r}", file=sys.stderr)
    return out


def abrir(ruta):
    try:
        im = Image.open(ruta)
    except Exception as e:
        if ruta.lower().endswith((".heic", ".heif")):
            raise RuntimeError("HEIC no soportado aquí: exportar la foto a JPG o PNG") from e
        raise
    im = ImageOps.exif_transpose(im)
    if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
        im = im.convert("RGBA")
        fondo = Image.new("RGBA", im.size, (255, 255, 255, 255))
        im = Image.alpha_composite(fondo, im)  # la transparencia se compone sobre blanco, no negro
    return im.convert("RGB")


def gris(im, lado=900):
    """Gris con el lado largo normalizado, para que la nitidez no dependa de la resolución."""
    g = im.convert("L")
    k = lado / max(g.size)
    g = g.resize((max(3, round(g.width * k)), max(3, round(g.height * k))), Image.LANCZOS)
    return np.asarray(g, dtype=np.float64)


def nitidez(g):
    """Varianza del laplaciano: más alto = más enfocada."""
    if min(g.shape) < 3:
        return 0.0
    lap = (-4 * g[1:-1, 1:-1] + g[:-2, 1:-1] + g[2:, 1:-1] + g[1:-1, :-2] + g[1:-1, 2:])
    return float(lap.var())


def dhash(im, n=8):
    g = im.convert("L").resize((n + 1, n), Image.LANCZOS)
    a = np.asarray(g, dtype=np.int16)
    return (a[:, 1:] > a[:, :-1]).flatten()


def hamming(a, b):
    return int(np.count_nonzero(a != b))


def slug(texto):
    t = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    t = re.sub(r"[^a-zA-Z0-9]+", "-", t).strip("-").lower()
    return t or "foto"


# ---------------------------------------------------------------- cuadrícula
def _fondo(a):
    """Color de fondo = el más frecuente en el borde de la imagen."""
    borde = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]).reshape(-1, 3)
    q = (borde // 8).astype(np.int32)
    llaves, cuentas = np.unique(q, axis=0, return_counts=True)
    return llaves[cuentas.argmax()] * 8 + 4


def _tramos(mask_ok, min_len):
    """Tramos consecutivos True de longitud >= min_len, como (inicio, fin) exclusivo."""
    out, ini = [], None
    for i, v in enumerate(np.append(mask_ok, False)):
        if v and ini is None:
            ini = i
        elif not v and ini is not None:
            if i - ini >= min_len:
                out.append((ini, i))
            ini = None
    return out


def detectar_cuadricula(im, cols=3, min_lado=80, tol=14):
    """Devuelve la lista de recuadros (x0, y0, x1, y1) de las fotos de una captura de perfil.

    Busca los canales finos del color de fondo que separan las miniaturas; descarta
    la cabecera del perfil (textos, historias destacadas) y las filas incompletas.
    """
    a = np.asarray(im, dtype=np.int16)
    bg = _fondo(a)
    es_fondo = (np.abs(a - bg).max(axis=2) <= tol)
    # 1) columnas: se miden solo en las filas que no son casi todo fondo
    # primero las filas densas (casi todo el ancho es foto): así los botones y textos de la cabecera
    # no ensucian la medida de las columnas; si no hay suficientes, se usa el criterio amplio
    filas_foto = es_fondo.mean(axis=1) <= 0.1
    if filas_foto.sum() < min_lado:
        filas_foto = es_fondo.mean(axis=1) < 0.5
    if filas_foto.sum() < min_lado:
        return []
    col_fondo = es_fondo[filas_foto].mean(axis=0)
    tramos_x = _tramos(col_fondo < 0.9, min_lado)
    if not tramos_x:
        return []
    # nos quedamos con las `cols` columnas de ancho parecido más frecuente
    anchos = np.array([f - i for i, f in tramos_x])
    mediana = np.median(anchos)
    tramos_x = [t for t in tramos_x if abs((t[1] - t[0]) - mediana) <= 0.2 * mediana]
    if len(tramos_x) != cols:
        return []
    x_ini, x_fin = tramos_x[0][0], tramos_x[-1][1]
    # 2) filas: se miden solo dentro de la zona de columnas
    fila_fondo = np.mean(np.concatenate([es_fondo[:, i:f] for i, f in tramos_x], axis=1), axis=1)
    tramos_y = _tramos(fila_fondo < 0.9, min_lado)
    if not tramos_y:
        return []
    # Las filas de una cuadrícula van pegadas, separadas por la misma brecha que las columnas;
    # la cabecera (avatar, historias, botones) no cumple eso. Se toma la cadena más larga de
    # tramos consecutivos y se descartan las filas cortadas arriba o abajo por el borde de la captura.
    brecha = max(0, tramos_x[1][0] - tramos_x[0][1])
    cadenas, actual = [], [tramos_y[0]]
    for t in tramos_y[1:]:
        if abs((t[0] - actual[-1][1]) - brecha) <= 3:
            actual.append(t)
        else:
            cadenas.append(actual)
            actual = [t]
    cadenas.append(actual)
    ancho = tramos_x[0][1] - tramos_x[0][0]
    mejor = []
    for c in cadenas:
        ref = max(f - i for i, f in c)
        if not 0.6 * ancho <= ref <= 1.6 * ancho:
            continue
        completas = [t for t in c if (t[1] - t[0]) >= ref - 3]
        if len(completas) > len(mejor):
            mejor = completas
    tramos_y = mejor
    cajas = []
    for (y0, y1) in tramos_y:
        for (x0, x1) in tramos_x:
            cajas.append((x0, y0, x1, y1))
    return cajas


def cmd_recortar(args):
    im = abrir(args.captura)
    cajas = detectar_cuadricula(im, cols=args.cols)
    if not cajas:
        print("No se detectó una cuadrícula de miniaturas. Probar con --cols distinto, "
              "o una captura que muestre solo la cuadrícula del perfil.")
        return 1
    os.makedirs(args.out, exist_ok=True)
    base = slug(os.path.splitext(os.path.basename(args.captura))[0])
    res = []
    for n, (x0, y0, x1, y1) in enumerate(cajas, 1):
        t = im.crop((x0 + 1, y0 + 1, x1 - 1, y1 - 1))
        dest = os.path.join(args.out, f"{base}-{n:02d}.png")
        t.save(dest)
        res.append({"archivo": dest, "ancho": t.width, "alto": t.height})
    print(json.dumps(res, ensure_ascii=False, indent=1))
    print(f"\n{len(res)} miniaturas guardadas en {args.out}. "
          "Son recortes de una captura: sirven para la galería, pero para la portada "
          "conviene pedir la foto original.")
    return 0


def fraccion_plana(im):
    """Fracción de píxeles del color más frecuente: las capturas de pantalla tienen grandes zonas planas."""
    t = im.copy(); t.thumbnail((200, 200))
    q = (np.asarray(t, dtype=np.int32) // 16).reshape(-1, 3)
    _, c = np.unique(q, axis=0, return_counts=True)
    return float(c.max() / len(q))


def parece_captura(im, cuadricula=None):
    """Captura de pantalla (de un teléfono o del perfil) y no una foto de obra.

    Solo se decide sola cuando es claro: cuadrícula de perfil o proporción de teléfono (2:1 o más).
    Una foto vertical 9:16 con cielo o pared lisa se deja pasar: es común en historias y reels."""
    asp = im.height / im.width
    if cuadricula is None:
        cuadricula = len(detectar_cuadricula(im))
    return bool(cuadricula >= 6 or asp >= 1.9)


def dudosa_captura(im):
    """Vertical con grandes zonas planas: puede ser una captura, pero también una foto de obra con cielo."""
    asp = im.height / im.width
    return bool(1.6 <= asp < 1.9 and fraccion_plana(im) >= .45)


# ---------------------------------------------------------------- inventario
def info(ruta):
    im = abrir(ruta)
    g = gris(im)
    d = {
        "archivo": ruta,
        "ancho": im.width,
        "alto": im.height,
        "peso_kb": round(os.path.getsize(ruta) / 1024),
        "nitidez": round(nitidez(g), 1),
        "brillo": round(float(g.mean()), 1),
        "contraste": round(float(g.std()), 1),
    }
    cuad = len(detectar_cuadricula(im))
    d["posible_captura_de_perfil"] = bool(cuad >= 6)
    d["captura"] = parece_captura(im, cuad)
    d["dudosa"] = dudosa_captura(im)
    avisos = []
    if min(im.size) < 800:
        avisos.append("baja resolución")
    if d["nitidez"] < 40:
        avisos.append("posible desenfoque")
    if d["brillo"] < 45:
        avisos.append("muy oscura")
    if d["brillo"] > 215:
        avisos.append("muy clara")
    if d["posible_captura_de_perfil"]:
        avisos.append("parece cuadrícula de perfil: usar recortar")
    elif d["captura"]:
        avisos.append("parece captura de pantalla: no usar como foto de obra")
    elif d["dudosa"]:
        avisos.append("revisar: vertical con zonas lisas, puede ser captura o foto con cielo")
    d["avisos"] = avisos
    return d


def cmd_inventario(args):
    rutas = listar(args.rutas)
    if not rutas:
        print("No hay imágenes.")
        return 1
    filas = []
    for r in rutas:
        try:
            filas.append(info(r))
        except Exception as e:  # archivo dañado o formato no soportado
            print(f"AVISO: no se pudo leer {r}: {e}", file=sys.stderr)
    if not filas:
        print("No se pudo leer ninguna imagen.", file=sys.stderr)
        return 1
    if args.json:
        print(json.dumps(filas, ensure_ascii=False, indent=1))
    else:
        for d in filas:
            print(f"{d['archivo']}  {d['ancho']}x{d['alto']}  {d['peso_kb']} KB  "
                  f"nitidez {d['nitidez']}  brillo {d['brillo']}  "
                  f"{'; '.join(d['avisos']) or 'ok'}")
    return 0


# ---------------------------------------------------------------- ranking
def puntaje(d):
    s_nit = min(1.0, np.log10(d["nitidez"] + 1) / 3.0)
    s_res = min(1.0, min(d["ancho"], d["alto"]) / 1200.0)
    b = d["brillo"]
    s_exp = 1.0 if 70 <= b <= 190 else max(0.0, 1 - min(abs(b - 130) / 130, 1))
    s_con = min(1.0, d["contraste"] / 60.0)
    return round(0.40 * s_nit + 0.30 * s_res + 0.20 * s_exp + 0.10 * s_con, 3)


def cmd_ranking(args):
    rutas = listar(args.rutas)
    if not rutas:
        print("No hay imágenes en esas rutas (se buscan también en subcarpetas).", file=sys.stderr)
        return 1
    items, capturas = [], []
    for r in rutas:
        try:
            im = abrir(r)
            d = info(r)
            if d["captura"] and not args.con_capturas:
                capturas.append(r)  # capturas de pantalla: no compiten como fotos de obra
                continue
            d["puntaje"] = puntaje(d)
            d["_h"] = dhash(im)
            items.append(d)
        except Exception as e:
            print(f"AVISO: no se pudo leer {r}: {e}", file=sys.stderr)
    if not items:
        print("Ninguna imagen sirve como foto de obra (todas parecen capturas o no se pudieron leer). "
              "Usar recortar sobre las capturas del perfil, o --con-capturas.", file=sys.stderr)
        return 1
    items.sort(key=lambda d: d["puntaje"], reverse=True)
    elegidas, dup = [], {}
    for d in items:
        igual = next((e for e in elegidas if hamming(e["_h"], d["_h"]) <= args.dup), None)
        if igual:
            dup[d["archivo"]] = igual["archivo"]
        else:
            elegidas.append(d)
    salida = []
    for d in elegidas[: args.top]:
        d = {k: v for k, v in d.items() if k != "_h"}
        salida.append(d)
    print(json.dumps({"mejores": salida, "duplicadas": dup, "capturas_excluidas": capturas}, ensure_ascii=False, indent=1))
    print("\nEl puntaje solo mide técnica (nitidez, resolución, exposición). "
          "La elección final es visual: mirar las mejores y decidir qué obra muestra cada una.",
          file=sys.stderr)
    return 0


# ---------------------------------------------------------------- optimizar
def cmd_optimizar(args):
    rutas = listar(args.rutas)
    if not rutas:
        print("No hay imágenes.")
        return 1
    os.makedirs(args.out, exist_ok=True)
    usados = set(os.listdir(args.out))
    res = []
    for r in rutas:
        try:
            im = abrir(r)
        except Exception as e:
            print(f"AVISO: no se pudo leer {r}: {e}", file=sys.stderr)
            continue
        if im.width > args.ancho:
            im = im.resize((args.ancho, round(im.height * args.ancho / im.width)), Image.LANCZOS)
        base = slug(os.path.splitext(os.path.basename(r))[0])
        nombre, n = f"{base}.jpg", 2
        while nombre in usados and not args.reemplazar:
            nombre, n = f"{base}-{n}.jpg", n + 1
        usados.add(nombre)
        dest = os.path.join(args.out, nombre)
        # sin parámetro exif: se eliminan metadatos (ubicación GPS, cámara, fecha)
        im.save(dest, "JPEG", quality=args.calidad, optimize=True, progressive=True)
        res.append({"origen": r, "archivo": dest, "ancho": im.width, "alto": im.height,
                    "peso_kb": round(os.path.getsize(dest) / 1024)})
    if not res:
        print("No se generó ninguna imagen.", file=sys.stderr)
        return 1
    print(json.dumps(res, ensure_ascii=False, indent=1))
    return 0


# ---------------------------------------------------------------- revisar
def cmd_revisar(args):
    """Parte cada foto en recuadros al tamaño real para leer placas, números de casa, rótulos y rostros."""
    rutas = listar(args.rutas)
    if not rutas:
        print("No hay imágenes.", file=sys.stderr)
        return 1
    os.makedirs(args.out, exist_ok=True)
    for r in rutas:
        try:
            im = abrir(r)
        except Exception as e:
            print(f"AVISO: no se pudo leer {r}: {e}", file=sys.stderr)
            continue
        base = slug(os.path.splitext(os.path.basename(r))[0])
        lado = args.lado
        nx, ny = max(1, -(-im.width // lado)), max(1, -(-im.height // lado))
        for j in range(ny):
            for i in range(nx):
                x0, y0 = min(i * lado, max(0, im.width - lado)), min(j * lado, max(0, im.height - lado))
                im.crop((x0, y0, min(im.width, x0 + lado), min(im.height, y0 + lado))).save(
                    os.path.join(args.out, f"{base}-r{j + 1}{i + 1}.png"))
        print(f"{r}: {nx * ny} recuadros de {lado} px en {args.out}")
    print("Abrir cada recuadro con Read. Si se lee una placa, un número de casa o de medidor, un rótulo con nombre "
          "o se ve un rostro: recortar o descartar la foto.")
    return 0


# ---------------------------------------------------------------- principal
def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = p.add_subparsers(dest="cmd", required=True)

    a = sp.add_parser("inventario", help="tamaño, nitidez, brillo y avisos de cada imagen")
    a.add_argument("rutas", nargs="+")
    a.add_argument("--json", action="store_true")
    a.set_defaults(f=cmd_inventario)

    a = sp.add_parser("recortar", help="separa las fotos de una captura de la cuadrícula del perfil")
    a.add_argument("captura")
    a.add_argument("--out", required=True)
    a.add_argument("--cols", type=int, default=3)
    a.set_defaults(f=cmd_recortar)

    a = sp.add_parser("ranking", help="ordena por calidad técnica y marca duplicadas")
    a.add_argument("rutas", nargs="+")
    a.add_argument("--top", type=int, default=20)
    a.add_argument("--dup", type=int, default=6, help="distancia máxima para considerar dos fotos iguales")
    a.add_argument("--con-capturas", action="store_true", help="incluir en el ranking las capturas de pantalla")
    a.set_defaults(f=cmd_ranking)

    a = sp.add_parser("revisar", help="parte las fotos en recuadros al tamaño real para la revisión de privacidad")
    a.add_argument("rutas", nargs="+")
    a.add_argument("--out", required=True)
    a.add_argument("--lado", type=int, default=800)
    a.set_defaults(f=cmd_revisar)

    a = sp.add_parser("optimizar", help="JPG liviano, orientado y sin metadatos, listo para el sitio")
    a.add_argument("rutas", nargs="+")
    a.add_argument("--out", required=True)
    a.add_argument("--ancho", type=int, default=1600)
    a.add_argument("--calidad", type=int, default=82)
    a.add_argument("--reemplazar", action="store_true", help="sobrescribir si ya existe un archivo con el mismo nombre (si no, se agrega -2, -3...)")
    a.set_defaults(f=cmd_optimizar)

    args = p.parse_args()
    sys.exit(args.f(args))


if __name__ == "__main__":
    main()
