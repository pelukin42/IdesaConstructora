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
    facebook: "https://www.facebook.com/search/pages?q=Constructora%20IDESA", // reemplazar por el enlace exacto

    /* ---- Fotos ----
       fotos: la imagen principal de cada tipo de obra (órbita de la portada y tarjetas).
       obras: la galería (carrusel 3D, mosaico y visor). Cada una con foto, zona, área y estado.
       Opcional por obra: foco, el punto de la foto que no debe cortarse, por ejemplo foco: "50% 30%".
       Mientras una foto sea null se muestra una tarjeta de marca y la maqueta 3D del tipo de obra.
       Las rutas van relativas a la raíz del sitio: las fotos optimizadas quedan en img/obras/<nombre>.jpg
       El orden importa en el mosaico: los lugares 1, 4 y 7 son horizontales, el 3 y el 9 verticales. */
    fotos: { casa: null, ampliacion: null, remodelacion: null, comercial: null, muros: null },
    obras: [
      { tipo: "casa", titulo: "Casa de habitación", foto: null, zona: null, area: null, estado: null },
      { tipo: "ampliacion", titulo: "Ampliación de vivienda", foto: null, zona: null, area: null, estado: null },
      { tipo: "remodelacion", titulo: "Remodelación de cocina", foto: null, zona: null, area: null, estado: null },
      { tipo: "comercial", titulo: "Local comercial", foto: null, zona: null, area: null, estado: null },
      { tipo: "muros", titulo: "Muro de contención", foto: null, zona: null, area: null, estado: null },
      { tipo: "casa", titulo: "Casa de dos niveles", foto: null, zona: null, area: null, estado: null },
      { tipo: "comercial", titulo: "Bodega", foto: null, zona: null, area: null, estado: null },
      { tipo: "remodelacion", titulo: "Remodelación de baño", foto: null, zona: null, area: null, estado: null }
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
    ruta: function (p) { return p ? (/^(https?:|data:|\/)/.test(p) ? p : base + p) : null; }
  };
})();
