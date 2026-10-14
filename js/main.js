(function () {
  "use strict";
  var N = window.IDESA, T = window.TXT, E = window.Escena;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var wa = function (msg) { return "https://wa.me/" + N.whatsapp + "?text=" + encodeURIComponent(msg); };
  var TIPOS = ["casa", "ampliacion", "remodelacion", "comercial", "muros"];
  var TODOS = TIPOS.concat("otro");
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  /* ---------- datos del negocio ---------- */
  $$("[data-neg]").forEach(function (el) {
    var v = N[el.getAttribute("data-neg")];
    if (v) el.textContent = v;
    else if (N.demo) { el.textContent = T.pendiente; el.classList.add("pend"); }
  });
  $$("[data-requiere]").forEach(function (el) { if (!N[el.getAttribute("data-requiere")] && !N.demo) el.hidden = true; });
  $$("[data-demo]").forEach(function (el) { el.hidden = !N.demo; });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  $("#cajFecha").textContent = new Date().toLocaleDateString("es-CR", { month: "short", year: "numeric" });
  $$("[data-wa]").forEach(function (a) { a.href = wa(a.getAttribute("data-wa")); a.target = "_blank"; a.rel = "noopener"; });
  var enlaces = { tel: "tel:+506" + N.telefono.replace(/\D/g, ""), instagram: N.instagram, facebook: N.facebook, email: N.correo ? "mailto:" + N.correo : "#" };
  $$("[data-href]").forEach(function (a) {
    a.href = enlaces[a.getAttribute("data-href")] || "#";
    if (/^https/.test(a.href)) { a.target = "_blank"; a.rel = "noopener"; }
  });

  /* ---------- tema ---------- */
  var root = document.documentElement, themeBtn = $("#themeBtn");
  function oscuro() { return root.dataset.theme ? root.dataset.theme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches; }
  function icono() { themeBtn.querySelector("use").setAttribute("href", oscuro() ? "#i-sun" : "#i-moon"); }

  /* ---------- logo (si hay archivo en config.js; si no, queda la marca de texto) ---------- */
  var marcas = $$(".brand"), marcaHTML = marcas.map(function (b) { return b.innerHTML; });
  function logo() {
    marcas.forEach(function (b, i) {
      var sobreOscuro = b.classList.contains("brand--inv") || oscuro();
      var src = sobreOscuro ? (N.logoSobreOscuro || N.logo) : N.logo;
      if (!src) return;
      var img = new Image();
      img.alt = "Constructora IDESA"; img.className = "brand__img"; img.decoding = "async";
      img.onload = function () { b.innerHTML = ""; b.appendChild(img); };
      img.onerror = function () { b.innerHTML = marcaHTML[i]; };
      img.src = src;
    });
  }
  try { var guardado = localStorage.getItem("idesa-tema"); if (guardado) root.dataset.theme = guardado; } catch (e) {}
  icono(); logo();
  themeBtn.addEventListener("click", function () {
    root.dataset.theme = oscuro() ? "light" : "dark"; icono(); logo();
    try { localStorage.setItem("idesa-tema", root.dataset.theme); } catch (e) {}
  });

  /* ---------- menú móvil ---------- */
  var burger = $("#burger"), menu = $("#menu");
  burger.addEventListener("click", function () {
    var abierto = menu.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(abierto));
  });
  $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); }); });

  /* ---------- escena de obra: foto real si existe, ilustración si no ---------- */
  function visualObra(tipo, v, foto, titulo) {
    var src = foto || (N.fotos && N.fotos[tipo]);
    if (src) return '<img src="' + esc(src) + '" alt="' + esc(titulo || T.tipos[tipo]) + '" decoding="async">';
    return E.svg(tipo, { modo: "obra", v: v || 0, label: titulo || T.tipos[tipo] });
  }

  /* ---------- cinta de obra ---------- */
  (function () {
    var item = T.cinta.map(function (t) { return "<span>" + t + "</span>"; }).join("");
    var set = '<div class="cinta__set">' + item + item + item + "</div>";
    $("#cintaPista").innerHTML = set + set;
  })();

  /* ---------- portada: comparador plano ⇄ obra ---------- */
  var cmp = $("#cmp"), rng = $("#cmpRange"), heroTipo = "casa", rafId = 0, timer = 0, nudged = false;
  function setP(v) { cmp.style.setProperty("--p", v + "%"); rng.value = v; }
  function cancelar() { cancelAnimationFrame(rafId); clearTimeout(timer); }
  function tween(from, to, ms, cb) {
    cancelAnimationFrame(rafId);
    var t0 = null;
    function paso(ts) {
      if (t0 === null) t0 = ts;
      var k = Math.min(1, (ts - t0) / ms), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      setP(from + (to - from) * e);
      if (k < 1) rafId = requestAnimationFrame(paso); else if (cb) cb();
    }
    rafId = requestAnimationFrame(paso);
  }
  function usado() { cancelar(); cmp.classList.add("usado"); nudged = true; }
  rng.addEventListener("input", function () { usado(); setP(+rng.value); });
  rng.addEventListener("pointerdown", usado);

  var tiposHero = $("#heroTipos");
  TIPOS.forEach(function (k, i) {
    var l = document.createElement("label");
    l.className = "chip";
    l.innerHTML = '<input type="radio" name="tipoHero" value="' + k + '"' + (i === 0 ? " checked" : "") + '><span><svg aria-hidden="true"><use href="#s-' + k + '"/></svg>' + T.tipos[k] + "</span>";
    tiposHero.appendChild(l);
  });
  function pintarHero(animar) {
    $("#cmpObra").innerHTML = visualObra(heroTipo, 0) + '<span class="cmp__tag cmp__tag--b">Obra</span>';
    var cont = $("#cmpPlano .cmp__svg");
    cont.innerHTML = E.svg(heroTipo, { modo: "plano" });
    $("#cmpPieza").textContent = T.pieza[heroTipo];
    $("#heroEstado").textContent = T.hero[heroTipo];
    var b = $("#heroWa");
    b.href = wa("Hola IDESA, quiero un presupuesto para: " + T.tipos[heroTipo] + ". Lo vi en su sitio web.");
    b.target = "_blank"; b.rel = "noopener";
    if (animar && !reduce) {
      cancelar(); setP(100); E.animar(cont);
      timer = setTimeout(function () { tween(100, 52, 1200); }, 1000);
    } else setP(52);
  }
  tiposHero.addEventListener("change", function (e) { heroTipo = e.target.value; pintarHero(true); });
  $("#heroDetalle").addEventListener("click", function () { setTipo(heroTipo); });
  pintarHero(false);
  if (!reduce) {
    timer = setTimeout(function () {
      if (nudged) return;
      tween(52, 68, 600, function () { tween(68, 36, 900, function () { tween(36, 52, 600); }); });
    }, 1400);
  }

  /* ---------- servicios: lista + visor ---------- */
  var lista = $("#srvLista"), visor = $("#visor");
  TIPOS.forEach(function (k, i) {
    var letra = "ABCDE".charAt(i);
    var li = document.createElement("li");
    li.className = "srv" + (i === 0 ? " on" : "");
    li.dataset.k = k;
    li.innerHTML = '<button type="button" class="srv__btn" aria-expanded="' + (i === 0) + '"><span class="srv__eje">' + letra + '</span><span class="srv__t">' + T.tipos[k] + '</span><svg class="srv__fl" aria-hidden="true"><use href="#i-arrow"/></svg></button>' +
      '<div class="srv__cuerpo"><div><p>' + T.serv[k] + '</p><button type="button" class="btn btn--primary btn--sm" data-preset="' + k + '"><span>Cotizar esta obra</span><svg aria-hidden="true"><use href="#i-arrow"/></svg></button></div></div>';
    lista.appendChild(li);
    var cap = document.createElement("div");
    cap.className = "visor__cap" + (i === 0 ? " on" : "");
    cap.dataset.k = k;
    cap.innerHTML = visualObra(k, i % 3) + '<div class="visor__plano">' + E.svg(k, { modo: "plano" }) + '</div><span class="visor__t">Lámina ' + letra + " · " + T.tipos[k] + "</span>";
    visor.appendChild(cap);
  });
  function activar(k) {
    $$(".srv", lista).forEach(function (li) {
      var on = li.dataset.k === k;
      li.classList.toggle("on", on);
      $(".srv__btn", li).setAttribute("aria-expanded", String(on));
    });
    $$(".visor__cap", visor).forEach(function (c) { c.classList.toggle("on", c.dataset.k === k); });
  }
  lista.addEventListener("click", function (e) { var li = e.target.closest(".srv"); if (li && e.target.closest(".srv__btn")) activar(li.dataset.k); });
  lista.addEventListener("focusin", function (e) { var li = e.target.closest(".srv"); if (li) activar(li.dataset.k); });
  if (window.matchMedia("(hover: hover)").matches) {
    lista.addEventListener("mouseover", function (e) { var li = e.target.closest(".srv"); if (li && !li.classList.contains("on")) activar(li.dataset.k); });
  }

  /* ---------- obras: galería + visor ampliado ---------- */
  var OBRAS = N.obras || [], filtroAct = "todas";
  var filtros = $("#filtros"), grid = $("#obrasGrid"), lb = $("#lb"), vis = [], cur = 0;
  [["todas", T.filtroTodas]].concat(TIPOS.map(function (k) { return [k, T.tipos[k]]; })).forEach(function (f) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "filtro"; b.dataset.f = f[0]; b.textContent = f[1];
    b.setAttribute("aria-pressed", String(f[0] === "todas"));
    filtros.appendChild(b);
  });
  OBRAS.forEach(function (o, i) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "obra"; b.dataset.i = i; b.dataset.tipo = o.tipo;
    b.setAttribute("aria-label", "Ver en grande: " + o.titulo);
    b.innerHTML = '<span class="obra__vis">' + visualObra(o.tipo, i % 3, o.foto, o.titulo) + "</span>" +
      (o.foto ? "" : '<span class="obra__tag">Ejemplo</span>') +
      '<span class="obra__cap"><span><b>' + esc(o.titulo) + "</b><small>" + esc(T.tipos[o.tipo]) + '</small></span><span class="obra__ver"><svg aria-hidden="true"><use href="#i-arrow"/></svg></span></span>';
    grid.appendChild(b);
  });
  function visibles() {
    return OBRAS.map(function (o, i) { return i; }).filter(function (i) { return filtroAct === "todas" || OBRAS[i].tipo === filtroAct; });
  }
  function maquetar() {
    var primero = true;
    $$(".obra", grid).forEach(function (b) {
      var ver = filtroAct === "todas" || b.dataset.tipo === filtroAct;
      b.hidden = !ver;
      b.classList.toggle("big", ver && primero);
      if (ver) primero = false;
    });
  }
  maquetar();
  filtros.addEventListener("click", function (e) {
    var b = e.target.closest(".filtro"); if (!b) return;
    filtroAct = b.dataset.f;
    $$(".filtro", filtros).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    maquetar();
  });
  function dato(k, v) { return "<div><dt>" + k + "</dt><dd" + (v ? "" : ' class="pend"') + ">" + esc(v || T.pendiente) + "</dd></div>"; }
  function pintarLb() {
    var o = OBRAS[vis[cur]];
    $("#lbVis").innerHTML = visualObra(o.tipo, vis[cur] % 3, o.foto, o.titulo);
    $("#lbTipo").textContent = T.tipos[o.tipo];
    $("#lbTit").textContent = o.titulo;
    $("#lbDatos").innerHTML = dato("Zona", o.zona) + dato("Área", o.area) + dato("Estado", o.estado);
    $("#lbPos").textContent = (cur + 1) + " / " + vis.length;
  }
  function abrirLb(i) {
    vis = visibles(); cur = Math.max(0, vis.indexOf(i)); pintarLb();
    if (lb.showModal) { if (!lb.open) lb.showModal(); } else lb.setAttribute("open", "");
  }
  function moverLb(d) { cur = (cur + d + vis.length) % vis.length; pintarLb(); }
  grid.addEventListener("click", function (e) { var b = e.target.closest(".obra"); if (b) abrirLb(+b.dataset.i); });
  $("#lbX").addEventListener("click", function () { lb.close(); });
  $("#lbPrev").addEventListener("click", function () { moverLb(-1); });
  $("#lbNext").addEventListener("click", function () { moverLb(1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
  lb.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") moverLb(-1); else if (e.key === "ArrowRight") moverLb(1); });
  $("#lbPedir").addEventListener("click", function () {
    var o = OBRAS[vis[cur]];
    lb.close();
    setTipo(o.tipo, "Me interesa una obra parecida a «" + o.titulo + "» de su sitio web.");
    $("#cotizador").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  });

  /* ---------- cómo trabajamos: la obra se levanta con el scroll ---------- */
  var panel = $("#buildPanel"), pasosEl = $$(".bp", $("#buildPasos")), etapaAct = 0;
  $("#buildSvg").innerHTML = window.Etapas.svg();
  var grupos = $$(".et", $("#buildSvg"));
  function setEtapa(n) {
    if (n === etapaAct) return;
    etapaAct = n;
    panel.dataset.etapa = n;
    grupos.forEach(function (g) { g.classList.toggle("on", +g.dataset.e <= n); });
    pasosEl.forEach(function (p, i) { p.classList.toggle("on", i + 1 === n); });
    $("#buildN").textContent = "Etapa " + n + " de 5";
    $("#buildT").textContent = T.etapas[n - 1];
  }
  function etapaPorScroll() {
    var linea = window.innerHeight * (window.innerWidth <= 900 ? 0.68 : 0.5), e = 1;
    pasosEl.forEach(function (p, i) { if (p.getBoundingClientRect().top <= linea) e = i + 1; });
    setEtapa(e);
  }

  /* ---------- cotizador ---------- */
  var S = { tipo: "", provincia: "", zona: "", terreno: "", area: 120, areaNs: false, planos: "", acabados: "", plazo: "", nombre: "", notas: "" };
  var paso = 1, TOTAL = 4, pasosNav = $("#pasosNav");
  T.pasos.forEach(function (t, i) {
    var li = document.createElement("li");
    li.innerHTML = '<button type="button" data-ir="' + (i + 1) + '"><span>' + (i + 1) + "</span>" + t + "</button>";
    pasosNav.appendChild(li);
  });
  function radios(cont, name, lista2, onSel) {
    var h = "";
    lista2.forEach(function (it) { h += '<label class="opt"><input type="radio" name="' + name + '" value="' + it[0] + '"><span>' + it[1] + "</span></label>"; });
    cont.innerHTML = h;
    cont.addEventListener("change", function (e) { onSel(e.target.value); render(); });
  }
  radios($("#optTipo"), "tipo", TODOS.map(function (k) { return [k, T.tipos[k]]; }), function (v) { S.tipo = v; });
  radios($("#optTerreno"), "terreno", T.terreno, function (v) { S.terreno = v; });
  radios($("#optPlanos"), "planos", T.planos, function (v) { S.planos = v; });
  radios($("#optAcabados"), "acabados", T.acabados, function (v) { S.acabados = v; });
  radios($("#optPlazo"), "plazo", T.plazo, function (v) { S.plazo = v; });
  T.provincias.forEach(function (p) { var o = document.createElement("option"); o.value = p; o.textContent = p; $("#provincia").appendChild(o); });
  $("#provincia").addEventListener("change", function (e) { S.provincia = e.target.value; render(); });
  $("#zona").addEventListener("input", function (e) { S.zona = e.target.value.trim(); render(); });
  $("#nombre").addEventListener("input", function (e) { S.nombre = e.target.value.trim(); render(); });
  $("#notas").addEventListener("input", function (e) { S.notas = e.target.value.trim(); render(); });
  $("#area").addEventListener("input", function (e) { S.area = +e.target.value; render(); });
  $("#areaNs").addEventListener("change", function (e) { S.areaNs = e.target.checked; $("#area").disabled = S.areaNs; render(); });

  function setTipo(k, nota) {
    S.tipo = k;
    var r = $('#optTipo input[value="' + k + '"]'); if (r) r.checked = true;
    if (nota) { S.notas = nota; $("#notas").value = nota; }
    irPaso(2); render();
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-preset]"); if (!b) return;
    setTipo(b.dataset.preset, b.dataset.nota);
    $("#cotizador").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  });

  function irPaso(n) {
    paso = Math.max(1, Math.min(TOTAL, n));
    $$(".paso").forEach(function (p) { p.hidden = +p.dataset.paso !== paso; });
    $$("button", pasosNav).forEach(function (b) { b.setAttribute("aria-current", +b.dataset.ir === paso ? "step" : "false"); });
    $("#btnAtras").style.visibility = paso === 1 ? "hidden" : "visible";
    $("#btnSig").hidden = paso === TOTAL;
    $("#cotErr").hidden = true;
  }
  $("#btnAtras").addEventListener("click", function () { irPaso(paso - 1); });
  $("#btnSig").addEventListener("click", function () {
    var err = $("#cotErr");
    if (paso === 1 && !S.tipo) { err.textContent = "Elegí el tipo de obra para continuar."; err.hidden = false; return; }
    if (paso === 2 && !S.provincia) { err.textContent = "Elegí la provincia donde queda la obra."; err.hidden = false; return; }
    irPaso(paso + 1);
  });
  pasosNav.addEventListener("click", function (e) { var b = e.target.closest("[data-ir]"); if (b) irPaso(+b.dataset.ir); });

  function nombreDe(l, v) { for (var i = 0; i < l.length; i++) if (l[i][0] === v) return l[i][1]; return ""; }
  function lineas() {
    return [
      ["Obra", S.tipo ? T.tipos[S.tipo] : ""],
      ["Ubicación", [S.provincia, S.zona].filter(Boolean).join(", ")],
      ["Terreno", nombreDe(T.terreno, S.terreno)],
      ["Tamaño", S.areaNs ? "Por definir" : S.area + " m²"],
      ["Planos", nombreDe(T.planos, S.planos)],
      ["Acabados", nombreDe(T.acabados, S.acabados)],
      ["Inicio", nombreDe(T.plazo, S.plazo)]
    ];
  }
  function mensaje() {
    var m = "Hola IDESA, quisiera solicitar un presupuesto (desde el sitio web).\n";
    lineas().forEach(function (l) { if (l[1]) m += "\n" + l[0] + ": " + l[1]; });
    if (S.nombre) m += "\nNombre: " + S.nombre;
    if (S.notas) m += "\nDetalles: " + S.notas;
    return m;
  }
  var planoTipo = "";
  function render() {
    $("#areaOut").textContent = S.areaNs ? "Por definir" : S.area + " m²";
    var h = "", llenos = 0;
    lineas().forEach(function (l) {
      if (l[1]) llenos++;
      h += "<div" + (l[1] ? "" : ' class="vacio"') + "><dt>" + l[0] + "</dt><dd>" + esc(l[1] || "—") + "</dd></div>";
    });
    $("#tiqLineas").innerHTML = h;
    $("#tiqBarra").style.width = Math.round(llenos / 7 * 100) + "%";
    var listo = !!(S.tipo && S.provincia);
    $("#tiqEstado").textContent = listo ? "Lista para enviar. Mientras más datos, mejor." : "Falta el tipo de obra y la provincia.";
    var b = $("#btnEnviar");
    b.href = listo ? wa(mensaje()) : "#cotizador";
    b.classList.toggle("is-off", !listo);
    b.setAttribute("aria-disabled", String(!listo));
    $("#msgPrev").value = mensaje();
    $$("#pasosNav button").forEach(function (x, i) {
      x.classList.toggle("ok", [!!S.tipo, !!S.provincia, !!(S.planos || S.acabados || S.areaNs || S.area !== 120), !!S.plazo][i]);
    });
    var pt = S.tipo || "casa";
    if (pt !== planoTipo) { planoTipo = pt; $("#tiqPlano").innerHTML = E.svg(pt, { modo: "plano" }); }
  }
  $("#btnEnviar").addEventListener("click", function (e) {
    if (this.classList.contains("is-off")) {
      e.preventDefault(); irPaso(!S.tipo ? 1 : 2);
      var err = $("#cotErr"); err.textContent = "Completá el tipo de obra y la provincia para enviar."; err.hidden = false;
    }
  });
  $("#btnCopiar").addEventListener("click", function () {
    var t = $("#btnCopiarTxt"), prev = $("#msgPrev"), msg = mensaje();
    function ok() { t.textContent = "Mensaje copiado"; setTimeout(function () { t.textContent = "Copiar el mensaje"; }, 1800); }
    function respaldo() { prev.closest("details").open = true; prev.focus(); prev.select(); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(msg).then(ok, respaldo); else respaldo();
  });
  $("#tiqFecha").textContent = new Date().toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" });
  irPaso(1); render();

  /* ---------- regla de niveles + etapa de la obra ---------- */
  var nivelM = $("#nivelMarca"), nivelT = $("#nivelTxt"), tick = false;
  function alScroll() {
    tick = false;
    var max = document.documentElement.scrollHeight - window.innerHeight, f = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    nivelM.style.setProperty("--n", f);
    nivelT.textContent = "N +" + (f * 12).toFixed(2).replace(".", ",");
    etapaPorScroll();
  }
  function pedir() { if (!tick) { tick = true; requestAnimationFrame(alScroll); } }
  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  setEtapa(1); alScroll();
})();
