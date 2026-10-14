/* Revisión del sitio con fotos conectadas: capturas de escritorio y móvil, errores de consola,
   scroll horizontal e imágenes que no cargan. Uso:
     PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verificar.js RAIZ_DEL_SITIO CARPETA_DE_CAPTURAS
   (no ejecutar "playwright install"; el módulo está en /opt/node22/lib/node_modules/playwright). */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path'), fs = require('fs');
const raiz = path.resolve(process.argv[2] || '.'), out = path.resolve(process.argv[3] || './capturas');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const problemas = [];
  async function pagina(nombre, opts) {
    const ctx = await b.newContext(Object.assign({ locale: 'es-CR' }, opts));
    const p = await ctx.newPage();
    p.on('pageerror', e => problemas.push(`${nombre}: error de página ${e.message}`));
    p.on('console', m => m.type() === 'error' && problemas.push(`${nombre}: consola ${m.text().slice(0, 140)}`));
    p.on('requestfailed', r => problemas.push(`${nombre}: no cargó ${r.url().slice(-80)}`));
    await p.addInitScript(() => { try { sessionStorage.setItem('idesa_intro', '1'); } catch (e) {} });
    await p.goto('file://' + path.join(raiz, 'index.html'));
    await p.waitForTimeout(500);
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 500) { await p.evaluate(v => window.scrollTo(0, v), y); await p.waitForTimeout(90); }
    return p;
  }
  const ir = (p, sel, off) => p.evaluate(([s, o]) => { const el = document.querySelector(s); if (el) window.scrollTo(0, el.getBoundingClientRect().top + scrollY - o); }, [sel, off]);
  for (const [nombre, opts] of [['escritorio', { viewport: { width: 1366, height: 860 } }], ['movil', { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }]]) {
    const p = await pagina(nombre, opts);
    for (const [id, off] of [['#obras', 40], ['#servicios', 70], ['#galeria', 70]]) {
      await ir(p, id, off); await p.waitForTimeout(900); await p.screenshot({ path: path.join(out, `${nombre}-${id.slice(1)}.png`) });
    }
    // visor de obra: la primera obra y la última, pestañas Foto y Maqueta 3D
    const n = await p.evaluate(() => (window.IDESA.obras || []).length);
    for (const i of [0, n - 1]) {
      await ir(p, '#obras', 40);
      await p.evaluate(i => document.querySelector(`[data-obra="${i}"]`).click(), i); await p.waitForTimeout(900);
      await p.screenshot({ path: path.join(out, `${nombre}-visor-${i}.png`) });
      if (await p.$('#ovTab3d')) { await p.click('#ovTab3d'); await p.waitForTimeout(1800); await p.screenshot({ path: path.join(out, `${nombre}-visor-${i}-3d.png`) }); }
      await p.keyboard.press('Escape'); await p.waitForTimeout(250);
    }
    if (await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)) problemas.push(`${nombre}: hay scroll horizontal`);
    const rotas = await p.evaluate(() => [...document.images].filter(i => i.getAttribute('src') && i.complete && i.naturalWidth === 0).map(i => i.src.slice(-60)));
    rotas.forEach(r => problemas.push(`${nombre}: imagen rota ${r}`));
    await p.close();
  }
  // movimiento reducido: sin carrusel 3D y con el visor funcionando
  const r = await pagina('reducido', { viewport: { width: 1366, height: 860 }, reducedMotion: 'reduce' });
  if (await r.$('.r3d')) problemas.push('reducido: el carrusel 3D no debería existir');
  await r.close();
  console.log(problemas.length ? 'PROBLEMAS:\n' + [...new Set(problemas)].join('\n') : 'Sin problemas. Capturas en ' + out);
  await b.close();
})();
