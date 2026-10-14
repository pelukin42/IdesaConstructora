/* Escenas por tipo de obra, en dos modos con la MISMA geometría:
   "plano": líneas sobre fondo de plano. "obra": la obra ya construida y a color.
   Cuando exista una foto real (config.js), la foto reemplaza la escena de modo "obra".
   viewBox 320 x 236. */
(function () {
  var cont = 0;

  var dimH = function (x1, x2, y, t) {
    return '<g class="dim"><line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '"/><line x1="' + x1 + '" y1="' + (y - 6) + '" x2="' + x1 + '" y2="' + (y + 6) + '"/><line x1="' + x2 + '" y1="' + (y - 6) + '" x2="' + x2 + '" y2="' + (y + 6) + '"/><text x="' + (x1 + x2) / 2 + '" y="' + (y + 12) + '" text-anchor="middle">' + t + '</text></g>';
  };
  var dimV = function (x, y1, y2, t) {
    var m = (y1 + y2) / 2;
    return '<g class="dim"><line x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + y2 + '"/><line x1="' + (x - 5) + '" y1="' + y1 + '" x2="' + (x + 5) + '" y2="' + y1 + '"/><line x1="' + (x - 5) + '" y1="' + y2 + '" x2="' + (x + 5) + '" y2="' + y2 + '"/><text transform="rotate(-90 ' + (x - 5) + ' ' + m + ')" x="' + (x - 5) + '" y="' + m + '" text-anchor="middle">' + t + '</text></g>';
  };
  var eje = function (x, y1, y2, l) {
    return '<g class="eje"><line x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + y2 + '"/><circle cx="' + x + '" cy="' + (y1 - 9) + '" r="8"/><text x="' + x + '" y="' + (y1 - 5.8) + '" text-anchor="middle">' + l + '</text></g>';
  };
  var suelo = function (y) { return '<line class="d" x1="18" y1="' + y + '" x2="304" y2="' + y + '"/>'; };
  var arbol = function (x, y, s) {
    s = s || 1;
    return '<g class="arbol"><rect x="' + (x - 2.5 * s) + '" y="' + (y - 34 * s) + '" width="' + 5 * s + '" height="' + 34 * s + '"/><circle cx="' + x + '" cy="' + (y - 44 * s) + '" r="' + 22 * s + '"/><circle cx="' + (x + 12 * s) + '" cy="' + (y - 31 * s) + '" r="' + 14 * s + '"/></g>';
  };
  var arbusto = function (x, y, r) { return '<circle class="arbusto" cx="' + x + '" cy="' + y + '" r="' + r + '"/>'; };

  var S = {};

  S.casa = {
    base: '<rect class="d p" x="70" y="108" width="180" height="88"/>' +
      '<polygon class="d t" points="54,112 160,52 266,112"/>' +
      '<rect class="d u" x="148" y="148" width="24" height="48"/>' +
      '<rect class="d v" x="90" y="126" width="38" height="30"/><rect class="d v" x="192" y="126" width="38" height="30"/>' +
      '<path class="s" d="M109 126v30M90 141h38M211 126v30M192 141h38"/>' +
      '<rect class="d c" x="140" y="192" width="40" height="4"/>',
    plano: suelo(196) + eje(70, 40, 108, 'A') + eje(250, 40, 108, 'B') + dimH(70, 250, 209, '10,00 m') + dimV(310, 108, 196, '3,0 m'),
    obra: '<rect class="sombra" x="70" y="108" width="180" height="7"/><polygon class="camino" points="146,196 174,196 194,236 126,236"/>' +
      arbol(288, 196) + arbol(34, 196, 0.75) + arbusto(80, 192, 8) + arbusto(96, 194, 6) + arbusto(228, 193, 7) + arbusto(244, 194, 9)
  };

  S.ampliacion = {
    base: '<rect class="d p ex" x="34" y="116" width="124" height="80"/>' +
      '<polygon class="d t ex" points="26,120 96,70 166,120"/>' +
      '<rect class="d u ex" x="64" y="152" width="22" height="44"/><rect class="d v ex" x="106" y="134" width="34" height="26"/>' +
      '<rect class="d n" x="158" y="122" width="112" height="74"/><rect class="d c" x="152" y="114" width="124" height="8"/>' +
      '<rect class="d v" x="176" y="140" width="32" height="28"/><rect class="d v" x="222" y="140" width="32" height="28"/>' +
      '<path class="s" d="M192 140v28M176 154h32M238 140v28M222 154h32"/>',
    plano: suelo(196) + '<path class="d a" d="M214 98V70M203 81l11-11 11 11"/><g class="dim"><text x="214" y="62" text-anchor="middle">NUEVO</text></g>' + dimH(158, 270, 209, '+ 28 m²') + eje(34, 40, 116, 'A'),
    obra: '<rect class="sombra" x="158" y="122" width="112" height="6"/><polygon class="camino" points="62,196 88,196 102,236 48,236"/>' +
      arbol(304, 196, 0.8) + arbusto(46, 192, 8) + arbusto(130, 193, 7) + arbusto(286, 194, 7)
  };

  S.remodelacion = {
    interior: true,
    base: '<rect class="d p" x="30" y="36" width="260" height="164"/>' +
      '<rect class="d m" x="42" y="58" width="56" height="48"/><rect class="d m" x="100" y="58" width="56" height="48"/><rect class="d m" x="236" y="58" width="42" height="48"/>' +
      '<polygon class="d c" points="176,64 216,64 224,96 168,96"/><rect class="d c" x="186" y="36" width="20" height="28"/>' +
      '<rect class="d c" x="36" y="148" width="248" height="8"/>' +
      '<rect class="d m" x="38" y="156" width="58" height="40"/><rect class="d m" x="98" y="156" width="58" height="40"/><rect class="d u" x="160" y="156" width="62" height="40"/><rect class="d m" x="224" y="156" width="58" height="40"/>' +
      '<rect class="d v" x="172" y="164" width="38" height="18"/>' +
      '<path class="s" d="M70 70v16M130 70v16M258 70v16M68 164v8M126 164v8M252 164v8"/>',
    plano: '<rect class="d a dash" x="34" y="48" width="252" height="152"/>' + dimH(30, 290, 211, '4,20 m') + dimV(310, 36, 200, '2,6 m'),
    obra: '<path class="hilo" d="M72 0V30M128 0V30"/><path class="lampara" d="M60 42a12 12 0 0 1 24 0zM116 42a12 12 0 0 1 24 0z"/>'
  };

  S.comercial = {
    suelo: '<rect class="acera" x="0" y="196" width="320" height="14"/><rect class="calle" x="0" y="210" width="320" height="26"/><path class="raya" d="M20 224h40M100 224h40M180 224h40M260 224h40"/>',
    base: '<rect class="d p" x="40" y="96" width="240" height="100"/><rect class="d c" x="34" y="86" width="252" height="10"/>' +
      '<rect class="d n" x="62" y="104" width="104" height="16"/>' +
      '<polygon class="d t" points="54,126 184,126 192,138 46,138"/>' +
      '<rect class="d v" x="58" y="138" width="126" height="58"/><path class="s" d="M100 138v58M142 138v58"/>' +
      '<rect class="d u" x="196" y="140" width="28" height="56"/>' +
      '<rect class="d c" x="234" y="124" width="38" height="72"/><path class="s" d="M234 136h38M234 148h38M234 160h38M234 172h38M234 184h38"/>',
    plano: suelo(196) + eje(40, 40, 86, 'A') + eje(280, 40, 86, 'B') + dimH(40, 280, 209, '12,00 m') + dimV(310, 86, 196, '4,2 m'),
    obra: '<rect class="sombra" x="40" y="96" width="240" height="6"/>' + arbusto(28, 192, 8) + arbusto(300, 193, 8)
  };

  S.muros = {
    suelo: '<rect class="tierra-f" x="0" y="186" width="320" height="50"/><rect class="pasto" x="0" y="186" width="112" height="6"/>',
    base: '<path class="d" d="M18 186H112"/><polygon class="d e" points="162,96 300,96 300,196 162,196"/>' +
      '<rect class="d c" x="140" y="96" width="22" height="100"/><rect class="d c" x="112" y="186" width="98" height="10"/>' +
      '<circle class="d" cx="128" cy="176" r="5"/>' +
      '<g class="acero"><circle cx="147" cy="110" r="2.4"/><circle cx="155" cy="110" r="2.4"/><circle cx="147" cy="130" r="2.4"/><circle cx="155" cy="130" r="2.4"/><circle cx="147" cy="150" r="2.4"/><circle cx="155" cy="150" r="2.4"/><circle cx="147" cy="170" r="2.4"/><circle cx="155" cy="170" r="2.4"/></g>' +
      '<path class="s" d="M118 191h86"/>',
    plano: '<path class="s" d="M170 196l24-24M196 196l50-50M232 196l60-60M268 196l32-32M170 170l24-24M170 144l48-48M170 118l22-22"/>' + dimV(310, 96, 196, '2,4 m') + dimH(112, 210, 209, '1,60 m'),
    obra: '<rect class="pasto" x="162" y="90" width="138" height="8"/>' + arbol(262, 96, 0.75) + arbusto(192, 90, 8) + arbusto(224, 91, 6) + arbusto(60, 184, 7) + arbusto(88, 185, 6)
  };

  S.otro = {
    base: S.casa.base,
    plano: S.casa.plano + '<text class="q" x="160" y="96" text-anchor="middle">?</text>',
    obra: S.casa.obra
  };

  function fondo(s, id) {
    if (s.interior) {
      return '<rect class="paredint" x="0" y="0" width="320" height="236"/><rect class="piso" x="0" y="200" width="320" height="36"/><rect class="zocalo" x="0" y="196" width="320" height="5"/>';
    }
    return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--cielo-a)"/><stop offset="1" style="stop-color:var(--cielo-b)"/></linearGradient></defs>' +
      '<rect width="320" height="236" fill="url(#' + id + ')"/><circle class="sol" cx="262" cy="46" r="17"/>' +
      '<path class="colina" d="M0 172C50 150 104 168 160 158S270 150 320 166V200H0Z"/>' +
      (s.suelo || '<rect class="suelo" x="0" y="196" width="320" height="40"/>');
  }

  function svg(tipo, o) {
    o = o || {};
    var m = o.modo === 'plano' ? 'plano' : 'obra';
    var s = S[tipo] || S.casa;
    var inner = m === 'obra' ? fondo(s, 'gc' + (++cont)) + s.base + (s.obra || '') : s.base + (s.plano || '');
    var a11y = m === 'plano' ? 'aria-hidden="true"' : 'role="img" aria-label="' + (o.label || '') + '"';
    return '<svg class="esc modo-' + m + '" data-v="' + (o.v || 0) + '" viewBox="0 0 320 236" preserveAspectRatio="xMidYMid slice" ' + a11y + '>' + inner + '</svg>';
  }

  function fin(e) {
    var el = e.currentTarget;
    el.classList.remove('draw');
    el.style.animationDelay = '';
    el.removeAttribute('pathLength');
    el.removeEventListener('animationend', fin);
  }
  /* Hace que el dibujo se trace solo, línea por línea. */
  function animar(root) {
    var els = root.querySelectorAll('.d'), i, el;
    for (i = 0; i < els.length; i++) {
      el = els[i];
      el.setAttribute('pathLength', '1');
      el.style.animationDelay = (i * 45) + 'ms';
      el.classList.add('draw');
      el.addEventListener('animationend', fin);
    }
  }

  window.Escena = { svg: svg, animar: animar };
})();
