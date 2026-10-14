#!/usr/bin/env python3
"""Genera el fragmento HTML para publicar el sitio como Artifact y lista los archivos que lo acompañan.

  python3 -I fragmento.py RAIZ_DEL_SITIO SALIDA.html

Quita doctype/html/head/body, conserva el <title>, las fuentes y la hoja de estilos, y escribe
en la salida el contenido del <body>. Imprime en JSON el mapa `files` para la herramienta Artifact
(css, js y las imágenes que el sitio usa, incluidas las fotos nuevas). Avisa por stderr de archivos
sobrantes y termina con código 1 (no publicar) si hay archivos de más de 15 MB, más de 64 MB en total,
más de 255 archivos o JPG con ubicación GPS.
"""
import json
import os
import re
import sys
import urllib.parse

TITULO = "Constructora IDESA"
PUBLICAR = (".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif")


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    raiz, salida = sys.argv[1], sys.argv[2]
    src = open(os.path.join(raiz, "index.html"), encoding="utf-8").read()
    head = re.search(r"<head[\s>].*?</head>", src, re.S).group(0)
    body = re.search(r"<body[^>]*>(.*)</body>", src, re.S).group(1)
    fuentes = re.findall(r"<link[^>]+fonts\.(?:googleapis|gstatic)[^>]*>", head)
    css = re.findall(r'<link[^>]+href="css/[^"]+\.css"[^>]*>', head)
    frag = (f"<title>{TITULO}</title>\n"
            '<meta name="claude:viewport-fit-sides" content="cover">\n'
            + "\n".join(fuentes + css) + "\n" + body.strip() + "\n")
    for malo in ("<!doctype", "<html", "<head", "<body"):
        assert not re.search(re.escape(malo) + r"[\s>]", frag, re.I), malo
    open(salida, "w", encoding="utf-8").write(frag)

    files = {}
    for carpeta in ("css", "js"):
        for dirpath, _, nombres in os.walk(os.path.join(raiz, carpeta)):
            for n in sorted(nombres):
                if n.lower().endswith((".css", ".js")):
                    rel = os.path.relpath(os.path.join(dirpath, n), raiz).replace(os.sep, "/")
                    files[rel] = rel
    # imágenes: solo las que el HTML, el CSS o el JS mencionan (los originales sueltos en img/ no se publican)
    texto = src
    for rel in list(files):
        texto += open(os.path.join(raiz, rel), encoding="utf-8", errors="ignore").read()
    citadas = {urllib.parse.unquote(m) for m in re.findall(r"""(img/[^"'()\s?#<>]+\.(?:png|jpe?g|webp|svg|gif))""", texto, re.I)}
    for rel in sorted(citadas):
        if os.path.isfile(os.path.join(raiz, rel)):
            files[rel] = rel
        else:
            print(f"AVISO: el sitio menciona {rel} pero el archivo no existe", file=sys.stderr)
    sobrantes = []
    for dirpath, _, nombres in os.walk(os.path.join(raiz, "img")):
        for n in nombres:
            rel = os.path.relpath(os.path.join(dirpath, n), raiz).replace(os.sep, "/")
            if n.lower().endswith(PUBLICAR) and rel not in files:
                sobrantes.append(rel)
    if sobrantes:
        print("AVISO: no se publican (nadie los usa): " + ", ".join(sorted(sobrantes)), file=sys.stderr)
    total, bloquea = 0, False
    if len(files) > 255:
        print(f"AVISO: {len(files)} archivos superan los 255 de una publicación", file=sys.stderr); bloquea = True
    for rel in sorted(files):
        ruta = os.path.join(raiz, rel); peso = os.path.getsize(ruta); total += peso
        if peso > 15 * 1024 * 1024:
            print(f"AVISO: {rel} pesa {peso / 1048576:.1f} MB y supera el límite de 15 MB por archivo", file=sys.stderr); bloquea = True
        if rel.lower().endswith((".jpg", ".jpeg")):
            try:
                from PIL import Image
                if 34853 in (Image.open(ruta).getexif() or {}):
                    print(f"AVISO: {rel} conserva ubicación GPS; pasarla por fotos.py optimizar", file=sys.stderr); bloquea = True
            except Exception:
                pass
    if total > 64 * 1024 * 1024:
        print(f"AVISO: el total pesa {total / 1048576:.1f} MB y supera los 64 MB de una publicación", file=sys.stderr); bloquea = True
    print(json.dumps(files, ensure_ascii=False, indent=1))
    if bloquea:
        print("NO PUBLICAR: corregir los avisos y repetir.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
