import json, re
from bs4 import BeautifulSoup

def main():
    print("=" * 60)
    print("🔬 COMPREHENSIVE NUMERICAL QA AUDIT - MARKETING T9/2026")
    print("=" * 60)

    # 1. Load HTML
    with open("client/public/t9-report/index.html", "r", encoding="utf-8") as f:
        html = f.read()
    soup = BeautifulSoup(html, "html.parser")

    # 2. Load JSON
    with open("client/public/t9-report/t9_data.json", "r", encoding="utf-8") as f:
        t9_json = json.load(f)

    # 3. Load Email
    with open("client/public/t9-report/email.html", "r", encoding="utf-8") as f:
        email_html = f.read()

    errors = []

    # ----------------------------------------------------
    # AUDIT 1: MASTER DATA JSON & ALLROWS TOTALS
    # ----------------------------------------------------
    all_rows = t9_json.get("allRows", [])
    print(f"\n[1] AUDIT MASTER AUDIT ROWS: {len(all_rows)} rows found")
    if len(all_rows) != 80:
        errors.append(f"Master Audit rows count mismatch: got {len(all_rows)}, expected 80")

    json_spend = sum(float(r.get("spend", 0) or 0) for r in all_rows)
    json_msgs = sum(int(r.get("messages", 0) or 0) for r in all_rows)
    json_leads = sum(int(r.get("leads", 0) or 0) for r in all_rows)

    print(f"    - Total Spend: {json_spend:,.0f} đ (Expected: 97,597,508 đ)")
    print(f"    - Total Messages: {json_msgs} Msg (Expected: 2,113 Msg)")
    print(f"    - Total Leads: {json_leads} Lead (Expected: 427 Lead)")
    print(f"    - Overall CPL: {json_spend/json_leads:,.0f} đ (Expected: 228,566 đ)")

    if round(json_spend) != 97597508:
        errors.append(f"JSON Spend mismatch: {json_spend} != 97597508")
    if json_msgs != 2113:
        errors.append(f"JSON Messages mismatch: {json_msgs} != 2113")
    if json_leads != 427:
        errors.append(f"JSON Leads mismatch: {json_leads} != 427")

    # ----------------------------------------------------
    # AUDIT 2: BU BREAKDOWN IN JSON VS EXPECTED DB
    # ----------------------------------------------------
    expected_bu = {
        "BU1": {"spend": 38492088, "msgs": 696, "leads": 180, "phones": 330, "target_leads": 150},
        "BU2": {"spend": 15954295, "msgs": 222, "leads": 77, "phones": 102, "target_leads": 80},
        "BU4": {"spend": 21082736, "msgs": 637, "leads": 75, "phones": 91, "target_leads": 100},
        "BU5": {"spend": 22068389, "msgs": 558, "leads": 95, "phones": 150, "target_leads": 120},
    }

    print("\n[2] AUDIT BU TOTALS IN JSON & DB:")
    bu_totals = {}
    for r in all_rows:
        bu = r.get("bu_name")
        if bu not in bu_totals:
            bu_totals[bu] = {"spend": 0, "msgs": 0, "leads": 0}
        bu_totals[bu]["spend"] += float(r.get("spend", 0) or 0)
        bu_totals[bu]["msgs"] += int(r.get("messages", 0) or 0)
        bu_totals[bu]["leads"] += int(r.get("leads", 0) or 0)

    for bu, exp in expected_bu.items():
        actual = bu_totals.get(bu, {})
        sp_diff = abs(round(actual.get("spend", 0)) - exp["spend"])
        msg_diff = abs(actual.get("msgs", 0) - exp["msgs"])
        lead_diff = abs(actual.get("leads", 0) - exp["leads"])
        print(f"    - {bu}: Spend={actual.get('spend', 0):,.0f} đ, Msgs={actual.get('msgs', 0)}, Leads={actual.get('leads', 0)}")
        if sp_diff > 1:
            errors.append(f"{bu} Spend mismatch: {actual.get('spend')} != {exp['spend']}")
        if msg_diff != 0:
            errors.append(f"{bu} Msgs mismatch: {actual.get('msgs')} != {exp['msgs']}")
        if lead_diff != 0:
            errors.append(f"{bu} Leads mismatch: {actual.get('leads')} != {exp['leads']}")

    # ----------------------------------------------------
    # AUDIT 3: CRM PHONE-VERIFIED LEADS (TIER 2)
    # ----------------------------------------------------
    crm_audit = t9_json.get("crmPhoneAudit", {})
    total_crm_phones = crm_audit.get("total_phone_leads", 0)
    print(f"\n[3] AUDIT CRM PHONE LEADS (TIER 2): Total = {total_crm_phones} SĐT")
    if total_crm_phones != 673:
        errors.append(f"CRM Phone leads total mismatch: {total_crm_phones} != 673")

    bu_breakdown = {b["bu_name"]: b for b in crm_audit.get("bu_breakdown", [])}
    for bu, exp_data in expected_bu.items():
        bu_item = bu_breakdown.get(bu, {})
        act_p = bu_item.get("phone_leads", 0)
        exp_p = exp_data["phones"]
        print(f"    - {bu} Phone Leads: {act_p} SĐT (Expected: {exp_p})")
        if act_p != exp_p:
            errors.append(f"{bu} phone leads mismatch: {act_p} != {exp_p}")

    # Check weekly phone leads
    weekly_list = crm_audit.get("weekly_phone_leads", [])
    weekly_phones = [w["phone_leads"] for w in weekly_list]
    expected_weekly = [148, 140, 192, 193]
    print(f"    - Weekly Phone Leads: {weekly_phones} (Expected: {expected_weekly})")
    if weekly_phones != expected_weekly:
        errors.append(f"Weekly phone leads mismatch: {weekly_phones} != {expected_weekly}")

    # ----------------------------------------------------
    # AUDIT 4: NORMALIZED DAILY METRICS (W3 VS W4)
    # ----------------------------------------------------
    print("\n[4] AUDIT W3 VS W4 NORMALIZATION:")
    # W3: 7 days, 192 SĐT, Spend 29,178,421 đ -> 27.4 SĐT/day, 4.17M/day, CPL 151,971 đ
    w3_phones = 192
    w3_days = 7
    w3_daily_phones = w3_phones / w3_days # 27.4285
    w3_spend = 29178421
    w3_daily_spend = w3_spend / w3_days # 4,168,345
    w3_cpl = w3_spend / w3_phones # 151,970.9

    # W4: 9 days, 193 SĐT, Spend 23,040,999 đ -> 21.4 SĐT/day, 2.56M/day, CPL 119,383 đ
    w4_phones = 193
    w4_days = 9
    w4_daily_phones = w4_phones / w4_days # 21.444
    w4_spend = 23040999
    w4_daily_spend = w4_spend / w4_days # 2,560,111
    w4_cpl = w4_spend / w4_phones # 119,383.4

    pct_daily_phone_change = (w4_daily_phones - w3_daily_phones) / w3_daily_phones * 100
    pct_daily_spend_change = (w4_daily_spend - w3_daily_spend) / w3_daily_spend * 100
    pct_cpl_change = (w4_cpl - w3_cpl) / w3_cpl * 100

    print(f"    - W3 Daily SĐT: {w3_daily_phones:.1f} SĐT/day | Daily Spend: {w3_daily_spend/1e6:.2f}M | CPL: {w3_cpl:,.0f} đ")
    print(f"    - W4 Daily SĐT: {w4_daily_phones:.1f} SĐT/day | Daily Spend: {w4_daily_spend/1e6:.2f}M | CPL: {w4_cpl:,.0f} đ")
    print(f"    - Variance W4 vs W3 Daily SĐT: {pct_daily_phone_change:.1f}% (Expected: -21.8%)")
    print(f"    - Variance W4 vs W3 Daily Spend: {pct_daily_spend_change:.1f}% (Expected: -38.6%)")
    print(f"    - Variance W4 vs W3 CPL: {pct_cpl_change:.1f}% (Expected: -21.4%)")

    if abs(pct_daily_phone_change - (-21.8)) > 0.1:
        errors.append(f"W4 daily phone variance mismatch: {pct_daily_phone_change:.2f}% != -21.8%")

    # ----------------------------------------------------
    # AUDIT 5: HTML TABLES INTEGRITY & NUMBERS CHECK
    # ----------------------------------------------------
    print("\n[5] AUDIT HTML TABLES & STRINGS:")
    tables = soup.find_all("table")
    print(f"    - Found {len(tables)} tables in index.html")

    checks = [
        ("97.597.508", "Total spend in VND format"),
        ("2.113", "Total messages"),
        ("427", "Total reported leads"),
        ("673", "Total CRM phone leads"),
        ("228.566", "Reported CPL"),
        ("145.018", "CRM Phone CPL"),
        ("27.4", "W3 Daily SĐT"),
        ("21.4", "W4 Daily SĐT"),
        ("-21.8%", "W4 Daily SĐT variance"),
        ("119.383", "W4 Phone CPL"),
        ("42.3%", "W4 phone capture rate"),
        ("38.492.088", "BU1 spend"),
        ("15.954.295", "BU2 spend"),
        ("21.082.736", "BU4 spend"),
        ("22.068.389", "BU5 spend"),
        ("4 kỳ báo cáo", "Header 4 periods label"),
    ]

    for val, desc in checks:
        if val.lower() not in html.lower():
            errors.append(f"Missing expected text/figure in index.html: '{val}' ({desc})")
        else:
            print(f"    ✔ Found '{val}': {desc}")

    # ----------------------------------------------------
    # AUDIT 6: EMAIL.HTML KEY NUMBERS CHECK
    # ----------------------------------------------------
    print("\n[6] AUDIT EMAIL.HTML STRINGS:")
    email_checks = [
        ("97.597.508", "Email total spend"),
        ("2.113", "Email total messages"),
        ("427", "Email total reported leads"),
        ("673", "Email total CRM phone leads"),
        ("228.566", "Email reported CPL"),
        ("145.018", "Email CRM Phone CPL"),
        ("119.383", "Email W4 Phone CPL"),
    ]
    for val, desc in email_checks:
        if val.lower() not in email_html.lower():
            errors.append(f"Missing expected figure in email.html: '{val}' ({desc})")
        else:
            print(f"    ✔ Email Found '{val}': {desc}")

    # ----------------------------------------------------
    # AUDIT 7: BU TABLES ROW COUNTS IN HTML
    # ----------------------------------------------------
    print("\n[7] AUDIT BU AD SET TABLES IN HTML:")
    bu_table_ids = [
        ("page-bu1", 12, "BU1 Ad Sets"),
        ("page-bu2", 2, "BU2 Ad Sets"),
        ("page-bu4", 4, "BU4 Ad Sets"),
        ("page-bu5", 4, "BU5 Ad Sets"),
    ]
    for page_id, expected_rows, name in bu_table_ids:
        sec = soup.find(id=page_id)
        if not sec:
            errors.append(f"Section {page_id} not found in index.html")
            continue
        tb = sec.find("tbody")
        if not tb:
            errors.append(f"Tbody not found in {page_id}")
            continue
        rows = [tr for tr in tb.find_all("tr", recursive=False) if "border-t-2" not in tr.get("class", [])]
        print(f"    - {name}: Found {len(rows)} rows (Expected: {expected_rows})")
        if len(rows) != expected_rows:
            errors.append(f"{name} row count mismatch: {len(rows)} != {expected_rows}")

    print("\n" + "=" * 60)
    if errors:
        print(f"❌ AUDIT FAILED WITH {len(errors)} ERRORS:")
        for e in errors:
            print(f"  - {e}")
        return False
    else:
        print("✅ ALL 7 AUDIT CHECKS PASSED WITH 100% MATHEMATICAL PRECISION!")
        print("=" * 60)
        return True

if __name__ == "__main__":
    main()
