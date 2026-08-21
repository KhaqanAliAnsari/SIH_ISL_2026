const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--mute-audio'
    ]
  });
  
  const page = await browser.newPage();
  
  // Collect logs
  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    console.log('BROWSER:', text);
  });
  
  console.log('Navigating to app...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  console.log('Clicking "Use Camera"...');
  // Find the Use Camera button. It has text "Use Camera" or "Webcam Active"
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const camBtn = buttons.find(b => b.textContent.includes('Use Camera'));
    if (camBtn) camBtn.click();
  });
  
  console.log('Waiting 10 seconds for profiling...');
  await new Promise(r => setTimeout(r, 10000));
  
  console.log('--- Measurement Complete ---');
  await browser.close();
})();
