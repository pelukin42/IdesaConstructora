/* Constructora IDESA · capa inmersiva de las obras publicadas
   - Carrusel 3D giratorio de obras
   - Visor de obra con foto en profundidad y maqueta 3D (CSS 3D, sin librerías)
   - Tarjetas de la galería con inclinación, brillo y entrada en perspectiva
   Se apoya en window.IDESA (datos) y window.IDESA_UI (ventanas y utilidades de app.js). */
(function () {
  "use strict";
  var N = window.IDESA, U = window.IDESA_UI;
  if (!N || !U) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  var esc = U.esc;
  var has3d = (function () { var s = document.documentElement.style; return "transformStyle" in s || "webkitTransformStyle" in s; })();
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ============ íconos nuevos ============ */
  (function () {
    var ic = {
      "i-cubo": '<path d="M12 2.8 20 7.4v9.2l-8 4.6-8-4.6V7.4z"/><path d="M4 7.4l8 4.6 8-4.6M12 12v9.2"/>',
      "i-explotar": '<path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="m9 9-3-3M15 9l3-3M9 15l-3 3M15 15l3 3"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/>',
      "i-luna": '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
      "i-sol": '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
      "i-girar": '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v5h-5"/>',
      "i-mas": '<path d="M12 5v14M5 12h14"/>',
      "i-menos": '<path d="M5 12h14"/>',
      "i-foto": '<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><circle cx="9" cy="10.5" r="1.7"/><path d="m4 17 5-4.5 3.5 3L16 12l4 4"/>',
      "i-mano": '<path d="M7 14V6.5a1.5 1.5 0 0 1 3 0V12M10 11V4.8a1.5 1.5 0 0 1 3 0V11M13 11V6a1.5 1.5 0 0 1 3 0v7M16 11.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.4a5 5 0 0 1-4-2L4.7 15.2a1.6 1.6 0 0 1 2.4-2z"/>'
    };
    var s = '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>';
    Object.keys(ic).forEach(function (k) { s += '<symbol id="' + k + '" viewBox="0 0 24 24">' + ic[k] + "</symbol>"; });
    var d = document.createElement("div"); d.innerHTML = s + "</defs></svg>";
    document.body.insertBefore(d.firstChild, document.body.firstChild);
  })();
  var ico = function (k, c) { return '<svg class="ic' + (c ? " " + c : "") + '"><use href="#i-' + k + '"/></svg>'; };

  /* ============================================================
     MAQUETA 3D
     Geometría en píxeles; x a la derecha, y hacia arriba, z hacia quien mira.
     Cada caja son seis caras con color propio según su orientación.
     ============================================================ */
  var NAVY = "#2B2142", NAVY3 = "#54406C", RED = "#E23737", SALMON = "#F18D71", LILAC = "#BBA9E3";
  var WALL = "#FBD7CB", CONC = "#CFC6DE", CREAM = "#F6F3F7";
  var SHADE = { f: .97, b: .66, r: .8, l: .88, t: 1.1, d: .5 };

  function rgb(h) { h = h.replace("#", ""); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function div(cls, p) { var d = document.createElement("div"); d.className = cls; if (p) p.appendChild(d); return d; }
  function face(p, cls, w, h, tr, hex, k, extra) {
    var c = rgb(hex), f = div("f " + cls, p), m = function (v) { return Math.min(255, Math.round(v * k)); };
    f.style.cssText = "width:" + w + "px;height:" + h + "px;margin:" + (-h / 2) + "px 0 0 " + (-w / 2) + "px;transform:" + tr + ";--fr:" + m(c[0]) + ";--fg:" + m(c[1]) + ";--fb:" + m(c[2]) + (extra || "");
    return f;
  }
  function part(p, ex, base) {
    var d = div("pt", p), s = "";
    if (ex) s += "--x:" + (ex[0] || 0) + "px;--y:" + (ex[1] || 0) + "px;--z:" + (ex[2] || 0) + "px;";
    if (base) s += "--bx:" + (base[0] || 0) + "px;--by:" + (base[1] || 0) + "px;--bz:" + (base[2] || 0) + "px;";
    d.style.cssText = s; return d;
  }
  function box(p, o) {
    var w = o.w, h = o.h, d = o.d, b = div("b", p), cl = o.cls || "", c = o.c;
    b.style.transform = "translate3d(" + (o.x || 0) + "px," + (-((o.y || 0) + h / 2)) + "px," + (o.z || 0) + "px)";
    var F = {};
    F.f = face(b, "wall " + cl, w, h, "translateZ(" + d / 2 + "px)", o.cf || c, SHADE.f);
    F.b = face(b, "wall " + cl, w, h, "rotateY(180deg) translateZ(" + d / 2 + "px)", o.cb || c, SHADE.b);
    F.r = face(b, "wall " + cl, d, h, "rotateY(90deg) translateZ(" + w / 2 + "px)", o.cr || c, SHADE.r);
    F.l = face(b, "wall " + cl, d, h, "rotateY(-90deg) translateZ(" + w / 2 + "px)", o.cl || c, SHADE.l);
    F.t = face(b, "top " + (o.top || cl), w, d, "rotateX(90deg) translateZ(" + h / 2 + "px)", o.ct || c, SHADE.t);
    F.d = face(b, "bot", w, d, "rotateX(-90deg) translateZ(" + h / 2 + "px)", o.cd || c, SHADE.d);
    b.F = F; return b;
  }
  /* decoración plana sobre una cara: l, t, w, h en píxeles desde su esquina superior izquierda */
  function deco(f, cls, l, t, w, h, html) {
    var i = document.createElement("i"); i.className = "dc " + cls;
    i.style.cssText = "left:" + l + "px;top:" + t + "px;width:" + w + "px;height:" + h + "px";
    if (html) i.textContent = html; f.appendChild(i); return i;
  }
  function ventana(f, l, t, w, h) { return deco(f, "win", l, t, w || 44, h || 38); }

  /* techo a dos aguas con frontones laterales */
  function techo(p, o) {
    var hyp = Math.hypot(o.d / 2, o.rh), L = hyp + (o.over || 0), cosA = (o.d / 2) / hyp, sinA = o.rh / hyp;
    var th = Math.atan2(o.d / 2, o.rh) * 180 / Math.PI, zc = (L / 2) * cosA, yc = o.y + o.rh - (L / 2) * sinA, W = o.w + (o.overX || 0) * 2;
    [1, -1].forEach(function (s) {
      var b = div("b", p), base = (s > 0 ? "" : "rotateY(180deg) ") + "rotateX(" + th + "deg)";
      b.style.transform = "translate3d(" + (o.x || 0) + "px," + (-yc) + "px," + (s * zc) + "px)";
      face(b, "roof", W, L, base + " translateZ(1.6px)", o.c, s > 0 ? 1 : .88);
      face(b, "roof", W, L, base + " translateZ(-1.6px)", o.c, .5);
    });
    [1, -1].forEach(function (s) {
      var b = div("b", p); b.style.transform = "translate3d(" + ((o.x || 0) + s * o.w / 2) + "px," + (-(o.y + o.rh / 2)) + "px,0)";
      face(b, "", o.d, o.rh, "rotateY(" + (s * 90) + "deg)", o.g, s > 0 ? .8 : .88, ";clip-path:polygon(50% 0,100% 100%,0 100%)");
    });
  }
  /* techo de un agua: lado alto atrás, lado bajo adelante */
  function techo1(p, o) {
    var hyp = Math.hypot(o.d, o.rh), L = hyp + (o.over || 0), th = Math.atan2(o.d, o.rh) * 180 / Math.PI;
    var b = div("b", p); b.style.transform = "translate3d(" + (o.x || 0) + "px," + (-(o.y + o.rh / 2)) + "px," + (o.z || 0) + "px)";
    var tr = "rotateX(" + th + "deg)";
    face(b, "roof", o.w, L, tr + " translateZ(1.6px)", o.c, 1);
    face(b, "roof", o.w, L, tr + " translateZ(-1.6px)", o.c, .5);
  }
  function arbol(p, x, z, s) {
    s = s || 1;
    var t = div("tr", p); t.style.transform = "translate3d(" + x + "px,0," + z + "px)";
    box(t, { w: 7 * s, h: 30 * s, d: 7 * s, x: 0, y: 0, z: 0, c: "#7A5A48" });
    var c = div("b", t); c.style.transform = "translate3d(0," + (-(30 * s + 26 * s)) + "px,0)";
    [0, 60, 120].forEach(function (a) {
      var l = div("leaf", c), d = 64 * s;
      l.style.cssText = "width:" + d + "px;height:" + d + "px;margin:" + (-d / 2) + "px 0 0 " + (-d / 2) + "px;transform:rotateY(" + a + "deg)";
    });
    var sh = div("shadow", t); sh.style.cssText = "width:" + 52 * s + "px;height:" + 52 * s + "px;margin:" + (-26 * s) + "px 0 0 " + (-26 * s) + "px";
  }
  function base(w, W, D) {
    var p = part(w);
    box(p, { w: 520, h: 14, d: 400, x: 0, y: -14, z: 0, c: NAVY3, ct: "#3E2B4E", top: "plinth" });
    var s = div("shadow", p); s.style.cssText = "width:" + W + "px;height:" + D + "px;margin:" + (-D / 2) + "px 0 0 " + (-W / 2) + "px;transform:rotateX(90deg) translateZ(1px)";
    return p;
  }

  var BUILD = {
    casa: {
      span: 330, alto: 250, zex: .72, ex: "Vista explotada",
      build: function (w) {
        var W = 230, D = 150, H = 96, RH = 56, Y = 7;
        base(w, 300, 230);
        var s = part(w, [0, -2, 0]);
        box(s, { w: W + 50, h: Y, d: D + 60, x: 0, y: 0, z: 6, c: CONC, ct: "#DDD6EA" });
        box(s, { w: 30, h: 3, d: 82, x: -64, y: 0, z: 152, c: "#CBBFE0", ct: "#E4DCF1" });
        var body = part(w, [0, -4, 0]);
        var cu = box(body, { w: W, h: H, d: D, x: 0, y: Y, z: 0, c: WALL });
        box(body, { w: W + 4, h: 9, d: D + 4, x: 0, y: Y, z: 0, c: LILAC });
        deco(cu.F.f, "door", 34, H - 62, 34, 62);
        ventana(cu.F.f, 100, 26); ventana(cu.F.f, 164, 26);
        ventana(cu.F.r, 52, 26); ventana(cu.F.r, 104, 26);
        ventana(cu.F.b, 40, 26); ventana(cu.F.b, 150, 26);
        var roof = part(w, [0, 120, 0]);
        techo(roof, { w: W, d: D, rh: RH, y: Y + H, c: RED, g: WALL, over: 16, overX: 12 });
        var por = part(w, [0, 24, 78]);
        box(por, { w: 100, h: 4, d: 58, x: -64, y: Y, z: D / 2 + 29, c: "#E4DCF1" });
        box(por, { w: 7, h: 62, d: 7, x: -104, y: Y + 4, z: D / 2 + 52, c: "#FFFFFF" });
        box(por, { w: 7, h: 62, d: 7, x: -24, y: Y + 4, z: D / 2 + 52, c: "#FFFFFF" });
        box(por, { w: 118, h: 5, d: 70, x: -64, y: Y + 66, z: D / 2 + 33, c: "#B52424", ct: RED });
        var ar = part(w, [40, 6, 40]);
        arbol(ar, 205, 110, 1.1); arbol(ar, -205, -80, 1); arbol(ar, 190, -110, .9);
      }
    },
    ampliacion: {
      span: 330, alto: 235, zex: .86, ex: "Separar ampliación",
      build: function (w) {
        var Y = 7;
        base(w, 340, 230);
        var cim = part(w, [0, -34, 0]);
        box(cim, { w: 124, h: Y, d: 116, x: 96, y: 0, z: -12, c: "#8E83A3", ct: "#B2A8C6" });
        var s = part(w);
        box(s, { w: 190, h: Y, d: 156, x: -45, y: 0, z: 0, c: CONC, ct: "#DDD6EA" });
        var casa = part(w, [-30, 0, 0]);
        var c1 = box(casa, { w: 170, h: 88, d: 140, x: -45, y: Y, z: 0, c: "#E7DFF2" });
        deco(c1.F.f, "door", 22, 88 - 60, 32, 60); ventana(c1.F.f, 80, 24); ventana(c1.F.f, 126, 24, 34);
        ventana(c1.F.l, 50, 24);
        var r1 = part(casa, [0, 80, 0]);
        techo(r1, { w: 170, d: 140, rh: 50, y: Y + 88, c: "#8C79B8", g: "#E7DFF2", over: 14, overX: 10, x: -45 });
        var amp = part(w, [100, 22, 0]);
        var c2 = box(amp, { w: 110, h: 88, d: 110, x: 96, y: Y, z: -12, c: WALL });
        box(amp, { w: 114, h: 8, d: 114, x: 96, y: Y, z: -12, c: LILAC });
        deco(c2.F.f, "shop", 14, 22, 82, 52);
        deco(c2.F.r, "door", 38, 88 - 60, 34, 60);
        techo1(amp, { w: 124, d: 118, rh: 24, y: Y + 88, x: 96, z: -12, c: RED, over: 8 });
        var ar = part(w, [30, 6, 50]);
        arbol(ar, 215, 110, 1.05); arbol(ar, -215, 100, 1);
      }
    },
    remodelacion: {
      span: 300, alto: 265, zex: .8, ex: "Vista explotada",
      build: function (w) {
        var Y = 8, H = 92;
        base(w, 330, 230);
        var piso = part(w, [0, -34, 0]);
        box(piso, { w: 256, h: Y, d: 176, x: 0, y: 0, z: 0, c: CONC, ct: "#D8B592", top: "wood" });
        var par = part(w, [0, 0, -20]);
        var pb = box(par, { w: 256, h: H, d: 8, x: 0, y: Y, z: -84, c: WALL, cf: "#F6EEF8" });
        deco(pb.F.f, "win", 150, 26, 54, 40);
        box(par, { w: 8, h: H, d: 176, x: -124, y: Y, z: 0, c: WALL, cr: "#F6EEF8" });
        box(par, { w: 8, h: H, d: 176, x: 124, y: Y, z: 0, c: WALL, cl: "#F6EEF8" });
        var ban = part(w, [70, 6, -42]);
        box(ban, { w: 6, h: H, d: 66, x: 58, y: Y, z: -48, c: "#E4DCF1" });
        box(ban, { w: 52, h: H, d: 6, x: 94, y: Y, z: -15, c: "#E4DCF1" });
        box(ban, { w: 16, h: 14, d: 22, x: 108, y: Y, z: -66, c: "#FFFFFF" });
        box(ban, { w: 16, h: 26, d: 8, x: 108, y: Y, z: -78, c: "#FFFFFF" });
        box(ban, { w: 38, h: 3, d: 38, x: 78, y: Y, z: -52, c: "#A896D6" });
        face(ban, "glass", 38, 66, "translate3d(78px," + (-(Y + 36)) + "px,-33px)", "#FFFFFF", 1);
        var coc = part(w, [-40, 10, 10]);
        box(coc, { w: 130, h: 26, d: 30, x: -50, y: Y, z: -62, c: SALMON, ct: CREAM });
        box(coc, { w: 120, h: 24, d: 18, x: -50, y: Y + 62, z: -70, c: NAVY3 });
        box(coc, { w: 58, h: 26, d: 32, x: -56, y: Y, z: -6, c: NAVY, ct: CREAM });
        var mue = part(w, [10, 52, 60]);
        box(mue, { w: 72, h: 14, d: 32, x: 62, y: Y, z: 52, c: LILAC });
        box(mue, { w: 72, h: 20, d: 8, x: 62, y: Y + 14, z: 40, c: "#A896D6" });
        box(mue, { w: 38, h: 10, d: 24, x: -6, y: Y, z: 56, c: "#8C79B8", ct: "#D8B592" });
        var roof = part(w, [0, 70, 0], [0, 70, 0]);
        box(roof, { w: 266, h: 6, d: 186, x: 0, y: Y + H, z: 0, c: "#B52424", ct: RED });
      }
    },
    comercial: {
      span: 370, alto: 205, zex: .76, ex: "Vista explotada",
      build: function (w) {
        var Y = 3, H = 84;
        base(w, 380, 250);
        var pk = part(w, [0, -2, 30]);
        box(pk, { w: 350, h: 3, d: 108, x: 0, y: 0, z: 120, c: "#6B5A85", top: "lines" });
        var s = part(w, [0, -4, 0]);
        box(s, { w: 320, h: Y, d: 166, x: 0, y: 0, z: -20, c: CONC, ct: "#DDD6EA" });
        var cu = part(w, [0, 0, 0]);
        var b = box(cu, { w: 300, h: H, d: 150, x: 0, y: Y, z: -20, c: "#EDE7F5", cf: CREAM });
        deco(b.F.f, "shop", 22, 24, 172, 56);
        deco(b.F.f, "shop", 212, 24, 52, 60);
        deco(b.F.r, "win", 30, 24, 40, 30); deco(b.F.r, "win", 80, 24, 40, 30);
        deco(b.F.l, "win", 30, 24, 40, 30);
        var sg = box(cu, { w: 304, h: 18, d: 10, x: 0, y: Y + 66, z: 60, c: RED });
        deco(sg.F.f, "sign", 0, 0, 304, 18, "TU LOCAL");
        var aw = part(w, [0, 16, 52]);
        var th = 72, L = 44, ay = Y + 63 - (L / 2) * Math.cos(th * Math.PI / 180), az = 55 + (L / 2) * Math.sin(th * Math.PI / 180);
        var ab = div("b", aw); ab.style.transform = "translate3d(-8px," + (-ay) + "px," + az + "px)";
        face(ab, "roof stripe", 214, L, "rotateX(" + th + "deg) translateZ(1px)", RED, 1);
        face(ab, "roof", 214, L, "rotateX(" + th + "deg) translateZ(-1px)", RED, .5);
        var roof = part(w, [0, 74, 0]);
        box(roof, { w: 308, h: 5, d: 158, x: 0, y: Y + H, z: -20, c: NAVY3, ct: "#6B5A85" });
        box(roof, { w: 308, h: 8, d: 6, x: 0, y: Y + H + 5, z: 57, c: "#8E83A3" });
        box(roof, { w: 308, h: 8, d: 6, x: 0, y: Y + H + 5, z: -97, c: "#8E83A3" });
        box(roof, { w: 6, h: 8, d: 152, x: -151, y: Y + H + 5, z: -20, c: "#8E83A3" });
        box(roof, { w: 6, h: 8, d: 152, x: 151, y: Y + H + 5, z: -20, c: "#8E83A3" });
        box(roof, { w: 42, h: 18, d: 30, x: -80, y: Y + H + 5, z: -40, c: "#DDD6EA" });
        box(roof, { w: 26, h: 12, d: 26, x: 90, y: Y + H + 5, z: -50, c: "#DDD6EA" });
        var ar = part(w, [30, 6, 40]);
        arbol(ar, 225, 70, .9); arbol(ar, -225, 90, 1);
      }
    },
    muros: {
      span: 440, alto: 215, zex: .82, ex: "Ver capas",
      build: function (w) {
        base(w, 450, 250);
        var ac = part(w, [0, -2, 40]);
        box(ac, { w: 430, h: 3, d: 100, x: 0, y: 0, z: 118, c: "#6B5A85", ct: "#CFC6DE", top: "tile" });
        var tie = part(w, [0, 0, -50]);
        box(tie, { w: 430, h: 70, d: 112, x: 0, y: 0, z: -96, c: "#A9826D", ct: "#7FB08E" });
        var ft = part(w, [0, -28, 0]);
        box(ft, { w: 392, h: 12, d: 72, x: 0, y: 0, z: -28, c: "#8E83A3", ct: "#A99FBC" });
        var gr = part(w, [0, 8, -34]);
        box(gr, { w: 380, h: 20, d: 16, x: 0, y: 12, z: -64, c: "#B9B0C9" });
        var tb = part(w, [0, -6, -52]);
        box(tb, { w: 380, h: 6, d: 7, x: 0, y: 12, z: -50, c: NAVY });
        var bw = 52, bh = 30, bd = 38, FILAS = 3, r, k;
        for (r = 0; r < FILAS; r++) {
          var row = part(w, [0, 14 * r + 2, 6 * r]);
          var y = 12 + r * bh;
          if (r % 2 === 0) for (k = 0; k < 7; k++) box(row, { w: bw, h: bh, d: bd, x: -156 + k * bw, y: y, z: -28, c: (k + r) % 2 ? "#BFB3D4" : CONC, cls: "blk" });
          else {
            box(row, { w: bw / 2, h: bh, d: bd, x: -182 + bw / 4, y: y, z: -28, c: CONC, cls: "blk" });
            for (k = 0; k < 6; k++) box(row, { w: bw, h: bh, d: bd, x: -156 + bw / 2 + k * bw, y: y, z: -28, c: k % 2 ? CONC : "#BFB3D4", cls: "blk" });
            box(row, { w: bw / 2, h: bh, d: bd, x: 182 - bw / 4, y: y, z: -28, c: CONC, cls: "blk" });
          }
        }
        var top = 12 + FILAS * bh, ba = part(w, [0, 56, 10]);
        for (k = 0; k < 5; k++) box(ba, { w: 6, h: 36, d: 6, x: -170 + k * 85, y: top, z: -28, c: SALMON });
        box(ba, { w: 346, h: 4, d: 4, x: 0, y: top + 12, z: -28, c: RED });
        box(ba, { w: 346, h: 4, d: 4, x: 0, y: top + 28, z: -28, c: RED });
        var ar = part(w, [0, 6, 60]);
        arbol(ar, -215, 120, .9); arbol(ar, 215, 128, .9);
      }
    }
  };

  var Maqueta = {
    tiene: function (t) { return !!BUILD[t]; },
    crear: function (host, tipo, o) {
      o = o || {};
      var cfg = BUILD[tipo] || BUILD.casa;
      host.classList.add("mq"); host.innerHTML = "";
      var sky = div("mq-sky", host), nt = div("mq-sky nt", host), scene = div("mq-scene", host), world = div("mq-world", scene);
      cfg.build(world);
      var hint = document.createElement("div"); hint.className = "mq-hint";
      hint.innerHTML = ico("mano") + "Arrastrá para girar"; host.appendChild(hint);
      if (o.nota) { var nota = div("mq-note", host); nota.textContent = o.nota; }
      var ui = div("mq-ui", host);
      function boton(txt, icono, cls, label) {
        var b = document.createElement("button"); b.type = "button"; b.className = "mq-b " + (cls || "");
        b.innerHTML = ico(icono) + (txt ? "<span>" + txt + "</span>" : ""); if (label) b.setAttribute("aria-label", label);
        ui.appendChild(b); return b;
      }
      var bEx = boton(cfg.ex, "explotar", "keep pulse"); bEx.setAttribute("aria-pressed", "false");
      var bNi = boton("Noche", "luna"); bNi.setAttribute("aria-pressed", "false");
      var bAu = boton("Girar solo", "girar"); bAu.setAttribute("aria-pressed", reduce || o.auto === false ? "false" : "true");
      var sp = div("mq-sp", ui);
      var bMe = boton("", "menos", "ico", "Alejar"), bMa = boton("", "mas", "ico", "Acercar"), bRe = boton("", "girar", "ico", "Volver a la vista inicial");
      if (o.onFoto) { var bFo = boton("Ver foto", "foto", "keep"); bFo.addEventListener("click", o.onFoto); ui.insertBefore(bFo, sp); }
      host.setAttribute("tabindex", "0"); host.setAttribute("role", "group");
      host.setAttribute("aria-label", "Maqueta 3D. Arrastrá para girar; con el teclado, las flechas giran y más y menos acercan.");

      var S = { yaw: -34, pitch: 24, zoom: 1, ze: 1, vy: 0, auto: !reduce && o.auto !== false, base: 1, intro: reduce ? 1 : 0 }, I = { yaw: -34, pitch: 24 };
      var raf = 0, last = 0, idle = 0, visible = true, drag = null, ptrs = {}, pinch = 0, vivo = true;
      function ajustar() {
        var w = host.clientWidth || 600, h = host.clientHeight || 420;
        S.base = clamp(Math.min(.62 * w / cfg.span, .56 * h / cfg.alto), .3, 1.5);
      }
      function pintar() {
        var e = 1 - Math.pow(1 - S.intro, 3), k = S.base * S.zoom * S.ze * (.62 + .38 * e), yw = S.yaw - (1 - e) * 150;
        world.style.transform = "translate3d(0," + (-14 * S.base) + "px,0) rotateX(" + (-S.pitch) + "deg) rotateY(" + yw + "deg) scale3d(" + k + "," + k + "," + k + ")";
      }
      function paso(t) {
        raf = 0; if (!vivo) return;
        var dt = Math.min(48, t - last || 16); last = t;
        if (S.intro < 1) S.intro = Math.min(1, S.intro + dt / 1100);
        var zt = host.classList.contains("ex") ? cfg.zex : 1; S.ze += (zt - S.ze) * Math.min(1, dt * .004);
        if (!drag) {
          if (Math.abs(S.vy) > .0005) { S.yaw += S.vy * dt; S.vy *= Math.pow(.93, dt / 16); }
          idle = Math.max(0, idle - dt);
          if (S.auto && idle === 0 && S.intro >= 1) S.yaw += dt * .011;
        }
        pintar();
        if (visible && (S.auto || S.intro < 1 || Math.abs((host.classList.contains("ex") ? cfg.zex : 1) - S.ze) > .002 || drag || Math.abs(S.vy) > .0005 || idle > 0)) raf = requestAnimationFrame(paso);
      }
      function arrancar() { if (!raf && vivo) { last = 0; raf = requestAnimationFrame(paso); } }
      function usado() { host.classList.add("used"); idle = 2600; }

      var ro = window.ResizeObserver ? new ResizeObserver(function () { ajustar(); pintar(); }) : null;
      if (ro) ro.observe(host);
      var io = window.IntersectionObserver ? new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) arrancar(); }) : null;
      if (io) io.observe(host);
      ajustar(); pintar(); arrancar();

      host.addEventListener("pointerdown", function (e) {
        if (e.target.closest(".mq-ui")) return;
        ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
        var n = Object.keys(ptrs).length;
        if (n === 1) { drag = { x: e.clientX, y: e.clientY, t: e.timeStamp }; S.vy = 0; host.classList.add("drag"); }
        if (n === 2) { var p = Object.keys(ptrs).map(function (k) { return ptrs[k]; }); pinch = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y); }
        try { host.setPointerCapture(e.pointerId); } catch (x) {}
        usado(); arrancar();
      });
      host.addEventListener("pointermove", function (e) {
        var p = ptrs[e.pointerId]; if (!p) return;
        var n = Object.keys(ptrs).length;
        if (n >= 2) {
          p.x = e.clientX; p.y = e.clientY;
          var q = Object.keys(ptrs).map(function (k) { return ptrs[k]; }), d = Math.hypot(q[0].x - q[1].x, q[0].y - q[1].y);
          if (pinch) S.zoom = clamp(S.zoom * d / pinch, .5, 2.2); pinch = d; pintar(); return;
        }
        var dx = e.clientX - p.x, dy = e.clientY - p.y, dt = Math.max(8, e.timeStamp - (drag ? drag.t : e.timeStamp - 16));
        p.x = e.clientX; p.y = e.clientY;
        S.yaw += dx * .45; S.pitch = clamp(S.pitch + dy * .28, 6, 80);
        if (drag) { S.vy = clamp(dx * .45 / dt, -.6, .6); drag.t = e.timeStamp; }
        pintar();
      });
      function soltar(e) {
        delete ptrs[e.pointerId]; pinch = 0;
        if (!Object.keys(ptrs).length) { drag = null; host.classList.remove("drag"); idle = 2600; arrancar(); }
      }
      host.addEventListener("pointerup", soltar); host.addEventListener("pointercancel", soltar);
      host.addEventListener("wheel", function (e) {
        if (!(e.ctrlKey || e.metaKey)) return;
        e.preventDefault(); S.zoom = clamp(S.zoom * (e.deltaY < 0 ? 1.06 : .94), .5, 2.2); usado(); pintar();
      }, { passive: false });
      host.addEventListener("keydown", function (e) {
        var k = e.key, c = true;
        if (k === "ArrowLeft") S.yaw -= 8; else if (k === "ArrowRight") S.yaw += 8;
        else if (k === "ArrowUp") S.pitch = clamp(S.pitch - 5, 6, 80); else if (k === "ArrowDown") S.pitch = clamp(S.pitch + 5, 6, 80);
        else if (k === "+" || k === "=") S.zoom = clamp(S.zoom * 1.1, .5, 2.2); else if (k === "-") S.zoom = clamp(S.zoom / 1.1, .5, 2.2);
        else c = false;
        if (c) { e.preventDefault(); usado(); pintar(); }
      });
      bEx.addEventListener("click", function () {
        var on = host.classList.toggle("ex"); bEx.setAttribute("aria-pressed", String(on)); bEx.classList.remove("pulse"); usado(); arrancar();
        var s = bEx.querySelector("span"); if (s) s.textContent = on ? "Juntar piezas" : cfg.ex;
      });
      bNi.addEventListener("click", function () {
        var on = host.classList.toggle("night"); bNi.setAttribute("aria-pressed", String(on));
        bNi.innerHTML = ico(on ? "sol" : "luna") + "<span>" + (on ? "Día" : "Noche") + "</span>"; usado();
      });
      bAu.addEventListener("click", function () {
        S.auto = !S.auto; bAu.setAttribute("aria-pressed", String(S.auto)); idle = 0; arrancar();
      });
      bMa.addEventListener("click", function () { S.zoom = clamp(S.zoom * 1.18, .5, 2.2); usado(); pintar(); });
      bMe.addEventListener("click", function () { S.zoom = clamp(S.zoom / 1.18, .5, 2.2); usado(); pintar(); });
      bRe.addEventListener("click", function () { S.yaw = I.yaw; S.pitch = I.pitch; S.zoom = 1; S.vy = 0; usado(); pintar(); });
      function onVis() { if (!document.hidden) arrancar(); }
      document.addEventListener("visibilitychange", onVis);

      return {
        destruir: function () {
          vivo = false; if (raf) cancelAnimationFrame(raf); raf = 0;
          if (ro) ro.disconnect(); if (io) io.disconnect();
          document.removeEventListener("visibilitychange", onVis);
          host.innerHTML = ""; host.classList.remove("mq", "ex", "night", "used", "drag");
          ["tabindex", "role", "aria-label"].forEach(function (a) { host.removeAttribute(a); });
        }
      };
    }
  };

  /* ============================================================
     VISOR DE OBRA
     ============================================================ */
  var OBRAS = (N.obras || []).map(function (o) { return { tipo: o.tipo, titulo: o.titulo, foto: N.ruta(o.foto), zona: o.zona, area: o.area, estado: o.estado }; });
  var ov = $("#ov"), ovBox = ov && $(".box", ov), OV = { i: 0, mq: null, tab: "foto", listo: false };

  function armarOv() {
    if (OV.listo) return; OV.listo = true;
    ovBox.innerHTML =
      '<button class="qv-x" type="button" data-close aria-label="Cerrar"><svg class="ic"><use href="#i-x"/></svg></button>' +
      '<div class="ov-stage">' +
        '<div class="ov-tabs" role="tablist" aria-label="Vista de la obra">' +
          '<button type="button" role="tab" id="ovTabFoto" aria-controls="ovFoto" aria-selected="true">' + ico("foto") + "Foto</button>" +
          '<button type="button" role="tab" id="ovTab3d" aria-controls="ov3d" aria-selected="false">' + ico("cubo") + "Maqueta 3D</button>" +
        "</div>" +
        '<div class="ov-pane" id="ovFoto" role="tabpanel" aria-labelledby="ovTabFoto"></div>' +
        '<div class="ov-pane" id="ov3d" role="tabpanel" aria-labelledby="ovTab3d" hidden></div>' +
        '<button class="ov-nav p" type="button" aria-label="Obra anterior"><svg class="ic"><use href="#i-chl"/></svg></button>' +
        '<button class="ov-nav n" type="button" aria-label="Obra siguiente"><svg class="ic"><use href="#i-chr"/></svg></button>' +
      "</div>" +
      '<div class="ov-info">' +
        '<small class="k" id="ovTipo"></small><h3 id="ovTitle"></h3><p class="ov-desc" id="ovDesc"></p>' +
        '<dl class="ov-facts" id="ovFacts"></dl>' +
        '<ul class="qv-feat" id="ovFeat"></ul>' +
        '<div class="qv-actions"><button class="btn primary lg-btn" type="button" id="ovCta">' + ico("calc") + "Quiero una como esta</button>" +
        '<a class="btn wa" id="ovWa" href="#" target="_blank" rel="noopener"><svg class="ic fill"><use href="#i-wa"/></svg>Preguntar por WhatsApp</a></div>' +
        '<div class="ov-pos" id="ovPos"></div>' +
      "</div>";
    $("#ovTabFoto").addEventListener("click", function () { ponerTab("foto"); });
    $("#ovTab3d").addEventListener("click", function () { ponerTab("3d"); });
    $(".ov-nav.p", ov).addEventListener("click", function () { moverOv(-1); });
    $(".ov-nav.n", ov).addEventListener("click", function () { moverOv(1); });
    $("#ovCta").addEventListener("click", function () {
      var o = OBRAS[OV.i]; U.cerrar(ov); U.abrirSol(o.tipo, "Me interesa algo como: " + o.titulo + ".");
    });
  }

  function dato(v) {
    if (v) return '<dd>' + esc(v) + "</dd>";
    return N.demo ? '<dd class="na">Por confirmar</dd>' : "";
  }
  function pintarFoto(o, t) {
    var p = $("#ovFoto");
    if (!o.foto) { p.innerHTML = ""; return; }
    p.innerHTML = '<div class="ovp"><div class="ovp-card"><div class="ovp-shadow"></div><div class="ovp-frame" style="--g:var(' + t.g + ')"><img src="' + esc(o.foto) + '" alt="' + esc(o.titulo) + '"></div>' +
      '<span class="ovp-chip c1">' + U.icono(t.k) + esc(t.n) + "</span>" +
      '<span class="ovp-chip c2">' + ico("cubo") + "Mirá la maqueta 3D</span></div></div>";
    var wrap = $(".ovp", p), card = $(".ovp-card", p);
    $(".c2", p).style.cursor = "pointer"; $(".c2", p).addEventListener("click", function () { ponerTab("3d"); });
    if (reduce) return;
    wrap.addEventListener("pointermove", function (e) {
      var r = wrap.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.classList.add("live");
      card.style.setProperty("--ry", (x * 16).toFixed(2) + "deg"); card.style.setProperty("--rx", (-y * 12).toFixed(2) + "deg");
      card.style.setProperty("--gx", (x + .5) * 100 + "%"); card.style.setProperty("--gy", (y + .5) * 100 + "%");
    });
    wrap.addEventListener("pointerleave", function () { card.classList.remove("live"); card.style.setProperty("--ry", "0deg"); card.style.setProperty("--rx", "0deg"); });
  }
  function montar3d() {
    var o = OBRAS[OV.i], host = $("#ov3d");
    if (OV.mq) { OV.mq.destruir(); OV.mq = null; }
    OV.mq = Maqueta.crear(host, o.tipo, {
      nota: !o.foto && N.demo ? "Maqueta de ejemplo. La foto real de esta obra se agrega en js/config.js." : "",
      onFoto: o.foto ? function () { ponerTab("foto"); } : null
    });
  }
  function ponerTab(t) {
    var o = OBRAS[OV.i];
    if (t === "foto" && !o.foto) t = "3d";
    OV.tab = t;
    $("#ovFoto").hidden = t !== "foto"; $("#ov3d").hidden = t !== "3d";
    $("#ovTabFoto").setAttribute("aria-selected", String(t === "foto")); $("#ovTab3d").setAttribute("aria-selected", String(t === "3d"));
    if (t === "3d" && !OV.mq) montar3d();
  }
  function mostrarObra(i) {
    var o = OBRAS[i], t = U.BYK[o.tipo] || U.OTRO; OV.i = i;
    if (OV.mq) { OV.mq.destruir(); OV.mq = null; }
    $("#ovTipo").textContent = t.n; $("#ovTitle").textContent = o.titulo;
    $("#ovDesc").textContent = t.p || "";
    $("#ovFacts").innerHTML = [["Zona", o.zona], ["Área", o.area], ["Estado", o.estado]].map(function (x) {
      var d = dato(x[1]); return d ? "<div><dt>" + x[0] + "</dt>" + d + "</div>" : "";
    }).join("");
    $("#ovFeat").innerHTML = (t.inc || []).map(function (x) { return '<li><svg class="ic"><use href="#i-check"/></svg>' + esc(x) + "</li>"; }).join("");
    $("#ovWa").href = U.wa("Hola IDESA, vi en su sitio la obra «" + o.titulo + "» y quiero cotizar algo parecido.");
    $("#ovPos").textContent = (i + 1) + " de " + OBRAS.length;
    $("#ovTabFoto").disabled = !o.foto;
    pintarFoto(o, t);
    ponerTab(o.foto ? "foto" : "3d");
  }
  function moverOv(d) { mostrarObra((OV.i + d + OBRAS.length) % OBRAS.length); }
  function abrirObra(i) {
    if (!ov || !OBRAS[i]) return;
    armarOv(); mostrarObra(i); U.abrir(ov);
  }
  document.addEventListener("keydown", function (e) {
    if (!ov || !ov.classList.contains("on")) return;
    if (e.target.closest && e.target.closest(".mq")) return;
    if (e.key === "ArrowLeft") moverOv(-1); if (e.key === "ArrowRight") moverOv(1);
  });
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-obra]");
    if (t) abrirObra(+t.getAttribute("data-obra"));
  });
  document.addEventListener("idesa:cerrar", function (e) {
    var m = e.detail;
    if (m === ov && OV.mq) { OV.mq.destruir(); OV.mq = null; }
    if (m && m.id === "qv" && QV.mq) { QV.mq.destruir(); QV.mq = null; }
  });

  /* ============================================================
     VISTA RÁPIDA DE SERVICIOS: ahora con maqueta
     ============================================================ */
  var QV = { mq: null };
  document.addEventListener("idesa:qv", function (e) {
    var k = e.detail, vis = $("#qvVis");
    if (QV.mq) { QV.mq.destruir(); QV.mq = null; }
    vis.classList.remove("is3d");
    if (!Maqueta.tiene(k) || !has3d) return;
    var foto = vis.innerHTML, tieneFoto = !!$("img", vis);
    function ver3d() {
      vis.classList.add("is3d");
      QV.mq = Maqueta.crear(vis, k, { onFoto: tieneFoto ? function () { QV.mq.destruir(); QV.mq = null; vis.classList.remove("is3d"); vis.innerHTML = foto; poner3dBoton(); } : null });
    }
    function poner3dBoton() {
      var b = document.createElement("button"); b.type = "button"; b.className = "mq-b keep qv-3d";
      b.innerHTML = ico("cubo") + "<span>Ver maqueta 3D</span>"; b.addEventListener("click", ver3d); vis.appendChild(b);
    }
    if (tieneFoto) poner3dBoton(); else ver3d();
  });

  /* ============================================================
     CARRUSEL 3D
     ============================================================ */
  (function () {
    var sec = $("#obras"), rib = $("#ribbon");
    if (!sec || !rib || reduce || !has3d || !OBRAS.length) return;
    var lista = OBRAS.map(function (o, i) { return { o: o, i: i }; });
    while (lista.length < 8) lista = lista.concat(lista);
    var n = lista.length, paso = 360 / n;
    var wrap = document.createElement("div"); wrap.className = "r3d wrap";
    wrap.setAttribute("role", "group"); wrap.setAttribute("aria-roledescription", "carrusel"); wrap.setAttribute("aria-label", "Obras de IDESA en 3D");
    wrap.innerHTML = '<div class="r3d-hint">' + ico("mano") + "Arrastrá para girar</div>" +
      '<div class="r3d-stage"><div class="r3d-tilt"><div class="r3d-spin"></div></div><div class="r3d-floor"></div></div>' +
      '<div class="r3d-hud"><button class="r3d-btn" type="button" data-d="1" aria-label="Obra anterior"><svg class="ic"><use href="#i-chl"/></svg></button>' +
      '<div class="r3d-cap"><b id="r3dT"></b><small id="r3dS"></small></div>' +
      '<button class="r3d-btn" type="button" data-d="-1" aria-label="Obra siguiente"><svg class="ic"><use href="#i-chr"/></svg></button></div>';
    sec.insertBefore(wrap, rib); sec.classList.add("ring-on");
    var stage = $(".r3d-stage", wrap), spin = $(".r3d-spin", wrap), cards = [];
    lista.forEach(function (x, j) {
      var o = x.o, t = U.BYK[o.tipo] || U.OTRO, foto = N.ruta(o.foto), b = document.createElement("button");
      b.type = "button"; b.setAttribute("data-obra", x.i); b.setAttribute("aria-label", o.titulo + ". Abrir en 3D");
      b.className = "rc tile " + (foto ? "photo" : "hue");
      if (!foto) b.style.setProperty("--g", "var(--g" + (x.i % 5 + 1) + ")");
      b.innerHTML = (foto ? '<img src="' + esc(foto) + '" alt="" loading="lazy">' : U.icono(t.k)) +
        '<span class="b3d">' + ico("cubo") + "3D</span>" +
        '<span class="tt"><small>' + esc(t.n) + "</small>" + esc(o.titulo) + "</span>";
      spin.appendChild(b); cards.push(b);
      b.addEventListener("focus", function () { ir(j); });
    });

    var R = 300, rot = 0, vel = 0, tgt = null, drag = null, suprimir = false, hover = false, idle = 0, vis = false, raf = 0, last = 0, lastY = scrollY, frente = -1;
    function medir() {
      var w = stage.clientWidth, cw = w > 760 ? clamp(w * .2, 170, 235) : clamp(w * .46, 150, 210);
      R = cw / 2 / Math.tan(Math.PI / n) * 1.3 + 18;
      wrap.style.setProperty("--cw", cw + "px"); wrap.style.setProperty("--ch", Math.round(cw * 1.28) + "px");
    }
    function pintar() {
      spin.style.transform = "translate3d(0,0," + (-R) + "px) rotateY(" + rot + "deg)";
      var best = -2, bi = 0;
      for (var j = 0; j < n; j++) {
        var a = (((j * paso + rot) % 360) + 540) % 360 - 180, f = Math.cos(a * Math.PI / 180), pop = Math.max(0, (f - .8) / .2);
        cards[j].style.transform = "rotateY(" + j * paso + "deg) translateZ(" + (R + pop * 46) + "px)";
        cards[j].style.setProperty("--f", Math.max(0, f).toFixed(3));
        if (f > best) { best = f; bi = j; }
      }
      if (bi !== frente) {
        frente = bi; var o = lista[bi].o, t = U.BYK[o.tipo] || U.OTRO;
        $("#r3dT").textContent = o.titulo; $("#r3dS").textContent = t.n + " · tocá para verla en 3D";
      }
    }
    function bucle(t) {
      raf = 0; var dt = Math.min(40, t - last || 16); last = t;
      var sy = scrollY, ds = sy - lastY; lastY = sy;
      if (drag) { /* la rotación sigue al dedo */ }
      else if (tgt !== null) { var d = tgt - rot; rot += d * Math.min(1, dt * .009); if (Math.abs(d) < .05) { rot = tgt; tgt = null; } }
      else {
        rot += vel * dt; vel *= Math.pow(.94, dt / 16); if (Math.abs(vel) < .0004) vel = 0;
        idle = Math.max(0, idle - dt);
        if (!hover && idle === 0) rot -= dt * .0075;
        rot -= clamp(ds, -80, 80) * .06;
      }
      pintar();
      if (vis) raf = requestAnimationFrame(bucle);
    }
    function arrancar() { if (!raf && vis) { last = 0; lastY = scrollY; raf = requestAnimationFrame(bucle); } }
    function ir(j) { var k = Math.round((rot + j * paso) / 360); tgt = -j * paso + 360 * k; vel = 0; idle = 4000; arrancar(); }
    function mover(d) { tgt = Math.round(rot / paso) * paso + d * paso; vel = 0; idle = 4000; wrap.classList.add("used"); arrancar(); }
    $$(".r3d-btn", wrap).forEach(function (b) { b.addEventListener("click", function () { mover(+b.getAttribute("data-d")); }); });
    wrap.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); mover(1); } else if (e.key === "ArrowRight") { e.preventDefault(); mover(-1); }
    });
    stage.addEventListener("pointerdown", function (e) {
      suprimir = false; drag = { x: e.clientX, y: e.clientY, rot: rot, t: e.timeStamp, on: false, id: e.pointerId };
    });
    stage.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.on) {
        if (Math.abs(dx) < 7 || Math.abs(dx) < Math.abs(dy)) return;
        drag.on = true; tgt = null; stage.classList.add("drag"); wrap.classList.add("used");
        try { stage.setPointerCapture(drag.id); } catch (x) {}
      }
      var nr = drag.rot + dx * (180 / Math.PI) / R * .9, dt = Math.max(8, e.timeStamp - drag.t);
      vel = clamp((nr - rot) / dt, -.7, .7); rot = nr; drag.t = e.timeStamp; drag.last = e.clientX; pintar();
    });
    function soltar() {
      if (drag && drag.on) { suprimir = true; idle = 2500; }
      drag = null; stage.classList.remove("drag"); arrancar();
    }
    stage.addEventListener("pointerup", soltar); stage.addEventListener("pointercancel", soltar);
    stage.addEventListener("click", function (e) { if (suprimir) { e.stopPropagation(); e.preventDefault(); suprimir = false; } }, true);
    if (fine) { stage.addEventListener("pointerenter", function () { hover = true; }); stage.addEventListener("pointerleave", function () { hover = false; }); }
    if (window.ResizeObserver) new ResizeObserver(function () { medir(); pintar(); }).observe(stage);
    addEventListener("resize", function () { medir(); pintar(); });
    medir(); pintar();
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) arrancar(); }, { rootMargin: "120px" }).observe(wrap);
    else { vis = true; arrancar(); }
  })();

  /* ============================================================
     GALERÍA: tarjetas con profundidad y entrada en perspectiva
     ============================================================ */
  (function () {
    var tiles = $$("#gallery .shot");
    tiles.forEach(function (el, i) {
      el.style.setProperty("--i", i % 6);
      if (!el.querySelector(".b3d")) el.insertAdjacentHTML("afterbegin", '<span class="b3d">' + ico("cubo") + "3D</span>");
      el.insertAdjacentHTML("beforeend", '<span class="gl"></span>');
    });
    if (!reduce && "IntersectionObserver" in window) {
      tiles.forEach(function (el) { el.classList.add("pre"); });
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (!e.isIntersecting) return; io.unobserve(e.target); e.target.classList.remove("pre"); e.target.classList.add("go"); });
      }, { threshold: .15 });
      tiles.forEach(function (el) { io.observe(el); });
    }
    if (reduce || !fine) return;
    tiles.forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.classList.add("live");
        el.style.setProperty("--ry", ((x - .5) * 14).toFixed(2) + "deg"); el.style.setProperty("--rx", ((.5 - y) * 12).toFixed(2) + "deg");
        el.style.setProperty("--gx", x * 100 + "%"); el.style.setProperty("--gy", y * 100 + "%");
      });
      el.addEventListener("pointerleave", function () {
        el.classList.remove("live"); el.style.setProperty("--ry", "0deg"); el.style.setProperty("--rx", "0deg");
      });
    });
  })();
})();
