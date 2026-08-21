const { chromium } = require('playwright-core');
const EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
(async () => {
  const b = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();

  // SCENARIO A: clean device, straight to /lite-bcgolf
  await p.goto('http://localhost:3000/lite-bcgolf', { waitUntil: 'networkidle' });
  const ls = await p.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
  console.log('A: url =', p.url());
  console.log('A: hook-clinic       =', ls['recognaize-hook-clinic']);
  console.log('A: hook-report-path  =', ls['recognaize-hook-report-path']);
  console.log('A: hook-entry-path   =', ls['recognaize-hook-entry-path']);

  // SCENARIO B: phone that previously used /lite-two, then opens /lite-bcgolf
  const p2 = await ctx.newPage();
  await p2.goto('http://localhost:3000/lite-two', { waitUntil: 'networkidle' });
  const before = await p2.evaluate(() => localStorage.getItem('recognaize-hook-report-path'));
  console.log('B: after visiting /lite-two  =', before);
  await p2.goto('http://localhost:3000/lite-bcgolf', { waitUntil: 'networkidle' });
  const after = await p2.evaluate(() => localStorage.getItem('recognaize-hook-report-path'));
  console.log('B: after visiting /lite-bcgolf =', after);

  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
