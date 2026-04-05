const xlsx = require('xlsx');
const path = require('path');

const inputFile = path.join(__dirname, '../../data_import/BU3-tour-doan.xlsx');
const outputFile = path.join(__dirname, '../../data_import/BU3-tour-doan-cleaned.xlsx');

function cleanExcel() {
    console.log("Loading Excel file...");
    const workbook = xlsx.readFile(inputFile, { cellStyles: true, bookVBA: true });
    const sheetName = workbook.SheetNames[0]; 
    const sheet = workbook.Sheets[sheetName];
    const range = xlsx.utils.decode_range(sheet['!ref']);
    
    // First, shift all columns from H (index 7) onwards to the right by 1
    // We iterate backwards to prevent overwriting
    let maxCol = range.e.c;
    for (let r = 0; r <= range.e.r; r++) {
        for (let c = maxCol; c >= 7; c--) {
            const oldCellAddr = xlsx.utils.encode_cell({r: r, c: c});
            const newCellAddr = xlsx.utils.encode_cell({r: r, c: c + 1});
            
            if (sheet[oldCellAddr]) {
                const oldCell = sheet[oldCellAddr];
                let newCell = { ...oldCell };
                if (newCell.f) delete newCell.f; // Strip formula, keep static value
                sheet[newCellAddr] = newCell;
            } else {
                delete sheet[newCellAddr];
            }
        }
    }
    
    // Expand the bounding box of the sheet
    range.e.c++;
    sheet['!ref'] = xlsx.utils.encode_range(range);
    
    let headerRowIdx = 3; // Index 3 is row 4
    let updated = 0;
    
    for (let r = 0; r <= range.e.r; r++) {
        if (r < headerRowIdx) {
            // clear column H just in case
            delete sheet[xlsx.utils.encode_cell({r, c: 7})];
            continue;
        }
        
        if (r === headerRowIdx) {
            sheet[xlsx.utils.encode_cell({r: headerRowIdx, c: 6})] = { t: 's', v: 'NGÀY ĐI (DỰ KIẾN)' };
            sheet[xlsx.utils.encode_cell({r: headerRowIdx, c: 7})] = { t: 's', v: 'NGÀY VỀ (DỰ KIẾN)' };
            continue;
        }

        const timeCellAddr = xlsx.utils.encode_cell({r: r, c: 6});
        const timeCell = sheet[timeCellAddr];
        
        let departure_date = null, return_date = null;
        
        if (timeCell && timeCell.w) { 
            let raw = timeCell.w.trim();
            
            if (raw.includes('-')) {
                let parts = raw.split('-');
                let p1 = parts[0].trim();
                let p2 = parts[1].trim();

                let p2Parts = p2.split('/');
                let endDay = parseInt(p2Parts[0]);
                let endMonth = parseInt(p2Parts[1]);

                let p1Parts = p1.split('/');
                let startDay = parseInt(p1Parts[0]);
                let startMonth = p1Parts.length > 1 ? parseInt(p1Parts[1]) : endMonth;

                let year = 2026;

                if (!isNaN(startDay) && !isNaN(startMonth)) {
                    let textD = `${String(startDay).padStart(2, '0')}/${String(startMonth).padStart(2, '0')}/${year}`;
                    let parseD = `${year}-${String(startMonth).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
                    if (!isNaN(Date.parse(parseD))) departure_date = textD;
                }
                if (!isNaN(endDay) && !isNaN(endMonth)) {
                    let textD = `${String(endDay).padStart(2, '0')}/${String(endMonth).padStart(2, '0')}/${year}`;
                    let parseD = `${year}-${String(endMonth).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
                    if (!isNaN(Date.parse(parseD))) return_date = textD;
                }
            } else if (raw.includes('/')) {
                let pParts = raw.split('/');
                let day = parseInt(pParts[0]);
                let month = parseInt(pParts[1]);
                let year = 2026;
                if (!isNaN(day) && !isNaN(month)) {
                    let textD = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
                    let parseD = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    if (!isNaN(Date.parse(parseD))) {
                        departure_date = textD;
                        return_date = textD;
                    }
                }
            }
        }
        
        if (departure_date) {
            sheet[xlsx.utils.encode_cell({r, c: 6})] = { t: 's', v: departure_date };
        } else {
            sheet[xlsx.utils.encode_cell({r, c: 6})] = { t: 's', v: '' }; // Clear it out if fails
        }
        
        if (return_date) {
            sheet[xlsx.utils.encode_cell({r, c: 7})] = { t: 's', v: return_date };
        } else {
            delete sheet[xlsx.utils.encode_cell({r, c: 7})]; // Keep clean
        }
        
        // Clean Tuyến điểm (Now at Column I, index 8)
        const destAddr = xlsx.utils.encode_cell({r, c: 8});
        if (sheet[destAddr] && sheet[destAddr].v) {
            let dest = sheet[destAddr].v.toString().trim();
            const upper = dest.toUpperCase();
            
            if (upper.includes('YEP - MIỀN BẮC') || upper.includes('HA NOI') || upper === 'HÀ NỘI') dest = 'Hà Nội';
            else if (upper.includes('YEP - MIỀN NAM') || upper.includes('CITY HCM') || upper.includes('YEP - HCM') || upper === 'HCM') dest = 'TP.HCM';
            else if (upper === 'PHÚ YÊN') dest = 'Phú Yên';
            else if (upper === 'ĐÀ LẠT') dest = 'Đà Lạt';
            else if (upper === 'BẢO LỘC' || upper.includes('BAO LOC')) dest = 'Bảo Lộc';
            else if (upper.includes('VŨNG TÀU') || upper.includes('VUNG TAU') || upper.includes('HỒ TRÀM')) dest = 'Vũng Tàu';
            else if (upper.includes('MIỀN TÂY')) dest = 'Miền Tây';
            else if (upper.includes('CAMPUCHIA')) dest = 'Campuchia';
            else if (upper === 'TRUNG QUỐC') dest = 'Trung Quốc';
            else if (upper.includes('TRUNG QUỐC/NHẬT BẢN')) dest = 'Nhật Bản';
            else if (upper.includes('UK') || upper.includes('CHÂU ÂU')) dest = 'Châu Âu';
            else if (upper === 'THAI LAN' || upper === 'THÁI LAN') dest = 'Thái Lan';
            else if (upper.includes('PHAN THIẾT')) dest = 'Phan Thiết';
            else if (upper.includes('NHA TRANG')) dest = 'Nha Trang';
            else if (upper.includes('ĐÀ NẴNG')) dest = 'Đà Nẵng';
            else if (upper.includes('PHÚ QUỐC')) dest = 'Phú Quốc';
            else if (upper.includes('HÀN QUỐC')) dest = 'Hàn Quốc';
            else if (upper.includes('LỆ GIANG')) dest = 'Lệ Giang';
            else if (upper.includes('BALI')) dest = 'Bali';
            else if (upper.includes('CAM RANH')) dest = 'Cam Ranh';
            
            sheet[destAddr].v = dest;
            if (sheet[destAddr].w) sheet[destAddr].w = dest;
        }

        if (departure_date || return_date) updated++;
    }
    
    // We don't need sheet_add_aoa anymore because we manually manipulated the cells
    xlsx.writeFile(workbook, outputFile);
    console.log(`Cleaned Excel written to ${outputFile}! Updated ${updated} rows split into two columns.`);
}

cleanExcel();
