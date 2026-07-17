document.addEventListener('DOMContentLoaded', () => {
    Chart.register(ChartDataLabels);

    // 1. Navigation Logic (Top Level Tabs)
    const topNavBtns = document.querySelectorAll('.top-nav-btn');
    const pages = document.querySelectorAll('.page-content');
    topNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            topNavBtns.forEach(b => {
                b.classList.remove('active', 'border-blue-600', 'text-blue-600', 'font-bold');
                b.classList.add('border-transparent', 'text-gray-500');
            });
            pages.forEach(p => {
                p.classList.remove('block');
                p.classList.add('hidden');
            });
            btn.classList.add('active', 'border-blue-600', 'text-blue-600', 'font-bold');
            btn.classList.remove('border-transparent', 'text-gray-500');
            const targetId = btn.getAttribute('data-page');
            document.getElementById(targetId).classList.remove('hidden');
            document.getElementById(targetId).classList.add('block');
        });
    });

    // 2. Inner Navigation Logic (Old Analysis Tabs in Overview)
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => {
                b.classList.remove('active', 'border-blue-600', 'text-blue-600');
                b.classList.add('border-transparent', 'text-gray-500');
            });
            tabContents.forEach(c => {
                c.classList.remove('block');
                c.classList.add('hidden');
            });
            btn.classList.add('active', 'border-blue-600', 'text-blue-600');
            btn.classList.remove('border-transparent', 'text-gray-500');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.remove('hidden');
            document.getElementById(targetId).classList.add('block');
        });
    });

    Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    Chart.defaults.color = '#4b5563';

    const targets = {
        'BU1': { budget: 120000000, leads: 450, color: 'rgba(59, 130, 246, 0.8)' },
        'BU2': { budget: 150000000, leads: 375, color: 'rgba(16, 185, 129, 0.8)' },
        'BU4': { budget: 60000000, leads: 300, color: 'rgba(245, 158, 11, 0.8)' }
    };
    const buLabels = ['BU1', 'BU2', 'BU4'];

    // Fetch Data
    fetch('ads_data.json')
        .then(res => res.json())
        .then(data => {
            const validData = data.filter(d => ['BU1', 'BU2', 'BU4'].includes(d.bu_name));

            let totalSpend = 0; let totalLeads = 0;
            const spendByBU = { 'BU1': 0, 'BU2': 0, 'BU4': 0 };
            const leadsByBU = { 'BU1': 0, 'BU2': 0, 'BU4': 0 };
            const trendData = { 4: { spend: 0, leads: 0 }, 5: { spend: 0, leads: 0 }, 6: { spend: 0, leads: 0 } };
            const allCampaigns = {}; // Flat list for global Best/Worst
            const campaignsByBU = { 'BU1': {}, 'BU2': {}, 'BU4': {} };
            const chunkString = (str, length) => {
                if (!str) return [];
                const words = str.split(' ');
                const chunks = [];
                let current = '';
                words.forEach(w => {
                    if ((current + w).length > length) {
                        chunks.push(current.trim());
                        current = w + ' ';
                    } else {
                        current += w + ' ';
                    }
                });
                if (current) chunks.push(current.trim());
                return chunks;
            };

            const extractDestination = (name) => {
                name = name.toUpperCase();
                if (name.includes('TÂN CƯƠNG')) return 'Tân Cương';
                if (name.includes('THIỂM TÂY')) return 'Thiểm Tây';
                if (name.includes('LỆ GIANG') || name.includes('SA KHÊ')) return 'Lệ Giang';
                if (name.includes('THANH TẠNG') || name.includes('TÂY TẠNG')) return 'Tây Tạng';
                if (name.includes('BẮC KINH')) return 'Bắc Kinh';
                if (name.includes('GIANG NAM')) return 'Giang Nam';
                if (name.includes('ALASKA')) return 'Alaska';
                if (name.includes('MONGOLIA') || name.includes('MÔNG CỔ')) return 'Mongolia';
                if (name.includes('NAM MỸ')) return 'Nam Mỹ';
                if (name.includes('NHẬT BẢN')) return 'Nhật Bản';
                if (name.includes('PAKISTAN')) return 'Pakistan';
                if (name.includes('BHUTAN')) return 'Bhutan';
                if (name.includes('BROMO') || name.includes('BALI')) return 'Bromo (Bali)';
                if (name.includes('LADAKH')) return 'Ladakh';
                if (name.includes('SIKKIM')) return 'Sikkim';
                return 'Khác';
            };
            const destByBU = { 'BU1': {}, 'BU2': {}, 'BU4': {} };


            validData.forEach(row => {
                const spend = parseFloat(row.spend) || 0;
                const leads = parseInt(row.leads) || 0;
                const msgs = parseInt(row.messages) || 0;
                const bu = row.bu_name;
                const m = parseInt(row.month);
                
                let rawCamp = (row.campaign_name || '') + ' - ' + (row.ad_set_name || '');
                // Smart rename: remove repetitive prefixes/suffixes
                const ignores = [
                    '\\[BU1\\]', '\\[BU2\\]', '\\[BU4\\]',
                    'BU1 - ', 'BU2 - ', 'BU4 - ',
                    'CHIẾN DỊCH TRUNG QUỐC', 'CHẠY QUẢNG CÁO TRUNG QUỐC', 'CHIẾN DỊCH', 'CHẠY QUẢNG CÁO',
                    'QUÝ 2 - 3 - 2026', 'QUÝ 2', '2026',
                    '- TIN NHẮN', 'TIN NHẮN -', 'CHẠY THEO NGÀY',
                    'NỬA CUỐI', 'Bản sao', 'QC BU4', '- Hàng ngày 100k', '-> HẾT NĂM', 'CHẠY CUỐI NĂM', 'BÀI TỔNG', 'TƯƠNG TÁC'
                ];
                let pattern = new RegExp(ignores.join('|'), 'gi');
                let smartName = rawCamp.replace(pattern, '').replace(/[-_\[\]]/g, ' ').replace(/\s+/g, ' ').trim();
                if (!smartName) smartName = rawCamp.substring(0, 30);
                const campName = smartName;


                totalSpend += spend;
                totalLeads += leads;
                spendByBU[bu] += spend;
                leadsByBU[bu] += leads;
                if (trendData[m]) { trendData[m].spend += spend; trendData[m].leads += leads; }

                if (!campaignsByBU[bu][campName]) campaignsByBU[bu][campName] = { spend: 0, leads: 0, messages: 0 };
                campaignsByBU[bu][campName].spend += spend;
                campaignsByBU[bu][campName].leads += leads;
                campaignsByBU[bu][campName].messages += msgs;

                if (!allCampaigns[campName]) allCampaigns[campName] = { bu: bu, spend: 0, leads: 0 };
                allCampaigns[campName].spend += spend;
                allCampaigns[campName].leads += leads;
                const dest = extractDestination(campName);
                if (!destByBU[bu][dest]) destByBU[bu][dest] = { spend: 0, leads: 0 };
                destByBU[bu][dest].spend += spend;
                destByBU[bu][dest].leads += leads;

            });

            const totalBudget = buLabels.reduce((sum, bu) => sum + targets[bu].budget, 0);
            const totalLeadTarget = buLabels.reduce((sum, bu) => sum + targets[bu].leads, 0);

            // Update Top KPIs
            if (document.getElementById('kpi-total-spend')) {
                document.getElementById('kpi-total-spend').textContent = (totalSpend / 1000000).toFixed(1) + 'M đ';
                document.getElementById('kpi-spend-percent').textContent = ((totalSpend / totalBudget) * 100).toFixed(1) + '% Ngân sách';
                document.getElementById('kpi-total-leads').textContent = new Intl.NumberFormat('vi-VN').format(totalLeads) + ' Leads';
                document.getElementById('kpi-leads-percent').textContent = 'Đạt ' + ((totalLeads / totalLeadTarget) * 100).toFixed(1) + '% Mục tiêu';
            }

            // Raw Data Table Updates (Funnel Raw Data)
            buLabels.forEach(bu => {
                if (document.getElementById('tbl-spend-' + bu.toLowerCase())) {
                    document.getElementById('tbl-spend-' + bu.toLowerCase()).textContent = new Intl.NumberFormat('vi-VN').format(spendByBU[bu]);
                    document.getElementById('tbl-prog-' + bu.toLowerCase()).textContent = ((spendByBU[bu] / targets[bu].budget) * 100).toFixed(1) + '%';
                    document.getElementById('tbl-lead-' + bu.toLowerCase()).textContent = new Intl.NumberFormat('vi-VN').format(leadsByBU[bu]);
                    document.getElementById('tbl-lprog-' + bu.toLowerCase()).textContent = ((leadsByBU[bu] / targets[bu].leads) * 100).toFixed(1) + '%';
                }
            });

            buLabels.forEach(bu => {
                // Update inner BU tabs dynamically
                const buLower = bu.toLowerCase();
                if (document.getElementById(`inner-${buLower}-spend`)) {
                    document.getElementById(`inner-${buLower}-spend`).textContent = (spendByBU[bu] / 1000000).toFixed(1) + 'M';
                    
                    const percent = ((spendByBU[bu] / targets[bu].budget) * 100).toFixed(1);
                    const diffEl = document.getElementById(`inner-${buLower}-diff`);
                    if (percent >= 100) {
                        diffEl.textContent = `${percent}% (Vượt)`;
                        diffEl.className = 'font-bold text-red-600';
                    } else if (percent >= 80) {
                        diffEl.textContent = `${percent}% (Đạt)`;
                        diffEl.className = 'font-bold text-gray-600';
                    } else {
                        diffEl.textContent = `Chậm (${percent}%)`;
                        diffEl.className = 'font-bold text-orange-600';
                    }

                    document.getElementById(`inner-${buLower}-leads`).textContent = new Intl.NumberFormat('vi-VN').format(leadsByBU[bu]) + ' Leads';
                    const cpl = leadsByBU[bu] > 0 ? Math.round(spendByBU[bu] / leadsByBU[bu]) : 0;
                    document.getElementById(`inner-${buLower}-cpl`).textContent = '~' + new Intl.NumberFormat('vi-VN').format(cpl) + ' đ/Lead';
                }
            });

            if (document.getElementById('tbl-spend-total')) {
                document.getElementById('tbl-spend-total').textContent = new Intl.NumberFormat('vi-VN').format(totalSpend);
                document.getElementById('tbl-prog-total').textContent = ((totalSpend / totalBudget) * 100).toFixed(1) + '%';
                document.getElementById('tbl-lead-total').textContent = new Intl.NumberFormat('vi-VN').format(totalLeads);
                document.getElementById('tbl-lprog-total').textContent = ((totalLeads / totalLeadTarget) * 100).toFixed(1) + '%';
            }

            // Charts
            const budgetData = buLabels.map(bu => targets[bu].budget);
            const spendData = buLabels.map(bu => spendByBU[bu]);
            const leadPercentData = buLabels.map(bu => Number(((leadsByBU[bu] / targets[bu].leads) * 100).toFixed(1)));
            const leadColors = leadPercentData.map(p => p >= 100 ? '#10b981' : '#ef4444');

            if (document.getElementById('budgetChart')) {
                new Chart(document.getElementById('budgetChart').getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: buLabels,
                        datasets: [
                            { label: 'Ngân sách', data: budgetData, stack: 'budget', yAxisID: 'y', backgroundColor: 'rgba(156, 163, 175, 0.6)', datalabels: { anchor: 'end', align: 'top', formatter: v => (v / 1000000).toFixed(0) + 'M' } },
                            { label: 'Chi tiêu', data: spendData, stack: 'spend', yAxisID: 'y', backgroundColor: 'rgba(234, 88, 12, 0.8)', datalabels: { labels: { amount: { anchor: 'end', align: 'top', offset: 18, color: '#ea580c', formatter: v => (v / 1000000).toFixed(1) + 'M' }, percent: { anchor: 'end', align: 'top', offset: 0, font: { size: 10 }, formatter: (v, ctx) => '(' + Math.round(v/ctx.chart.data.datasets[0].data[ctx.dataIndex]*100) + '%)' } } } },
                            { label: 'Tiến độ Lead (%)', data: leadPercentData, stack: 'lead', yAxisID: 'y1', backgroundColor: leadColors, datalabels: { anchor: 'end', align: 'top', font: { weight: 'bold' }, formatter: v => v + '%' } },
                            { label: 'Còn thiếu', data: leadPercentData.map(p => p < 100 ? 100 - p : 0), stack: 'lead', yAxisID: 'y1', backgroundColor: '#e5e7eb', datalabels: { display: false } }
                        ]
                    },
                    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grace: '25%', ticks: { callback: v => (v/1000000)+'M' } }, y1: { beginAtZero: true, position: 'right', grace: '20%', grid: { display: false } } } }
                });
            }

            if (document.getElementById('leadChart')) {
                new Chart(document.getElementById('leadChart').getContext('2d'), {
                    type: 'doughnut',
                    data: { labels: buLabels, datasets: [{ data: buLabels.map(bu => leadsByBU[bu]), backgroundColor: buLabels.map(bu => targets[bu].color), borderWidth: 2, borderColor: '#fff', datalabels: { font: { weight: 'bold', size: 13 }, formatter: (v, ctx) => v + '\n(' + Math.round(v/totalLeads*100) + '%)' } }] },
                    options: { responsive: true, maintainAspectRatio: false, cutout: '65%' }
                });
            }

            // Expert Trendline Chart
            if (document.getElementById('trendChart')) {
                const trendLeads = [trendData[4].leads, trendData[5].leads, trendData[6].leads];
                const trendCPL = [4, 5, 6].map(m => trendData[m].leads > 0 ? trendData[m].spend / trendData[m].leads : 0);
                
                new Chart(document.getElementById('trendChart').getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: ['Tháng 4', 'Tháng 5', 'Tháng 6'],
                        datasets: [
                            { label: 'Lượng Lead', data: trendLeads, yAxisID: 'yL', type: 'bar', backgroundColor: 'rgba(99, 102, 241, 0.2)', borderColor: 'rgba(99, 102, 241, 1)', borderWidth: 1, datalabels: { anchor: 'end', align: 'top', color: '#4f46e5', font: { weight: 'bold' } } },
                            { label: 'CPL (VNĐ)', data: trendCPL, yAxisID: 'yC', type: 'line', borderColor: '#ef4444', backgroundColor: '#ef4444', fill: false, tension: 0.3, pointRadius: 5, datalabels: { anchor: 'bottom', align: 'bottom', color: '#ef4444', font: { size: 10 }, formatter: v => new Intl.NumberFormat('vi-VN').format(Math.round(v)) + 'đ' } }
                        ]
                    },
                    options: { responsive: true, maintainAspectRatio: false, layout: { padding: 20 }, scales: { yL: { position: 'left', beginAtZero: true }, yC: { position: 'right', beginAtZero: true, grid: { display: false } } } }
                });

                // MoM Analysis
                if (document.getElementById('mom-insights')) {
                    let momText = '';
                    const m5LdGrowth = trendData[4].leads > 0 ? ((trendData[5].leads - trendData[4].leads)/trendData[4].leads*100).toFixed(1) : 0;
                    const m6CplDiff = Math.round(trendCPL[2] - trendCPL[1]);
                    momText += `<div class="bg-indigo-50 text-indigo-800 p-3 rounded flex-1"><b>Tăng trưởng T5:</b> Lượng Lead tăng ${m5LdGrowth > 0 ? '+'+m5LdGrowth : m5LdGrowth}% so với T4.</div>`;
                    momText += `<div class="bg-pink-50 text-pink-800 p-3 rounded flex-1"><b>Biến động CPL T6:</b> CPL ${m6CplDiff > 0 ? 'TĂNG' : 'GIẢM'} ${new Intl.NumberFormat('vi-VN').format(Math.abs(m6CplDiff))}đ so với T5.</div>`;
                    document.getElementById('mom-insights').innerHTML = momText;
                }
            }

            // Top Best / Worst Campaigns Array filtering
            const campList = Object.keys(allCampaigns).map(k => {
                const c = allCampaigns[k];
                return { name: k, bu: c.bu, spend: c.spend, leads: c.leads, cpl: c.leads > 0 ? c.spend / c.leads : 0 };
            }).filter(c => c.leads > 5 && c.spend > 1000000); // Only significant campaigns

            const best = [...campList].sort((a,b) => a.cpl - b.cpl).slice(0, 5);
            const worst = [...campList].sort((a,b) => b.cpl - a.cpl).slice(0, 5);

            const renderMinTable = (arr, id) => {
                if(!document.getElementById(id)) return;
                let html = `<thead><tr class="border-b border-gray-200"><th class="px-3 py-2">Chiến Dịch</th><th class="px-3 py-2 text-right">BU</th><th class="px-3 py-2 text-right">CPL</th></tr></thead><tbody>`;
                arr.forEach(c => {
                    html += `<tr class="border-b border-gray-100 last:border-0 hover:bg-white/50">
                        <td class="px-3 py-2 truncate max-w-[150px]" title="${c.name}">${c.name}</td>
                        <td class="px-3 py-2 text-right font-bold">${c.bu}</td>
                        <td class="px-3 py-2 text-right">${new Intl.NumberFormat('vi-VN').format(Math.round(c.cpl))}đ</td>
                    </tr>`;
                });
                html += '</tbody>';
                document.getElementById(id).innerHTML = html;
            };
            renderMinTable(best, 'table-best-campaigns');
            renderMinTable(worst, 'table-worst-campaigns');

            // Render 3 BU Deep Dive Pages AND the old inner tab tables!
            buLabels.forEach(bu => {
                // KPIs for new sub-pages
                if (document.getElementById(`${bu.toLowerCase()}-kpi-spend`)) {
                    document.getElementById(`${bu.toLowerCase()}-kpi-spend`).textContent = new Intl.NumberFormat('vi-VN').format(spendByBU[bu]) + 'đ';
                    document.getElementById(`${bu.toLowerCase()}-kpi-leads`).textContent = new Intl.NumberFormat('vi-VN').format(leadsByBU[bu]);
                    document.getElementById(`${bu.toLowerCase()}-kpi-cpl`).textContent = leadsByBU[bu] > 0 ? new Intl.NumberFormat('vi-VN').format(Math.round(spendByBU[bu] / leadsByBU[bu])) + 'đ' : '0đ';
                    document.getElementById(`${bu.toLowerCase()}-kpi-camps`).textContent = Object.keys(campaignsByBU[bu]).length;
                }

                // Data mapping for campaign lists
                const cArray = Object.keys(campaignsByBU[bu]).map(k => {
                    const obj = campaignsByBU[bu][k];
                    return { name: k, spend: obj.spend, msgs: obj.messages, leads: obj.leads, cpl: obj.leads > 0 ? obj.spend / obj.leads : 0 };
                }).sort((a, b) => b.spend - a.spend); // Sort descending by spend

                const buLower = bu.toLowerCase();
                // KPIs for NEW detailed pages
                if (document.getElementById(`page-${buLower}-spend`)) {
                    document.getElementById(`page-${buLower}-spend`).textContent = (spendByBU[bu] / 1000000).toFixed(1) + 'M';
                    document.getElementById(`page-${buLower}-leads`).textContent = new Intl.NumberFormat('vi-VN').format(leadsByBU[bu]);
                    const cpl = leadsByBU[bu] > 0 ? Math.round(spendByBU[bu] / leadsByBU[bu]) : 0;
                    document.getElementById(`page-${buLower}-cpl`).textContent = '~' + new Intl.NumberFormat('vi-VN').format(cpl) + ' đ';
                }

                // Chart for Top Campaigns in BU
                if (document.getElementById(`chart-${buLower}-camps`)) {
                    const topCamps = [...cArray].sort((a,b) => b.spend - a.spend).slice(0, 7);
                    
                    new Chart(document.getElementById(`chart-${buLower}-camps`).getContext('2d'), {
                        type: 'bar',
                        data: {
                            labels: topCamps.map(c => chunkString(c.name, 25)),
                            datasets: [
                                {
                                    label: 'Chi Tiêu (VND)',
                                    data: topCamps.map(c => c.spend),
                                    backgroundColor: 'rgba(249, 115, 22, 0.8)',
                                    yAxisID: 'y',
                                    datalabels: {
                                        align: 'end',
                                        anchor: 'end',
                                        font: { size: 10, weight: 'bold' },
                                        formatter: v => new Intl.NumberFormat('vi-VN').format(v)
                                    }
                                },
                                {
                                    label: 'Lượng Lead',
                                    data: topCamps.map(c => c.leads),
                                    type: 'line',
                                    borderColor: '#3b82f6',
                                    backgroundColor: '#3b82f6',
                                    borderWidth: 3,
                                    pointRadius: 4,
                                    yAxisID: 'y1',
                                    datalabels: {
                                        align: 'bottom',
                                        anchor: 'bottom',
                                        color: '#1d4ed8',
                                        font: { size: 11, weight: 'bold' }
                                    }
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'top' } },
                            scales: {
                                y: { type: 'linear', display: true, position: 'left', ticks: { callback: v => (v / 1000000).toFixed(0) + 'M' } },
                                y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } }
                            }
                        }
                    });
                }

                // --- Destination Charts ---
                const destObj = destByBU[bu];
                const destKeys = Object.keys(destObj).sort((a,b) => destObj[b].spend - destObj[a].spend); // Sort by spend
                
                const destLabels = destKeys;
                const destSpends = destKeys.map(k => destObj[k].spend);
                const destCPLs = destKeys.map(k => destObj[k].leads > 0 ? destObj[k].spend / destObj[k].leads : 0);

                if (document.getElementById(`chart-${buLower}-dest-pie`)) {
                    new Chart(document.getElementById(`chart-${buLower}-dest-pie`).getContext('2d'), {
                        type: 'doughnut',
                        data: {
                            labels: destLabels,
                            datasets: [{
                                data: destSpends,
                                backgroundColor: ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#64748b']
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { position: 'right', labels: { font: {size: 10} } },
                                datalabels: {
                                    formatter: (value, ctx) => {
                                        const total = ctx.dataset.data.reduce((a,b) => a+b, 0);
                                        const p = (value/total*100).toFixed(0);
                                        return p > 5 ? p + '%' : ''; // Only show if > 5%
                                    },
                                    color: '#fff',
                                    font: { weight: 'bold' }
                                }
                            }
                        }
                    });
                }

                if (document.getElementById(`chart-${buLower}-dest-bar`)) {
                    new Chart(document.getElementById(`chart-${buLower}-dest-bar`).getContext('2d'), {
                        type: 'bar',
                        data: {
                            labels: destKeys,
                            datasets: [
                                {
                                    label: 'Chi Tiêu (VND)',
                                    data: destSpends,
                                    backgroundColor: 'rgba(249, 115, 22, 0.8)',
                                    yAxisID: 'y',
                                    datalabels: {
                                        align: 'end',
                                        anchor: 'end',
                                        font: { size: 10 },
                                        formatter: v => new Intl.NumberFormat('vi-VN').format(v)
                                    }
                                },
                                {
                                    label: 'Lượng Lead',
                                    data: destKeys.map(k => destObj[k].leads),
                                    type: 'line',
                                    borderColor: '#3b82f6',
                                    backgroundColor: '#3b82f6',
                                    borderWidth: 3,
                                    yAxisID: 'y1',
                                    datalabels: {
                                        align: 'bottom',
                                        anchor: 'bottom',
                                        color: '#1d4ed8',
                                        font: { size: 11, weight: 'bold' }
                                    }
                                },
                                {
                                    label: 'CPL (VND)',
                                    data: destCPLs,
                                    type: 'line',
                                    borderColor: '#10b981',
                                    backgroundColor: '#10b981',
                                    borderWidth: 2,
                                    borderDash: [5, 5],
                                    yAxisID: 'y2',
                                    datalabels: {
                                        align: 'top',
                                        anchor: 'top',
                                        color: '#047857',
                                        font: { size: 10, weight: 'bold' },
                                        formatter: v => new Intl.NumberFormat('vi-VN').format(Math.round(v))
                                    }
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'top', labels: { font: {size: 10} } } },
                            scales: {
                                y: { type: 'linear', display: true, position: 'left', ticks: { callback: v => (v / 1000000).toFixed(0) + 'M' } },
                                y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } },
                                y2: { type: 'linear', display: false, position: 'right' }
                            }
                        }
                    });
                }
                // --- End Destination Charts ---



                const renderTbody = (arr) => {
                    let html = '';
                    arr.forEach((c, idx) => {
                        html += `
                        <tr class="${idx === 0 ? 'bg-orange-50/20' : 'hover:bg-gray-50'}">
                            <td class="px-5 py-4 ${idx===0 ? 'font-bold text-orange-900' : 'font-medium text-gray-900'}">${c.name}</td>
                            <td class="px-5 py-4 text-right">${new Intl.NumberFormat('vi-VN').format(c.spend)}</td>
                            <td class="px-5 py-4 text-right text-gray-500">${new Intl.NumberFormat('vi-VN').format(c.msgs)}</td>
                            <td class="px-5 py-4 text-right font-bold text-blue-600">${new Intl.NumberFormat('vi-VN').format(c.leads)}</td>
                            <td class="px-5 py-4 text-right ${c.cpl > (totalSpend/totalLeads) ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}">${new Intl.NumberFormat('vi-VN').format(Math.round(c.cpl))}</td>
                        </tr>`;
                    });
                    return html;
                };

                // Inject into OLD inner tabs (Overview page) -> Top 10 only
                const innerTbody = document.getElementById(`${bu.toLowerCase()}-table`);
                if (innerTbody) {
                    let thead = `
                        <thead class="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th class="px-5 py-3 w-1/3">Tên Chiến Dịch / AdSet</th>
                                <th class="px-5 py-3 text-right">Chi Tiêu (đ)</th>
                                <th class="px-5 py-3 text-right">Lượt Tin Nhắn</th>
                                <th class="px-5 py-3 text-right">Khách Hàng (Leads)</th>
                                <th class="px-5 py-3 text-right">CPL Lead (đ)</th>
                            </tr>
                        </thead>`;
                    innerTbody.innerHTML = thead + `<tbody>${renderTbody(cArray.slice(0, 10))}</tbody>`;
                }

                // Inject into NEW sub-pages -> All data
                const deepTbody = document.getElementById(`${bu.toLowerCase()}-deep-table`);
                if (deepTbody) {
                    deepTbody.innerHTML = renderTbody(cArray);
                }
            });
        })
        .catch(err => console.error("Error fetching data:", err));
});
