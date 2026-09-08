document.addEventListener('DOMContentLoaded', () => {
    // Register Chart DataLabels
    if (typeof ChartDataLabels !== 'undefined') {
        Chart.register(ChartDataLabels);
    }

    // Tab Navigation Logic
    const topNavBtns = document.querySelectorAll('.top-nav-btn');
    const pages = document.querySelectorAll('.page-content');

    const buMap = {
        'page-bu1': 'BU1',
        'page-bu2': 'BU2',
        'page-bu4': 'BU4',
        'page-bu5': 'BU5'
    };

    let currentSelectedBU = 'ALL';

    topNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            topNavBtns.forEach(b => {
                b.classList.remove('active', 'border-blue-600', 'text-blue-600', 'font-bold', 'bg-blue-50');
                b.classList.add('border-transparent', 'text-slate-600');
            });
            pages.forEach(p => {
                p.classList.remove('block');
                p.classList.add('hidden');
            });

            btn.classList.add('active', 'border-blue-600', 'text-blue-600', 'font-bold', 'bg-blue-50');
            btn.classList.remove('border-transparent', 'text-slate-600');

            const targetId = btn.getAttribute('data-page');
            const targetPage = document.getElementById(targetId);
            if (targetPage) {
                targetPage.classList.remove('hidden');
                targetPage.classList.add('block');
            }

            // Automatically sync bottom table filter to the active BU
            const targetBU = buMap[targetId] || 'ALL';
            if (window.syncBUFilter) {
                window.syncBUFilter(targetBU);
            } else {
                // Fallback if data not yet loaded, though unlikely for user clicking late
                currentSelectedBU = targetBU;
                const buFilter = document.getElementById('table-bu-filter');
                if (buFilter) {
                    buFilter.value = targetBU;
                }
            }
        });
    });

    Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    Chart.defaults.color = '#64748b';

    // Fetch and Render Data with Cache Buster
    fetch('t8_data.json?v=' + Date.now())
        .then(res => res.json())
        .then(data => {
            initDashboard(data);
        })
        .catch(err => {
            console.error('Error fetching t8_data.json:', err);
        });

    function initDashboard(data) {
        const { kpis, weekly, buWeekly, buTotal, allRows } = data;

        // 1. Render Charts
        renderBudgetSpendChart(buTotal);
        renderLeadShareChart(buTotal);
        renderWeeklyTrendChart(weekly);
        renderTopRoutesChart(allRows);

        // 2. Render Best and Worst Adsets
        renderPerformanceHighlights(allRows);

        // 3. Render Granular Table
        renderGranularTable(allRows);
    }

    // Chart 1: Budget vs Spend Bar Chart
    function renderBudgetSpendChart(buTotal) {
        const ctx = document.getElementById('chartBudgetSpend');
        if (!ctx) return;

        const targetBudgets = {
            'BU1': 40000000,
            'BU2': 20000000,
            'BU4': 30000000,
            'BU5': 40000000
        };

        const bus = ['BU1', 'BU2', 'BU4', 'BU5'];
        const planData = bus.map(b => targetBudgets[b] / 1000000);
        const actualData = bus.map(b => {
            const found = buTotal.find(item => item.bu_name === b);
            return found ? parseFloat(found.spend) / 1000000 : 0;
        });

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['BU1 (TQ)', 'BU2 (Âu/Nhật)', 'BU4 (Ngách)', 'BU5 (T.Đông)'],
                datasets: [
                    {
                        label: 'Kế hoạch (Triệu đ)',
                        data: planData,
                        backgroundColor: '#cbd5e1',
                        borderRadius: 6,
                        barPercentage: 0.6
                    },
                    {
                        label: 'Thực chi (Triệu đ)',
                        data: actualData,
                        backgroundColor: ['#3b82f6', '#f43f5e', '#10b981', '#a855f7'],
                        borderRadius: 6,
                        barPercentage: 0.6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11, weight: '600' } } },
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        formatter: (val) => val > 0 ? val.toFixed(1) + 'M' : '',
                        font: { size: 10, weight: 'bold' },
                        color: '#334155'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => context.dataset.label + ': ' + context.parsed.y.toFixed(2) + ' Triệu VNĐ'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 48,
                        ticks: { callback: (v) => v + 'M' },
                        grid: { color: '#f1f5f9' }
                    },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // Chart 2: Lead Share Donut Chart
    function renderLeadShareChart(buTotal) {
        const ctx = document.getElementById('chartLeadShare');
        if (!ctx) return;

        const bus = ['BU1', 'BU2', 'BU4', 'BU5'];
        const leadsData = bus.map(b => {
            const found = buTotal.find(item => item.bu_name === b);
            return found ? parseInt(found.leads) : 0;
        });

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['BU1 (150)', 'BU2 (26)', 'BU4 (148)', 'BU5 (126)'],
                datasets: [{
                    data: leadsData,
                    backgroundColor: ['#3b82f6', '#f43f5e', '#10b981', '#a855f7'],
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } },
                    datalabels: {
                        formatter: (val, ctx) => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            return ((val / total) * 100).toFixed(0) + '%';
                        },
                        color: '#ffffff',
                        font: { weight: 'bold', size: 11 }
                    }
                },
                cutout: '62%'
            }
        });
    }

    // Chart 3: Weekly Trend Multi-Axis Chart (4 Complete Weeks)
    function renderWeeklyTrendChart(weekly) {
        const ctx = document.getElementById('chartWeeklyTrend');
        if (!ctx) return;

        // Tạm tách Tuần 5 (chỉ có 1 ngày lẻ 31/8) ra khỏi chu kỳ tuần tròn
        const completeWeeks = weekly.filter(w => parseInt(w.week_number) <= 4);

        const labels = completeWeeks.map(w => 'Tuần ' + w.week_number);
        const spendData = completeWeeks.map(w => parseFloat(w.spend) / 1000000);
        const cplData = completeWeeks.map(w => {
            const leads = parseInt(w.leads);
            return leads > 0 ? Math.round(parseFloat(w.spend) / leads) : 0;
        });

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        type: 'line',
                        label: 'Giá Lead (CPL đ)',
                        data: cplData,
                        borderColor: '#f97316',
                        backgroundColor: '#f97316',
                        borderWidth: 3,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        yAxisID: 'y1'
                    },
                    {
                        type: 'bar',
                        label: 'Chi tiêu (Triệu đ)',
                        data: spendData,
                        backgroundColor: '#93c5fd',
                        borderRadius: 6,
                        yAxisID: 'y',
                        barPercentage: 0.5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
                    datalabels: {
                        display: (context) => context.dataset.type === 'line',
                        align: 'top',
                        formatter: (val) => Math.round(val / 1000) + 'k',
                        font: { size: 10, weight: 'bold' },
                        color: '#ea580c'
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        ticks: { callback: (v) => v + 'M' },
                        title: { display: true, text: 'Chi tiêu (Tr đ)', font: { size: 10 } },
                        grid: { color: '#f1f5f9' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        ticks: { callback: (v) => (v / 1000) + 'k' },
                        title: { display: true, text: 'Giá Lead (VNĐ)', font: { size: 10 } },
                        grid: { drawOnChartArea: false }
                    },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // Chart 4: Top Routes Performance Horizontal Bar
    function renderTopRoutesChart(allRows) {
        const ctx = document.getElementById('chartTopRoutes');
        if (!ctx) return;

        const tours = {};
        allRows.forEach(r => {
            let name = r.ad_set_name || r.campaign_name;
            let tourName = 'Khác';
            if (/Ladakh/i.test(name)) tourName = 'Ladakh';
            else if (/Ai Cập/i.test(name)) tourName = 'Ai Cập';
            else if (/Ma Rốc/i.test(name)) tourName = 'Ma Rốc';
            else if (/Pakistan/i.test(name)) tourName = 'Pakistan';
            else if (/Srilanka/i.test(name)) tourName = 'Sri Lanka';
            else if (/Bắc Kinh/i.test(name)) tourName = 'Bắc Kinh';
            else if (/Nam Tân Cương|Tân Cương/i.test(name)) tourName = 'Tân Cương';
            else if (/Cửu Trại Câu/i.test(name)) tourName = 'Cửu Trại Câu';
            else if (/Lệ Giang/i.test(name)) tourName = 'Lệ Giang';
            else if (/Thanh Tạng/i.test(name)) tourName = 'Thanh Tạng';
            else if (/Giang Nam/i.test(name)) tourName = 'Giang Nam';
            else if (/Nhật Bản/i.test(name)) tourName = 'Nhật Bản';

            if (!tours[tourName]) tours[tourName] = { spend: 0, leads: 0 };
            tours[tourName].spend += parseFloat(r.spend);
            tours[tourName].leads += parseInt(r.leads);
        });

        const sortedTours = Object.entries(tours)
            .filter(([t]) => t !== 'Khác')
            .sort((a, b) => b[1].spend - a[1].spend)
            .slice(0, 8);

        const labels = sortedTours.map(t => t[0]);
        const spendData = sortedTours.map(t => (t[1].spend / 1000000));
        const leadData = sortedTours.map(t => t[1].leads);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Chi tiêu (Tr đ)',
                        data: spendData,
                        backgroundColor: '#60a5fa',
                        borderRadius: 4
                    },
                    {
                        label: 'Số Lead',
                        data: leadData,
                        backgroundColor: '#34d399',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { boxWidth: 10, font: { size: 10 } } },
                    datalabels: {
                        anchor: 'end',
                        align: 'right',
                        formatter: (val, context) => {
                            if (context.datasetIndex === 0) return val.toFixed(1) + 'M';
                            return val + 'L';
                        },
                        font: { size: 9, weight: 'bold' },
                        color: '#475569'
                    }
                },
                scales: {
                    x: { grid: { color: '#f1f5f9' }, beginAtZero: true },
                    y: { grid: { display: false }, ticks: { font: { size: 11, weight: '500' } } }
                }
            }
        });
    }

    // 2. Render Best and Worst Adsets (Lũy Kế Đầy Đủ Cả Tháng 8)
    function renderPerformanceHighlights(allRows) {
        const tblWorst = document.getElementById('tbl-worst-adsets');
        const tblBest = document.getElementById('tbl-best-adsets');
        if (!tblWorst || !tblBest) return;

        // Gom nhóm adset theo BU + Tên nhóm trên phạm vi toàn bộ các tuần trong tháng
        const adsetMap = {};
        allRows.forEach(r => {
            if (r.bu_name && !['BU1', 'BU2', 'BU4', 'BU5'].includes(r.bu_name)) return;
            const name = r.ad_set_name || r.campaign_name;
            const key = (r.bu_name || '') + '___' + name;
            if (!adsetMap[key]) {
                adsetMap[key] = {
                    bu_name: r.bu_name,
                    ad_set_name: name,
                    spend: 0,
                    leads: 0,
                    messages: 0,
                    weeks: []
                };
            }
            adsetMap[key].spend += parseFloat(r.spend || 0);
            adsetMap[key].leads += parseInt(r.leads || 0);
            adsetMap[key].messages += parseInt(r.messages || 0);
            const w = parseInt(r.week_number);
            if (!adsetMap[key].weeks.includes(w)) {
                adsetMap[key].weeks.push(w);
            }
        });

        const aggregated = Object.values(adsetMap).map(item => {
            const cpl = item.leads > 0 ? Math.round(item.spend / item.leads) : 999999999;
            return { ...item, cpl };
        });

        // Top Kém: Chi tiêu cả tháng >= 1.5M và CPL cao nhất (hoặc 0 lead)
        const worst = aggregated
            .filter(item => item.spend >= 1500000 && (item.leads === 0 || item.cpl > 250000))
            .sort((a, b) => b.cpl - a.cpl)
            .slice(0, 5);

        tblWorst.innerHTML = worst.map(r => {
            const spend = Math.round(r.spend).toLocaleString('vi-VN') + ' đ';
            const leads = r.leads;
            const cpl = leads > 0 ? r.cpl.toLocaleString('vi-VN') + ' đ' : '<span class="text-rose-600 font-bold">0 Lead (Vô cực)</span>';
            const buColor = r.bu_name === 'BU5' ? 'bg-purple-100 text-purple-800' : (r.bu_name === 'BU2' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800');
            const weeksCount = r.weeks.length;

            return `
                <tr class="hover:bg-slate-50">
                    <td class="p-2.5 font-medium text-slate-800 truncate max-w-[180px]" title="${r.ad_set_name}">
                        ${r.ad_set_name}
                    </td>
                    <td class="p-2.5 text-center"><span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${buColor}">${r.bu_name}</span></td>
                    <td class="p-2.5 text-center text-slate-500 font-medium whitespace-nowrap">${weeksCount} tuần</td>
                    <td class="p-2.5 text-right font-semibold text-slate-700 whitespace-nowrap">${spend}</td>
                    <td class="p-2.5 text-center font-bold ${leads === 0 ? 'text-rose-600' : 'text-slate-800'}">${leads}</td>
                    <td class="p-2.5 text-right font-bold text-rose-600 whitespace-nowrap">${cpl}</td>
                </tr>
            `;
        }).join('');

        // Top Xuất Sắc: Thu được >= 10 Leads cả tháng, CPL thấp nhất
        const best = aggregated
            .filter(item => item.leads >= 10)
            .sort((a, b) => a.cpl - b.cpl)
            .slice(0, 5);

        tblBest.innerHTML = best.map(r => {
            const spend = Math.round(r.spend).toLocaleString('vi-VN') + ' đ';
            const leads = r.leads;
            const cpl = r.cpl.toLocaleString('vi-VN') + ' đ';
            const buColor = r.bu_name === 'BU4' ? 'bg-emerald-100 text-emerald-800' : (r.bu_name === 'BU1' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800');
            const weeksCount = r.weeks.length;

            return `
                <tr class="hover:bg-slate-50">
                    <td class="p-2.5 font-medium text-slate-800 truncate max-w-[180px]" title="${r.ad_set_name}">
                        ${r.ad_set_name}
                    </td>
                    <td class="p-2.5 text-center"><span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${buColor}">${r.bu_name}</span></td>
                    <td class="p-2.5 text-center text-slate-500 font-medium whitespace-nowrap">${weeksCount} tuần</td>
                    <td class="p-2.5 text-right font-semibold text-slate-700 whitespace-nowrap">${spend}</td>
                    <td class="p-2.5 text-center font-bold text-emerald-700">${leads}</td>
                    <td class="p-2.5 text-right font-bold text-emerald-600 bg-emerald-50/50 whitespace-nowrap">${cpl}</td>
                </tr>
            `;
        }).join('');
    }

    // 3. Render Granular Table & Filters
    function renderGranularTable(allRows) {
        const tbody = document.getElementById('tbl-full-adsets');
        const searchInput = document.getElementById('table-search');
        const buFilter = document.getElementById('table-bu-filter');
        const weekFilter = document.getElementById('table-week-filter');

        function filterAndRender() {
            const query = searchInput.value.toLowerCase().trim();
            const selectedBU = buFilter.value;
            const selectedWeek = weekFilter.value;

            const filtered = allRows.filter(r => {
                const matchQuery = !query || (r.campaign_name && r.campaign_name.toLowerCase().includes(query)) || (r.ad_set_name && r.ad_set_name.toLowerCase().includes(query));
                const matchBU = selectedBU === 'ALL' || r.bu_name === selectedBU;
                const matchWeek = selectedWeek === 'ALL' || r.week_number.toString() === selectedWeek;
                return matchQuery && matchBU && matchWeek;
            });

            // Update Counter Badge
            const countBadge = document.getElementById('table-count-badge');
            if (countBadge) {
                const buLabel = selectedBU === 'ALL' ? 'Tất cả' : selectedBU;
                const weekLabel = selectedWeek === 'ALL' ? '' : ` • Tuần ${selectedWeek}`;
                countBadge.textContent = `${filtered.length} nhóm (${buLabel}${weekLabel} / ${allRows.length} tổng)`;
                if (selectedBU === 'BU1') {
                    countBadge.className = 'px-2 py-0.5 text-xs font-bold rounded-md bg-blue-100 text-blue-800';
                } else if (selectedBU === 'BU2') {
                    countBadge.className = 'px-2 py-0.5 text-xs font-bold rounded-md bg-rose-100 text-rose-800';
                } else if (selectedBU === 'BU4') {
                    countBadge.className = 'px-2 py-0.5 text-xs font-bold rounded-md bg-emerald-100 text-emerald-800';
                } else if (selectedBU === 'BU5') {
                    countBadge.className = 'px-2 py-0.5 text-xs font-bold rounded-md bg-purple-100 text-purple-800';
                } else {
                    countBadge.className = 'px-2 py-0.5 text-xs font-bold rounded-md bg-slate-100 text-slate-800';
                }
            }

            if (filtered.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" class="p-6 text-center text-slate-400 font-medium">Không tìm thấy nhóm quảng cáo nào phù hợp với bộ lọc ${selectedBU !== 'ALL' ? selectedBU : ''}.</td></tr>`;
                return;
            }

            tbody.innerHTML = filtered.map(r => {
                const spend = Math.round(parseFloat(r.spend)).toLocaleString('vi-VN');
                const msgs = parseInt(r.messages);
                const leads = parseInt(r.leads);
                const cplMsg = msgs > 0 ? Math.round(parseFloat(r.spend) / msgs).toLocaleString('vi-VN') + ' đ' : '-';
                const cplLead = leads > 0 ? Math.round(parseFloat(r.spend) / leads).toLocaleString('vi-VN') + ' đ' : '-';

                let buClass = 'bg-slate-100 text-slate-800';
                if (r.bu_name === 'BU1') buClass = 'bg-blue-100 text-blue-800 font-bold';
                else if (r.bu_name === 'BU2') buClass = 'bg-rose-100 text-rose-800 font-bold';
                else if (r.bu_name === 'BU4') buClass = 'bg-emerald-100 text-emerald-800 font-bold';
                else if (r.bu_name === 'BU5') buClass = 'bg-purple-100 text-purple-800 font-bold';

                return `
                    <tr class="hover:bg-slate-50/80">
                        <td class="p-3 font-semibold text-slate-700">Tuần ${r.week_number}</td>
                        <td class="p-3"><span class="px-2 py-0.5 rounded text-[11px] ${buClass}">${r.bu_name}</span></td>
                        <td class="p-3 text-slate-700 max-w-[220px] truncate" title="${r.campaign_name}">${r.campaign_name || '-'}</td>
                        <td class="p-3 font-medium text-slate-900 max-w-[260px] truncate" title="${r.ad_set_name}">${r.ad_set_name || '-'}</td>
                        <td class="p-3 text-right font-bold text-slate-900">${spend}</td>
                        <td class="p-3 text-center font-semibold text-slate-800">${msgs}</td>
                        <td class="p-3 text-center font-bold ${leads > 0 ? 'text-blue-700' : 'text-slate-400'}">${leads}</td>
                        <td class="p-3 text-right text-slate-600">${cplMsg}</td>
                        <td class="p-3 text-right font-semibold ${leads > 0 ? 'text-emerald-700' : 'text-slate-400'}">${cplLead}</td>
                    </tr>
                `;
            }).join('');
        }

        if (buFilter && currentSelectedBU !== 'ALL') {
            buFilter.value = currentSelectedBU;
        }

        // Expose global function for reliable cross-component syncing
        window.syncBUFilter = function(buName) {
            currentSelectedBU = buName;
            if (buFilter) buFilter.value = buName;
            filterAndRender();
        };

        searchInput.addEventListener('input', filterAndRender);
        buFilter.addEventListener('change', () => {
            currentSelectedBU = buFilter.value;
            filterAndRender();
        });
        weekFilter.addEventListener('change', filterAndRender);

        filterAndRender();
    }
});
