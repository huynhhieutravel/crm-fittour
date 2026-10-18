document.addEventListener('DOMContentLoaded', () => {
    // Register Chart DataLabels
    if (typeof ChartDataLabels !== 'undefined') {
        Chart.register(ChartDataLabels);
    }

    // Top Tab Navigation Logic
    const topNavBtns = document.querySelectorAll('.top-nav-btn');
    const pages = document.querySelectorAll('.page-content');

    const buMap = {
        'page-bu1': 'BU1',
        'page-bu2': 'BU2',
        'page-bu4': 'BU4',
        'page-bu5': 'BU5'
    };

    let currentSelectedBU = 'ALL';
    let globalAllRows = [];

    topNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            topNavBtns.forEach(b => {
                b.classList.remove('active', 'border-indigo-600', 'text-indigo-600', 'font-bold', 'bg-indigo-50');
                b.classList.add('border-transparent', 'text-slate-600');
            });
            pages.forEach(p => {
                p.classList.remove('block');
                p.classList.add('hidden');
            });

            btn.classList.add('active', 'border-indigo-600', 'text-indigo-600', 'font-bold', 'bg-indigo-50');
            btn.classList.remove('border-transparent', 'text-slate-600');

            const targetId = btn.getAttribute('data-page');
            const targetPage = document.getElementById(targetId);
            if (targetPage) {
                targetPage.classList.remove('hidden');
                targetPage.classList.add('block');
            }

            // Sync bottom table filter to the active BU
            const targetBU = buMap[targetId] || 'ALL';
            if (window.syncBUFilter) {
                window.syncBUFilter(targetBU);
            } else {
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
    fetch('t9_data.json?v=' + Date.now())
        .then(res => res.json())
        .then(data => {
            initDashboard(data);
        })
        .catch(err => {
            console.error('Lỗi khi tải t9_data.json:', err);
        });

    function initDashboard(data) {
        const { kpis, weekly, buWeekly, buTotal, allRows, momByBU, momSystem } = data;
        globalAllRows = allRows;

        // 1. Render Charts
        renderBudgetSpendChart(buTotal);
        renderLeadShareChart(buTotal);
        renderWeeklyTrendChart(weekly);
        renderTopRoutesChart(allRows);
        renderMoMTrendChart(momSystem);
        renderConversionRatesChart(buTotal);

        // 2. Render Best and Worst Adsets
        renderPerformanceHighlights(allRows);

        // 3. Render Granular Table & Filters
        renderGranularTable(allRows);

        // 4. Setup CSV Export
        setupExportCSV(allRows);
    }

    // Chart 1: Budget vs Spend vs Phone Leads Bar Chart
    function renderBudgetSpendChart(buTotal) {
        const ctx = document.getElementById('chartBudgetSpend');
        if (!ctx) return;

        const targetBudgets = {
            'BU1': 40000000,
            'BU2': 20000000,
            'BU4': 30000000,
            'BU5': 40000000
        };

        const phoneLeads = {
            'BU1': 330,
            'BU2': 102,
            'BU4': 91,
            'BU5': 150
        };

        const bus = ['BU1', 'BU2', 'BU4', 'BU5'];
        const planData = bus.map(b => targetBudgets[b] / 1000000);
        const actualData = bus.map(b => {
            const found = buTotal.find(item => item.bu_name === b);
            return found ? parseFloat(found.spend) / 1000000 : 0;
        });
        const phoneData = bus.map(b => phoneLeads[b]);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['BU1 (Trung Quốc)', 'BU2 (Nhật/Âu/Mỹ)', 'BU4 (Tuyến Ngách)', 'BU5 (Trung Đông/Nga)'],
                datasets: [
                    {
                        label: 'Ngân Sách Kế Hoạch (Tr đ)',
                        data: planData,
                        backgroundColor: '#cbd5e1',
                        borderRadius: 6,
                        yAxisID: 'y',
                        barPercentage: 0.8,
                        categoryPercentage: 0.75
                    },
                    {
                        label: 'Chi Tiêu Thực Tế (Tr đ)',
                        data: actualData,
                        backgroundColor: '#4f46e5',
                        borderRadius: 6,
                        yAxisID: 'y',
                        barPercentage: 0.8,
                        categoryPercentage: 0.75
                    },
                    {
                        label: 'SĐT Thực Thu (Lead CRM)',
                        data: phoneData,
                        backgroundColor: '#10b981',
                        borderRadius: 6,
                        yAxisID: 'y1',
                        barPercentage: 0.8,
                        categoryPercentage: 0.75
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            font: { size: 11, weight: '600' },
                            usePointStyle: true,
                            pointStyle: 'rectRounded'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const val = context.raw;
                                if (context.datasetIndex === 2) {
                                    return `${context.dataset.label}: ${val} SĐT`;
                                }
                                return `${context.dataset.label}: ${val.toFixed(2)} Tr VNĐ`;
                            }
                        }
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        offset: 2,
                        formatter: (val, context) => {
                            if (context.datasetIndex === 2) {
                                return val + ' 📱';
                            }
                            return val.toFixed(1) + 'M';
                        },
                        font: { size: 10, weight: 'bold' },
                        color: (context) => {
                            if (context.datasetIndex === 0) return '#64748b';
                            if (context.datasetIndex === 1) return '#4338ca';
                            return '#047857';
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        max: 48,
                        ticks: { callback: (v) => v + 'M' },
                        grid: { color: '#f1f5f9' },
                        title: { display: true, text: 'Ngân Sách & Chi Tiêu (Tr đ)', font: { size: 11, weight: 'bold' } }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        max: 380,
                        grid: { drawOnChartArea: false },
                        ticks: {
                            stepSize: 50,
                            callback: (v) => v + ' SĐT'
                        },
                        title: { display: true, text: 'Số Điện Thoại Thực Thu (CRM)', font: { size: 11, weight: 'bold' }, color: '#059669' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { weight: '600' } }
                    }
                }
            }
        });
    }

    // Chart 2: Lead Share Donut Chart
    function renderLeadShareChart(buTotal) {
        const ctx = document.getElementById('chartLeadShare');
        if (!ctx) return;

        const filtered = buTotal.filter(b => ['BU1', 'BU2', 'BU4', 'BU5'].includes(b.bu_name));
        const totalLeads = filtered.reduce((acc, cur) => acc + parseInt(cur.leads), 0);

        const labels = filtered.map(b => {
            const names = {
                'BU1': 'BU1 (Trung Quốc)',
                'BU2': 'BU2 (Nhật/Âu/Mỹ)',
                'BU4': 'BU4 (Tuyến Ngách)',
                'BU5': 'BU5 (Trung Đông/Nga)'
            };
            return names[b.bu_name] || b.bu_name;
        });

        const data = filtered.map(b => parseInt(b.leads));
        const colors = ['#dc2626', '#2563eb', '#059669', '#9333ea'];

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    hoverOffset: 6,
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const val = context.raw;
                                const pct = totalLeads > 0 ? ((val / totalLeads) * 100).toFixed(1) : 0;
                                return `${context.label}: ${val} Lead (${pct}%)`;
                            }
                        }
                    },
                    datalabels: {
                        formatter: (val) => {
                            const pct = totalLeads > 0 ? ((val / totalLeads) * 100).toFixed(1) : 0;
                            return `${val}L\n(${pct}%)`;
                        },
                        color: '#ffffff',
                        font: { weight: 'bold', size: 10 },
                        textAlign: 'center'
                    }
                },
                cutout: '55%'
            }
        });
    }

    // Chart 3: 4-Week Trend Multi-Axis Bar + Line Chart
    function renderWeeklyTrendChart(weekly) {
        const ctx = document.getElementById('chartWeeklyTrend');
        if (!ctx) return;

        const labels = weekly.map(w => 'Tuần ' + w.week_number);
        const spendData = weekly.map(w => parseFloat(w.spend) / 1000000);
        const cplData = weekly.map(w => {
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
                        label: 'Giá Mỗi Lead (CPL đ)',
                        data: cplData,
                        borderColor: '#ea580c',
                        backgroundColor: '#ea580c',
                        borderWidth: 3,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        yAxisID: 'y1'
                    },
                    {
                        type: 'bar',
                        label: 'Chi Tiêu (Triệu đ)',
                        data: spendData,
                        backgroundColor: '#a5b4fc',
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
                        color: '#c2410c'
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
            else if (/Srilanka|Sri Lanka/i.test(name)) tourName = 'Sri Lanka';
            else if (/Bhutan/i.test(name)) tourName = 'Bhutan';
            else if (/Cáp Nhĩ Tân/i.test(name)) tourName = 'Cáp Nhĩ Tân';
            else if (/Bắc Kinh/i.test(name)) tourName = 'Bắc Kinh';
            else if (/Cửu Trại Câu/i.test(name)) tourName = 'Cửu Trại Câu';
            else if (/Nam Tân Cương|Tân Cương/i.test(name)) tourName = 'Nam Tân Cương';
            else if (/Giang Nam/i.test(name)) tourName = 'Giang Nam';
            else if (/Lệ Giang/i.test(name)) tourName = 'Lệ Giang';
            else if (/Thanh Tạng/i.test(name)) tourName = 'Thanh Tạng';
            else if (/Thanh Hải/i.test(name)) tourName = 'Thanh Hải - Cam Túc';
            else if (/Nhật Bản/i.test(name)) tourName = 'Nhật Bản';
            else if (/Nga/i.test(name)) tourName = 'Nga';
            else if (/Pakistan/i.test(name)) tourName = 'Pakistan';
            else if (/Ai Cập/i.test(name)) tourName = 'Ai Cập';
            else if (/Ma Rốc/i.test(name)) tourName = 'Ma Rốc';
            else if (/Lịch Khởi Hành/i.test(name)) tourName = 'Lịch Khởi Hành (TQ)';
            else if (/Tổng Hợp/i.test(name)) tourName = 'Tổng Hợp (BU2)';

            if (!tours[tourName]) tours[tourName] = { spend: 0, leads: 0 };
            tours[tourName].spend += parseFloat(r.spend);
            tours[tourName].leads += parseInt(r.leads);
        });

        const sortedTours = Object.entries(tours)
            .filter(([t]) => t !== 'Khác')
            .sort((a, b) => b[1].spend - a[1].spend)
            .slice(0, 10);

        const labels = sortedTours.map(t => t[0]);
        const spendData = sortedTours.map(t => (t[1].spend / 1000000));
        const leadData = sortedTours.map(t => t[1].leads);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Chi Tiêu (Tr đ)',
                        data: spendData,
                        backgroundColor: '#6366f1',
                        borderRadius: 4
                    },
                    {
                        label: 'Số Lead Thu Thập',
                        data: leadData,
                        backgroundColor: '#10b981',
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
                    y: { grid: { display: false }, ticks: { font: { size: 10, weight: '600' } } }
                }
            }
        });
    }

    // Chart 5 (MỚI TIẾN BỘ): MoM Trend Chart (T7 - T8 - T9)
    function renderMoMTrendChart(momSystem) {
        const ctx = document.getElementById('chartMoMTrend');
        if (!ctx) return;

        const months = ['Tháng 7', 'Tháng 8', 'Tháng 9'];
        const spendData = [130.60, 104.42, 97.60];
        const msgData = [2392, 1626, 2113];
        const cplData = [184.2, 229.0, 228.6];

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    {
                        type: 'line',
                        label: 'Giá Lead TB (nghìn đ)',
                        data: cplData,
                        borderColor: '#e11d48',
                        backgroundColor: '#e11d48',
                        borderWidth: 3,
                        pointRadius: 6,
                        yAxisID: 'y1'
                    },
                    {
                        type: 'line',
                        label: 'Lượng Tin Nhắn (Msg)',
                        data: msgData,
                        borderColor: '#0284c7',
                        backgroundColor: '#0284c7',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        pointRadius: 5,
                        yAxisID: 'y2'
                    },
                    {
                        type: 'bar',
                        label: 'Tổng Chi Tiêu (Tr đ)',
                        data: spendData,
                        backgroundColor: '#cbd5e1',
                        borderRadius: 6,
                        barPercentage: 0.45,
                        yAxisID: 'y'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { boxWidth: 10, font: { size: 10 } } },
                    datalabels: {
                        display: (context) => context.dataset.type === 'line',
                        align: 'top',
                        formatter: (val, context) => {
                            if (context.datasetIndex === 0) return val.toFixed(0) + 'k';
                            return val.toLocaleString('vi-VN');
                        },
                        font: { size: 9, weight: 'bold' },
                        color: '#334155'
                    }
                },
                scales: {
                    y: {
                        position: 'left',
                        title: { display: true, text: 'Chi tiêu (Tr đ)', font: { size: 10 } },
                        ticks: { callback: v => v + 'M' },
                        grid: { color: '#f8fafc' }
                    },
                    y1: {
                        position: 'right',
                        title: { display: true, text: 'CPL (k đ)', font: { size: 10 } },
                        ticks: { callback: v => v + 'k' },
                        grid: { drawOnChartArea: false }
                    },
                    y2: {
                        position: 'right',
                        display: false
                    },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // Chart 6 (MỚI TIẾN BỘ): Conversion Rates Chart (Msg -> Lead)
    function renderConversionRatesChart(buTotal) {
        const ctx = document.getElementById('chartConversionRates');
        if (!ctx) return;

        const bus = ['BU1', 'BU2', 'BU4', 'BU5'];
        const rateData = bus.map(b => {
            const found = buTotal.find(item => item.bu_name === b);
            if (!found || parseInt(found.msgs) === 0) return 0;
            return parseFloat(((parseInt(found.leads) / parseInt(found.msgs)) * 100).toFixed(1));
        });

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['BU1 (25.9%)', 'BU2 (34.7% ⭐)', 'BU4 (11.8%)', 'BU5 (17.0%)'],
                datasets: [{
                    label: 'Tỷ Lệ Msg ➔ Lead (%)',
                    data: rateData,
                    backgroundColor: ['#f87171', '#3b82f6', '#34d399', '#c084fc'],
                    borderRadius: 6,
                    barPercentage: 0.55
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        formatter: (val) => val + '%',
                        font: { size: 11, weight: 'bold' },
                        color: '#1e293b'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 45,
                        ticks: { callback: v => v + '%' },
                        grid: { color: '#f1f5f9' },
                        title: { display: true, text: 'Tỷ lệ gom Lead (%)', font: { size: 10 } }
                    },
                    x: { grid: { display: false }, ticks: { font: { weight: '600' } } }
                }
            }
        });
    }

    // 2. Render Best and Worst Adsets
    function renderPerformanceHighlights(allRows) {
        const tblWorst = document.getElementById('tbl-worst-adsets');
        const tblBest = document.getElementById('tbl-best-adsets');
        if (!tblWorst || !tblBest) return;

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

        // Top Kém: Chi tiêu cả tháng >= 1.0M và CPL cao nhất (hoặc 0 lead)
        const worst = aggregated
            .filter(item => item.spend >= 1000000 && (item.leads === 0 || item.cpl > 250000))
            .sort((a, b) => b.cpl - a.cpl)
            .slice(0, 5);

        tblWorst.innerHTML = worst.map(r => {
            const spend = Math.round(r.spend).toLocaleString('vi-VN') + ' đ';
            const leads = r.leads;
            const cpl = leads > 0 ? r.cpl.toLocaleString('vi-VN') + ' đ' : '<span class="text-rose-600 font-bold">0 Lead (Vô cực)</span>';
            const buColor = r.bu_name === 'BU5' ? 'bg-purple-100 text-purple-800' : (r.bu_name === 'BU4' ? 'bg-emerald-100 text-emerald-800' : (r.bu_name === 'BU1' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'));
            const weeksCount = r.weeks.length;

            return `
                <tr class="hover:bg-slate-50">
                    <td class="p-2.5 font-medium text-slate-800 truncate max-w-[200px]" title="${r.ad_set_name}">
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
            const buColor = r.bu_name === 'BU1' ? 'bg-red-100 text-red-800' : (r.bu_name === 'BU5' ? 'bg-purple-100 text-purple-800' : (r.bu_name === 'BU2' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'));
            const weeksCount = r.weeks.length;

            return `
                <tr class="hover:bg-slate-50">
                    <td class="p-2.5 font-medium text-slate-800 truncate max-w-[200px]" title="${r.ad_set_name}">
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
        const countBadge = document.getElementById('table-count-badge');

        if (!tbody) return;

        function applyFilters() {
            const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';
            const buVal = buFilter ? buFilter.value : 'ALL';
            const weekVal = weekFilter ? weekFilter.value : 'ALL';

            const filtered = allRows.filter(r => {
                // BU check
                if (buVal !== 'ALL' && r.bu_name !== buVal) return false;
                // Week check
                if (weekVal !== 'ALL' && String(r.week_number) !== String(weekVal)) return false;
                // Search check
                if (searchVal) {
                    const campaign = (r.campaign_name || '').toLowerCase();
                    const adset = (r.ad_set_name || '').toLowerCase();
                    const ad = (r.ad_name || '').toLowerCase();
                    if (!campaign.includes(searchVal) && !adset.includes(searchVal) && !ad.includes(searchVal)) {
                        return false;
                    }
                }
                return true;
            });

            if (countBadge) {
                countBadge.textContent = `${filtered.length} / ${allRows.length} bản ghi`;
            }

            if (filtered.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" class="p-8 text-center text-slate-400">Không tìm thấy nhóm quảng cáo nào phù hợp với bộ lọc.</td></tr>`;
                return;
            }

            tbody.innerHTML = filtered.map(r => {
                const spend = Math.round(parseFloat(r.spend)).toLocaleString('vi-VN');
                const msgs = parseInt(r.messages) || 0;
                const leads = parseInt(r.leads) || 0;
                const cplMsg = msgs > 0 ? Math.round(parseFloat(r.spend) / msgs).toLocaleString('vi-VN') + ' đ' : '-';
                const cplLead = leads > 0 ? Math.round(parseFloat(r.spend) / leads).toLocaleString('vi-VN') + ' đ' : '-';

                const buColor = r.bu_name === 'BU1' ? 'bg-red-100 text-red-800' :
                                (r.bu_name === 'BU2' ? 'bg-blue-100 text-blue-800' :
                                (r.bu_name === 'BU4' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'));

                return `
                    <tr class="hover:bg-slate-50 transition-colors">
                        <td class="p-3 text-center font-bold text-slate-600">T${r.week_number}</td>
                        <td class="p-3 text-center"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${buColor}">${r.bu_name}</span></td>
                        <td class="p-3 text-slate-700 max-w-[200px] truncate" title="${r.campaign_name}">${r.campaign_name}</td>
                        <td class="p-3 font-semibold text-slate-800 max-w-[240px] truncate" title="${r.ad_set_name}">${r.ad_set_name}</td>
                        <td class="p-3 text-right font-bold text-slate-800">${spend} đ</td>
                        <td class="p-3 text-center font-bold text-indigo-700">${msgs}</td>
                        <td class="p-3 text-center font-extrabold ${leads > 0 ? 'text-emerald-700' : 'text-slate-400'}">${leads}</td>
                        <td class="p-3 text-right text-slate-600">${cplMsg}</td>
                        <td class="p-3 text-right font-bold ${leads > 0 ? 'text-emerald-600' : 'text-slate-400'}">${cplLead}</td>
                    </tr>
                `;
            }).join('');
        }

        if (searchInput) searchInput.addEventListener('input', applyFilters);
        if (buFilter) buFilter.addEventListener('change', applyFilters);
        if (weekFilter) weekFilter.addEventListener('change', applyFilters);

        window.syncBUFilter = function(bu) {
            if (buFilter) {
                buFilter.value = bu;
                applyFilters();
            }
        };

        // Initial render
        applyFilters();
    }

    // 4. Setup CSV Export
    function setupExportCSV(allRows) {
        const btn = document.getElementById('btn-export-csv');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const buFilter = document.getElementById('table-bu-filter');
            const weekFilter = document.getElementById('table-week-filter');
            const searchInput = document.getElementById('table-search');

            const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';
            const buVal = buFilter ? buFilter.value : 'ALL';
            const weekVal = weekFilter ? weekFilter.value : 'ALL';

            const filtered = allRows.filter(r => {
                if (buVal !== 'ALL' && r.bu_name !== buVal) return false;
                if (weekVal !== 'ALL' && String(r.week_number) !== String(weekVal)) return false;
                if (searchVal) {
                    const campaign = (r.campaign_name || '').toLowerCase();
                    const adset = (r.ad_set_name || '').toLowerCase();
                    if (!campaign.includes(searchVal) && !adset.includes(searchVal)) return false;
                }
                return true;
            });

            let csvContent = '\uFEFFTuần,BU,Chiến Dịch,Nhóm Quảng Cáo,Chi Tiêu (VNĐ),Tin Nhắn (Msg),Lead MKT,Giá / Msg (VNĐ),Giá / Lead (VNĐ)\n';
            filtered.forEach(r => {
                const spend = Math.round(parseFloat(r.spend));
                const msgs = parseInt(r.messages) || 0;
                const leads = parseInt(r.leads) || 0;
                const cplMsg = msgs > 0 ? Math.round(spend / msgs) : 0;
                const cplLead = leads > 0 ? Math.round(spend / leads) : 0;

                const row = [
                    `"Tuần ${r.week_number}"`,
                    `"${r.bu_name}"`,
                    `"${(r.campaign_name || '').replace(/"/g, '""')}"`,
                    `"${(r.ad_set_name || '').replace(/"/g, '""')}"`,
                    spend,
                    msgs,
                    leads,
                    cplMsg,
                    cplLead
                ];
                csvContent += row.join(',') + '\n';
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Bao_Cao_Meta_Ads_Thang_9_2026_${buVal}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
});
