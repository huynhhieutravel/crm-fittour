const { generateMarketingReportEmail } = require('./utils/templateRenderer');
const fs = require('fs');

async function run() {
  try {
    const { html: monthlyHtml } = await generateMarketingReportEmail('monthly', 2026, 7);
    fs.writeFileSync('monthly_preview.html', monthlyHtml);
    
    const { html: weeklyHtml } = await generateMarketingReportEmail('weekly', 2026, 7, 2);
    fs.writeFileSync('weekly_preview.html', weeklyHtml);
    
    console.log('Previews generated');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
