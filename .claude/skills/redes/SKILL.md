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
1. **Originales (lo mejor):** en Instagram, Centro de cuentas > Tu información y permisos > Descargar tu información
   (los nombres de los menús pueden variar). Entrega las fotos en calidad completa, en carpetas anidadas;
   las herramientas las recorren con sus subcarpetas. Desde la cuenta de empresa también se pueden guardar las imágenes de cada publicación.
2. **Capturas del perfil:** desde su teléfono o computador con la sesión abierta, capturas de la cuadrícula
   que muestren al menos dos filas completas. Sirven para la galería; para la portada hacen falta originales.
3. **Enlaces directos a imágenes** que la persona copie de sus propias publicaciones: se pueden descargar con curl
   si la red del entorno lo permite.

Las imágenes adjuntas en el chat quedan guardadas en una carpeta `images/` de la sesión; la ruta aparece en la conversación.

## Carpetas y comandos
- **Trabajo (fuera del repositorio):** `/tmp/redes-trabajo/` con `originales/`, `recortes/` y `elegidas/`. El repositorio ignora una carpeta `trabajo/` por si alguien la crea dentro.
- **Fotos finales:** `img/obras/` (solo las salidas de `optimizar`). Los originales no se dejan en `img/`: pueden traer ubicación GPS y no se publican.
- **Herramientas:** `H=.claude/skills/redes/scripts`, ejecutadas desde la raíz del repositorio. Se necesita Python 3 con Pillow y numpy. HEIC no se lee: pedir la foto en JPG o PNG.

## Flujo
1. **Inventario.** `python3 -I $H/fotos.py inventario /tmp/redes-trabajo`. Marca baja resolución, desenfoque,
   exposición extrema, capturas de pantalla y cuadrículas de perfil.
2. **Recortar capturas.** `python3 -I $H/fotos.py recortar captura.png --out /tmp/redes-trabajo/recortes`.
   Contar y mirar los recortes: tienen que ser miniaturas completas, del mismo tamaño y sin cabecera. Si salen pocos o cortados,
   pedir una captura que muestre solo la cuadrícula con dos filas completas o, mejor, los originales.
3. **Elegir.** `python3 -I $H/fotos.py ranking /tmp/redes-trabajo/originales /tmp/redes-trabajo/recortes --top 20`
   (acepta varias carpetas) ordena por calidad técnica, señala duplicadas y deja fuera las capturas de pantalla.
   El puntaje no decide solo: abrir las mejores con Read, mirarlas y elegir por contenido
   (obra terminada y bien encuadrada, variedad de tipos, luz natural). Evitar fotos con personas identificables.
4. **Clasificar y ordenar.** Copiar las elegidas a `/tmp/redes-trabajo/elegidas/` con nombres descriptivos (`casa-dos-niveles.jpg`) y
   asignar cada una a un tipo: `casa`, `ampliacion`, `remodelacion`, `comercial` o `muros`. El orden en `obras` importa en el mosaico:
   los lugares 1, 4 y 7 son horizontales (4:3), el 3 y el 9 verticales; las capturas de baja resolución no van en el lugar 1.
5. **Optimizar.** `python3 -I $H/fotos.py optimizar /tmp/redes-trabajo/elegidas --out img/obras` genera JPG de hasta 1600 px de ancho,
   orientado y sin metadatos (se elimina el GPS). Con `--reemplazar` se sobrescribe un archivo del mismo nombre; si no, se agrega `-2`.
6. **Conectar en `js/config.js`:**
   - `fotos`: la imagen principal por tipo, por ejemplo `casa: "img/obras/casa-dos-niveles.jpg"` (órbita de la portada y vista rápida de servicios).
   - `obras`: la galería. Cada entrada lleva `tipo`, `titulo` (descriptivo, sin inventar), `foto` y, solo
     si la persona los confirmó, `zona`, `area` y `estado`. Las entradas sin foto siguen mostrando la tarjeta de marca y la maqueta 3D.
   - `foco` (opcional por obra): el punto que no debe cortarse, por ejemplo `foco: "50% 30%"`. Las tarjetas recortan: el carrusel 3D (1:1.28) deja ver cerca de la mitad
     de una foto 3:2 y el mosaico depende del lugar.
   - `demo`: dejarlo en `true` hasta que la persona confirme los datos pendientes; mientras tanto se ve «Por confirmar» y el aviso de propuesta.
     La nota «Las tarjetas de marca se reemplazan…» se oculta sola cuando todas las obras tienen foto.
7. **Verificar.** `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node $H/verificar.js . /tmp/redes-capturas` (no ejecutar `playwright install`).
   Toma capturas de escritorio y móvil del carrusel 3D (`#obras`), servicios, mosaico (`#galeria`), visor de obra (`#ov`, pestañas Foto y Maqueta 3D),
   y avisa de errores de consola, scroll horizontal e imágenes rotas. Mirar las capturas: recorte de cada tarjeta, texto legible sobre fotos claras, ninguna foto deformada.
   La cinta clásica de obras (`#ribbon`) solo se ve con «reducir movimiento» activado; el carrusel 3D la reemplaza.
8. **Publicar.**
   - `python3 -I $H/fragmento.py . RUTA/idesa-constructora.html` genera el fragmento e imprime el mapa `files` (css, js y solo las imágenes que el sitio usa).
     Avisa de archivos sobrantes, de más de 15 MB, de más de 64 MB en total y de JPG con GPS.
   - Publicar con la herramienta Artifact con ese archivo, ese mapa `files` y `root` en la raíz del repositorio. Para actualizar el artifact existente
     (https://claude.ai/artifact/LBsuKyP6arh6aBgykMSw5M) usar la misma ruta del archivo o su URL, leyéndolo antes con `action: "read"`.
   - El artifact no incluye las animaciones de aparición (`.rv`) ni los datos estructurados del `<head>`; el sitio publicado desde el repositorio sí.
9. **Guardar el trabajo.** Commit en la rama de desarrollo con los trailers de atribución de la sesión y push.
   Subir a `main` solo si la persona lo pidió.

## Qué decirle a la persona al terminar
- Cuántas fotos se usaron, cuáles quedaron como principal de cada tipo y cuáles se descartaron y por qué.
- Los datos de obra que siguen en «Por confirmar» (zona, área, estado) para que los complete.
- Si alguna foto salió de una captura, que su calidad es menor y conviene reemplazarla por el original.
