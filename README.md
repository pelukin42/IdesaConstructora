# Constructora IDESA — sitio web

Sitio estático (HTML, CSS y JS sin dependencias). Abrir `index.html` o servir la carpeta con cualquier servidor estático.

- **Instagram:** @idesaconstructora_cr · **Facebook:** Constructora IDESA · **Tel/WhatsApp:** 6264 3211

## Qué incluye
- Portada interactiva: se elige el tipo de obra y cambia el dibujo técnico y el mensaje de WhatsApp.
- Servicios, obras filtrables con «Quiero una como esta» y cotizador de 4 pasos con resumen en vivo.
- Mensaje de WhatsApp armado, botón para copiarlo, flotante de WhatsApp y barra de acciones en celular.
- Modo claro/oscuro, accesible por teclado, SEO básico y datos estructurados.

## Qué falta confirmar con IDESA
Todo está en `js/config.js`. Lo que está en `null` aparece como «Por confirmar» mientras `demo: true`:
dirección, horario, zona de trabajo, correo, cédula jurídica, CFIA, pólizas y años de experiencia.
También: confirmar que 6264 3211 tenga WhatsApp y poner el enlace exacto de Facebook.

## Fotos reales
Las fichas de obras son dibujos de ejemplo. En `js/main.js`, arreglo `OBRAS`, poner la ruta de la foto en `foto: "img/obra1.jpg"` y se usa en lugar del dibujo.
Los textos de servicios, proceso y preguntas son propuestas: ajustarlos a lo que IDESA hace. Con todo confirmado, poner `demo: false`.
