import re
import sys
import json
from bs4 import BeautifulSoup

def audit_t9():
    print("==================================================")
    print("🔍 BẮT ĐẦU KIỂM THỬ TOÀN DIỆN BÁO CÁO THÁNG 9/2026")
    print("==================================================")

    issues = []

    # 1. READ FILES
    with open('client/public/t9-report/index.html', 'r', encoding='utf-8') as f:
        html = f.read()
    with open('client/public/t9-report/script.js', 'r', encoding='utf-8') as f:
        js = f.read()
    with open('client/public/t9-report/email.html', 'r', encoding='utf-8') as f:
        email_html = f.read()
    with open('client/public/t9-report/t9_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    soup = BeautifulSoup(html, 'html.parser')

    # -------------------------------------------------------------
    # A. DOM & TAB INTEGRITY CHECK
    # -------------------------------------------------------------
    print("\n--- [1] KIỂM TRA CẤU TRÚC DOM & CÁC TAB ---")
    nav_btns = soup.find_all(class_='top-nav-btn')
    btn_pages = [b.get('data-page') for b in nav_btns if b.get('data-page')]
    pages = soup.find_all(class_='page-content')
    page_ids = [p.get('id') for p in pages if p.get('id')]

    print(f"Số lượng tab nút: {len(btn_pages)} -> {btn_pages}")
    print(f"Số lượng trang content: {len(page_ids)} -> {page_ids}")

    for bp in btn_pages:
        if bp not in page_ids:
            issues.append(f"Tab button '{bp}' không tìm thấy div trang tương ứng!")
    for pid in page_ids:
        if pid not in btn_pages:
            issues.append(f"Div trang '{pid}' không có tab button nào trỏ tới!")

    # Check root container
    for p in pages:
        parent = p.parent
        parent_classes = parent.get('class', [])
        if 'max-w-7xl' not in parent_classes:
            issues.append(f"Trang '{p.get('id')}' không nằm ở root container max-w-7xl! Cha hiện tại: {parent_classes}")

    # -------------------------------------------------------------
    # B. TABLE COLUMNS ALIGNMENT CHECK
    # -------------------------------------------------------------
    print("\n--- [2] KIỂM TRA ĐỘ THẲNG HÀNG & CỘT CỦA MỌI BẢNG ---")
    tables = soup.find_all('table')
    print(f"Tổng số bảng tìm thấy trong index.html: {len(tables)}")
    for idx, table in enumerate(tables, 1):
        thead = table.find('thead')
        tbody = table.find('tbody')
        if not thead or not tbody:
            continue
        
        header_cols = 0
        header_tr = thead.find('tr')
        if header_tr:
            header_cols = len(header_tr.find_all(['th', 'td']))

        tbody_rows = tbody.find_all('tr')
        for r_idx, row in enumerate(tbody_rows, 1):
            cells = row.find_all(['td', 'th'])
            col_count = 0
            for c in cells:
                colspan = int(c.get('colspan', 1))
                col_count += colspan
            if col_count != header_cols:
                issues.append(f"Bảng #{idx} (dòng {r_idx}): Số cột ({col_count}) không khớp header ({header_cols})! Ô đầu: '{cells[0].text.strip() if cells else ''}'")

    email_soup = BeautifulSoup(email_html, 'html.parser')
    email_tables = email_soup.find_all('table')
    print(f"Tổng số bảng tìm thấy trong email.html: {len(email_tables)}")
    for idx, table in enumerate(email_tables, 1):
        thead = table.find('thead')
        tbody = table.find('tbody')
        if not thead or not tbody:
            continue
        header_tr = thead.find('tr')
        header_cols = len(header_tr.find_all(['th', 'td'])) if header_tr else 0
        tbody_rows = tbody.find_all('tr')
        for r_idx, row in enumerate(tbody_rows, 1):
            cells = row.find_all(['td', 'th'])
            col_count = sum(int(c.get('colspan', 1)) for c in cells)
            if col_count != header_cols:
                issues.append(f"Email Bảng #{idx} (dòng {r_idx}): Số cột ({col_count}) không khớp header ({header_cols})!")

    # -------------------------------------------------------------
    # C. FORBIDDEN & OBSOLETE KEYWORDS / MEDIA-BUYER SLANG
    # -------------------------------------------------------------
    print("\n--- [3] QUÉT TỪ KHÓA CẤM & TỪ NGỮ MEDIA-BUYER ---")
    forbidden_terms = [
        ('BU3', 'Vẫn còn sót tham chiếu BU3 trong T9'),
        ('gánh team', 'Từ ngữ media-buyer: gánh team'),
        ('lỗ đen', 'Từ ngữ media-buyer: lỗ đen'),
        ('đốt hết', 'Từ ngữ media-buyer: đốt hết'),
        ('đốt tiền', 'Từ ngữ media-buyer: đốt tiền'),
        ('cân team', 'Từ ngữ media-buyer: cân team'),
        ('heroic', 'Từ ngữ phóng đại: heroic'),
        ('thảm họa', 'Từ ngữ phóng đại: thảm họa'),
        ('phi mã', 'Từ ngữ phóng đại: phi mã'),
        ('sập', 'Từ ngữ kịch tính: sập')
    ]

    for term, reason in forbidden_terms:
        # Check in visible body text
        matches = re.findall(re.escape(term), soup.text, re.IGNORECASE)
        if matches:
            issues.append(f"Tìm thấy từ cấm '{term}' ({reason}) trong index.html: {len(matches)} lần")
        email_matches = re.findall(re.escape(term), email_soup.text, re.IGNORECASE)
        if email_matches:
            issues.append(f"Tìm thấy từ cấm '{term}' ({reason}) trong email.html: {len(email_matches)} lần")

    # -------------------------------------------------------------
    # D. DATA CONSISTENCY & NUMBERS VERIFICATION
    # -------------------------------------------------------------
    print("\n--- [4] XÁC THỰC DỮ LIỆU JSON & CÁC CHỈ SỐ CHÍNH ---")
    allRows = data.get('allRows', [])
    print(f"Tổng số bản ghi allRows trong t9_data.json: {len(allRows)}")
    if len(allRows) != 80:
        issues.append(f"Số lượng bản ghi allRows ({len(allRows)}) khác kỳ vọng (80)!")

    total_spend = sum(float(r['spend']) for r in allRows)
    total_msgs = sum(int(r['messages']) for r in allRows)
    total_leads = sum(int(r['leads']) for r in allRows)

    print(f"Tổng Spend tính từ allRows: {total_spend:,.0f} đ (Kỳ vọng: 97,597,508 đ)")
    print(f"Tổng Tin nhắn: {total_msgs} Msg (Kỳ vọng: 2,113 Msg)")
    print(f"Tổng Lead: {total_leads} Lead (Kỳ vọng: 427 Lead)")

    if round(total_spend) != 97597508:
        issues.append(f"Tổng spend ({total_spend}) không khớp 97,597,508 đ!")
    if total_msgs != 2113:
        issues.append(f"Tổng msgs ({total_msgs}) không khớp 2,113!")
    if total_leads != 427:
        issues.append(f"Tổng leads ({total_leads}) không khớp 427!")

    # Check key figures in index.html and email.html
    expected_snippets = [
        "97.597.508",
        "427 Lead",
        "2.113",
        "228.566",
        "46.189",
        "673 SĐT",
        "145.018",
        "330 SĐT",
        "102 SĐT",
        "91 SĐT",
        "150 SĐT"
    ]
    for snip in expected_snippets:
        if snip not in html:
            issues.append(f"index.html thiếu số liệu chuẩn: '{snip}'")
        if snip not in email_html:
            issues.append(f"email.html thiếu số liệu chuẩn: '{snip}'")

    # Check CRM phone audit in t9_data.json
    crm_audit = data.get('crmPhoneAudit', {})
    if not crm_audit:
        issues.append("t9_data.json thiếu trường 'crmPhoneAudit'!")
    else:
        tot_phone = crm_audit.get('total_phone_leads')
        if tot_phone != 673:
            issues.append(f"Tổng phone leads ({tot_phone}) trong crmPhoneAudit khác 673!")
        weekly_phone = crm_audit.get('weekly_phone_leads', [])
        sum_weekly_phone = sum(w.get('phone_leads', 0) for w in weekly_phone)
        if sum_weekly_phone != 673:
            issues.append(f"Tổng weekly phone leads ({sum_weekly_phone}) khác 673!")
        print(f"CRM Phone Leads trong JSON: {tot_phone} SĐT | Phân bổ 4 tuần: {[w.get('phone_leads') for w in weekly_phone]}")

    print("\n==================================================")
    if issues:
        print(f"❌ PHÁT HIỆN {len(issues)} VẤN ĐỀ CẦN XỬ LÝ:")
        for idx, iss in enumerate(issues, 1):
            print(f"  {idx}. {iss}")
        return False
    else:
        print("✅ TẤT CẢ CÁC BƯỚC KIỂM THỬ ĐÃ ĐẠT 100% HOÀN HẢO!")
        print("==================================================")
        return True

if __name__ == '__main__':
    success = audit_t9()
    sys.exit(0 if success else 1)
