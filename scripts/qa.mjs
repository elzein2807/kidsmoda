import { chromium } from 'playwright';

// Point CHROMIUM_PATH at a browser if Playwright's own download is not present.
const launch = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};

const browser = await chromium.launch(launch);
const pages = ['/', '/girls', '/boys/6-9', '/product/court-sneakers', '/new-in', '/sale',
                '/cart', '/checkout', '/wishlist', '/our-store', '/size-guide', '/faq',
                '/contact', '/delivery', '/returns', '/privacy', '/terms', '/admin',
                '/admin/pos', '/admin/inventory', '/admin/reports', '/nope-404'];
const widths = [390, 768, 1024, 1440, 1920];
let problems = 0;

for (const w of widths) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.addInitScript(() => { try { sessionStorage.setItem('km-intro-seen','1'); } catch(e){} });
  for (const path of pages) {
    await page.goto('http://localhost:3000' + path, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(150);
    const overflow = await page.evaluate(() => {
      const d = document.documentElement;
      if (d.scrollWidth <= d.clientWidth + 1) return null;
      // find the widest offending element
      let worst = null, max = 0;
      document.querySelectorAll('body *').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.right > d.clientWidth + 1 && r.width > max) { max = r.width; worst = el.className || el.tagName; }
      });
      return { scrollWidth: d.scrollWidth, clientWidth: d.clientWidth, worst: String(worst).slice(0,60) };
    });
    if (overflow) { console.log(`✗ ${w}px ${path} — horizontal overflow ${overflow.scrollWidth}>${overflow.clientWidth} (${overflow.worst})`); problems++; }
  }
  await page.close();
}
console.log(problems === 0 ? '✓ No horizontal overflow at 390 / 768 / 1024 / 1440 / 1920' : `${problems} overflow problems`);

// Accessibility spot checks on the homepage
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => { try { sessionStorage.setItem('km-intro-seen','1'); } catch(e){} });
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

await page.keyboard.press('Tab');
const first = await page.evaluate(() => document.activeElement?.textContent?.trim());
console.log(first === 'Skip to content' ? '✓ First tab stop is the skip link' : `✗ First tab stop is "${first}"`);

const a11y = await page.evaluate(() => {
  const out = [];
  const h1 = document.querySelectorAll('h1');
  if (h1.length !== 1) out.push(`h1 count = ${h1.length}`);
  document.querySelectorAll('img').forEach(i => { if (!i.hasAttribute('alt')) out.push('img without alt'); });
  document.querySelectorAll('a[href]').forEach(a => {
    const name = (a.textContent || '').trim() || a.getAttribute('aria-label');
    if (!name) out.push('link with no accessible name: ' + a.getAttribute('href'));
  });
  document.querySelectorAll('button').forEach(b => {
    const name = (b.textContent || '').trim() || b.getAttribute('aria-label');
    if (!name) out.push('button with no accessible name');
  });
  document.querySelectorAll('main main').forEach(() => out.push('nested <main>'));
  return out;
});
console.log(a11y.length === 0 ? '✓ Homepage: one h1, all images/links/buttons named' : '✗ ' + a11y.join('\n✗ '));

// Reduced motion: everything must still be visible
const rm = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
const rmPage = await rm.newPage();
await rmPage.addInitScript(() => { try { sessionStorage.setItem('km-intro-seen','1'); } catch(e){} });
await rmPage.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
await rmPage.waitForTimeout(2500);
const hidden = await rmPage.evaluate(() =>
  [...document.querySelectorAll('[data-reveal]')].filter(e => getComputedStyle(e).opacity === '0').length);
console.log(hidden === 0 ? '✓ Reduced motion: nothing left hidden' : `✗ ${hidden} elements stuck invisible under reduced motion`);

await browser.close();
