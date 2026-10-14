(function () {
  "use strict";
  var N = window.IDESA, T = window.TXT;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var wa = function (msg) { return "https://wa.me/" + N.whatsapp + "?text=" + encodeURIComponent(msg); };
  var TIPOS = ["casa", "ampliacion", "remodelacion", "comercial", "muros", "otro"];

  /* ---------- datos del negocio ---------- */
  $$("[data-neg]").forEach(function (el) {
    var v = N[el.getAttribute("data-neg")];
    if (v) { el.textContent = v; }
    else if (N.demo) { el.textContent = T.pendiente; el.classList.add("pend"); }
    else { var p = el.closest("[data-requiere]"); if (p) p.hidden = true; }
  });
  $$("[data-requiere]").forEach(function (el) {
    if (!N[el.getAttribute("data-requiere")] && !N.demo) el.hidden = true;
  });
  $$("[data-demo]").forEach(function (el) { el.hidden = !N.demo; });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  $$("[data-wa]").forEach(function (a) { a.href = wa(a.getAttribute("data-wa")); a.target = "_blank"; a.rel = "noopener"; });
  var enlaces = { tel: "tel:+506" + N.telefono.replace(/\D/g, ""), instagram: N.instagram, facebook: N.facebook, email: N.correo ? "mailto:" + N.correo : "#" };
  $$("[data-href]").forEach(function (a) {
    a.href = enlaces[a.getAttribute("data-href")] || "#";
    if (/^https/.test(a.href)) { a.target = "_blank"; a.rel = "noopener"; }
  });

  /* ---------- tema ---------- */
  var root = document.documentElement, themeBtn = $("#themeBtn");
  function oscuro() { return root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; }
  function icono() { themeBtn.querySelector("use").setAttribute("href", oscuro() ? "#i-sun" : "#i-moon"); }
  try { var guardado = localStorage.getItem("idesa-tema"); if (guardado) root.dataset.theme = guardado; } catch (e) {}
  icono();
  themeBtn.addEventListener("click", function () {
    root.dataset.theme = oscuro() ? "light" : "dark"; icono();
    try { localStorage.setItem("idesa-tema", root.dataset.theme); } catch (e) {}
  });

  /* ---------- menú móvil ---------- */
  var burger = $("#burger"), menu = $("#menu");
  burger.addEventListener("click", function () {
    var abierto = menu.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(abierto));
  });
  $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); }); });

  /* ---------- portada: selector + dibujo ---------- */
  var selOps = $("#selectorOps"), dibujo = $("#planoDibujo"), tipoHero = "casa";
  TIPOS.slice(0, 5).forEach(function (k, i) {
    var l = document.createElement("label");
    l.className = "op";
    l.innerHTML = '<input type="radio" name="tipoHero" value="' + k + '"' + (i === 0 ? " checked" : "") + '><span><svg aria-hidden="true"><use href="#' + (k === "casa" || k === "ampliacion" || k === "remodelacion" || k === "comercial" || k === "muros" ? "s-" + k : "s-casa") + '"/></svg>' + T.tipos[k] + "</span>";
    selOps.appendChild(l);
  });
  function pintarHero(animar) {
    window.pintarPlano(dibujo, tipoHero, animar);
    $("#planoPieza").textContent = T.pieza[tipoHero];
    $("#selectorEstado").textContent = T.hero[tipoHero];
    $("#selectorWa").href = wa("Hola IDESA, quiero un presupuesto para: " + T.tipos[tipoHero] + ". Lo vi en su sitio web.");
    $("#selectorWa").target = "_blank"; $("#selectorWa").rel = "noopener";
  }
  selOps.addEventListener("change", function (e) { tipoHero = e.target.value; pintarHero(true); });
  $("#selectorDetalle").addEventListener("click", function () { setTipo(tipoHero); });
  pintarHero(false);

  /* ---------- obras (fichas de ejemplo; poner foto: "ruta.jpg" para usar una imagen real) ---------- */
  var OBRAS = [
    { cat: "casa", foto: "" }, { cat: "ampliacion", foto: "" }, { cat: "remodelacion", foto: "" },
    { cat: "comercial", foto: "" }, { cat: "muros", foto: "" }, { cat: "casa", foto: "" }
  ];
  var filtros = $("#filtros"), grid = $("#obrasGrid"), filtroAct = "todas";
  [["todas", T.filtroTodas]].concat(TIPOS.slice(0, 5).map(function (k) { return [k, T.tipos[k]]; })).forEach(function (f) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "filtro"; b.dataset.f = f[0]; b.textContent = f[1];
    b.setAttribute("aria-pressed", String(f[0] === "todas"));
    filtros.appendChild(b);
  });
  OBRAS.forEach(function (o, i) {
    var c = document.createElement("article");
    c.className = "obra"; c.dataset.cat = o.cat;
    var vis = o.foto ? '<img src="' + o.foto + '" alt="' + T.tipos[o.cat] + '" loading="lazy">'
      : '<svg viewBox="0 20 320 216" role="img" aria-label="' + T.tipos[o.cat] + '"><g></g></svg><span class="obra__tag">Ejemplo</span>';
    c.innerHTML = '<div class="obra__vis">' + vis + '</div><div class="obra__cap"><h3>' + T.tipos[o.cat] + '</h3>' +
      '<dl><div><dt>Zona</dt><dd class="pend">' + T.pendiente + '</dd></div><div><dt>Área</dt><dd class="pend">' + T.pendiente + '</dd></div></dl>' +
      '<button type="button" class="link" data-obra="' + i + '">Quiero una como esta<svg aria-hidden="true"><use href="#i-arrow"/></svg></button></div>';
    var g = $("svg g", c); if (g) window.pintarPlano(g, o.cat, false);
    grid.appendChild(c);
  });
  filtros.addEventListener("click", function (e) {
    var b = e.target.closest(".filtro"); if (!b) return;
    filtroAct = b.dataset.f;
    $$(".filtro", filtros).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    $$(".obra", grid).forEach(function (c) { c.hidden = filtroAct !== "todas" && c.dataset.cat !== filtroAct; });
  });
  grid.addEventListener("click", function (e) {
    var b = e.target.closest("[data-obra]"); if (!b) return;
    var o = OBRAS[+b.dataset.obra];
    setTipo(o.cat, "Me interesa una obra parecida a la ficha «" + T.tipos[o.cat] + "» de su sitio web.");
    $("#cotizador").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ---------- cotizador ---------- */
  var S = { tipo: "", provincia: "", zona: "", terreno: "", area: 120, areaNs: false, planos: "", acabados: "", plazo: "", nombre: "", notas: "" };
  var paso = 1, TOTAL = 4;
  var pasosNav = $("#pasosNav");
  T.pasos.forEach(function (t, i) {
    var li = document.createElement("li");
    li.innerHTML = '<button type="button" data-ir="' + (i + 1) + '"><span>' + (i + 1) + "</span>" + t + "</button>";
    pasosNav.appendChild(li);
  });
  function radios(cont, name, lista, onSel) {
    var h = "";
    lista.forEach(function (it) { h += '<label class="opt"><input type="radio" name="' + name + '" value="' + it[0] + '"><span>' + it[1] + "</span></label>"; });
    cont.innerHTML = h;
    cont.addEventListener("change", function (e) { onSel(e.target.value); render(); });
  }
  radios($("#optTipo"), "tipo", TIPOS.map(function (k) { return [k, T.tipos[k]]; }), function (v) { S.tipo = v; });
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
  $$("[data-preset]").forEach(function (b) {
    b.addEventListener("click", function () {
      setTipo(b.dataset.preset, b.dataset.nota);
      $("#cotizador").scrollIntoView({ behavior: "smooth", block: "start" });
    });
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

  function nombreDe(lista, v) { for (var i = 0; i < lista.length; i++) if (lista[i][0] === v) return lista[i][1]; return ""; }
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
  function render() {
    $("#areaOut").textContent = S.areaNs ? "Por definir" : S.area + " m²";
    var h = "", llenos = 0;
    lineas().forEach(function (l) {
      if (l[1]) llenos++;
      h += "<div" + (l[1] ? "" : ' class="vacio"') + "><dt>" + l[0] + "</dt><dd>" + (l[1] || "—") + "</dd></div>";
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
      var ok = [!!S.tipo, !!S.provincia, !!(S.planos || S.acabados || S.areaNs || S.area !== 120), !!S.plazo][i];
      x.classList.toggle("ok", ok);
    });
  }
  $("#btnEnviar").addEventListener("click", function (e) { if (this.classList.contains("is-off")) { e.preventDefault(); irPaso(!S.tipo ? 1 : 2); $("#cotErr").textContent = "Completá el tipo de obra y la provincia para enviar."; $("#cotErr").hidden = false; } });
  $("#btnCopiar").addEventListener("click", function () {
    var t = $("#btnCopiarTxt"), prev = $("#msgPrev"), msg = mensaje();
    function ok() { t.textContent = "Mensaje copiado"; setTimeout(function () { t.textContent = "Copiar el mensaje"; }, 1800); }
    function respaldo() { prev.closest("details").open = true; prev.focus(); prev.select(); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(msg).then(ok, respaldo); else respaldo();
  });
  $("#tiqFecha").textContent = new Date().toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" });
  irPaso(1); render();
})();
