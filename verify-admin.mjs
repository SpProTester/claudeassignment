import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/shailendra.parmar/AppData/Roaming/npm/node_modules/playwright');
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:5174';
const CREDS = { email: 'admin@jobportal.com', password: 'Admin@1234' };
const SS_DIR = 'd:/Monster.com-replica/verify-screenshots';
mkdirSync(SS_DIR, { recursive: true });

const errors = [];
const warnings = [];

async function shot(page, name) {
  await page.screenshot({ path: `${SS_DIR}/${name}.png`, fullPage: true });
  console.log(`  📸 ${name}.png`);
}

async function checkPage(page, path, name) {
  console.log(`\n→ ${name} (${path})`);
  const pageErrors = [];
  const handler = msg => {
    if (msg.type() === 'error') pageErrors.push({ page: name, msg: msg.text() });
    if (msg.type() === 'warning') warnings.push({ page: name, msg: msg.text() });
  };
  page.on('console', handler);

  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await shot(page, name);

  page.off('console', handler);
  if (pageErrors.length) {
    pageErrors.forEach(e => { console.log(`  ❌ Console error: ${e.msg}`); errors.push(e); });
  } else {
    console.log('  ✅ No console errors');
  }

  // Check for visible error UI
  const errText = await page.locator('text=/error|failed|not found|undefined/i').count().catch(() => 0);
  if (errText > 0) console.log(`  ⚠️  ${errText} visible error-like text nodes`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Capture uncaught page errors
  page.on('pageerror', err => errors.push({ page: 'GLOBAL', msg: err.message }));

  // ── Login ──
  console.log('\n→ Login');
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"], input[name="email"]', CREDS.email);
  await page.fill('input[type="password"], input[name="password"]', CREDS.password);
  await shot(page, '00-login');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await shot(page, '01-dashboard');
  console.log('  ✅ Logged in, at:', page.url());

  const ROUTES = [
    ['/dashboard',           '01-dashboard-loaded'],
    ['/employers',           '02-employers'],
    ['/seekers',             '03-seekers'],
    ['/users',               '04-users'],
    ['/jobs',                '05-jobs'],
    ['/applications',        '06-applications'],
    ['/subscriptions',       '07-subscriptions'],
    ['/reports',             '08-reports'],
    ['/analytics',           '09-analytics'],
    ['/audit-log',           '10-audit-log'],
    ['/settings/categories', '11-categories'],
    ['/settings/admins',     '12-admin-users'],
  ];

  for (const [path, name] of ROUTES) {
    await checkPage(page, path, name);
  }

  // ── Employer detail panel ──
  console.log('\n→ Employer detail panel');
  await page.goto(`${BASE}/employers`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const viewBtn = page.locator('button:has-text("View")').first();
  if (await viewBtn.count() > 0) {
    await viewBtn.click();
    await page.waitForTimeout(1500);
    await shot(page, '13-employer-detail');
    console.log('  ✅ Detail panel opened');
  } else {
    console.log('  ⚠️  No View buttons found on employers page');
  }

  await browser.close();

  // ── Summary ──
  console.log('\n════════════════════════════════');
  console.log('VERIFICATION SUMMARY');
  console.log('════════════════════════════════');
  if (errors.length === 0) {
    console.log('✅  No errors detected across all pages');
  } else {
    console.log(`❌  ${errors.length} error(s) found:\n`);
    errors.forEach((e, i) => console.log(`  ${i+1}. [${e.page}] ${e.msg}`));
  }
  if (warnings.length) {
    console.log(`\n⚠️  ${warnings.length} warning(s):`);
    warnings.slice(0, 10).forEach(w => console.log(`  • [${w.page}] ${w.msg}`));
  }
  console.log(`\nScreenshots saved to: ${SS_DIR}`);
})();
