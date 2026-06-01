import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/shailendra.parmar/AppData/Roaming/npm/node_modules/playwright');
import { mkdirSync } from 'fs';

const DIR = 'd:/Monster.com-replica/verify-screenshots';
mkdirSync(DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // ── Main app (job portal) ──────────────────────────────────────────────────
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${DIR}/app-home.png`, fullPage: false });
  console.log('app-home.png');

  await page.goto('http://localhost:5173/jobs', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${DIR}/app-jobs.png`, fullPage: false });
  console.log('app-jobs.png');

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${DIR}/app-login.png`, fullPage: false });
  console.log('app-login.png');

  // ── Admin portal ────────────────────────────────────────────────────────────
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${DIR}/admin-login.png`, fullPage: false });
  console.log('admin-login.png');

  await page.fill('input[type="email"]', 'admin@jobportal.com');
  await page.fill('input[type="password"]', 'Admin@1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${DIR}/admin-dashboard.png`, fullPage: true });
  console.log('admin-dashboard.png');

  await page.goto('http://localhost:5174/employers', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${DIR}/admin-employers.png`, fullPage: false });
  console.log('admin-employers.png');

  await page.goto('http://localhost:5174/reports', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/admin-reports.png`, fullPage: false });
  console.log('admin-reports.png');

  await browser.close();
  console.log('Done.');
})();
