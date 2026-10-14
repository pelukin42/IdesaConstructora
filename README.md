# Constructora IDESA — sitio web

Sitio estático (HTML, CSS y JS sin dependencias ni paso de compilación). Abrir `index.html` o servir la carpeta con cualquier servidor estático.
**Instagram:** @idesaconstructora_cr · **Facebook:** Constructora IDESA · **Tel/WhatsApp:** 6264 3211

## Concepto
Diseño dinámico con la paleta del logo (índigo, rojo y salmón) y Montserrat, la tipografía de la marca.
- **Intro:** animación de la marca (hexágono + cubo) que se abre en círculo; una vez por sesión.
- **Portada:** palabra que cambia (casa, ampliación, remodelación, local, muro), órbita de burbujas con los tipos de obra, brillo que sigue al mouse y botones magnéticos.
- **Valores, cinta de obras y servicios:** tarjetas con inclinación 3D y vista rápida; cada una lleva a la solicitud.
- **Cómo trabajamos:** una casa isométrica de cubos que se construye con el scroll en cinco etapas (consulta, presupuesto, planos y permisos, construcción, entrega).
- **Obras en 3D:** carrusel giratorio (arrastre, scroll y teclado) y visor de cada obra con foto en profundidad y maqueta 3D por tipo de obra (casa, ampliación, remodelación, local y muros): se gira, se acerca, se separa en piezas y cambia de día a noche. Con «reducir movimiento» activado se usa la cinta de obras sin 3D.
- **Galería:** mosaico con inclinación, brillo y visor de obra.
- **Solicitud:** asistente de 4 pasos con ticket en vivo que arma el mensaje de WhatsApp (no calcula precios). Barra flotante para retomarla.
- Widget de WhatsApp, menú móvil, accesible por teclado, SEO básico y datos estructurados.

## Estructura
- `index.html` — contenido y secciones.
- `css/styles.css` — estilos; la paleta está en las variables del inicio (`--navy`, `--red`, `--salmon`, `--cream`).
- `css/inmersivo.css` y `js/inmersivo.js` — carrusel 3D de obras, visor de obra y maquetas 3D (CSS 3D, sin librerías).
- `js/config.js` — **datos del negocio, fotos y obras** (lo único que hay que editar).
- `js/app.js` — comportamiento (intro, órbita, casa isométrica, solicitud, galería, WhatsApp).
- `img/` — logo y marca (`logo.png`, `logo-blanco.png`, `marca.svg`, `marca-blanco.svg`) y, cuando lleguen, las fotos.

## Para completar (lo que falta)
1. **Fotos reales:** pasarlas por `.claude/skills/redes/scripts/fotos.py optimizar` (salen a `img/obras/` sin ubicación GPS) y anotarlas en `js/config.js`: `fotos` (la principal de cada tipo de obra) y `obras` (la galería, con zona, área, estado y `foco` opcional). Mientras falten se muestran tarjetas de marca y la maqueta 3D de cada tipo. El flujo completo, con la revisión de privacidad, está en `.claude/skills/redes/SKILL.md`.
2. **Datos pendientes:** dirección, horario, zona de trabajo, correo, cédula jurídica, CFIA, pólizas, años de experiencia y obras entregadas, también en `js/config.js`. Aparecen como «Por confirmar» mientras `demo: true`; con todo confirmado, poner `demo: false`.
3. Confirmar que 6264 3211 tenga WhatsApp y poner el enlace exacto de la página de Facebook (`facebook` en `js/config.js`).

Los textos de servicios, proceso y preguntas frecuentes son propuestas: ajustarlos a lo que IDESA hace.
