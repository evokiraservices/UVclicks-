import { chromium } from 'playwright';

async function main() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture console events
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  // Capture page errors
  page.on('pageerror', err => {
    console.error(`[BROWSER EXCEPTION] ${err.message}`);
    if (err.stack) console.error(err.stack);
  });

  try {
    console.log("Navigating to http://localhost:3000 ...");
    await page.goto('http://localhost:3000', { waitUntil: 'load', timeout: 15000 });
    
    console.log("Waiting 3 seconds for page loads/animations...");
    await page.waitForTimeout(3000);
    
    console.log("Taking screenshot...");
    await page.screenshot({ path: 'C:/Users/gagan/uvclicks-app/public/screenshot.png', fullPage: true });
    console.log("Screenshot saved to public/screenshot.png");
    
    const content = await page.content();
    console.log(`Page Title: ${await page.title()}`);
    console.log(`Body HTML Length: ${content.length}`);
  } catch (error) {
    console.error("Diagnostic error:", error);
  } finally {
    await browser.close();
    process.exit(0);
  }
}

main();
