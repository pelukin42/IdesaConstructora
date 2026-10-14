# Constructora IDESA — sitio web

Sitio estático (HTML, CSS y JS sin dependencias). Abrir `index.html` o servir la carpeta con cualquier servidor estático.
**Instagram:** @idesaconstructora_cr · **Facebook:** Constructora IDESA · **Tel/WhatsApp:** 6264 3211

## Concepto
El sitio es un juego de láminas de obra: ejes, cotas, niveles, cajetín y cinta de seguridad.
- **Portada:** comparador «plano ⇄ obra». Se arrastra la plomada y el dibujo se vuelve obra; cambia según el tipo de obra elegido.
- **Servicios:** lista con visor que muestra la obra y su plano.
- **Obras:** galería filtrable con visor ampliado y «Quiero una como esta».
- **Cómo trabajamos:** una casa que se va construyendo con el scroll, de la consulta a la entrega.
- **Solicitud:** cotizador de 4 pasos que arma el mensaje de WhatsApp (no calcula precios).
- Regla de niveles que sube mientras se baja, modo claro/oscuro, accesible por teclado, SEO básico y datos estructurados.

## Para completar la identidad (lo que falta)
1. **Colores de marca:** `css/marca.css` (cinco variables). Los valores actuales son provisionales.
2. **Logo:** poner el archivo en `img/` y anotar la ruta en `js/config.js` (`logo` y `logoSobreOscuro`). Mientras no exista, se muestra una marca de texto.
3. **Fotos:** en `js/config.js`, `fotos` (la principal de cada tipo de obra) y `obras` (la galería, con zona, área y estado).
   Donde falta una foto se muestra una ilustración de ejemplo, marcada como «Ejemplo».
4. **Datos pendientes:** dirección, horario, zona de trabajo, correo, cédula jurídica, CFIA, pólizas y años de experiencia, también en `js/config.js`.
   Aparecen como «Por confirmar» mientras `demo: true`; con todo confirmado, poner `demo: false`.
5. Confirmar que 6264 3211 tenga WhatsApp y poner el enlace exacto de la página de Facebook.

Los textos de servicios, proceso y preguntas frecuentes son propuestas: ajustarlos a lo que IDESA hace.
