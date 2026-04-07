const fs = require('fs');

const file = '/Volumes/T7 Loki SS/WORK Hiếu/crm-fittour/client/src/tabs/GroupProjectsTab.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove buildTimeOptions & TIME_OPTIONS
content = content.replace(/(\/\/ Build time filter options[\s\S]*?const TIME_OPTIONS = buildTimeOptions\(\);\n)/, '');

// 2. Add state
const oldState = `    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');  // empty = auto-exclude 'Chưa thành công'
    const [userFilter, setUserFilter] = useState('');
    const [timeFilter, setTimeFilter] = useState('');`;

const newState = `    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');  // empty = auto-exclude 'Chưa thành công'
    const [userFilter, setUserFilter] = useState('');
    
    // New time filter state
    const [timeFilterMode, setTimeFilterMode] = useState('all'); // 'all', 'month', 'quarter', 'year', 'custom'
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');`;

content = content.replace(oldState, newState);

// 3. Update filter logic
const oldFilterLogic = `        // Time filter: month (2026-01), quarter (Q1-2026), year (Y-2026)
        let matchTime = true;
        if (timeFilter) {
            const depDate = p.departure_date ? p.departure_date.substring(0, 10) : null;
            if (timeFilter.startsWith('Q')) {
                // Quarter: Q1-2026
                const [qPart, yPart] = timeFilter.split('-');
                const quarter = parseInt(qPart.replace('Q', ''));
                const qYear = parseInt(yPart);
                if (depDate) {
                    const dMonth = parseInt(depDate.substring(5, 7));
                    const dYear = parseInt(depDate.substring(0, 4));
                    const dQuarter = Math.ceil(dMonth / 3);
                    matchTime = dYear === qYear && dQuarter === quarter;
                } else { matchTime = false; }
            } else if (timeFilter.startsWith('Y-')) {
                // Year: Y-2026
                const yr = timeFilter.replace('Y-', '');
                matchTime = depDate ? depDate.startsWith(yr) : false;
            } else {
                // Month: 2026-01
                matchTime = depDate ? depDate.startsWith(timeFilter) : false;
            }
        }`;

const newFilterLogic = `        let matchTime = true;
        if (timeFilterMode !== 'all') {
            const depDate = p.departure_date ? p.departure_date.substring(0, 10) : null;
            if (!depDate) {
                matchTime = false;
            } else {
                const dYear = parseInt(depDate.substring(0, 4));
                const dMonth = parseInt(depDate.substring(5, 7));
                if (timeFilterMode === 'month') {
                    matchTime = dYear === selectedYear && dMonth === selectedMonth;
                } else if (timeFilterMode === 'quarter') {
                    const dQuarter = Math.ceil(dMonth / 3);
                    matchTime = dYear === selectedYear && dQuarter === selectedQuarter;
                } else if (timeFilterMode === 'year') {
                    matchTime = dYear === selectedYear;
                } else if (timeFilterMode === 'custom') {
                    const dNum = new Date(depDate).getTime();
                    const sNum = customStartDate ? new Date(customStartDate).getTime() : -Infinity;
                    const eNum = customEndDate ? new Date(customEndDate).getTime() : Infinity;
                    matchTime = dNum >= sNum && dNum <= eNum;
                }
            }
        }`;

content = content.replace(oldFilterLogic, newFilterLogic);

// 4. Update UI
// Match the time filter group and replace it
const oldUI = `                <div className="filter-group" style={{ flex: '1 1 200px', margin: 0 }}>
                    <label style={{ marginBottom: '8px', display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>THỜI GIAN</label>
                    <Select
                        options={[
                            { label: '📅 Tháng', options: TIME_OPTIONS.filter(o => o.type === 'month') },
                            { label: '📊 Quý', options: TIME_OPTIONS.filter(o => o.type === 'quarter') },
                            { label: '📆 Năm', options: TIME_OPTIONS.filter(o => o.type === 'year') }
                        ]}
                        value={TIME_OPTIONS.find(o => o.value === timeFilter) || null}
                        onChange={option => setTimeFilter(option ? option.value : '')}
                        styles={reactSelectStyles}
                        isClearable
                        placeholder="Tháng / Quý / Năm"
                    />
                </div>`;

const newUI = `                <div style={{ flexBasis: '100%', height: 0 }}></div>
                
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', flexWrap: 'wrap', width: '100%' }}>
                  <span style={{ fontWeight: 600, color: '#64748b', marginRight: '0.5rem' }}>THỜI GIAN:</span>
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'month', label: 'Tháng' },
                    { id: 'quarter', label: 'Quý' },
                    { id: 'year', label: 'Năm' },
                    { id: 'custom', label: 'Tùy chọn' }
                  ].map(p => (
                    <button key={p.id} className={\`preset-btn \${timeFilterMode === p.id ? 'active' : ''}\`} onClick={() => setTimeFilterMode(p.id)}>
                      {p.label}
                    </button>
                  ))}

                  {timeFilterMode === 'month' && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem', alignItems: 'center', borderLeft: '1px solid #e2e8f0', paddingLeft: '1rem' }}>
                          <select className="filter-select" style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}>
                              {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
                          </select>
                          <select className="filter-select" style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
                              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>Năm {y}</option>)}
                          </select>
                      </div>
                  )}

                  {timeFilterMode === 'quarter' && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem', alignItems: 'center', borderLeft: '1px solid #e2e8f0', paddingLeft: '1rem' }}>
                          <select className="filter-select" style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} value={selectedQuarter} onChange={e => setSelectedQuarter(parseInt(e.target.value))}>
                              {[1, 2, 3, 4].map(q => <option key={q} value={q}>Quý {q}</option>)}
                          </select>
                          <select className="filter-select" style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
                              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>Năm {y}</option>)}
                          </select>
                      </div>
                  )}

                  {timeFilterMode === 'year' && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem', alignItems: 'center', borderLeft: '1px solid #e2e8f0', paddingLeft: '1rem' }}>
                          <select className="filter-select" style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
                              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>Năm {y}</option>)}
                          </select>
                      </div>
                  )}

                  {timeFilterMode === 'custom' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem', borderLeft: '1px solid #e2e8f0', paddingLeft: '1rem' }}>
                        <input type="date" className="filter-input" style={{ padding: '4px 8px', height: '32px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} />
                        <span style={{ color: '#94a3b8' }}>-</span>
                        <input type="date" className="filter-input" style={{ padding: '4px 8px', height: '32px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} />
                      </div>
                  )}
                  
                  <div style={{ marginLeft: 'auto', color: '#94a3b8', fontWeight: 600, background: '#f1f5f9', padding: '4px 12px', borderRadius: '6px' }}>
                    {filtered.length} Dự án
                  </div>
                </div>`;

content = content.replace(oldUI, newUI);

fs.writeFileSync(file, content, 'utf8');
console.log('PATCHED successfully');
