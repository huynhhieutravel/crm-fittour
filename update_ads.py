import re

with open('client/src/tabs/MarketingAdsTab.jsx', 'r') as f:
    code = f.read()

old_button = """          <a
            href="/tai-lieu/quy-tac-dat-ten-quang-cao-meta"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px',
              background: '#fef3c7', color: '#b45309', 
              fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none',
              border: '1px solid #fde68a', transition: 'all 0.2s'
            }}
          >
            <Star size={14} /> SOP Meta Ads
          </a>"""

new_buttons = """          <a
            href="/q2-report/index.html"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px',
              background: '#fdf2f8', color: '#be185d', 
              fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none',
              border: '1px solid #fbcfe8', transition: 'all 0.2s'
            }}
          >
            <Star size={14} /> Báo cáo Q2/2026
          </a>
          <a
            href="/tai-lieu/quy-tac-dat-ten-quang-cao-meta"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px',
              background: '#fef3c7', color: '#b45309', 
              fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none',
              border: '1px solid #fde68a', transition: 'all 0.2s'
            }}
          >
            <Star size={14} /> SOP Meta Ads
          </a>"""

code = code.replace(old_button, new_buttons)

with open('client/src/tabs/MarketingAdsTab.jsx', 'w') as f:
    f.write(code)

print("MarketingAdsTab updated")
