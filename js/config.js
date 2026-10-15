/* ============================================================
   DATOS DEL NEGOCIO — lo único que hay que editar para completar el sitio.
   Lo que esté en null se muestra como «Por confirmar» mientras demo sea true.
   Con demo en false, lo vacío simplemente se oculta.
   ============================================================ */
(function () {
  var base = (document.currentScript && document.currentScript.src || '').replace(/js\/config\.js.*$/, '');

  window.IDESA = {
    demo: true,

    nombre: "Constructora IDESA",
    corto: "IDESA",

    /* ---- Datos entregados por el negocio ---- */
    telefono: "6264 3211",
    telefonoIntl: "+506 6264 3211",
    whatsapp: "50662643211", // sin signos ni espacios; confirmar que este número tenga WhatsApp
    instagramUsuario: "@idesaconstructora_cr",
    instagram: "https://www.instagram.com/idesaconstructora_cr/",
    facebookNombre: "Constructora IDESA",
    facebook: "https://www.facebook.com/p/Constructora-IDESA-100061924993155/",

    /* ---- Fotos ----
       fotos: la imagen principal de cada tipo de obra (órbita de la portada y tarjetas).
       obras: la galería (carrusel 3D, mosaico y visor). Cada una con foto, zona, área y estado.
       Opcional por obra: foco, el punto de la foto que no debe cortarse, por ejemplo foco: "50% 30%".
       Mientras una foto sea null se muestra una tarjeta de marca y la maqueta 3D del tipo de obra.
       Las rutas van relativas a la raíz del sitio: las fotos optimizadas quedan en img/obras/<nombre>.jpg
       El orden importa en el mosaico: la forma de cada lugar depende de cuántas obras haya (ver BLOQUES en js/app.js).
       Hoy, con 6 obras: el lugar 2 es panorámico (2,7:1 en escritorio), el 3 es vertical y los demás son 4:3. */
    fotos: { casa: "img/obras/casa-liberia-acceso.jpg", ampliacion: null, remodelacion: null, comercial: null, muros: null },
    /* Hoy son renders que IDESA publicó en Facebook e Instagram (recortes de entre 300 y 550 px), por eso van con
       estado "Diseño 3D". Reemplazarlos por los archivos originales y sumar fotos de obra terminada (estado "Terminada").
       El área de la Casa Liberia (100 m²) es la que IDESA indica en su publicación; la zona no se infiere del nombre del modelo. */
    obras: [
      { tipo: "casa", titulo: "Casa Liberia: acceso", foto: "img/obras/casa-liberia-acceso.jpg", foco: "35% 50%", zona: null, area: "100 m²", estado: "Diseño 3D" },
      { tipo: "casa", titulo: "Casa Liberia: vista frontal", foto: "img/obras/casa-liberia-frente.jpg", foco: "45% 50%", zona: null, area: "100 m²", estado: "Diseño 3D" },
      { tipo: "casa", titulo: "Casa con pérgola: barra", foto: "img/obras/casa-pergola-barra.jpg", foco: "65% 50%", zona: null, area: null, estado: "Diseño 3D" },
      { tipo: "casa", titulo: "Casa con pérgola: fachada", foto: "img/obras/casa-pergola-fachada.jpg", foco: "45% 50%", zona: null, area: null, estado: "Diseño 3D" },
      { tipo: "casa", titulo: "Casa con pérgola: sala y terraza", foto: "img/obras/casa-pergola-sala-terraza.jpg", foco: "25% 50%", zona: null, area: null, estado: "Diseño 3D" },
      { tipo: "casa", titulo: "Casa con pérgola: vista exterior", foto: "img/obras/casa-pergola-vista-exterior.jpg", foco: "50% 40%", zona: null, area: null, estado: "Diseño 3D" }
    ],

    /* ---- Pendientes de confirmar con el negocio ---- */
    direccion: null,
    horario: null,
    zona: null,
    correo: null,
    cedulaJuridica: null,
    cfia: null,
    polizas: null,
    anios: null,
    obrasEntregadas: null,

    /* convierte una ruta relativa a la raíz del sitio en una ruta que funciona desde cualquier página */
    ruta: function (p) { return p ? (/^([a-z][a-z0-9+.\-]*:|\/)/i.test(p) ? p : base + p) : null; }
  };
})();
