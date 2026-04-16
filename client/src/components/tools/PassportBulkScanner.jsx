import React, { useState, useRef, useCallback } from 'react';
import { scanPassportImage } from '../../utils/passportOcr';
import * as XLSX from 'xlsx-js-style';

const isExpiringSoon = (dateStr) => {
  if (!dateStr) return false;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return false;
  const expDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
  if (isNaN(expDate.getTime())) return false;
  
  const today = new Date();
  const diffTime = expDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays < 185; // Báo động dưới 185 ngày (kể cả Hết Hạn = số âm)
};

export default function PassportBulkScanner() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = useCallback((newFiles) => {
    const imageFiles = Array.from(newFiles).filter(f => f.type.startsWith('image/'));
    setFiles(prev => {
      const combined = [...prev, ...imageFiles];
      if (combined.length > 20) {
        alert('⚠️ Để đảm bảo tốc độ và tránh treo máy, hệ thống giới hạn tối đa 20 ảnh/lần quét. Bạn vui lòng chia nhỏ file ra nhé!');
        return combined.slice(0, 20);
      }
      return combined;
    });
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleStartScan = async () => {
    if (files.length === 0) return;
    setScanning(true);
    const newResults = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setResults(prev => [...prev.slice(0, i), { status: 'scanning', progress: 0, fileName: file.name }, ...prev.slice(i + 1)]);
      
      try {
        const result = await scanPassportImage(file, (pct) => {
          setResults(prev => {
            const updated = [...prev];
            updated[i] = { ...updated[i], progress: pct };
            return updated;
          });
        });

        newResults.push({
          fileName: file.name,
          status: (result.valid || result.docId) ? 'success' : 'error',
          ...result,
        });
      } catch (err) {
        newResults.push({
          fileName: file.name,
          status: 'error',
          error: err.message,
        });
      }

      setResults([...newResults]);
    }

    setScanning(false);
  };

  const successResults = results.filter(r => r.status === 'success');

  // 10 cột đúng thứ tự anh yêu cầu
  const TABLE_HEADERS = ['STT', 'Surname', 'Given name', 'Gender', 'DOB', 'Passport no', 'DOE', 'Nationality', 'Ngày sinh', 'Ngày cấp', 'Ngày hết hạn'];

  const buildRow = (r, i) => [
    i + 1,
    r.surname || '',
    r.givenName || '',
    r.gender || '',
    '',                  // DOB — cột trống (ĐH tự điền)
    r.docId || '',
    '',                  // DOE — cột trống (ĐH tự điền)
    r.nationality || '',
    r.dobDisplay || '',        // Ngày sinh (DD/MM/YYYY)
    r.doiDisplay || '',        // Ngày cấp (DD/MM/YYYY) — từ visual text
    r.expiryDisplay || '',     // Ngày hết hạn (DD/MM/YYYY)
  ];

  const handleCopyTable = () => {
    if (successResults.length === 0) return;
    
    // Tạo table HTML sạch (ẩn) để copy — KHÔNG có inline CSS
    let html = '<table><thead><tr>';
    TABLE_HEADERS.forEach(h => html += `<th>${h}</th>`);
    html += '</tr></thead><tbody>';
    
    successResults.forEach((r, i) => {
      const row = buildRow(r, i);
      html += '<tr>';
      row.forEach(cell => {
        html += `<td>${cell}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);
    
    const range = document.createRange();
    range.selectNode(tempDiv);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand('copy');
    sel.removeAllRanges();
    document.body.removeChild(tempDiv);
    
    alert('✅ Đã copy! Khi dán (Paste) vào Excel sẽ giữ nguyên font mặc định của Excel.');
  };

  const handleExportExcel = () => {
    if (successResults.length === 0) return;
    const wsData = [TABLE_HEADERS];
    successResults.forEach((r, i) => {
      wsData.push(buildRow(r, i));
    });
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    const borderAll = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
    const colCount = TABLE_HEADERS.length - 1;
    for (let C = 0; C <= colCount; C++) {
      const cellRef = XLSX.utils.encode_cell({ c: C, r: 0 });
      if (ws[cellRef]) {
        ws[cellRef].s = {
          font: { bold: true, color: { rgb: "FFFFFF" }, name: "Times New Roman", sz: 11 },
          fill: { fgColor: { rgb: "1D4ED8" } },
          alignment: { vertical: "center", horizontal: "center" },
          border: borderAll,
        };
      }
    }
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = 1; R <= range.e.r; R++) {
      for (let C = 0; C <= colCount; C++) {
        const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
        if (ws[cellRef]) {
          let cellStyle = {
            font: { name: "Times New Roman", sz: 11 },
            alignment: { vertical: "center", horizontal: "center" },
            border: borderAll,
          };
          
          // Cột 10 là Ngày hết hạn
          if (C === 10 && ws[cellRef].v && isExpiringSoon(ws[cellRef].v)) {
            cellStyle.fill = { fgColor: { rgb: "FEE2E2" } }; // Nền đỏ nhạt báo động
            cellStyle.font.color = { rgb: "DC2626" }; // Chữ màu đỏ đậm
            cellStyle.font.bold = true;
          }

          ws[cellRef].s = cellStyle;
        }
      }
    }

    ws['!cols'] = [
      { wch: 5 },   // STT
      { wch: 18 },  // Surname
      { wch: 22 },  // Given name
      { wch: 10 },  // Gender
      { wch: 14 },  // DOB (trống)
      { wch: 16 },  // Passport no
      { wch: 14 },  // DOE (trống)
      { wch: 12 },  // Nationality
      { wch: 14 },  // Ngày sinh
      { wch: 14 },  // Ngày cấp
      { wch: 14 },  // Ngày hết hạn
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Passport Scan');
    XLSX.writeFile(wb, `Passport_Scan_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleClear = () => {
    setFiles([]);
    setResults([]);
  };

  return (
    <div style={{ padding: '24px', background: '#f1f5f9', minHeight: '100vh', width: '100%' }}>
      <div style={{ background: '#ffffff', borderRadius: '12px', width: '100%', minHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: 'white', borderRadius: '12px 12px 0 0' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>🔍 Công Cụ Quét Hộ Chiếu (OCR)</h2>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#64748b' }}>Trích xuất thông tin tự động từ ảnh Hộ chiếu. Xử lý 100% bảo mật trên trình duyệt.</p>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          
          {/* Warning */}
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 16px', marginBottom: '16px', fontSize: '12px', color: '#92400e' }}>
            ⚠️ <strong>Lưu ý:</strong> Chụp rõ nét phần MRZ (2 dòng mã dưới cùng hộ chiếu). Ảnh mờ / chói sáng có thể gây sai kết quả.
          </div>

          {/* Drop Zone */}
          <div 
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? '#3b82f6' : '#cbd5e1'}`,
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragOver ? '#eff6ff' : '#fafbfc',
              transition: 'all 0.2s',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>📂</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>Kéo thả ảnh hộ chiếu vào đây</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>hoặc click để chọn file (hỗ trợ nhiều file cùng lúc)</div>
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              accept="image/*" 
              style={{ display: 'none' }}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* File list + Actions */}
          {files.length > 0 && (
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>📎 {files.length} ảnh đã chọn</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleClear} style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>🗑️ Xóa hết</button>
                <button 
                  onClick={handleStartScan} 
                  disabled={scanning}
                  style={{ background: scanning ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', padding: '6px 18px', borderRadius: '6px', cursor: scanning ? 'wait' : 'pointer', fontSize: '12px', fontWeight: 700 }}
                >
                  {scanning ? '⏳ Đang quét...' : '🚀 Bắt đầu quét'}
                </button>
              </div>
            </div>
          )}

          {/* Scanning progress */}
          {scanning && results.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              {results.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', fontSize: '12px' }}>
                  <span style={{ width: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#475569' }}>{r.fileName}</span>
                  {r.status === 'scanning' ? (
                    <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${r.progress}%`, height: '100%', background: '#3b82f6', borderRadius: '3px', transition: 'width 0.3s' }} />
                    </div>
                  ) : r.status === 'success' ? (
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>✅ Thành công</span>
                  ) : (
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>❌ Lỗi</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Results Table */}
          {!scanning && successResults.length > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>📋 Kết quả: {successResults.length}/{results.length} ảnh quét thành công</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleCopyTable} style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>📋 Copy Bảng</button>
                  <button onClick={handleExportExcel} style={{ background: '#f97316', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>📥 Tải Excel</button>
                </div>
              </div>
              
              <div style={{ overflow: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <table id="bulk-scan-results-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#1d4ed8', color: 'white' }}>
                      {TABLE_HEADERS.map((h, i) => (
                        <th key={i} style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, borderRight: '1px solid rgba(255,255,255,0.2)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {successResults.map((r, i) => {
                      const row = buildRow(r, i);
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                          {row.map((cell, ci) => {
                            const expiring = ci === 10 && isExpiringSoon(cell);
                            return (
                              <td key={ci} style={{ 
                                padding: '8px', 
                                textAlign: ci === 0 ? 'center' : (ci >= 4 ? 'center' : 'left'), 
                                fontWeight: ci <= 2 ? 600 : 400,
                                fontFamily: [5, 8, 10].includes(ci) ? 'monospace' : 'inherit',
                                color: ci === 0 ? '#64748b' : (cell === '' ? '#cbd5e1' : '#1e293b'),
                              }}>
                                {expiring ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ color: '#ef4444', fontWeight: 700 }}>{cell}</span>
                                    <span style={{ fontSize: '10px', background: '#fef2f2', color: '#dc2626', padding: '2px 4px', borderRadius: '4px', marginTop: '4px', border: '1px solid #fecaca', whiteSpace: 'nowrap' }}>⚠️ Dưới 6 tháng</span>
                                  </div>
                                ) : (
                                  cell || (ci === 4 || ci === 6 || ci === 9 ? '' : '---')
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Error list */}
              {results.filter(r => r.status === 'error').length > 0 && (
                <div style={{ marginTop: '12px', padding: '10px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626', marginBottom: '4px' }}>❌ Ảnh không quét được:</div>
                  {results.filter(r => r.status === 'error').map((r, i) => (
                    <div key={i} style={{ fontSize: '11px', color: '#991b1b' }}>• {r.fileName}: {r.error || 'Không nhận diện được MRZ'}</div>
                  ))}
                </div>
              )}

              {/* Debug: Raw OCR Text */}
              <details style={{ marginTop: '16px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#94a3b8', padding: '8px 0' }}>
                  🔧 Debug: Xem raw OCR text (cho dev)
                </summary>
                {results.map((r, i) => (
                  <div key={i} style={{ marginTop: '8px', padding: '10px', background: '#1e293b', borderRadius: '6px', color: '#e2e8f0', fontSize: '11px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', overflowX: 'auto', maxHeight: '300px', overflow: 'auto' }}>
                    <div style={{ color: '#fbbf24', marginBottom: '4px' }}>── {r.fileName} ──</div>
                    {r.rawText || '(no text)'}
                  </div>
                ))}
              </details>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
