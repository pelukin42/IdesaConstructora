/* Dibujos de ejemplo por tipo de obra (viewBox 320 x 236). Línea = trazo principal, .s = secundario, .a = acento. */
(function () {
  var g = '<line class="s" x1="18" y1="196" x2="302" y2="196"/>';
  var dimH = function (x1, x2, t) {
    return '<g class="dim"><line x1="' + x1 + '" y1="216" x2="' + x2 + '" y2="216"/><line x1="' + x1 + '" y1="210" x2="' + x1 + '" y2="222"/><line x1="' + x2 + '" y1="210" x2="' + x2 + '" y2="222"/><text x="' + (x1 + x2) / 2 + '" y="230" text-anchor="middle">' + t + '</text></g>';
  };
  var dimV = function (y1, y2, t) {
    return '<g class="dim"><line x1="294" y1="' + y1 + '" x2="294" y2="' + y2 + '"/><line x1="288" y1="' + y1 + '" x2="300" y2="' + y1 + '"/><line x1="288" y1="' + y2 + '" x2="300" y2="' + y2 + '"/><text x="290" y="' + ((y1 + y2) / 2 + 3) + '" text-anchor="end">' + t + '</text></g>';
  };
  window.PLANOS = {
    casa: g + '<rect class="d" x="70" y="110" width="180" height="86"/><polyline class="d a" points="56,112 160,56 264,112"/>' +
      '<rect class="d" x="148" y="150" width="24" height="46"/><rect class="d" x="90" y="128" width="38" height="30"/><rect class="d" x="192" y="128" width="38" height="30"/>' +
      '<path class="s" d="M109 128v30M90 143h38M211 128v30M192 143h38"/>' + dimH(70, 250, '10,00 m') + dimV(110, 196, '3,0 m'),
    ampliacion: g + '<rect class="d s2" x="34" y="116" width="120" height="80"/><polyline class="d s2" points="26,118 94,70 162,118"/><rect class="s2" x="62" y="140" width="22" height="56"/>' +
      '<rect class="d a fill" x="154" y="126" width="112" height="70"/><path class="a" d="M148 126h126"/><rect class="d" x="178" y="146" width="30" height="26"/><rect class="d" x="224" y="146" width="30" height="26"/>' +
      '<path class="d a" d="M200 100v-22M190 88l10-10 10 10"/>' + dimH(154, 266, '+ 28 m²'),
    remodelacion: '<rect class="d thick" x="46" y="34" width="228" height="156"/><path class="d thick" d="M150 34v58M150 124v66"/><path class="d" d="M150 92h32"/><path class="d s" d="M182 92a32 32 0 0 1-32 32"/>' +
      '<path class="d a dash" d="M150 132h124"/><rect class="fill" x="154" y="136" width="116" height="50"/><rect class="s2" x="84" y="30" width="46" height="8"/><rect class="s2" x="190" y="30" width="46" height="8"/><rect class="s2" x="270" y="76" width="8" height="40"/>' +
      '<path class="s" d="M60 60h70M60 74h50"/>' + dimH(46, 274, '9,50 m'),
    comercial: g + '<rect class="d" x="40" y="100" width="240" height="96"/><rect class="d" x="34" y="90" width="252" height="10"/><rect class="d a fill" x="70" y="108" width="84" height="10"/>' +
      '<rect class="d a" x="56" y="122" width="132" height="6"/><rect class="d" x="60" y="130" width="124" height="66"/><path class="s" d="M91 130v66M122 130v66M153 130v66"/>' +
      '<rect class="d" x="196" y="140" width="28" height="56"/><rect class="d" x="234" y="128" width="38" height="68"/><path class="s" d="M234 140h38M234 152h38M234 164h38M234 176h38"/>' + dimH(40, 280, '12,00 m') + dimV(90, 196, '4,2 m'),
    muros: '<path class="s" d="M18 186h98"/><rect class="d a fill" x="140" y="96" width="22" height="100"/><rect class="d" x="112" y="186" width="98" height="10"/>' +
      '<polyline class="d s2" points="162,96 300,96 300,196 162,196"/><path class="s" d="M170 196l24-24M196 196l50-50M232 196l60-60M268 196l32-32M170 170l24-24M170 144l48-48M170 118l24-22"/>' +
      '<g class="a"><circle cx="147" cy="110" r="2.4"/><circle cx="155" cy="110" r="2.4"/><circle cx="147" cy="130" r="2.4"/><circle cx="155" cy="130" r="2.4"/><circle cx="147" cy="150" r="2.4"/><circle cx="155" cy="150" r="2.4"/><circle cx="147" cy="170" r="2.4"/><circle cx="155" cy="170" r="2.4"/></g>' +
      '<circle class="d s" cx="128" cy="176" r="5"/>' + dimV(96, 196, '2,4 m') + dimH(112, 210, '1,60 m'),
    otro: g + '<rect class="d" x="80" y="120" width="160" height="76"/><polyline class="d a" points="68,122 160,70 252,122"/><path class="s" d="M130 160h60M130 176h40"/><text class="q" x="160" y="108" text-anchor="middle">?</text>' + dimH(80, 240, '¿?')
  };
  /* Pinta un dibujo dentro de un <g>; draw=true anima el trazo. */
  window.pintarPlano = function (g, clave, draw) {
    g.innerHTML = window.PLANOS[clave] || window.PLANOS.otro;
    var els = g.querySelectorAll('.d');
    for (var i = 0; i < els.length; i++) {
      els[i].setAttribute('pathLength', '1');
      if (draw) { els[i].style.animationDelay = (i * 60) + 'ms'; els[i].classList.add('draw'); }
    }
  };
})();
