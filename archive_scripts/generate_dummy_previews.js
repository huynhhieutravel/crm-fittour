const fs = require('fs');

function generateHtml(type, week) {
  const targetMonth = 7;
  const targetYear = 2026;
  
  const alertsHtml = type === 'weekly' 
    ? `<div style="background: #fff1f2; border-left: 4px solid #e11d48; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
         <h4 style="margin: 0 0 10px; color: #e11d48;">Cảnh Báo Phân Tích</h4>
         <ul style="margin: 0; padding-left: 20px; line-height: 1.6; color: #334155;">
           <li>🚨 <b>BU1:</b> Gãy Funnel (Thiếu 5 Lead/tuần, CPA vượt ngưỡng 50k)</li>
         </ul>
       </div>`
    : `<div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 20px; border-radius: 4px; color: #065f46; font-weight: 500;">
         🎉 Tuyệt vời! Các BU đang hoạt động ổn định và giữ vững KPI.
       </div>`;

  const dateString = type === 'weekly' ? `Tuần ${week} Tháng ${targetMonth}/${targetYear}` : `Tháng ${targetMonth}/${targetYear}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 800px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
      <h2 style="color: #1e293b; margin-top: 0; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Báo Cáo Marketing Ads - ${dateString}</h2>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px; gap: 15px; flex-wrap: wrap;">
         <div style="flex: 1; min-width: 150px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">Ngân sách đã chi</div>
            <div style="font-size: 20px; color: #3b82f6; font-weight: bold; margin-top: 5px;">40.000.000 đ</div>
            <div style="font-size: 12px; color: #475569; margin-top: 5px;">80% so với Kế hoạch</div>
         </div>
         <div style="flex: 1; min-width: 150px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">Lead Thực tế / Mục tiêu</div>
            <div style="font-size: 20px; color: #f59e0b; font-weight: bold; margin-top: 5px;">400 / 500</div>
         </div>
         <div style="flex: 1; min-width: 150px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">CPL / CPA Trung bình</div>
            <div style="font-size: 20px; color: #10b981; font-weight: bold; margin-top: 5px;">100.0k / 500.0k</div>
         </div>
      </div>

      ${alertsHtml}

      <h3 style="color: #1e293b; font-size: 16px;">Chi tiết theo BU</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left;">
        <thead style="background: #f1f5f9;">
          <tr>
            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">BU</th>
            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">Tình trạng Funnel</th>
            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">Chi tiêu / Ngân sách</th>
            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">Leads / Target</th>
            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">CPL</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">BU1</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #ef4444; font-weight: bold;">🔴 Gãy funnel</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">10.000.000 / 12.000.000</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">80 / 150</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">125k</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">BU2</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #10b981; font-weight: bold;">🟢 Tốt</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">30.000.000 / 40.000.000</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">320 / 350</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">93k</td>
          </tr>
        </tbody>
      </table>
      
      <div style="margin-top: 30px; text-align: center;">
        <a href="https://erp.fittour.vn/marketing-ads" style="background: #3b82f6; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 500; display: inline-block;">Xem Bảng Điều Khiển Ads</a>
      </div>
    </div>
  `;
  return html;
}

fs.writeFileSync('/Users/huynhtronghieu/.gemini/antigravity-ide/brain/2d4ee57c-e269-44ac-a7c5-8cd8e9959e0b/monthly_preview.html', generateHtml('monthly'));
fs.writeFileSync('/Users/huynhtronghieu/.gemini/antigravity-ide/brain/2d4ee57c-e269-44ac-a7c5-8cd8e9959e0b/weekly_preview.html', generateHtml('weekly', 2));
