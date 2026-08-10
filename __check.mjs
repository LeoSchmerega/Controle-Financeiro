import { chromium } from 'playwright';

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});
page.on('pageerror', err => errors.push('PAGEERROR: ' + err.message));
page.on('requestfailed', req => errors.push('REQFAILED: ' + req.url() + ' ' + (req.failure()?.errorText || '')));

await page.goto('http://localhost:4173/Controle-Financeiro/', { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(1000);
await page.screenshot({ path: 'C:/Users/Leo/AppData/Local/Temp/claude/c--Users-Leo-Desktop-ADT-PROJETOS-E-CURSOS-controle-financeiro/eaa559fd-69a1-488d-98f1-edd61d5ff3ea/scratchpad/screenshot.png' });

const bodyText = await page.evaluate(() => document.body.innerText);
console.log('BODY_TEXT_LENGTH:', bodyText.length);
console.log('BODY_TEXT:', JSON.stringify(bodyText.slice(0, 200)));
console.log('ERRORS:', JSON.stringify(errors, null, 2));

await browser.close();
