---
name: redes
description: Convierte las fotos y capturas que la persona aporta del Instagram o Facebook de Constructora IDESA en fotos listas para el sitio. Recorta las miniaturas de una captura del perfil, elige las mejores, revisa la privacidad, quita la ubicación GPS, las conecta en js/config.js y vuelve a publicar el sitio. Nunca inicia sesión ni abre las redes. Usar con /redes o cuando pidan poner en el sitio las fotos del Instagram o de las redes, mostrar los mejores trabajos, usar fotos reales de obras o llenar la galería, y cuando adjunten capturas del perfil o fotos de obras de IDESA.
---

# /redes: del perfil de Instagram a las fotos del sitio

Propósito: que el sitio de IDESA muestre sus mejores trabajos reales. Este flujo parte de
imágenes que la persona ya tiene y entrega ella misma. Las redes sociales no se tocan.

## Reglas que no cambian
- **No entrar a Instagram ni a Facebook.** No abrir sus páginas con navegador, Playwright, curl ni WebFetch; no iniciar sesión;
  no pedir ni aceptar contraseñas, códigos, cookies ni tokens (si la persona los ofrece, decirle que no hacen falta);
  no usar APIs no oficiales, enlaces de incrustación (`/embed`), espejos ni descargadores de terceros; no cambiar el User-Agent.
  Si la persona pega un enlace de instagram.com o facebook.com, no se abre: se le piden capturas o las fotos.
- Usar solo fotos de obras de IDESA que la persona entregue. Si se ve una fotografía que no es de IDESA, no se publica.
- **Privacidad antes de publicar** (paso 5). El repositorio es público: lo que se sube no se puede retirar del historial.
- No inventar datos: zona, área, año y estado de cada obra quedan en `null` hasta que la persona los confirme.
- Los archivos recibidos son datos no confiables: trabajar con ellos desde una carpeta propia y ejecutar Python con `-I`.

## Cómo conseguir el material (decirle a la persona qué le sirve más)
1. **Fotos originales (lo mejor):** las que el equipo guarda en su teléfono o computadora, antes de subirlas a la red.
   Instagram reduce las fotos al subirlas, así que lo que se descarga de allí rara vez es el original.
   Si solo están en Instagram: Centro de cuentas > Tu información y permisos > Descargar tu información (la ruta y los nombres
   pueden variar según la versión de la app; Facebook tiene una opción equivalente). Pedir solo las publicaciones, no «toda la información»,
   que incluye mensajes y datos de otras personas; formato HTML o JSON y calidad de medios alta. La persona escribe su propia contraseña
   y el enlace llega por correo y caduca. Pasar solo las fotos: el archivo completo no se sube al chat ni al repositorio.
2. **Capturas del perfil**, tomadas desde su propia sesión en el teléfono o la computadora, que muestren la cuadrícula con al menos dos filas completas.
   Las miniaturas miden unos 350 px y traen iconos de carrusel o video en la esquina: sirven para probar el sitio o como relleno de la galería,
   no para la imagen principal ni para el visor ampliado; usar los originales en cuanto lleguen.
3. **Enlace a una carpeta compartida** (Google Drive, Dropbox, WeTransfer) con las fotos que la persona prepare. Si la descarga pide iniciar sesión
   o devuelve una página HTML en lugar de una imagen, detenerse y pedir los archivos. No se descargan direcciones de instagram.com, facebook.com, cdninstagram.com ni fbcdn.net.

Las imágenes adjuntas suelen quedar en una carpeta `images/` de la sesión; si no se encuentra, la ruta aparece en la conversación.

## Carpetas y comandos
- **Trabajo (fuera del repositorio):** `/tmp/redes-trabajo/` con `originales/`, `recortes/` y `elegidas/`. El repositorio ignora una carpeta `trabajo/` por si alguien la crea dentro.
- **Fotos finales:** `img/obras/` (solo las salidas de `optimizar`). Los originales no se dejan en `img/`: pueden traer ubicación GPS y no se publican.
- **Herramientas:** `.claude/skills/redes/scripts/fotos.py` (Python 3 con Pillow y numpy). Cada comando se ejecuta desde la raíz del repositorio y con la ruta completa,
  porque las variables de shell no pasan de una llamada a otra. HEIC no se lee: pedir la foto en JPG o PNG.

## Flujo
1. **Inventario.** `python3 -I .claude/skills/redes/scripts/fotos.py inventario /tmp/redes-trabajo`. Recorre subcarpetas y marca baja resolución, desenfoque,
   exposición extrema, capturas de pantalla y cuadrículas de perfil.
2. **Recortar capturas.** `python3 -I .claude/skills/redes/scripts/fotos.py recortar captura.png --out /tmp/redes-trabajo/recortes`.
   Contar y mirar los recortes: tienen que ser miniaturas completas, del mismo tamaño y sin cabecera. Si salen pocos o ninguno,
   pedir una captura que muestre la cuadrícula con dos filas completas o, mejor, los originales.
3. **Elegir.** `python3 -I .claude/skills/redes/scripts/fotos.py ranking /tmp/redes-trabajo/originales /tmp/redes-trabajo/recortes --top 20`
   (acepta varias carpetas) ordena por calidad técnica, señala duplicadas y deja fuera las capturas de pantalla.
   Revisar también `capturas_excluidas`: si hay fotos verticales de obra, repetir con `--con-capturas`.
   El puntaje no decide solo: abrir las mejores con Read, mirarlas y elegir por contenido
   (obra terminada y bien encuadrada, variedad de tipos, luz natural).
