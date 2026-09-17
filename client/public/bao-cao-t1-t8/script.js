document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation Tab Logic
    const topNavBtns = document.querySelectorAll('.top-nav-btn');
    const pages = document.querySelectorAll('.page-content');

    window.myCharts = [];

    topNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            topNavBtns.forEach(b => {
                b.classList.remove('active', 'border-blue-600', 'text-blue-700', 'bg-blue-50');
                b.classList.add('border-transparent', 'text-slate-600');
            });
            pages.forEach(p => {
                p.classList.remove('block');
                p.classList.add('hidden');
            });

            btn.classList.add('active', 'border-blue-600', 'text-blue-700', 'bg-blue-50');
            btn.classList.remove('border-transparent', 'text-slate-600');

            const targetId = btn.getAttribute('data-page');
            const targetPage = document.getElementById(targetId);
            if (targetPage) {
                targetPage.classList.remove('hidden');
                targetPage.classList.add('block');
            }

            // Scroll tab button into view on mobile
            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

            // Trigger chart resize when tab becomes visible
            setTimeout(() => {
                if (window.myCharts) {
                    window.myCharts.forEach(c => {
                        try {
                            if (c && typeof c.resize === 'function') c.resize();
                        } catch (e) {}
                    });
                }
            }, 60);
        });
    });

    // 2. Fetch and Init Data
    fetch('data.json?v=' + Date.now())
        .then(res => res.json())
        .then(data => {
            initDashboard(data);
        })
        .catch(err => {
            console.error('Error fetching data.json:', err);
        });

    function formatVND(val) {
        return (Number(val) || 0).toLocaleString('vi-VN') + ' đ';
    }

    function formatNumber(val) {
        return (Number(val) || 0).toLocaleString('vi-VN');
    }

    function initDashboard(data) {
        const { grandTotal, buTotal, monthlyTotal, monthlyByBU, routes, allRows } = data;

        // Render Overview Monthly Table
        renderMonthlyOverviewTable(monthlyTotal);

        // Render BU Specific Tabs
        renderBUTab('BU1', 'bu1-routes-body', 'bu1-months-body', routes, monthlyByBU);
        renderBUTab('BU2', 'bu2-routes-body', 'bu2-months-body', routes, monthlyByBU);
        renderBUTab('BU4', 'bu4-routes-body', 'bu4-months-body', routes, monthlyByBU);

        // Render All Charts (Overview & BU tabs)
        initCharts(buTotal, monthlyByBU);

        // Render Master Audit Table
        initMasterAudit(allRows);
    }

    function renderMonthlyOverviewTable(monthlyTotal) {
        const tbody = document.getElementById('monthly-summary-table-body');
        if (!tbody) return;

        const phases = {
            1: 'Thăm dò đầu năm, đẩy Giang Nam, Bắc Kinh.',
            2: 'Mùa Tết, tiền trạm tour mùa xuân & hè.',
            3: 'Tăng tốc hè: Mông Cổ Early Bird, Ladakh & Bali.',
            4: 'Duy trì ngân sách ngày, mở rộng Lookalike TQ.',
            5: 'Cao điểm hè: Tung Tân Cương, Thiểm Tây, Ladakh.',
            6: 'Đỉnh điểm: Chuyến tàu Thanh Tạng, tour 2/9.',
            7: 'Kỷ lục 1.104 inbox TQ, chuẩn bị tuyến mùa thu.',
            8: 'Chuyển mùa Thu: Pakistan, Mông Cổ, Cửu Trại Câu, Sri Lanka.'
        };

        tbody.innerHTML = monthlyTotal.map(m => `
            <tr class="hover:bg-slate-50/70 font-medium">
                <td class="px-3.5 py-2.5 sm:px-4 sm:py-3 font-bold text-slate-900">T${m.month}/2026</td>
                <td class="px-3 py-2.5 sm:px-4 sm:py-3 text-right font-bold text-blue-700">${formatVND(m.spend)}</td>
                <td class="px-3 py-2.5 sm:px-4 sm:py-3 text-right font-semibold">${formatNumber(m.messages)}</td>
                <td class="px-3 py-2.5 sm:px-4 sm:py-3 text-right">${formatVND(m.cpm)}</td>
                <td class="px-3 py-2.5 sm:px-4 sm:py-3 text-right font-bold text-emerald-700">${formatNumber(m.leads)}</td>
                <td class="px-3 py-2.5 sm:px-4 sm:py-3 text-right font-bold text-slate-900">${formatVND(m.cpl)}</td>
                <td class="px-3 py-2.5 sm:px-4 sm:py-3 text-center font-bold ${parseFloat(m.rate) >= 30 ? 'text-emerald-700' : 'text-slate-600'}">${m.rate}%</td>
                <td class="px-3 py-2.5 sm:px-4 sm:py-3 text-xs text-slate-500">${phases[m.month] || '-'}</td>
            </tr>
        `).join('');
    }

    function renderBUTab(buCode, routesTbodyId, monthsTbodyId, routes, monthlyByBU) {
        // Render Routes
        const routesTbody = document.getElementById(routesTbodyId);
        if (routesTbody) {
            const buRoutes = routes.filter(r => r.bu === buCode).sort((a, b) => b.spend - a.spend);
            routesTbody.innerHTML = buRoutes.map(r => `
                <tr class="hover:bg-slate-50/70">
                    <td class="px-3.5 py-2.5 sm:px-5 sm:py-3 font-bold text-slate-900 flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span> <span>${r.route}</span>
                    </td>
                    <td class="px-3 py-2.5 sm:px-5 sm:py-3 text-right font-bold text-blue-700">${formatVND(r.spend)}</td>
                    <td class="px-3 py-2.5 sm:px-5 sm:py-3 text-right font-semibold">${formatNumber(r.messages)}</td>
                    <td class="px-3 py-2.5 sm:px-5 sm:py-3 text-right">${formatVND(r.cpm)}</td>
                    <td class="px-3 py-2.5 sm:px-5 sm:py-3 text-right font-bold text-emerald-700">${formatNumber(r.leads)}</td>
                    <td class="px-3 py-2.5 sm:px-5 sm:py-3 text-right font-bold text-slate-900">${formatVND(r.cpl)}</td>
                </tr>
            `).join('');
        }

        // Render Months
        const monthsTbody = document.getElementById(monthsTbodyId);
        if (monthsTbody) {
            const buMonths = monthlyByBU.filter(m => m.bu === buCode).sort((a, b) => a.month - b.month);
            monthsTbody.innerHTML = buMonths.map(m => `
                <tr class="hover:bg-slate-50/70 font-medium">
                    <td class="px-3.5 py-2.5 sm:px-4 sm:py-3 font-bold text-slate-900">Tháng ${m.month}</td>
                    <td class="px-3 py-2.5 sm:px-4 sm:py-3 text-right font-bold text-blue-700">${formatVND(m.spend)}</td>
                    <td class="px-3 py-2.5 sm:px-4 sm:py-3 text-right font-semibold">${formatNumber(m.messages)}</td>
                    <td class="px-3 py-2.5 sm:px-4 sm:py-3 text-right">${formatVND(m.cpm)}</td>
                    <td class="px-3 py-2.5 sm:px-4 sm:py-3 text-right font-bold text-emerald-700">${formatNumber(m.leads)}</td>
                    <td class="px-3 py-2.5 sm:px-4 sm:py-3 text-right font-bold text-slate-900">${formatVND(m.cpl)}</td>
                    <td class="px-3 py-2.5 sm:px-4 sm:py-3 text-center font-bold text-blue-600">${m.rate}%</td>
                </tr>
            `).join('');
        }
    }

    function initCharts(buTotal, monthlyByBU) {
        Chart.defaults.font.family = "'Inter', -apple-system, sans-serif";
        Chart.defaults.color = '#64748b';

        const isMobile = window.innerWidth < 640;
        const months = [1, 2, 3, 4, 5, 6, 7, 8];
        const monthLabels = months.map(m => isMobile ? `T${m}` : `Tháng ${m}`);

        const getBUData = (buCode) => months.map(m => {
            const found = monthlyByBU.find(mb => mb.bu === buCode && mb.month === m);
            return found ? {
                spendMillion: parseFloat((found.spend / 1000000).toFixed(1)),
                spend: found.spend,
                messages: found.messages,
                leads: found.leads,
                cpl: found.cpl
            } : { spendMillion: 0, spend: 0, messages: 0, leads: 0, cpl: 0 };
        });

        const bu1Data = getBUData('BU1');
        const bu2Data = getBUData('BU2');
        const bu4Data = getBUData('BU4');

        // =========================================================================
        // BIỂU ĐỒ 1: SO SÁNH 8 THÁNG X 3 CỘT (BU1, BU2, BU4) - TOUCH OPTIMIZED
        // =========================================================================
        const ctxMonthly3BUs = document.getElementById('chartMonthly3BUs');
        if (ctxMonthly3BUs) {
            const c3BUs = new Chart(ctxMonthly3BUs, {
                type: 'bar',
                data: {
                    labels: monthLabels,
                    datasets: [
                        {
                            label: 'BU1 (Trung Quốc)',
                            data: bu1Data.map(d => d.spendMillion),
                            backgroundColor: '#2563eb',
                            borderRadius: 4,
                            barPercentage: 0.88,
                            categoryPercentage: 0.82
                        },
                        {
                            label: 'BU2 (Nhật & Viễn Chinh)',
                            data: bu2Data.map(d => d.spendMillion),
                            backgroundColor: '#9333ea',
                            borderRadius: 4,
                            barPercentage: 0.88,
                            categoryPercentage: 0.82
                        },
                        {
                            label: 'BU4 (Nam Á & Đảo)',
                            data: bu4Data.map(d => d.spendMillion),
                            backgroundColor: '#f59e0b',
                            borderRadius: 4,
                            barPercentage: 0.88,
                            categoryPercentage: 0.82
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        tooltip: {
                            padding: 10,
                            bodyFont: { size: 12 },
                            titleFont: { size: 13, weight: 'bold' },
                            callbacks: {
                                label: function(context) {
                                    const val = context.parsed.y || 0;
                                    return ` ${context.dataset.label}: ${val.toLocaleString('vi-VN')} Tr`;
                                }
                            }
                        },
                        legend: {
                            position: 'top',
                            labels: {
                                boxWidth: 10,
                                font: { size: isMobile ? 11 : 12, weight: 'bold' },
                                padding: 8
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: (val) => val + ' Tr',
                                font: { size: isMobile ? 10 : 11 }
                            }
                        },
                        x: {
                            grid: { display: false },
                            ticks: {
                                font: { size: isMobile ? 11 : 12, weight: 'bold' }
                            }
                        }
                    }
                }
            });
            window.myCharts.push(c3BUs);
        }

        // =========================================================================
        // BIỂU ĐỒ RIÊNG TỪNG BU: CỘT CHI PHÍ ADS TỪ THÁNG 1 -> THÁNG 8
        // =========================================================================
        
        // 1. BU1 Monthly Bar Chart
        const ctxBu1Monthly = document.getElementById('chartBu1Monthly');
        if (ctxBu1Monthly) {
            const cBu1 = new Chart(ctxBu1Monthly, {
                type: 'bar',
                data: {
                    labels: monthLabels,
                    datasets: [
                        {
                            label: 'Chi Phí BU1 (Triệu VNĐ)',
                            data: bu1Data.map(d => d.spendMillion),
                            backgroundColor: '#2563eb',
                            borderRadius: 6,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Lead Thu Về',
                            data: bu1Data.map(d => d.leads),
                            type: 'line',
                            borderColor: '#10b981',
                            backgroundColor: '#10b981',
                            borderWidth: 2,
                            tension: 0.3,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    scales: {
                        y: {
                            type: 'linear',
                            position: 'left',
                            ticks: { callback: (val) => val + ' Tr', font: { size: 10 } }
                        },
                        y1: {
                            type: 'linear',
                            position: 'right',
                            grid: { drawOnChartArea: false },
                            ticks: { font: { size: 10 } }
                        },
                        x: {
                            ticks: { font: { size: 11, weight: 'bold' } }
                        }
                    }
                }
            });
            window.myCharts.push(cBu1);
        }

        // 2. BU2 Monthly Bar Chart
        const ctxBu2Monthly = document.getElementById('chartBu2Monthly');
        if (ctxBu2Monthly) {
            const cBu2 = new Chart(ctxBu2Monthly, {
                type: 'bar',
                data: {
                    labels: monthLabels,
                    datasets: [
                        {
                            label: 'Chi Phí BU2 (Triệu VNĐ)',
                            data: bu2Data.map(d => d.spendMillion),
                            backgroundColor: '#9333ea',
                            borderRadius: 6,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Lead Thu Về',
                            data: bu2Data.map(d => d.leads),
                            type: 'line',
                            borderColor: '#10b981',
                            backgroundColor: '#10b981',
                            borderWidth: 2,
                            tension: 0.3,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    scales: {
                        y: {
                            type: 'linear',
                            position: 'left',
                            ticks: { callback: (val) => val + ' Tr', font: { size: 10 } }
                        },
                        y1: {
                            type: 'linear',
                            position: 'right',
                            grid: { drawOnChartArea: false },
                            ticks: { font: { size: 10 } }
                        },
                        x: {
                            ticks: { font: { size: 11, weight: 'bold' } }
                        }
                    }
                }
            });
            window.myCharts.push(cBu2);
        }

        // 3. BU4 Monthly Bar Chart
        const ctxBu4Monthly = document.getElementById('chartBu4Monthly');
        if (ctxBu4Monthly) {
            const cBu4 = new Chart(ctxBu4Monthly, {
                type: 'bar',
                data: {
                    labels: monthLabels,
                    datasets: [
                        {
                            label: 'Chi Phí BU4 (Triệu VNĐ)',
                            data: bu4Data.map(d => d.spendMillion),
                            backgroundColor: '#f59e0b',
                            borderRadius: 6,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Lead Thu Về',
                            data: bu4Data.map(d => d.leads),
                            type: 'line',
                            borderColor: '#10b981',
                            backgroundColor: '#10b981',
                            borderWidth: 2,
                            tension: 0.3,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    scales: {
                        y: {
                            type: 'linear',
                            position: 'left',
                            ticks: { callback: (val) => val + ' Tr', font: { size: 10 } }
                        },
                        y1: {
                            type: 'linear',
                            position: 'right',
                            grid: { drawOnChartArea: false },
                            ticks: { font: { size: 10 } }
                        },
                        x: {
                            ticks: { font: { size: 11, weight: 'bold' } }
                        }
                    }
                }
            });
            window.myCharts.push(cBu4);
        }

        // Spend vs Leads Tổng
        const ctxSpendLeads = document.getElementById('chartSpendLeads');
        if (ctxSpendLeads) {
            const labels = isMobile ? ['BU1', 'BU2', 'BU4'] : ['BU1 (TQ)', 'BU2 (Nhật & Viễn Chinh)', 'BU4 (Nam Á & Đảo)'];
            const spendData = buTotal.map(b => (b.total_spend / 1000000).toFixed(1));
            const leadData = buTotal.map(b => b.total_leads);

            const cSpendLeads = new Chart(ctxSpendLeads, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        {
                            label: 'Chi Phí (Tr đ)',
                            data: spendData,
                            backgroundColor: '#3b82f6',
                            borderRadius: 6,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Lead',
                            data: leadData,
                            backgroundColor: '#10b981',
                            borderRadius: 6,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    scales: {
                        y: {
                            type: 'linear',
                            position: 'left',
                            ticks: { font: { size: 10 } }
                        },
                        y1: {
                            type: 'linear',
                            position: 'right',
                            grid: { drawOnChartArea: false },
                            ticks: { font: { size: 10 } }
                        }
                    }
                }
            });
            window.myCharts.push(cSpendLeads);
        }

        // Budget Share Donut
        const ctxBudgetShare = document.getElementById('chartBudgetShare');
        if (ctxBudgetShare) {
            const cBudgetShare = new Chart(ctxBudgetShare, {
                type: 'doughnut',
                data: {
                    labels: ['BU1 (42.7%)', 'BU2 (30.3%)', 'BU4 (27.0%)'],
                    datasets: [{
                        data: buTotal.map(b => b.total_spend),
                        backgroundColor: ['#2563eb', '#9333ea', '#f59e0b'],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } }
                    }
                }
            });
            window.myCharts.push(cBudgetShare);
        }

        // Monthly Spend Trend Line
        const ctxMonthlyTrend = document.getElementById('chartMonthlyTrend');
        if (ctxMonthlyTrend) {
            const cMonthlyTrend = new Chart(ctxMonthlyTrend, {
                type: 'line',
                data: {
                    labels: monthLabels,
                    datasets: [
                        {
                            label: 'BU1',
                            data: bu1Data.map(d => d.spendMillion),
                            borderColor: '#2563eb',
                            backgroundColor: '#2563eb',
                            tension: 0.3,
                            borderWidth: 2.5
                        },
                        {
                            label: 'BU2',
                            data: bu2Data.map(d => d.spendMillion),
                            borderColor: '#9333ea',
                            backgroundColor: '#9333ea',
                            tension: 0.3,
                            borderWidth: 2.5
                        },
                        {
                            label: 'BU4',
                            data: bu4Data.map(d => d.spendMillion),
                            borderColor: '#f59e0b',
                            backgroundColor: '#f59e0b',
                            tension: 0.3,
                            borderWidth: 2.5
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    scales: {
                        y: {
                            ticks: { callback: (val) => val + ' Tr', font: { size: 10 } }
                        }
                    }
                }
            });
            window.myCharts.push(cMonthlyTrend);
        }

        // Efficiency: Cost/Inbox vs CPL
        const ctxEfficiency = document.getElementById('chartEfficiency');
        if (ctxEfficiency) {
            const cEfficiency = new Chart(ctxEfficiency, {
                type: 'bar',
                data: {
                    labels: isMobile ? ['BU1', 'BU2', 'BU4'] : ['BU1 (TQ)', 'BU2 (Nhật & Viễn Chinh)', 'BU4 (Nam Á & Đảo)'],
                    datasets: [
                        {
                            label: 'Giá Inbox (VNĐ)',
                            data: buTotal.map(b => b.avg_cpm),
                            backgroundColor: '#38bdf8',
                            borderRadius: 6
                        },
                        {
                            label: 'Giá Lead - CPL (VNĐ)',
                            data: buTotal.map(b => b.avg_cpl),
                            backgroundColor: '#6366f1',
                            borderRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    scales: {
                        y: {
                            ticks: { callback: (val) => (val / 1000).toFixed(0) + 'k', font: { size: 10 } }
                        }
                    }
                }
            });
            window.myCharts.push(cEfficiency);
        }
    }

    // 4. Master Audit Pagination & Filter
    function initMasterAudit(allRows) {
        const buFilter = document.getElementById('audit-bu-filter');
        const monthFilter = document.getElementById('audit-month-filter');
        const searchInput = document.getElementById('audit-search-input');
        const tbody = document.getElementById('audit-table-body');
        const pageInfo = document.getElementById('audit-page-info');
        const prevBtn = document.getElementById('audit-prev-btn');
        const nextBtn = document.getElementById('audit-next-btn');

        let currentPage = 1;
        const pageSize = 20;
        let filteredRows = [...allRows];

        function applyFilters() {
            const selectedBU = buFilter.value;
            const selectedMonth = monthFilter.value;
            const term = (searchInput.value || '').trim().toLowerCase();

            filteredRows = allRows.filter(r => {
                if (selectedBU !== 'ALL' && r.bu_name !== selectedBU) return false;
                if (selectedMonth !== 'ALL' && String(r.month) !== selectedMonth) return false;
                if (term) {
                    const str = `${r.campaign_name} ${r.ad_set_name} ${r.ad_name}`.toLowerCase();
                    if (!str.includes(term)) return false;
                }
                return true;
            });

            currentPage = 1;
            renderPage();
        }

        function renderPage() {
            const total = filteredRows.length;
            const maxPage = Math.ceil(total / pageSize) || 1;
            if (currentPage > maxPage) currentPage = maxPage;
            if (currentPage < 1) currentPage = 1;

            const startIdx = (currentPage - 1) * pageSize;
            const pageData = filteredRows.slice(startIdx, startIdx + pageSize);

            tbody.innerHTML = pageData.map(r => `
                <tr class="hover:bg-slate-50">
                    <td class="px-3 py-2 font-bold text-slate-800">T${r.month} (W${r.week_number})</td>
                    <td class="px-3 py-2">
                        <span class="px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold ${r.bu_name === 'BU1' ? 'bg-blue-100 text-blue-800' : r.bu_name === 'BU2' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'}">
                            ${r.bu_name}
                        </span>
                    </td>
                    <td class="px-3 py-2 max-w-[150px] sm:max-w-[200px] truncate" title="${r.campaign_name || ''}">${r.campaign_name || '-'}</td>
                    <td class="px-3 py-2 max-w-[180px] sm:max-w-[240px] truncate font-medium text-slate-900" title="${r.ad_set_name || ''}">${r.ad_set_name || '-'}</td>
                    <td class="px-3 py-2 text-right font-bold text-blue-700">${formatVND(r.spend)}</td>
                    <td class="px-3 py-2 text-right font-semibold">${formatNumber(r.messages)}</td>
                    <td class="px-3 py-2 text-right font-bold text-emerald-700">${formatNumber(r.leads)}</td>
                    <td class="px-3 py-2 text-right">${formatVND(r.cpl_lead || 0)}</td>
                </tr>
            `).join('');

            const endIdx = Math.min(startIdx + pageSize, total);
            pageInfo.textContent = `Hiển thị ${total === 0 ? 0 : startIdx + 1} - ${endIdx} / ${total} dòng`;

            prevBtn.disabled = currentPage <= 1;
            nextBtn.disabled = currentPage >= maxPage;
        }

        buFilter.addEventListener('change', applyFilters);
        monthFilter.addEventListener('change', applyFilters);
        searchInput.addEventListener('input', applyFilters);

        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderPage();
            }
        });

        nextBtn.addEventListener('click', () => {
            const maxPage = Math.ceil(filteredRows.length / pageSize);
            if (currentPage < maxPage) {
                currentPage++;
                renderPage();
            }
        });

        applyFilters();
    }
});
