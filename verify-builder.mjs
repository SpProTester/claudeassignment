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
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  // Login as seeker
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'john@example.com');
  await page.fill('input[type="password"]', 'Seeker@1234');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);

  // Open resume builder
  await page.goto('http://localhost:5173/seeker/resume/builder/new', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${DIR}/builder-01-template-modal.png` });
  console.log('Templates visible:', await page.locator('text=Modern').count() > 0 ? 'YES' : 'NO');

  // Click Modern template
  const modernBtn = page.locator('button:has-text("Modern")').first();
  if (await modernBtn.count() > 0) {
    await modernBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${DIR}/builder-02-after-template.png` });
    console.log('Template selected, modal closed:', await page.locator('text=Choose Template').count() === 0 ? 'YES' : 'NO');
  }

  // Fill name
  await page.fill('input[placeholder="John Doe"]', 'Jane Smith').catch(() => {});
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/builder-03-with-content.png` });

  if (errors.length) {
    console.log('Console errors:');
    errors.forEach(e => console.log(' ', e.slice(0, 120)));
  } else {
    console.log('No console errors');
  }

  await browser.close();
})();
