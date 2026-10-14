---
name: constructoras
description: Crea o rehace el sitio web de una constructora (casas, ampliaciones, remodelaciones, locales, obra exterior) con la identidad de su logo, diseño dinámico, maquetas 3D de sus obras, solicitud de presupuesto por WhatsApp y fotos de sus redes. Usar cuando pidan una página para una constructora, una empresa de remodelación o ingeniería, "estilo IDESA", o escriban /constructoras.
---

# /constructoras: sitio web para una constructora

Receta probada con Constructora IDESA (Costa Rica). Produce un sitio estático, dinámico y propio de cada cliente,
que se puede mostrar como propuesta el mismo día y completar después con datos y fotos reales.

## Base de código
Punto de partida: el repositorio `pelukin42/IdesaConstructora` (rama `main`; si va atrasada, la rama `claude/awesome-wozniak-rlhiql` tiene lo último). Se copia a una carpeta nueva y se adapta; no se edita el repositorio de IDESA para otro cliente.
Contiene:
- `index.html` secciones: intro, portada con órbita, valores, obras (carrusel 3D), servicios, proceso (casa isométrica que se construye con el scroll), galería, contacto, preguntas, WhatsApp flotante, visor de obra y solicitud en 4 pasos.
- `css/styles.css` (identidad y componentes) y `css/inmersivo.css` (carrusel 3D, visor y maquetas).
- `js/config.js` **todos los datos del cliente**; `js/app.js` comportamiento; `js/inmersivo.js` maquetas 3D (CSS 3D, sin librerías).
- `.claude/skills/redes/scripts/fotos.py` (recortar capturas del perfil, elegir y optimizar fotos) y `fragmento.py` (fragmento para publicar como Artifact).
Si el repositorio no está en la sesión, agregarlo con `add_repo` (o clonarlo) antes de empezar.

## 1. Entrada mínima
Pedir solo lo que falta; con lo recibido ya se puede empezar:
nombre, país o zona de trabajo, teléfono y WhatsApp, usuario de Instagram y nombre de Facebook, **logo** (adjunto en el chat), servicios reales.
Todo lo demás (dirección, horario, correo, cédula jurídica, registro profesional, pólizas, años de experiencia, obras entregadas)
queda en `null` en `js/config.js` y se muestra como «Por confirmar» mientras `demo: true`.

## 2. Identidad desde el logo
1. Extraer 3 a 4 colores reales del logo (PIL + numpy) y elegir una tipografía de Google Fonts parecida a la del logotipo.
2. Vectorizar la marca (SVG limpio) y generar versión clara y versión para fondo oscuro. Redibujar bordes irregulares en lugar de invertir colores.
3. ImageMagick de este entorno no dibuja SVG: renderizar con Chromium (Playwright) y revisar el resultado a ojo.
4. Cambiar los tokens al inicio de `css/styles.css` (`--navy`, `--red`, `--salmon`, `--cream`, gradientes `--g1` a `--g5`), el ícono de la marca, la trama hexagonal (`--hex`, tomada de la forma de la marca) y el favicon.
5. No reutilizar la estética de otro cliente. Se descartaron por plano o aburrido: concreto con amarillo y estilo planos/blueprint.

## 3. Dirección de diseño aprobada
Estilo dinámico: intro con la marca, portada con palabra que cambia y órbita de tipos de obra, brillo que sigue al mouse, cinta inclinada, tarjetas con inclinación,
revelado al hacer scroll, contadores y WhatsApp flotante. Lo propio de una constructora:
- **Casa isométrica de cubos** que se arma por etapas con el scroll (consulta, presupuesto, planos y permisos, construcción, entrega).
- **Solicitud en 4 pasos** con resumen en vivo que arma el mensaje de WhatsApp. No calcula precios.
- **Carrusel 3D de obras, visor de obra y maquetas 3D** por tipo (casa, ampliación, remodelación, local, muros): girar, acercar, vista explotada, día y noche.
- **Galería** en mosaico con inclinación y brillo.
Adaptar los tipos de obra del cliente en `TIPOS` (app.js) y en `BUILD` (inmersivo.js); si el cliente hace algo distinto (piscinas, techos, estructuras metálicas), construir su maqueta con las mismas piezas (`box`, `techo`, `arbol`).

