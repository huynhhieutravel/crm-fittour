import re

with open('client/src/pages/MarketingHub.jsx', 'r') as f:
    code = f.read()

# Change repeat(4, 1fr) to repeat(5, 1fr)
code = code.replace("gridTemplateColumns: 'repeat(4, 1fr)'", "gridTemplateColumns: 'repeat(5, 1fr)'")

# Add the 5th card
old_asset_card = """                { 
                  title: 'Asset', 
                  desc: 'Hình ảnh, video, template thiết kế, tài nguyên...', 
                  icon: <ImageIcon size={24} color="#9333ea" />, 
                  bg: '#faf5ff', 
                  links: [
                    { label: 'Xem tất cả (chưa có)', url: '#', internal: false, preventDefault: true }
                  ] 
                },"""

new_cards = """                { 
                  title: 'Asset', 
                  desc: 'Hình ảnh, video, template thiết kế, tài nguyên...', 
                  icon: <ImageIcon size={24} color="#9333ea" />, 
                  bg: '#faf5ff', 
                  links: [
                    { label: 'Xem tất cả (chưa có)', url: '#', internal: false, preventDefault: true }
                  ] 
                },
                { 
                  title: 'Báo Cáo Ads', 
                  desc: 'Báo cáo phân tích hiệu suất Ads Q2/2026', 
                  icon: <Star size={24} color="#ec4899" />, 
                  bg: '#fdf2f8', 
                  links: [
                    { label: 'Xem Báo Cáo', url: '/q2-report/index.html', internal: false, blank: true }
                  ] 
                },"""

code = code.replace(old_asset_card, new_cards)

with open('client/src/pages/MarketingHub.jsx', 'w') as f:
    f.write(code)

print("MarketingHub updated")
