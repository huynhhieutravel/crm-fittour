import re

with open('client/public/q2-report/index.html', 'r') as f:
    html = f.read()

# 1. Header flex
html = html.replace('<header class="flex justify-between items-center mb-6">', '<header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">')

# 2. Header title size
html = html.replace('<h1 class="text-2xl font-bold text-gray-900">', '<h1 class="text-xl md:text-2xl font-bold text-gray-900">')
html = html.replace('<h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">', '<h1 class="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">')

# 3. KPI flex container
html = html.replace('<div class="flex space-x-4">', '<div class="flex space-x-4 w-full md:w-auto">')
html = html.replace('<div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-center min-w-[150px]">', '<div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-center min-w-[140px] flex-1 md:flex-none">')

# 4. Body padding
html = html.replace('<body class="bg-gray-50 text-gray-800 font-sans p-6">', '<body class="bg-gray-50 text-gray-800 font-sans p-3 md:p-6">')

# 5. Nav bar
html = html.replace('sticky top-0 bg-gray-50 z-20 pt-2 pb-0 overflow-x-auto whitespace-nowrap scrollbar-hide shadow-sm', 'sticky top-0 bg-gray-50 z-20 pt-2 pb-0 overflow-x-auto whitespace-nowrap scrollbar-hide shadow-sm -mx-3 px-3 md:mx-0 md:px-0')

# Write back
with open('client/public/q2-report/index.html', 'w') as f:
    f.write(html)
    
# also update the original workspace
with open('/Users/huynhtronghieu/Documents/WORK Hiếu/q2-ads-report-2026/dashboard-q2.html', 'w') as f:
    f.write(html)

print("Responsive tweaks applied.")
