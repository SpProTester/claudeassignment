import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/shailendra.parmar/AppData/Roaming/npm/node_modules/playwright');
import { mkdirSync } from 'fs';

const DIR = 'd:/Monster.com-replica/verify-screenshots';
mkdirSync(DIR, { recursive: true });

async function scrollBottom(page) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(600);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // ── 1. Guest — CTA should be visible ──
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await scrollBottom(page);
  await page.screenshot({ path: `${DIR}/footer-guest.png` });
  const guestCTA = await page.locator('text=Ready to find your next opportunity?').count();
  console.log(`Guest  — CTA visible: ${guestCTA > 0} (expected: true)`);

  // ── 2. Employer — CTA should be hidden ──
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'alice@techcorp.com');
  await page.fill('input[type="password"]', 'Employer@1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/*', { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1000);
  await page.goto('http://localhost:5173/employer/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await scrollBottom(page);
  await page.screenshot({ path: `${DIR}/footer-employer.png` });
  const empCTA = await page.locator('text=Ready to find your next opportunity?').count();
  console.log(`Employer — CTA visible: ${empCTA > 0} (expected: false)`);

  // ── 3. Employer on jobs page ──
  await page.goto('http://localhost:5173/employer/jobs', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await scrollBottom(page);
  await page.screenshot({ path: `${DIR}/footer-employer-jobs.png` });

  // ── 4. Log out, log in as seeker ──
  // Find seeker credentials
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'john@example.com');
  await page.fill('input[type="password"]', 'Employer@1234');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);

  // Try seeker dashboard
  await page.goto('http://localhost:5173/seeker/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await scrollBottom(page);
  await page.screenshot({ path: `${DIR}/footer-seeker.png` });
  const seekerCTA = await page.locator('text=Ready to find your next opportunity?').count();
  console.log(`Seeker — CTA visible: ${seekerCTA > 0} (expected: false)`);

  await browser.close();
  console.log('\nAll screenshots saved to:', DIR);
})();
