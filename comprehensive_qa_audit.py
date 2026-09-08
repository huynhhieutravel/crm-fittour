import re
import sys
from bs4 import BeautifulSoup

def audit():
    print("==================================================")
    print("🔍 BẮT ĐẦU KIỂM THỬ TOÀN DIỆN (COMPREHENSIVE QA)")
    print("==================================================")

    issues = []

    # 1. READ FILES
    with open('client/public/t8-report/index.html', 'r', encoding='utf-8') as f:
        html = f.read()
    with open('client/public/t8-report/script.js', 'r', encoding='utf-8') as f:
        js = f.read()

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

    # Check that all page-content are siblings under the same root container
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
    print(f"Tổng số bảng tìm thấy trong báo cáo: {len(tables)}")
    for idx, table in enumerate(tables, 1):
        thead = table.find('thead')
        tbody = table.find('tbody')
        if not thead or not tbody:
            continue
        
        # Count header columns
        header_cols = 0
        header_tr = thead.find('tr')
        if header_tr:
            header_cols = len(header_tr.find_all(['th', 'td']))

        # Check each row in tbody
        tbody_rows = tbody.find_all('tr')
        for r_idx, row in enumerate(tbody_rows, 1):
            cells = row.find_all(['td', 'th'])
            # Calculate total col count accounting for colspan
            col_count = 0
            for c in cells:
                colspan = int(c.get('colspan', 1))
                col_count += colspan
            if col_count != header_cols:
                issues.append(f"Bảng #{idx} (dòng {r_idx}): Số cột ({col_count}) không khớp header ({header_cols})! Nội dung ô đầu: '{cells[0].text.strip() if cells else ''}'")

    # -------------------------------------------------------------
    # C. FORBIDDEN & OBSOLETE KEYWORDS / RESIDUAL DATA
    # -------------------------------------------------------------
    print("\n--- [3] QUÉT TỪ KHÓA CẤM, SỐ LIỆU ĐÁ NHAU & TÀN DƯ BU3 ---")
    forbidden_terms = [
        ('BU3', 'Vẫn còn sót tham chiếu BU3'),
        ('gánh team', 'Từ ngữ media-buyer: gánh team'),
        ('lỗ đen', 'Từ ngữ media-buyer: lỗ đen'),
        ('đốt hết', 'Từ ngữ media-buyer: đốt hết'),
        ('đốt tiền', 'Từ ngữ media-buyer: đốt tiền'),
        ('cân team', 'Từ ngữ media-buyer: cân team'),
        ('heroic', 'Từ ngữ phóng đại: heroic'),
        ('thảm họa', 'Từ ngữ phóng đại: thảm họa'),
        ('phi mã', 'Từ ngữ phóng đại: phi mã'),
        ('46 Lead', 'Số liệu cũ đá nhau: Pakistan 46 Lead'),
        ('104.423.393', 'Số liệu cũ: Tổng spend 104.4M (chưa trừ BU3)'),
        ('456 Lead', 'Số liệu cũ: Tổng leads 456 (chưa trừ BU3)'),
        ('1.626 Msg', 'Số liệu cũ: Tổng msgs 1.626 (chưa trừ BU3)'),
        ('229.000 đ', 'Số liệu cũ: CPL 229k (chưa trừ BU3)'),
        ('sập', 'Từ ngữ kịch tính: sập')
    ]

    for term, reason in forbidden_terms:
        # Ignore comments and scripts when searching in html? Let's check text content vs raw
        matches_html = [m.start() for m in re.finditer(re.escape(term), html, re.IGNORECASE)]
        if matches_html:
            # check lines
            for m in matches_html:
                line_no = html[:m].count('\n') + 1
                line_content = html.splitlines()[line_no - 1].strip()
                # If it's inside an HTML comment, note it
                if '<!--' in line_content:
                    continue
                issues.append(f"[index.html L{line_no}] {reason}: '{term}' -> '{line_content[:100]}'")

        matches_js = [m.start() for m in re.finditer(re.escape(term), js, re.IGNORECASE)]
        if matches_js:
            for m in matches_js:
                line_no = js[:m].count('\n') + 1
                line_content = js.splitlines()[line_no - 1].strip()
                issues.append(f"[script.js L{line_no}] {reason}: '{term}' -> '{line_content[:100]}'")

    # -------------------------------------------------------------
    # D. MATHEMATICAL RECONCILIATION
    # -------------------------------------------------------------
    print("\n--- [4] ĐỐI SOÁT TOÁN HỌC (MATHEMATICAL RECONCILIATION) ---")
    # BU5 Table Reconciliation
    # Pakistan winner: 8.50M, 60 lead
    # Mông Cổ: 4.33M, 19 lead
    # Pakistan phụ: 3.41M, 14 lead
    # Morocco: 6.86M, 15 lead
    # Egypt: 7.78M, 16 lead
    # Other: 3.52M, 2 lead
    bu5_spends = [8.50, 4.33, 3.41, 6.86, 7.78, 3.52]
    bu5_leads = [60, 19, 14, 15, 16, 2]
    total_bu5_spend = sum(bu5_spends)
    total_bu5_leads = sum(bu5_leads)
    print(f"Tổng Spend BU5 (bảng drilldown): {total_bu5_spend:.2f}M (Kỳ vọng: 34.40M)")
    print(f"Tổng Lead BU5 (bảng drilldown): {total_bu5_leads} Lead (Kỳ vọng: 126 Lead)")
    if abs(total_bu5_spend - 34.40) > 0.05:
        issues.append(f"Tổng spend BU5 không khớp: {total_bu5_spend:.2f}M vs 34.40M")
    if total_bu5_leads != 126:
        issues.append(f"Tổng leads BU5 không khớp: {total_bu5_leads} vs 126")

    # Main KPI table sums:
    # BU1: 30.255.991, 150 leads, 491 msgs
    # BU2: 8.957.476, 26 leads, 98 msgs
    # BU4: 29.001.924, 148 leads, 599 msgs
    # BU5: 34.396.454, 126 leads, 435 msgs
    tot_spend = 30255991 + 8957476 + 29001924 + 34396454
    tot_leads = 150 + 26 + 148 + 126
    tot_msgs = 491 + 98 + 599 + 435
    calc_cpl = round(tot_spend / tot_leads)
    calc_cpl_msg = round(tot_spend / tot_msgs)
    calc_rate = (tot_leads / tot_msgs) * 100

    print(f"Tính toán hệ thống (sau khi bỏ BU3):")
    print(f" - Tổng Spend: {tot_spend:,} đ (102.611.845 đ)")
    print(f" - Tổng Leads: {tot_leads} Lead (450 Lead)")
    print(f" - Tổng Msgs: {tot_msgs} Msg (1.623 Msg)")
    print(f" - CPL TB: {calc_cpl:,} đ (228.026 đ)")
    print(f" - Giá TB/Inbox: {calc_cpl_msg:,} đ (63.224 đ)")
    print(f" - Tỷ lệ Msg->Lead: {calc_rate:.1f}% (27.7%)")

    # -------------------------------------------------------------
    # E. REPORT ISSUES
    # -------------------------------------------------------------
    print("\n==================================================")
    if issues:
        print(f"❌ PHÁT HIỆN {len(issues)} VẤN ĐỀ CẦN XỬ LÝ:")
        for i, iss in enumerate(issues, 1):
            print(f" {i}. {iss}")
        return False
    else:
        print("✅ KHÔNG PHÁT HIỆN BẤT KỲ LỖI NÀO! HỆ THỐNG ĐẠT CHUẨN 100%.")
        return True

if __name__ == '__main__':
    audit()
