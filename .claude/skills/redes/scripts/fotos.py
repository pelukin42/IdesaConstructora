#!/usr/bin/env python3
"""Herramientas de la habilidad /redes: preparar las fotos de IDESA para el sitio.

Solo trabaja con archivos locales que la persona ya aportó (capturas, descargas,
exportación de Instagram). No se conecta a ninguna red social.

Uso (con -I para no cargar código de la carpeta de trabajo):
  python3 -I fotos.py inventario CARPETA_O_ARCHIVOS...
  python3 -I fotos.py recortar CAPTURA.png --out CARPETA [--cols 3]
  python3 -I fotos.py ranking CARPETA_O_ARCHIVOS... [--top 20]
  python3 -I fotos.py optimizar ARCHIVOS... --out img/obras [--ancho 1600] [--calidad 82]
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
            for n in sorted(os.listdir(r)):
                p = os.path.join(r, n)
                if os.path.isfile(p) and os.path.splitext(n)[1].lower() in EXT:
                    out.append(p)
        elif os.path.isfile(r):
            out.append(r)
        else:
            print(f"AVISO: no existe {r}", file=sys.stderr)
    return out


def abrir(ruta):
    im = Image.open(ruta)
    im = ImageOps.exif_transpose(im)
    return im.convert("RGB")


def gris(im, lado=900):
    g = im.convert("L")
    g.thumbnail((lado, lado))
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
    # miniaturas de la misma altura que la más repetida (la cabecera queda fuera)
    alto_ref = np.median([f - i for i, f in tramos_y if f - i <= 1.6 * (tramos_x[0][1] - tramos_x[0][0])] or [0])
    tramos_y = [t for t in tramos_y if alto_ref and abs((t[1] - t[0]) - alto_ref) <= 0.12 * alto_ref]
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
    d["posible_captura_de_perfil"] = bool(len(detectar_cuadricula(im)) >= 6)
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
    items = []
    for r in rutas:
        try:
            im = abrir(r)
            d = info(r)
            d["puntaje"] = puntaje(d)
            d["_h"] = dhash(im)
            items.append(d)
        except Exception as e:
            print(f"AVISO: no se pudo leer {r}: {e}", file=sys.stderr)
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
    print(json.dumps({"mejores": salida, "duplicadas": dup}, ensure_ascii=False, indent=1))
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
        while nombre in usados:
            nombre, n = f"{base}-{n}.jpg", n + 1
        usados.add(nombre)
        dest = os.path.join(args.out, nombre)
        # sin parámetro exif: se eliminan metadatos (ubicación GPS, cámara, fecha)
        im.save(dest, "JPEG", quality=args.calidad, optimize=True, progressive=True)
        res.append({"origen": r, "archivo": dest, "ancho": im.width, "alto": im.height,
                    "peso_kb": round(os.path.getsize(dest) / 1024)})
    print(json.dumps(res, ensure_ascii=False, indent=1))
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
    a.set_defaults(f=cmd_ranking)

    a = sp.add_parser("optimizar", help="JPG liviano, orientado y sin metadatos, listo para el sitio")
    a.add_argument("rutas", nargs="+")
    a.add_argument("--out", required=True)
    a.add_argument("--ancho", type=int, default=1600)
    a.add_argument("--calidad", type=int, default=82)
    a.set_defaults(f=cmd_optimizar)

    args = p.parse_args()
    sys.exit(args.f(args))


if __name__ == "__main__":
    main()