## 4. Reglas de honestidad
- No inventar credenciales, años de experiencia, obras entregadas, cifras, testimonios ni precios. Lo no confirmado queda como «Por confirmar» y se avisa en el resumen final.
- Los textos de servicios, proceso y preguntas frecuentes son propuestas: decirlo.
- Mantener el aviso de propuesta mientras `demo: true`.
- Confirmar que el número tenga WhatsApp y pedir el enlace exacto de Facebook (hasta entonces es una búsqueda).

## 5. Fotos de sus redes
**No se sacan fotos de Instagram ni de Facebook por la fuerza**: sin sesión, cookies, APIs no oficiales, espejos, descargadores ni cambio de User-Agent. Si la persona pide mirar el perfil público, se hace una sola visita simple y,
si hay pantalla de inicio de sesión, error 429 u otro bloqueo, se detiene ahí y se piden capturas o las fotos.
Se trabaja con lo que la persona aporte (fotos originales del teléfono o la computadora, capturas del perfil adjuntas en el chat, una carpeta compartida, o la descarga de su información de Instagram con solo las publicaciones)
siguiendo `.claude/skills/redes/SKILL.md`: recortar, elegir, **revisar privacidad por zonas** (placas, números de casa o medidor, rótulos con nombre del propietario, rostros, documentos), optimizar sin metadatos GPS y conectar en `js/config.js` (`fotos` y `obras`).
El repositorio puede ser público: se agrega solo `img/obras` y `js/config.js`, nunca `git add -A`.

## 6. Control de calidad antes de publicar
Playwright con Chromium (`/opt/pw-browsers`, sin `playwright install`), páginas con `sessionStorage idesa_intro=1` para saltar la intro:
1. Capturas de escritorio 1366×860 y móvil 390×844 recorriendo todas las secciones; mirarlas.
2. Sin errores de consola y sin scroll horizontal (`scrollWidth <= innerWidth`).
3. Abrir el visor de cada obra, cada maqueta (día, noche, vista explotada), la solicitud completa y el menú móvil.
4. Con `prefers-reduced-motion` no hay carrusel 3D ni giro automático y todo sigue funcionando.
5. Teclado: Escape cierra, flechas navegan, el foco se ve.
Con ultracode activo, correr un workflow con revisores independientes (fotos reales, robustez de JS, accesibilidad y compatibilidad, geometría 3D) y aplicar solo hallazgos reproducidos.

Errores ya vistos: el relleno de `section` global agranda las secciones internas de las ventanas (limitarlo a `main>section`); las reglas `.btn{display:...}` posteriores
pisan a las de móvil; el nombre de variable `--g` choca entre tarjetas y caras 3D (usar prefijos); `.qv-vis` pierde `position:relative` si otra clase lo fuerza a `absolute`.

## 7. Publicar y entregar
1. `python3 -I .claude/skills/redes/scripts/fragmento.py . RUTA/sitio.html` genera el fragmento y el mapa `files` (css, js y solo las imágenes que el sitio usa). Si avisa de GPS o de pesos, no publicar.
2. Publicar con la herramienta Artifact (primera vez con ícono `building`; para actualizar, la misma ruta o la URL) y pasar `root` en la raíz del sitio.
3. Commit con los trailers de atribución de la sesión y push a la rama de desarrollo. A `main` solo si lo piden. No abrir pull request sin que lo pidan.
4. Responder con: el enlace, lo que quedó pendiente (datos y fotos), y la petición de las mejores fotos del Instagram para conectarlas.

El artifact es privado: avisar que quien reciba el enlace necesita acceso hasta que se comparta desde el menú Share.
