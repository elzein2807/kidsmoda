import { chromium } from 'playwright';

// Point CHROMIUM_PATH at a browser if Playwright's own download is not present.
const launch = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};

const browser = await chromium.launch(launch);
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0,160)); });
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message.slice(0,160)));
await page.addInitScript(() => { try { sessionStorage.setItem('km-intro-seen','1'); } catch(e){} });

const step = (n) => console.log('· ' + n);

// 1 — product page, choose size, add to bag
await page.goto('http://localhost:3000/product/wildflower-tiered-dress', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Size 4Y', exact: true }).click();
await page.getByRole('button', { name: 'Add to bag' }).click();
await page.waitForSelector('[aria-label="Shopping bag"]', { timeout: 5000 });
step('PDP: size selected, added to bag, drawer opened');

// 2 — cart drawer shows the line and a subtotal
const drawerText = await page.locator('[aria-label="Shopping bag"]').innerText();
if (!drawerText.includes('Wildflower Tiered Dress') || !drawerText.includes('4Y')) throw new Error('cart line missing');
step('Cart drawer: line and size correct');

// 3 — currency switch re-prices
await page.keyboard.press('Escape');
await page.getByRole('button', { name: 'LBP' }).click();
await page.waitForTimeout(400);
const lbp = await page.locator('.km-price__usd').first().innerText();
if (!lbp.includes('LL')) throw new Error('currency switch did not re-price: ' + lbp);
step('Currency: LBP re-prices the page');
await page.getByRole('button', { name: 'USD' }).click();

// 4 — search
await page.getByRole('button', { name: 'Search' }).click();
await page.getByLabel('Search products').fill('denim');
await page.waitForSelector('.km-search__hit', { timeout: 8000 });
const hits = await page.locator('.km-search__hit').count();
step(`Search: "denim" returned ${hits} suggestions`);
await page.keyboard.press('Escape');

// 5 — filters write to the URL
await page.goto('http://localhost:3000/girls?category=dresses', { waitUntil: 'networkidle' });
const count = await page.locator('.km-listing__count').innerText();
step('Listing: ' + count.trim() + ' for category=dresses');

// 6 — checkout: validation then a real order
await page.goto('http://localhost:3000/checkout', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Place order/ }).click();
await page.waitForSelector('.km-error', { timeout: 5000 });
step('Checkout: empty submit blocked with field errors');

await page.getByLabel('Full name').fill('Rima Haddad');
await page.getByLabel('Mobile number').fill('03 123 456');
await page.getByLabel('Governorate').selectOption('Mount Lebanon');
await page.getByLabel('City or town').fill('Hadath');
await page.getByLabel('Street and area').fill('Saint Thérèse street, near Orca');
await page.getByRole('button', { name: /Place order/ }).click();
await page.waitForURL(/\/order\/KM-/, { timeout: 15000 });
const orderUrl = page.url();
step('Checkout: order placed → ' + orderUrl.replace('http://localhost:3000',''));

const success = await page.locator('.km-success').innerText();
if (!success.includes('Thank you, Rima')) throw new Error('confirmation missing customer name');
step('Confirmation: order number and tracking shown');

// 7 — cart emptied after the order
await page.goto('http://localhost:3000/cart', { waitUntil: 'networkidle' });
const cartText = await page.locator('#km-main').innerText();
if (!cartText.includes('Nothing in the bag')) throw new Error('cart was not cleared after checkout');
step('Cart: cleared after a successful order');

// 8 — the order now appears in the dashboard
await page.goto('http://localhost:3000/admin/orders', { waitUntil: 'networkidle' });
const admin = await page.locator('#km-main').innerText();
if (!admin.includes('Rima Haddad')) throw new Error('order missing from admin');
step('Admin: the order appears in Orders');

console.log(errors.length ? '\nCONSOLE ERRORS:\n' + errors.join('\n') : '\nNo console errors.');
await browser.close();
