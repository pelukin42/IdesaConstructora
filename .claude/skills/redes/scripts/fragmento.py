#!/usr/bin/env python3
"""Genera el fragmento HTML para publicar el sitio como Artifact y lista los archivos que lo acompañan.

  python3 -I fragmento.py RAIZ_DEL_SITIO SALIDA.html

Quita doctype/html/head/body, conserva el <title>, las fuentes y la hoja de estilos, y escribe
en la salida el contenido del <body>. Imprime en JSON el mapa `files` para la herramienta Artifact
(css, js e imágenes del sitio, incluidas las fotos nuevas de img/).
"""
import json
import os
import re
import sys

TITULO = "Constructora IDESA"
PUBLICAR = (".css", ".js", ".png", ".jpg", ".jpeg", ".webp", ".svg")


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
    for carpeta in ("css", "js", "img"):
        base = os.path.join(raiz, carpeta)
        for dirpath, _, nombres in os.walk(base):
            for n in sorted(nombres):
                if n.lower().endswith(PUBLICAR):
                    rel = os.path.relpath(os.path.join(dirpath, n), raiz).replace(os.sep, "/")
                    files[rel] = rel
    print(json.dumps(files, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