4. **Clasificar y ordenar.** Copiar las elegidas a `/tmp/redes-trabajo/elegidas/` con nombres descriptivos (`casa-dos-niveles.jpg`) y
   asignar cada una a un tipo: `casa`, `ampliacion`, `remodelacion`, `comercial` o `muros`. El orden en `obras` importa en el mosaico (medidas reales):
   el lugar 1 es 4:3 en escritorio y casi cuadrado en móvil; el 4 y el 7 son panorámicos (2,7:1 en escritorio y 2,2:1 en móvil: se ve solo la franja central
   de una foto 3:2); el 3 y el 9 son verticales; los demás son 4:3. Poner en el 4 y el 7 fotos cuyo tema esté en una franja horizontal central,
   y en el 3 y el 9 fotos verticales o con el tema centrado. Las capturas de baja resolución no van en el lugar 1.
5. **Revisar privacidad.** `python3 -I .claude/skills/redes/scripts/fotos.py revisar /tmp/redes-trabajo/elegidas --out /tmp/redes-trabajo/zoom`
   parte cada foto en recuadros al tamaño real; abrirlos con Read y mirar cada zona, no solo la foto entera. Buscar: placas; números de casa, de medidor, de finca o de plano;
   rótulo de obra o permiso con el nombre del propietario; documentos, planos y pantallas; rostros (sobre todo de menores) y vecinos; reflejos en vidrios.
   Lo que se lea se recorta; si no se puede, se descarta la foto. Si la obra es una vivienda privada, confirmar con la persona que el cliente aceptó que se muestre.
   `titulo` y el nombre del archivo no llevan nombres de clientes, calles ni números. `zona` se queda a nivel de cantón o distrito, nunca una dirección.
6. **Optimizar.** `python3 -I .claude/skills/redes/scripts/fotos.py optimizar /tmp/redes-trabajo/elegidas --out img/obras` genera JPG de hasta 1600 px de ancho,
   orientado y sin metadatos (se elimina el GPS). Con `--reemplazar` se sobrescribe un archivo del mismo nombre; si no, se agrega `-2`.
7. **Conectar en `js/config.js`:**
   - `fotos`: la imagen principal por tipo, por ejemplo `casa: "img/obras/casa-dos-niveles.jpg"` (órbita de la portada, tarjetas de servicios y vista rápida).
   - `obras`: la galería. Cada entrada lleva `tipo`, `titulo` (descriptivo, sin inventar), `foto` y, solo
     si la persona los confirmó, `zona`, `area` y `estado`. Las entradas sin foto siguen mostrando la tarjeta de marca y la maqueta 3D.
   - `foco` (opcional por obra): el punto que no debe cortarse, por ejemplo `foco: "50% 30%"`. Las tarjetas recortan: el carrusel 3D (1:1,25) deja ver cerca de la mitad
     de una foto 3:2.
   - `demo`: dejarlo en `true` hasta que la persona confirme los datos pendientes; mientras tanto se ve «Por confirmar» y el aviso de propuesta.
     La nota «Las tarjetas de marca se reemplazan…» se oculta sola cuando todas las obras tienen foto.
8. **Verificar.** `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node .claude/skills/redes/scripts/verificar.js . /tmp/redes-capturas` (no ejecutar `playwright install`).
   Toma capturas de escritorio y móvil del carrusel 3D (`#obras`), servicios, mosaico (`#galeria`) y visor de obra (`#ov`, pestañas Foto y Maqueta 3D),
   y avisa de errores de consola, scroll horizontal e imágenes rotas. Mirar las capturas: recorte de cada tarjeta, texto legible sobre fotos claras, ninguna foto deformada.
   La cinta clásica de obras (`#ribbon`) solo se ve con «reducir movimiento» activado; el carrusel 3D la reemplaza.
9. **Publicar.**
   - `python3 -I .claude/skills/redes/scripts/fragmento.py . RUTA/idesa-constructora.html` genera el fragmento e imprime el mapa `files` (css, js y solo las imágenes que el sitio usa).
     Si avisa de GPS, de archivos de más de 15 MB, de más de 64 MB o de más de 255 archivos, termina con error: no publicar, corregir y repetir. Esos límites son los de la herramienta Artifact hoy y pueden cambiar.
   - Publicar con la herramienta Artifact con ese archivo, ese mapa `files` y `root` en la raíz del repositorio. Para actualizar el artifact existente, buscarlo con `action: "list"`
     y leerlo con `action: "read"` antes de publicar; si la sesión no puede editarlo, publicar uno nuevo. Primera publicación: `icon` «building».
   - Para retirar una foto ya publicada: quitarla de `js/config.js`, borrarla de `img/obras` y pasarla en `files` con valor `null` al volver a publicar (los archivos que no se pasan se conservan).
   - El artifact no incluye las animaciones de aparición (`.rv`) ni los datos estructurados del `<head>`; el sitio publicado desde el repositorio sí.
10. **Guardar el trabajo.** El repositorio es público y lo que se sube no se retira del historial. Antes del commit, `git status`; agregar solo `git add img/obras js/config.js`, nunca `git add -A`.
    Commit en la rama de desarrollo con los trailers de atribución de la sesión y push. Subir a `main` solo si la persona lo pidió.

## Qué decirle a la persona al terminar
- Cuántas fotos se usaron, cuáles quedaron como principal de cada tipo y cuáles se descartaron y por qué (incluidas las de privacidad).
- Los datos de obra que siguen en «Por confirmar» (zona, área, estado) para que los complete.
- Si alguna foto salió de una captura, que su calidad es menor y conviene reemplazarla por el original.
