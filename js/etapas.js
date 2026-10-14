/* Obra que se construye por etapas (viewBox 480 x 360).
   Cada grupo .et lleva data-e="n": se dibuja cuando la etapa actual es >= n.
   Las líneas (.d) se trazan; el resto (.f) aparece con fundido. */
(function () {
  var k = 0;
  var estilo = function () { return ' style="--i:' + (k++) + '"'; };
  var d = function (tag, a, c) { return '<' + tag + ' class="d ' + (c || '') + '" pathLength="1" ' + a + estilo() + '/>'; };
  var f = function (tag, a, c) { return '<' + tag + ' class="f ' + (c || '') + '" ' + a + estilo() + '/>'; };
  var t = function (a, txt, c) { return '<text class="f cota ' + (c || '') + '" ' + a + estilo() + '>' + txt + '</text>'; };
  var grupo = function (e, cls, inner) { k = 0; return '<g class="et ' + (cls || '') + '" data-e="' + e + '">' + inner + '</g>'; };
  var cols = [136, 205, 275, 344], i, x, y, s;

  function build() {
    /* capa de rellenos: sólo se ve al entregar */
    k = 0;
    var rellenos = grupo(5, '',
      f('rect', 'x="0" y="300" width="480" height="60"', 'fa-grass') +
      f('rect', 'x="131" y="132" width="218" height="168"', 'fa-wall') +
      f('polygon', 'points="112,130 240,74 368,130"', 'fa-roof'));

    /* 1 · Consulta: el terreno */
    s = d('line', 'x1="20" y1="300" x2="460" y2="300"');
    for (x = 24; x < 460; x += 20) s += d('line', 'x1="' + x + '" y1="300" x2="' + (x - 10) + '" y2="312"', 's');
    [58, 422].forEach(function (px) {
      s += d('line', 'x1="' + px + '" y1="266" x2="' + px + '" y2="300"', 'gone5') + f('polygon', 'points="' + px + ',266 ' + (px + 16) + ',271 ' + px + ',276"', 'acc gone5');
    });
    s += f('line', 'x1="58" y1="346" x2="422" y2="346"', 'cotal gone5') + f('line', 'x1="58" y1="340" x2="58" y2="352"', 'cotal gone5') + f('line', 'x1="422" y1="340" x2="422" y2="352"', 'cotal gone5') +
      t('x="240" y="342" text-anchor="middle"', 'TERRENO · 18,00 m', 'gone5') +
      f('circle', 'cx="440" cy="46" r="15"', 'cotal gone5') + f('polygon', 'points="440,34 446,52 440,48 434,52"', 'acc gone5') + t('x="440" y="76" text-anchor="middle"', 'N', 'gone5');
    var e1 = grupo(1, '', s);

    /* 2 · Presupuesto: volumen, niveles y cotas */
    s = f('rect', 'x="130" y="130" width="220" height="170"', 'dash gone5') + f('polyline', 'points="116,134 240,82 364,134"', 'dash gone5');
    [[300, 'N ±0,00'], [210, 'N +3,00'], [130, 'N +5,80']].forEach(function (n) {
      s += f('line', 'x1="92" y1="' + n[0] + '" x2="372" y2="' + n[0] + '"', 'nivel gone5') + t('x="88" y="' + (n[0] - 5) + '" text-anchor="end"', n[1], 'gone5');
    });
    s += f('line', 'x1="130" y1="326" x2="350" y2="326"', 'cotal gone5') + f('line', 'x1="130" y1="320" x2="130" y2="332"', 'cotal gone5') + f('line', 'x1="350" y1="320" x2="350" y2="332"', 'cotal gone5') + t('x="240" y="322" text-anchor="middle"', '11,00 m', 'gone5') +
      f('rect', 'x="24" y="24" width="84" height="100"', 'doc gone5') + t('x="34" y="40"', 'PRESUPUESTO', 'gone5') +
      f('path', 'd="M34 54h40M34 66h64M34 78h58M34 90h64M34 102h30"', 'docl gone5') + f('path', 'd="M34 112h64"', 'docl gone5');
    var e2 = grupo(2, '', s);

    /* 3 · Planos y permisos: cimientos y sello */
    s = d('rect', 'x="124" y="292" width="232" height="8"', 'conc');
    cols.forEach(function (c) { s += d('rect', 'x="' + (c - 14) + '" y="300" width="28" height="12"', 'conc'); });
    s += '<g class="f stamp gone5" transform="rotate(-12 180 46)"' + estilo() + '><circle cx="180" cy="46" r="30"/><circle cx="180" cy="46" r="25"/><text x="180" y="44" text-anchor="middle">PERMISO</text><text x="180" y="57" text-anchor="middle">APROBADO</text></g>';
    var e3 = grupo(3, '', s);

    /* 4 · Construcción: columnas, losas, muros, cubierta y grúa */
    s = '';
    cols.forEach(function (c) {
      s += d('rect', 'x="' + (c - 5) + '" y="212" width="10" height="80"') + d('rect', 'x="' + (c - 5) + '" y="132" width="10" height="72"');
    });
    s += d('rect', 'x="124" y="204" width="232" height="8"', 'conc') + d('rect', 'x="124" y="124" width="232" height="8"', 'conc') +
      d('rect', 'x="131" y="212" width="218" height="80"') + d('rect', 'x="131" y="132" width="218" height="72"');
    for (y = 222; y < 292; y += 10) s += d('line', 'x1="131" y1="' + y + '" x2="349" y2="' + y + '"', 's gone5');
    for (y = 142; y < 204; y += 10) s += d('line', 'x1="131" y1="' + y + '" x2="349" y2="' + y + '"', 's gone5');
    s += d('polyline', 'points="116,128 240,76 364,128"') +
      d('line', 'x1="240" y1="76" x2="240" y2="124"', 's gone5') + d('line', 'x1="178" y1="102" x2="240" y2="124"', 's gone5') + d('line', 'x1="302" y1="102" x2="240" y2="124"', 's gone5');
    /* grúa torre */
    var g = d('line', 'x1="414" y1="300" x2="414" y2="40"') + d('line', 'x1="426" y1="300" x2="426" y2="40"');
    var zz = '414,300';
    for (y = 282, i = 0; y >= 40; y -= 18, i++) zz += ' ' + (i % 2 === 0 ? 426 : 414) + ',' + y;
    g += d('polyline', 'points="' + zz + '"', 's');
    g += d('line', 'x1="290" y1="40" x2="470" y2="40"') + d('line', 'x1="290" y1="52" x2="440" y2="52"');
    zz = '290,40';
    for (x = 304, i = 0; x <= 440; x += 14, i++) zz += ' ' + x + ',' + (i % 2 === 0 ? 52 : 40);
    g += d('polyline', 'points="' + zz + '"', 's') + d('polyline', 'points="414,40 420,22 426,40"') +
      d('line', 'x1="420" y1="22" x2="292" y2="40"', 's') + d('line', 'x1="420" y1="22" x2="468" y2="40"', 's') +
      d('rect', 'x="446" y="42" width="16" height="14"') +
      d('line', 'x1="324" y1="52" x2="324" y2="70"', 's') + d('rect', 'x="316" y="70" width="16" height="9"') + f('rect', 'x="304" y="80" width="40" height="14"', 'acc');
    s += '<g class="gone5">' + g + '</g>';
    var e4 = grupo(4, '', s);

    /* 5 · Entrega: ventanas, puerta, jardín */
    s = '';
    [[150, 224], [290, 224], [150, 144], [220, 144], [290, 144]].forEach(function (w, n) {
      var lit = (n === 0 || n === 3) ? ' lit' : '';
      s += f('rect', 'x="' + w[0] + '" y="' + w[1] + '" width="40" height="34"', 'glass' + lit) + d('rect', 'x="' + w[0] + '" y="' + w[1] + '" width="40" height="34"') + d('path', 'd="M' + (w[0] + 20) + ' ' + w[1] + 'v34M' + w[0] + ' ' + (w[1] + 17) + 'h40"', 's');
    });
    s += f('rect', 'x="222" y="240" width="36" height="60"', 'door') + d('rect', 'x="222" y="240" width="36" height="60"') + f('circle', 'cx="251" cy="272" r="2"', 'acc') +
      d('rect', 'x="212" y="296" width="56" height="4"', 'conc');
    [[150, 296, 9], [182, 297, 8], [300, 296, 9], [330, 297, 8]].forEach(function (b) { s += f('circle', 'cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '"', 'arbusto'); });
    [[62, 300, 1.15], [434, 300, 1.05]].forEach(function (a) {
      s += '<g class="f arbol"' + estilo() + '><rect x="' + (a[0] - 3) + '" y="' + (a[1] - 40 * a[2]) + '" width="6" height="' + 40 * a[2] + '"/><circle cx="' + a[0] + '" cy="' + (a[1] - 52 * a[2]) + '" r="' + 26 * a[2] + '"/><circle cx="' + (a[0] + 14) + '" cy="' + (a[1] - 36 * a[2]) + '" r="' + 16 * a[2] + '"/></g>';
    });
    s += f('rect', 'x="24" y="24" width="118" height="24" rx="3"', 'acc') + '<text class="f lab" x="83" y="40" text-anchor="middle"' + estilo() + '>OBRA ENTREGADA</text>';
    var e5 = grupo(5, '', s);

    return '<svg class="bs" viewBox="0 0 480 360" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + rellenos + e1 + e2 + e3 + e4 + e5 + '</svg>';
  }

  window.Etapas = { svg: build };
})();
