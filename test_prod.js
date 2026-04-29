const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://erp.fittour.vn/login');
  await page.fill('input[type="text"]', 'admin');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button:has-text("Đăng nhập")');
  await page.waitForTimeout(2000);
  
  await page.goto('https://erp.fittour.vn/departures');
  await page.waitForTimeout(2000);
  
  // Click duplicate on first row
  await page.evaluate(() => {
     document.querySelector('button.icon-btn.add').click();
  });
  await page.waitForTimeout(2000);
  
  // Click View on first row (which is the new duplicate)
  await page.evaluate(() => {
     document.querySelector('.data-table tbody tr:first-child button.icon-btn[title="Xem chi tiết & Khách"]').click();
  });
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'prod_duplicate.png', fullPage: true });
  
  // Delete the test duplicate
  await page.goBack();
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
     document.querySelector('.data-table tbody tr:first-child button.icon-btn.delete').click();
  });
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
     document.querySelectorAll('button').forEach(b => {
        if(b.innerText.includes('Vâng, xóa đi!') || b.className.includes('success-pro')) b.click()
     });
  });
  await page.waitForTimeout(2000);

  await browser.close();
  console.log("Done testing production");
})();
