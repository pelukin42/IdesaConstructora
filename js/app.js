(function () {
  "use strict";
  var N = window.IDESA;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var wa = function (msg) { return "https://wa.me/" + N.whatsapp + "?text=" + encodeURIComponent(msg || ""); };

  /* ============ datos ============ */
  var TIPOS = [
    { k: "casa", n: "Casa nueva", g: "--g1", badge: "Empezá aquí", p: "Casas de habitación desde los cimientos hasta los acabados.",
      inc: ["Cimientos y estructura", "Muros, techo y acabados", "Instalaciones eléctricas y de agua", "Recorrido final y entrega"] },
    { k: "ampliacion", n: "Ampliación", g: "--g2", p: "Un cuarto, un segundo nivel o un anexo para la casa que ya tenés.",
      inc: ["Revisión de lo que ya existe", "Estructura unida a la casa actual", "Acabados que combinan con lo existente", "Obra con el menor desorden posible"] },
    { k: "remodelacion", n: "Remodelación", g: "--g3", p: "Cocinas, baños, cambios de distribución y renovación de acabados.",
      inc: ["Demolición y retiro de escombros", "Cambios de distribución", "Pisos, enchapes y pintura", "Cocinas, baños y carpintería"] },
    { k: "comercial", n: "Local o bodega", g: "--g4", p: "Locales, bodegas y oficinas, con plazos pensados para abrir.",
      inc: ["Fachada y accesos", "Estructura y cubierta", "Divisiones y acabados interiores", "Instalaciones para tu operación"] },
    { k: "muros", n: "Muros y obra exterior", g: "--g5", p: "Muros de contención, cercas, aceras y obra gris.",
      inc: ["Muros de contención y cercas", "Aceras y pisos exteriores", "Cimentación y drenaje", "Obra gris en general"] }
  ];
  var BYK = {}; TIPOS.forEach(function (t) { BYK[t.k] = t; });
  var OTRO = { k: "otro", n: "Otra obra o consulta", g: "--g1" };
  var PROV = ["San José", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limón"];
  var OPC = {
    terreno: [["si", "Es mío"], ["no", "No todavía"], ["alquilado", "Es alquilado"]],
    planos: [["si", "Sí, ya tengo"], ["proceso", "Están en proceso"], ["no", "Todavía no"]],
    acabados: [["basico", "Básicos"], ["medio", "Medios"], ["alto", "Altos"], ["ns", "No sé aún"]],
    plazo: [["ya", "Lo antes posible"], ["1-3", "En 1 a 3 meses"], ["3-6", "En 3 a 6 meses"], ["explorando", "Estoy explorando"]]
  };
  var MARQ = ["Casas nuevas", "Ampliaciones", "Remodelaciones", "Locales y bodegas", "Muros y obra exterior", "Planos y diseño", "Permisos y trámites"];
  var ETAPAS = ["Consulta", "Presupuesto", "Planos y permisos", "Construcción", "Entrega"];
  var fotoTipo = function (k) { return N.ruta(N.fotos && N.fotos[k]); };
  var OBRAS = (N.obras || []).map(function (o) { return { tipo: o.tipo, titulo: o.titulo, foto: N.ruta(o.foto), zona: o.zona, area: o.area, estado: o.estado }; });
  var icono = function (k) { return '<svg class="ic"><use href="#i-' + (k === "otro" ? "doc" : k) + '"/></svg>'; };

  /* ============ datos del negocio en la página ============ */
  $$("[data-neg]").forEach(function (el) {
    var v = N[el.getAttribute("data-neg")];
    if (v) el.textContent = v;
    else if (N.demo) el.textContent = "Por confirmar";
  });
  $$("[data-demo]").forEach(function (el) { el.hidden = !N.demo; });
  $$(".wa-num").forEach(function (el) { el.textContent = N.telefonoIntl; });
  $("#yr").textContent = new Date().getFullYear();
  $("#tkFecha").textContent = new Date().toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" });
  var enlaces = { tel: "tel:+506" + N.telefono.replace(/\D/g, ""), instagram: N.instagram, facebook: N.facebook };
  function hidratar(root) {
    $$("[data-wa]", root).forEach(function (a) { a.href = wa(a.getAttribute("data-msg")); a.target = "_blank"; a.rel = "noopener"; });
    $$("[data-href]", root).forEach(function (a) {
      a.href = enlaces[a.getAttribute("data-href")] || "#";
      if (/^https/.test(a.href)) { a.target = "_blank"; a.rel = "noopener"; }
    });
  }
  hidratar(document);

  /* ============ trama de hexágonos (fondo) ============ */
  (function () {
    var s = 30, w = Math.sqrt(3) * s, v = [[w / 2, 0], [w, s / 2], [w, 1.5 * s], [w / 2, 2 * s], [0, 1.5 * s], [0, s / 2]];
    var d = "M" + v.map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }).join("L") + "Z M" + (w / 2).toFixed(1) + " " + 2 * s + " V" + 3 * s;
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' width='" + w.toFixed(1) + "' height='" + 3 * s + "'><path d='" + d + "' fill='none' stroke='white' stroke-opacity='.11'/></svg>";
    document.documentElement.style.setProperty("--hex", 'url("data:image/svg+xml;utf8,' + encodeURIComponent(svg) + '")');
  })();

  /* ============ intro ============ */
  var intro = $("#intro"), visto = false;
  try { visto = sessionStorage.getItem("idesa_intro"); sessionStorage.setItem("idesa_intro", "1"); } catch (e) {}
  if (reduce || visto) intro.remove();
  else { setTimeout(function () { intro.classList.add("out"); }, 1400); setTimeout(function () { intro.remove(); }, 2500); }

  /* ============ ventanas ============ */
  var abierta = null, anterior = null;
  function abrir(m) {
    anterior = document.activeElement; m.classList.add("on"); abierta = m;
    document.documentElement.style.overflow = "hidden"; barra();
    setTimeout(function () { var f = $(".qv-x", m); if (f) f.focus(); }, 60);
  }
  function cerrar(m) {
    m.classList.remove("on"); abierta = null; document.documentElement.style.overflow = ""; barra();
    if (anterior && anterior.focus) anterior.focus();
  }
  $$(".modal").forEach(function (m) {
    m.addEventListener("click", function (e) { if (e.target === m || e.target.closest("[data-close]")) cerrar(m); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (abierta) cerrar(abierta);
      else if ($("#lb").classList.contains("open")) cerrarLb();
      else cerrarWa();
    }
    if (e.key === "Tab" && abierta) {
      var f = $$("button,a[href],input,select,textarea,summary", abierta).filter(function (x) { return !x.disabled && x.offsetParent !== null; });
      if (!f.length) return;
      var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
    var lb = $("#lb");
    if (lb.classList.contains("open")) { if (e.key === "ArrowLeft") moverLb(-1); if (e.key === "ArrowRight") moverLb(1); }
  });

  /* ============ encabezado, progreso y menú ============ */
  var nav = $("#nav"), bar = $("#bar"), menu = $("#menu"), burger = $("#burger");
  burger.addEventListener("click", function () {
    var o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", String(o));
    burger.innerHTML = '<svg class="ic"><use href="#i-' + (o ? "x" : "menu") + '"/></svg>';
  });
  function cerrarMenu() { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); burger.innerHTML = '<svg class="ic"><use href="#i-menu"/></svg>'; }
  $$("a", menu).forEach(function (a) { a.addEventListener("click", cerrarMenu); });
  var secs = $$("main section[id]"), links = $$("a[href^='#']", menu);
  if ("IntersectionObserver" in window) {
    var sObs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); }); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    secs.forEach(function (s) { sObs.observe(s); });
  }

  /* ============ palabra que cambia, resplandor y órbita ============ */
  var palabras = ["casa", "ampliación", "remodelación", "local", "muro"], sw = $("#swap"), wi = 0;
  if (!reduce) setInterval(function () {
    sw.classList.add("out");
    setTimeout(function () { wi = (wi + 1) % palabras.length; sw.textContent = palabras[wi]; sw.classList.remove("out"); }, 350);
  }, 2600);
  if (fine && !reduce) {
    var hero = $(".hero"), orb = $("#orb");
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      hero.style.setProperty("--mx", x * 100 + "%"); hero.style.setProperty("--my", y * 100 + "%");
      orb.style.transform = "translate3d(" + (x - .5) * -26 + "px," + (y - .5) * -26 + "px,0)";
    });
    $$(".mag").forEach(function (b) {
      b.addEventListener("pointermove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + (e.clientX - r.left - r.width / 2) * .18 + "px," + (e.clientY - r.top - r.height / 2) * .3 + "px)"; });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }
  var orbit = $("#orbit");
  TIPOS.forEach(function (t, i) {
    var f = fotoTipo(t.k), d = document.createElement("div");
    d.className = "chip"; d.style.setProperty("--a", i * 72 + "deg");
    d.innerHTML = '<button class="bub" type="button" data-qv="' + t.k + '" aria-label="Ver ' + esc(t.n) + '"><span class="bimg" style="--g:var(' + t.g + ')">' + (f ? '<img src="' + esc(f) + '" alt="">' : icono(t.k)) + "</span><b>" + esc(t.n) + "</b></button>";
    orbit.appendChild(d);
  });

  /* ============ cinta de palabras ============ */
  (function () { var h = MARQ.map(function (t) { return "<span>" + t + "</span>"; }).join(""); $("#marq").innerHTML = h + h + h + h; })();

  /* ============ cinta de obras ============ */
  function tileObra(o, i, clase) {
    var t = BYK[o.tipo] || OTRO;
    if (o.foto) return '<button class="rib tile photo ' + (clase || "") + '" type="button" data-foto="' + i + '" aria-label="Ver foto: ' + esc(o.titulo) + '"><img src="' + esc(o.foto) + '" alt="' + esc(o.titulo) + '" loading="lazy"><span class="tt"><small>' + esc(t.n) + "</small>" + esc(o.titulo) + "</span></button>";
    return '<button class="rib tile hue ' + (clase || "") + '" type="button" data-qv="' + t.k + '" style="--g:var(--g' + (i % 5 + 1) + ');animation-delay:' + (-i * 1.3) + 's" aria-label="' + esc(o.titulo) + '">' + icono(t.k) + '<span class="tt"><small>' + esc(t.n) + "</small>" + esc(o.titulo) + "</span></button>";
  }
  (function () {
    var a = OBRAS.map(function (o, i) { return tileObra(o, i); }).join("");
    var b = OBRAS.slice().reverse().map(function (o, i) { return tileObra(o, OBRAS.length - 1 - i); }).join("");
    $("#ribbon").innerHTML = '<div class="rrow">' + a + a + a + '</div><div class="rrow rev">' + b + b + b + "</div>";
  })();

  /* ============ tipos de obra ============ */
  (function () {
    $("#cats").innerHTML = TIPOS.map(function (t, i) {
      var f = fotoTipo(t.k);
      return '<button class="cat ' + (i === 0 ? "feat " : "") + (f ? "hasimg " : "") + 'rv tilt" type="button" data-qv="' + t.k + '" style="--g:var(' + t.g + ');--d:' + i * .08 + 's">' +
        (f ? '<img class="bgimg" src="' + esc(f) + '" alt="" loading="lazy">' : "") +
        (t.badge ? '<span class="badge">' + t.badge + "</span>" : "") + icono(t.k) +
        "<h3>" + esc(t.n) + "</h3><p>" + esc(t.p) + '</p><small>Ver detalle <svg class="ic"><use href="#i-arrow"/></svg></small></button>';
    }).join("");
  })();

  function abrirQv(k) {
    var t = BYK[k]; if (!t) return;
    var f = fotoTipo(k), vis = $("#qvVis");
    vis.style.setProperty("--g", "var(" + t.g + ")");
    vis.innerHTML = f ? '<img src="' + esc(f) + '" alt="' + esc(t.n) + '">' : icono(k);
    $("#qvTipo").textContent = "Tipo de obra";
    $("#qvTitle").textContent = t.n;
    $("#qvDesc").textContent = t.p;
    $("#qvFeat").innerHTML = t.inc.map(function (x) { return '<li><svg class="ic"><use href="#i-check"/></svg>' + esc(x) + "</li>"; }).join("");
    $("#qvCta").onclick = function () { cerrar($("#qv")); abrirSol(k); };
    $("#qvWa").href = wa("Hola IDESA, quiero cotizar: " + t.n + ". Lo vi en su sitio web."); $("#qvWa").target = "_blank"; $("#qvWa").rel = "noopener";
    abrir($("#qv"));
  }

  /* ============ galería ============ */
  var FORMAS = ["big", "", "tall", "wide", "", "", "wide", "", "tall", ""];
  $("#gallery").innerHTML = OBRAS.map(function (o, i) {
    var t = BYK[o.tipo] || OTRO, forma = FORMAS[i % FORMAS.length];
    if (o.foto) return '<button class="shot tile photo ' + forma + '" type="button" data-foto="' + i + '" aria-label="Ver foto: ' + esc(o.titulo) + '"><img src="' + esc(o.foto) + '" alt="' + esc(o.titulo) + '" loading="lazy"><span class="tt"><small>' + esc(t.n) + "</small>" + esc(o.titulo) + "</span></button>";
    return '<button class="shot tile hue ' + forma + '" type="button" data-qv="' + t.k + '" style="--g:var(--g' + ((i + 2) % 5 + 1) + ')" aria-label="' + esc(o.titulo) + '">' + icono(t.k) + '<span class="tt"><small>' + esc(t.n) + "</small>" + esc(o.titulo) + "</span></button>";
  }).join("");

  /* ============ visor de fotos ============ */
  var lbLista = OBRAS.map(function (o, i) { return { i: i, src: o.foto, t: o.titulo }; }).filter(function (x) { return x.src; }), lbPos = 0;
  function pintarLb() { var x = lbLista[lbPos]; $("#lbImg").src = x.src; $("#lbImg").alt = x.t; $("#lbCap").textContent = x.t; }
  function abrirLb(i) {
    var p = lbLista.findIndex(function (x) { return x.i === i; }); if (p < 0) return;
    lbPos = p; pintarLb(); $("#lb").classList.add("open"); document.documentElement.style.overflow = "hidden"; $("#lb .x").focus();
  }
  function cerrarLb() { $("#lb").classList.remove("open"); document.documentElement.style.overflow = ""; }
  function moverLb(d) { lbPos = (lbPos + d + lbLista.length) % lbLista.length; pintarLb(); }
  $("#lb .x").addEventListener("click", cerrarLb);
  $("#lb .p").addEventListener("click", function () { moverLb(-1); });
  $("#lb .n").addEventListener("click", function () { moverLb(1); });
  $("#lb").addEventListener("click", function (e) { if (e.target === this) cerrarLb(); });

  /* ============ casa de cubos (cómo trabajamos) ============ */
  var iso = $("#iso"), buildVis = $("#buildVis"), etapaAct = 0, cubos = [], fx = [];
  (function () {
    var Wd = 26, Hd = 27;
    var P = function (x, y, z) { return [(x - y) * Wd, (x + y) * Wd / 2 - z * Hd]; };
    var pts = function (a) { return a.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "); };
    var PAL = { base: ["#A896D6", "#7A66A8", "#5D4A86"], pared: ["#FCD3C6", "#F18D71", "#D96C50"], techo: ["#F57A7A", "#E23737", "#B52424"] };
    var celdas = [], x, y, z;
    for (x = 0; x < 3; x++) for (y = 0; y < 3; y++) celdas.push({ x: x, y: y, z: 0, p: "base", s: 3 });
    for (z = 1; z <= 2; z++) for (x = 0; x < 3; x++) for (y = 0; y < 3; y++) if (!(x === 1 && y === 1)) celdas.push({ x: x, y: y, z: z, p: "pared", s: 4 });
    for (x = 0; x < 3; x++) for (y = 0; y < 3; y++) celdas.push({ x: x, y: y, z: 3, p: "techo", s: 5 });
    celdas.push({ x: 1, y: 1, z: 4, p: "techo", s: 5 });
    var porEtapa = {};
    celdas.slice().sort(function (a, b) { return a.z - b.z || (a.x + a.y) - (b.x + b.y); }).forEach(function (c) { porEtapa[c.s] = (porEtapa[c.s] || 0) + 1; c.dl = (porEtapa[c.s] - 1) * 0.06; });
    celdas.sort(function (a, b) { return (a.x + a.y) - (b.x + b.y) || a.z - b.z; });
    var minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
    var ver = function (arr) { arr.forEach(function (p) { minx = Math.min(minx, p[0]); maxx = Math.max(maxx, p[0]); miny = Math.min(miny, p[1]); maxy = Math.max(maxy, p[1]); }); };
    var out = "";
    // terreno
    var gnd = "";
    for (var i = -1; i <= 4; i++) {
      gnd += '<path class="gnd" d="M' + P(i, -1, 0).join(" ") + "L" + P(i, 4, 0).join(" ") + 'M' + P(-1, i, 0).join(" ") + "L" + P(4, i, 0).join(" ") + '"/>';
    }
    ver([P(-1, -1, 0), P(4, -1, 0), P(4, 4, 0), P(-1, 4, 0)]);
    out += '<g class="fx" data-from="1" data-to="99">' + gnd + "</g>";
    // cubos
    celdas.forEach(function (c) {
      var pal = PAL[c.p], top = [P(c.x, c.y, c.z + 1), P(c.x + 1, c.y, c.z + 1), P(c.x + 1, c.y + 1, c.z + 1), P(c.x, c.y + 1, c.z + 1)];
      var rt = [P(c.x + 1, c.y, c.z), P(c.x + 1, c.y + 1, c.z), P(c.x + 1, c.y + 1, c.z + 1), P(c.x + 1, c.y, c.z + 1)];
      var lf = [P(c.x, c.y + 1, c.z), P(c.x + 1, c.y + 1, c.z), P(c.x + 1, c.y + 1, c.z + 1), P(c.x, c.y + 1, c.z + 1)];
      ver(top); ver(rt); ver(lf);
      var st = ' stroke="rgba(32,22,52,.4)" stroke-width=".8" stroke-linejoin="round"';
      out += '<g class="cb" data-s="' + c.s + '" style="--dl:' + c.dl.toFixed(2) + 's"><polygon points="' + pts(lf) + '" fill="' + pal[1] + '"' + st + '/><polygon points="' + pts(rt) + '" fill="' + pal[2] + '"' + st + '/><polygon points="' + pts(top) + '" fill="' + pal[0] + '"' + st + "/></g>";
    });
    // puerta y ventanas (etapa 5)
    var cara = function (a, b, d, u0, u1, v0, v1) {
      var pt = function (u, v) { return [a[0] + u * (b[0] - a[0]) + v * (d[0] - a[0]), a[1] + u * (b[1] - a[1]) + v * (d[1] - a[1])]; };
      return pts([pt(u0, v0), pt(u1, v0), pt(u1, v1), pt(u0, v1)]);
    };
    var det = "";
    var lfa = function (x, y, z) { return [P(x, y + 1, z), P(x + 1, y + 1, z), P(x, y + 1, z + 1)]; };
    var rta = function (x, y, z) { return [P(x + 1, y, z), P(x + 1, y + 1, z), P(x + 1, y, z + 1)]; };
    var f1 = lfa(1, 2, 1); det += '<polygon points="' + cara(f1[0], f1[1], f1[2], .26, .74, 0, .8) + '" fill="#2B2142"/>';
    var f2 = lfa(0, 2, 2); det += '<polygon points="' + cara(f2[0], f2[1], f2[2], .25, .75, .3, .75) + '" fill="#FFE9B8"/>';
    var f3 = lfa(2, 2, 2); det += '<polygon points="' + cara(f3[0], f3[1], f3[2], .25, .75, .3, .75) + '" fill="#FFE9B8"/>';
    var f4 = rta(2, 0, 2); det += '<polygon points="' + cara(f4[0], f4[1], f4[2], .25, .75, .3, .75) + '" fill="#FFE9B8"/>';
    var f5 = rta(2, 1, 1); det += '<polygon points="' + cara(f5[0], f5[1], f5[2], .25, .75, .3, .75) + '" fill="#FFE9B8"/>';
    out += '<g class="fx" data-from="5" data-to="99" style="--dl:.5s">' + det + "</g>";
    // volumen del presupuesto (etapa 2 y 3)
    var V = function (x, y, z) { return P(x, y, z); }, w = [];
    var cs = [[0, 0], [3, 0], [3, 3], [0, 3]];
    var base = cs.map(function (c) { return V(c[0], c[1], 0); }), alto = cs.map(function (c) { return V(c[0], c[1], 5); });
    var d = "M" + base.map(function (p) { return p.join(" "); }).join("L") + "Z M" + alto.map(function (p) { return p.join(" "); }).join("L") + "Z";
    cs.forEach(function (c, k) { d += "M" + base[k].join(" ") + "L" + alto[k].join(" "); });
    ver(alto);
    out += '<g class="fx" data-from="2" data-to="4"><path class="wire" d="' + d + '"/></g>';
    // jalón del terreno
    var j0 = P(4, -1, 0), j1 = [j0[0], j0[1] - 46];
    ver([j1]);
    out += '<g class="fx" data-from="1" data-to="5"><path d="M' + j0.join(" ") + "L" + j1.join(" ") + '" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M' + j1.join(" ") + "l26 9l-26 9z" + '" fill="#E23737"/></g>';
    var pad = 30;
    iso.innerHTML = '<svg viewBox="' + (minx - pad).toFixed(0) + " " + (miny - pad).toFixed(0) + " " + (maxx - minx + 2 * pad).toFixed(0) + " " + (maxy - miny + 2 * pad).toFixed(0) + '" aria-hidden="true">' + out + "</svg>";
    cubos = $$(".cb", iso); fx = $$(".fx", iso);
  })();
  function setEtapa(n) {
    if (n === etapaAct) return;
    etapaAct = n;
    cubos.forEach(function (c) { c.classList.toggle("on", +c.dataset.s <= n); });
    fx.forEach(function (f) { f.classList.toggle("on", n >= +f.dataset.from && n < +f.dataset.to); });
    $$(".step").forEach(function (s, i) { s.classList.toggle("on", i + 1 === n); });
    $("#stageN").textContent = "Etapa " + n + " de 5";
    $("#stageT").textContent = ETAPAS[n - 1];
  }
  function etapaPorScroll() {
    var linea = innerHeight * (innerWidth <= 900 ? 0.72 : 0.5), e = 1;
    $$(".step").forEach(function (s, i) { if (s.getBoundingClientRect().top <= linea) e = i + 1; });
    setEtapa(e);
  }

  /* ============ solicitud de presupuesto ============ */
  var S = { tipo: "", provincia: "", zona: "", terreno: "", area: 120, areaNs: false, planos: "", acabados: "", plazo: "", nombre: "", notas: "" };
  var paso = 1, TOTAL = 4, sol = $("#sol");
  var send = document.createElement("a");
  send.className = "btn wa"; send.id = "solSend"; send.target = "_blank"; send.rel = "noopener"; send.hidden = true;
  send.innerHTML = '<svg class="ic fill"><use href="#i-wa"/></svg><span>Enviar por WhatsApp</span>';
  $(".sol-nav").appendChild(send);
  ["Obra", "Lugar", "Tamaño", "Plazo"].forEach(function (t, i) {
    var li = document.createElement("li");
    li.innerHTML = '<button type="button" data-ir="' + (i + 1) + '"><span>' + (i + 1) + "</span>" + t + "</button>";
    $("#solSteps").appendChild(li);
  });
  function radios(cont, name, lista, onSel, conIcono) {
    cont.innerHTML = lista.map(function (it) {
      return '<label class="opt"><input type="radio" name="' + name + '" value="' + it[0] + '">' + (conIcono ? icono(it[0]) : "") + "<span>" + esc(it[1]) + "</span></label>";
    }).join("");
    cont.addEventListener("change", function (e) { onSel(e.target.value); render(); });
  }
  radios($("#optTipo"), "tipo", TIPOS.concat([OTRO]).map(function (t) { return [t.k, t.n]; }), function (v) { S.tipo = v; }, true);
  radios($("#optTerreno"), "terreno", OPC.terreno, function (v) { S.terreno = v; });
  radios($("#optPlanos"), "planos", OPC.planos, function (v) { S.planos = v; });
  radios($("#optAcabados"), "acabados", OPC.acabados, function (v) { S.acabados = v; });
  radios($("#optPlazo"), "plazo", OPC.plazo, function (v) { S.plazo = v; });
  PROV.forEach(function (p) { var o = document.createElement("option"); o.value = p; o.textContent = p; $("#provincia").appendChild(o); });
  $("#provincia").addEventListener("change", function (e) { S.provincia = e.target.value; render(); });
  $("#zona").addEventListener("input", function (e) { S.zona = e.target.value.trim(); render(); });
  $("#nombre").addEventListener("input", function (e) { S.nombre = e.target.value.trim(); render(); });
  $("#notas").addEventListener("input", function (e) { S.notas = e.target.value.trim(); render(); });
  $("#area").addEventListener("input", function (e) { S.area = +e.target.value; render(); });
  $("#areaNs").addEventListener("change", function (e) { S.areaNs = e.target.checked; $("#area").disabled = S.areaNs; render(); });

  function irPaso(n) {
    paso = Math.max(1, Math.min(TOTAL, n));
    $$(".paso", sol).forEach(function (p) { p.hidden = +p.dataset.paso !== paso; });
    $$("#solSteps button").forEach(function (b) { b.setAttribute("aria-current", +b.dataset.ir === paso ? "step" : "false"); });
    $("#solPrev").style.visibility = paso === 1 ? "hidden" : "visible";
    $("#solNext").hidden = paso === TOTAL; send.hidden = paso !== TOTAL;
    $("#solErr").classList.remove("on");
  }
  function falla(m) { var e = $("#solErr"); e.textContent = m; e.classList.add("on"); }
  $("#solPrev").addEventListener("click", function () { irPaso(paso - 1); });
  $("#solNext").addEventListener("click", function () {
    if (paso === 1 && !S.tipo) return falla("Elegí el tipo de obra para continuar.");
    if (paso === 2 && !S.provincia) return falla("Elegí la provincia donde queda la obra.");
    irPaso(paso + 1);
  });
  $("#solSteps").addEventListener("click", function (e) { var b = e.target.closest("[data-ir]"); if (b) irPaso(+b.dataset.ir); });
  send.addEventListener("click", function (e) { if (send.getAttribute("aria-disabled") === "true") { e.preventDefault(); falla("Completá el tipo de obra y la provincia para enviar."); irPaso(!S.tipo ? 1 : 2); } });

  function nombreDe(l, v) { for (var i = 0; i < l.length; i++) if (l[i][0] === v) return l[i][1]; return ""; }
  function lineas() {
    var t = S.tipo === "otro" ? OTRO : BYK[S.tipo];
    return [["Obra", t ? t.n : ""], ["Ubicación", [S.provincia, S.zona].filter(Boolean).join(", ")], ["Terreno", nombreDe(OPC.terreno, S.terreno)],
      ["Tamaño", S.areaNs ? "Por definir" : S.area + " m²"], ["Planos", nombreDe(OPC.planos, S.planos)], ["Acabados", nombreDe(OPC.acabados, S.acabados)], ["Inicio", nombreDe(OPC.plazo, S.plazo)]];
  }
  function mensaje() {
    var m = "Hola IDESA, quisiera solicitar un presupuesto (desde el sitio web).\n";
    lineas().forEach(function (l) { if (l[1]) m += "\n" + l[0] + ": " + l[1]; });
    if (S.nombre) m += "\nNombre: " + S.nombre;
    if (S.notas) m += "\nDetalles: " + S.notas;
    return m;
  }
  var prevCount = -1;
  function render() {
    $("#areaOut").textContent = S.areaNs ? "Por definir" : S.area + " m²";
    var h = "", llenos = 0;
    lineas().forEach(function (l, i) {
      var lleno = i === 3 ? (S.areaNs || S.area !== 120) : !!l[1];
      if (lleno) llenos++;
      h += "<div" + (lleno ? "" : ' class="vacio"') + "><dt>" + l[0] + "</dt><dd>" + esc(lleno ? l[1] : "—") + "</dd></div>";
    });
    $("#tkLines").innerHTML = h;
    $("#tkBar").style.width = Math.round(llenos / 7 * 100) + "%";
    var listo = !!(S.tipo && S.provincia);
    $("#tkState").textContent = listo ? "Lista para enviar. Mientras más datos, mejor." : "Falta el tipo de obra y la provincia.";
    [$("#tkWa"), send].forEach(function (b) { b.href = listo ? wa(mensaje()) : "#"; b.setAttribute("aria-disabled", String(!listo)); });
    $("#msgPrev").value = mensaje();
    $$("#solSteps button").forEach(function (x, i) { x.classList.toggle("ok", [!!S.tipo, !!S.provincia, !!(S.planos || S.acabados || S.areaNs || S.area !== 120), !!S.plazo][i]); });
    var c = $("#solCount"); c.textContent = llenos;
    if (llenos !== prevCount && prevCount >= 0) { c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); }
    prevCount = llenos; $("#obCount").textContent = llenos;
    var t = S.tipo === "otro" ? OTRO : BYK[S.tipo];
    $("#obText").textContent = t ? t.n + (S.provincia ? " · " + S.provincia : "") : "Tu solicitud";
    var ow = $("#obWa"); ow.href = listo ? wa(mensaje()) : "#"; ow.setAttribute("aria-disabled", String(!listo));
    barra();
  }
  function barra() {
    var on = !!S.tipo && !abierta;
    $("#orderBar").classList.toggle("on", on); document.body.classList.toggle("has-bar", on);
  }
  function abrirSol(tipo, nota) {
    if (tipo) {
      S.tipo = tipo; var r = $('#optTipo input[value="' + tipo + '"]'); if (r) r.checked = true;
    }
    if (nota) { S.notas = nota; $("#notas").value = nota; }
    irPaso(tipo ? Math.max(paso, 2) : paso); render(); cerrarMenu(); abrir(sol);
  }
  $("#obOpen").addEventListener("click", function () { abrirSol(); });
  $("#obWa").addEventListener("click", function (e) { if (this.getAttribute("aria-disabled") === "true") { e.preventDefault(); abrirSol(); irPaso(!S.tipo ? 1 : 2); falla("Completá el tipo de obra y la provincia para enviar."); } });
  $("#tkWa").addEventListener("click", function (e) { if (this.getAttribute("aria-disabled") === "true") { e.preventDefault(); falla("Completá el tipo de obra y la provincia para enviar."); irPaso(!S.tipo ? 1 : 2); } });
  $("#tkCopy").addEventListener("click", function () {
    var t = $("#tkCopyTxt"), prev = $("#msgPrev");
    function ok() { t.textContent = "Mensaje copiado"; setTimeout(function () { t.textContent = "Copiar el mensaje"; }, 1800); }
    function respaldo() { prev.closest("details").open = true; prev.focus(); prev.select(); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(mensaje()).then(ok, respaldo); else respaldo();
  });

  /* ============ clics generales ============ */
  document.addEventListener("click", function (e) {
    var s = e.target.closest("[data-sol]");
    if (s) { e.preventDefault(); abrirSol(s.getAttribute("data-tipo"), s.getAttribute("data-nota")); return; }
    var q = e.target.closest("[data-qv]");
    if (q) { abrirQv(q.getAttribute("data-qv")); return; }
    var f = e.target.closest("[data-foto]");
    if (f) abrirLb(+f.getAttribute("data-foto"));
  });

  /* ============ contacto ============ */
  (function () {
    var f = [];
    f.push(['<a class="crow" data-wa data-msg="Hola IDESA, quiero consultar por una obra." href="#">', "i-wa", "WhatsApp", N.telefonoIntl, "</a>"]);
    f.push(['<a class="crow" data-href="tel" href="#">', "i-phone", "Teléfono", N.telefonoIntl, "</a>"]);
    f.push(['<a class="crow" data-href="instagram" href="#">', "i-ig", "Instagram", N.instagramUsuario, "</a>"]);
    f.push(['<a class="crow" data-href="facebook" href="#">', "i-fb", "Facebook", N.facebookNombre, "</a>"]);
    [["direccion", "i-pin", "Oficina"], ["horario", "i-clock", "Horario"], ["zona", "i-pin", "Zona de trabajo"]].forEach(function (x) {
      if (N[x[0]]) f.push(['<div class="crow">', x[1], x[2], N[x[0]], "</div>"]);
      else if (N.demo) f.push(['<div class="crow">', x[1], x[2], "Por confirmar", "</div>"]);
    });
    $("#clist").innerHTML = f.map(function (r) {
      return r[0] + '<span class="ico"><svg class="ic' + (r[1] === "i-wa" ? " fill" : "") + '"><use href="#' + r[1] + '"/></svg></span><div><b>' + r[2] + "</b><span>" + esc(r[3]) + "</span></div>" + r[4];
    }).join("");
    hidratar($("#clist"));
  })();
  $("#contactForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var n = $("#cn").value.trim(), t = $("#ct").value.trim(), m = $("#cm").value.trim();
    var msg = "Hola IDESA, soy " + n + ". " + m + (t ? " Mi teléfono es " + t + "." : "");
    var url = wa(msg);
    $("#cStatus").innerHTML = 'Preparamos tu mensaje. <a href="' + url + '" target="_blank" rel="noopener">Abrir WhatsApp para enviarlo →</a>';
    try { window.open(url, "_blank", "noopener"); } catch (err) {}
  });

  /* ============ WhatsApp flotante ============ */
  var pop = $("#waPop"), fab = $("#waFab");
  function cerrarWa() { pop.hidden = true; fab.classList.remove("open"); fab.setAttribute("aria-expanded", "false"); }
  fab.addEventListener("click", function () { var o = pop.hidden; pop.hidden = !o; fab.classList.toggle("open", o); fab.setAttribute("aria-expanded", String(o)); });
  $(".wa-x", pop).addEventListener("click", cerrarWa);
  document.addEventListener("click", function (e) { if (!pop.hidden && !e.target.closest("#waWidget")) cerrarWa(); });
  setTimeout(function () { fab.classList.add("show-label"); setTimeout(function () { fab.classList.remove("show-label"); }, 4500); }, 5000);

  /* ============ efectos al hacer scroll ============ */
  var tick = false, pars = $$("[data-parallax]");
  function alScroll() {
    tick = false;
    var y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle("solid", y > 30);
    bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, y / h) : 0) + ")";
    if (!reduce) pars.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - innerHeight / 2) / innerHeight) * -60 + "px,0)";
    });
    etapaPorScroll();
  }
  function pedir() { if (!tick) { tick = true; requestAnimationFrame(alScroll); } }
  addEventListener("scroll", pedir, { passive: true }); addEventListener("resize", pedir);

  if ("IntersectionObserver" in window) {
    var rvObs = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); rvObs.unobserve(e.target); } }); }, { threshold: .12 });
    $$(".rv").forEach(function (el) { rvObs.observe(el); });
    var cObs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; cObs.unobserve(e.target);
        var end = +e.target.dataset.count, t0 = null;
        function paso1(t) { if (t0 === null) t0 = t; var p = Math.min((t - t0) / 1400, 1); e.target.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(paso1); }
        reduce ? (e.target.textContent = end) : requestAnimationFrame(paso1);
      });
    }, { threshold: .5 });
    $$("[data-count]").forEach(function (el) { cObs.observe(el); });
  } else {
    document.documentElement.classList.add("no-obs");
    $$("[data-count]").forEach(function (el) { el.textContent = el.dataset.count; });
  }
  if (fine && !reduce) $$(".tilt").forEach(function (el) {
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transition = "transform .12s ease-out"; el.style.transform = "perspective(800px) rotateX(" + -y * 7 + "deg) rotateY(" + x * 9 + "deg) translateY(-6px)";
    });
    el.addEventListener("pointerleave", function () { el.style.transition = "transform .5s var(--ease)"; el.style.transform = ""; });
  });

  irPaso(1); render(); setEtapa(1); alScroll();
})();
