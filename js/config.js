/* ============================================================
   DATOS DEL NEGOCIO — lo único que hay que editar para completar el sitio.
   Todo lo que esté en null se muestra como «Por confirmar» mientras demo sea true.
   Con demo en false, lo vacío simplemente se oculta.
   ============================================================ */
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

  /* ---- Logo ----
     Poner la ruta del archivo en la carpeta img/ (SVG o PNG con fondo transparente).
     logoSobreOscuro es la versión clara del logo, para el pie y el modo oscuro. */
  logo: null,            // ej. "img/logo.svg"
  logoSobreOscuro: null, // ej. "img/logo-claro.svg"

  /* ---- Fotos ----
     fotos: la imagen principal de cada tipo de obra (portada y servicios).
     obras: la galería. Cada una con su foto, zona, área y estado.
     Mientras una foto sea null, se muestra una ilustración de ejemplo. */
  fotos: { casa: null, ampliacion: null, remodelacion: null, comercial: null, muros: null }, // ej. casa: "img/casa.jpg"
  obras: [
    { tipo: "casa", titulo: "Casa de habitación", foto: null, zona: null, area: null, estado: null },
    { tipo: "ampliacion", titulo: "Ampliación de vivienda", foto: null, zona: null, area: null, estado: null },
    { tipo: "remodelacion", titulo: "Remodelación de cocina", foto: null, zona: null, area: null, estado: null },
    { tipo: "comercial", titulo: "Local comercial", foto: null, zona: null, area: null, estado: null },
    { tipo: "muros", titulo: "Muro de contención", foto: null, zona: null, area: null, estado: null },
    { tipo: "casa", titulo: "Casa de dos niveles", foto: null, zona: null, area: null, estado: null }
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
  obrasEntregadas: null
};
