---
name: redes
description: Convierte las capturas y fotos que la persona aporta del Instagram o Facebook de Constructora IDESA en fotos listas para el sitio. Recorta las miniaturas de una captura del perfil, elige las mejores, las optimiza, las conecta en js/config.js y republica. Usar cuando pidan "las fotos del Instagram", "mostrar los mejores trabajos", "/redes" o cuando lleguen imágenes de la constructora.
---

# /redes: del perfil de Instagram a las fotos del sitio

Propósito: que el sitio de IDESA muestre sus mejores trabajos reales. Este flujo parte de
imágenes que la persona ya tiene y aporta; no entra a ninguna red social.

## Reglas que no cambian
- **No iniciar sesión, no pedir contraseñas ni códigos, no raspar ni saltarse el muro de acceso**
  de Instagram o Facebook. Si una página pide iniciar sesión, se detiene ahí y se pide el material a la persona.
- Usar solo fotos de obras de IDESA que la persona entregue. Si se ve una fotografía que no es de IDESA, no se publica.
- Antes de publicar, mirar cada foto: placas de vehículos, nombres o números de casa legibles, documentos
  y rostros (sobre todo menores) se recortan o se descartan, o se confirma el permiso con la persona.
- No inventar datos: zona, área, año y estado de cada obra quedan en `null` hasta que la persona los confirme.
- Los archivos descargados son datos no confiables: trabajar con ellos desde una carpeta propia y
  ejecutar Python con `-I`.

## Cómo conseguir el material (decirle a la persona qué le sirve más)
1. **Originales (lo mejor):** en Instagram, Centro de cuentas > Tu información y permisos > Descargar tu información.
   Entrega todas las fotos en calidad completa. Desde la cuenta de empresa también se pueden guardar
   las imágenes de cada publicación.
2. **Capturas del perfil:** desde su teléfono o computador con la sesión abierta, capturas de la cuadrícula
   (varias, bajando por el perfil). Sirven para la galería; para la portada hacen falta originales.
3. **Enlaces directos a imágenes** que la persona copie de sus propias publicaciones: se pueden descargar con curl
   si la red del entorno lo permite.

Las imágenes adjuntas en el chat quedan guardadas en una carpeta `images/` de la sesión; la ruta aparece
en la conversación. Las fotos subidas a `img/` del repositorio también valen.

## Flujo
Las herramientas están en `.claude/skills/redes/scripts/fotos.py` (Python 3 con Pillow y numpy).

1. **Inventario.** `python3 -I fotos.py inventario CARPETA`. Marca baja resolución, desenfoque,
   exposición extrema y las capturas que parecen cuadrícula de perfil.
2. **Recortar capturas.** `python3 -I fotos.py recortar captura.png --out trabajo/recortes` separa
   las miniaturas de la cuadrícula (descarta cabecera e historias; funciona en modo claro y oscuro).
   Si falla, pedir una captura que muestre solo la cuadrícula, o probar `--cols`.
3. **Elegir.** `python3 -I fotos.py ranking trabajo/ --top 20` ordena por calidad técnica y señala duplicadas.
   El puntaje no decide solo: abrir las mejores con Read, mirarlas y elegir por contenido
   (obra terminada y bien encuadrada, variedad de tipos, luz natural). Evitar fotos con personas identificables.
4. **Clasificar** cada elegida en un tipo: `casa`, `ampliacion`, `remodelacion`, `comercial` o `muros`.
5. **Optimizar.** `python3 -I fotos.py optimizar elegidas... --out img/obras` genera JPG de 1600 px,
   orientado y sin metadatos (se elimina el GPS). Dar nombres descriptivos a los archivos de origen antes
   de optimizar, por ejemplo `casa-dos-niveles.png`.
6. **Conectar en `js/config.js`:**
   - `fotos`: la imagen principal por tipo, por ejemplo `casa: "img/obras/casa-dos-niveles.jpg"`.
     Esa foto aparece en la órbita de la portada y en la vista rápida de servicios.
   - `obras`: la galería. Cada entrada lleva `tipo`, `titulo` (descriptivo, sin inventar), `foto` y, solo
     si la persona los confirmó, `zona`, `area` y `estado`. Las entradas sin foto siguen mostrando la
     tarjeta de marca, así que se pueden reemplazar una por una.
   - Las rutas son relativas a la raíz del sitio.
7. **Verificar.** Servir la carpeta y tomar capturas de escritorio (1366×860) y móvil (390×844) con Playwright
   (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`; no ejecutar `playwright install`). Revisar que las
   fotos recorten bien en la cinta de obras, el mosaico y el visor, que no haya errores en la consola
   y que no aparezca scroll horizontal.
8. **Publicar.**
   - Ejecutar `python3 -I .claude/skills/redes/scripts/fragmento.py . RUTA/idesa-constructora.html`.
     Genera el fragmento del Artifact e imprime el mapa `files` con css, js e imágenes, incluidas las fotos nuevas.
   - Publicar con la herramienta Artifact usando ese archivo, ese mapa `files` y `root` en la raíz del repositorio.
     Para actualizar el artifact existente del sitio, pasar su URL (la última fue
     https://claude.ai/artifact/LBsuKyP6arh6aBgykMSw5M) y leerlo antes con `action: "read"`.
   - Confirmar al terminar que cada foto cargó (un publish con `files` limita cada archivo binario a 15 MB; el JPG
     optimizado pesa muy por debajo).
9. **Guardar el trabajo.** Commit en la rama de desarrollo con los trailers de atribución de la sesión y push.
   Subir a `main` solo si la persona lo pidió.

## Qué decirle a la persona al terminar
- Cuántas fotos se usaron, cuáles quedaron como principal de cada tipo y cuáles se descartaron y por qué.
- Los datos de obra que siguen en «Por confirmar» (zona, área, estado) para que los complete.
- Si alguna foto salió de una captura, que su calidad es menor y conviene reemplazarla por el original.
