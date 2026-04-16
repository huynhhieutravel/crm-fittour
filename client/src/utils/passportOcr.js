import Tesseract from 'tesseract.js';

/**
 * Quét ảnh Hộ chiếu — PHƯƠNG PHÁP KÉP + SMART MERGE:
 *   - OCR: Tesseract với vie+eng (Tiếng Việt + Tiếng Anh)
 *   - Visual Text: đọc phần in rõ (tên + ngày cấp + ngày hết hạn)
 *   - MRZ: Fixed Position + Anchor Fallback (hỗ trợ MỌI quốc tịch)
 *   - Smart Merge: gán DOB từ MRZ (chính xác hơn), DOI+DOE từ visual text
 */
export async function scanPassportImage(imageSource, onProgress) {
  try {
    // vie+eng: tải thêm bộ nhận dạng tiếng Việt (~3MB, cache lần đầu)
    const result = await Tesseract.recognize(imageSource, 'vie+eng', {
      logger: (m) => {
        if (m.status === 'recognizing text' && m.progress) {
          onProgress?.(Math.round(m.progress * 100));
        }
      },
    });

    const rawText = result.data.text;
    console.log('[OCR] Raw text:\n', rawText);

    const visual = extractVisual(rawText);
    console.log('[OCR] Visual:', visual);

    const mrz = extractMrz(rawText);
    console.log('[OCR] MRZ:', mrz);

    const allDates = findAllDates(rawText);
    console.log('[OCR] All dates found:', allDates);

    const merged = smartMerge(visual, mrz, allDates);
    console.log('[OCR] Merged:', merged);

    const hasData = merged.docId || merged.surname || merged.givenName;
    if (!hasData) {
      return { valid: false, error: 'Không trích xuất được thông tin. Hãy chụp rõ nét hộ chiếu.', rawText };
    }

    return { valid: true, ...merged, rawText };
  } catch (err) {
    console.error('[OCR] Error:', err);
    return { valid: false, error: `Lỗi quét ảnh: ${err.message}` };
  }
}

// ═══════════════════════════════════════════════════════════
// VISUAL TEXT: Đọc phần in rõ trên passport
// ═══════════════════════════════════════════════════════════

// Helper: Loại bỏ dấu tiếng Việt và chuẩn hóa chữ cái
function removeVietnameseTones(str) {
  if (!str) return '';
  return str.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d").replace(/Đ/g, "D");
}

function extractVisual(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  let surname = '';
  let givenName = '';
  let passportNo = '';
  let gender = '';

  // Helper: chỉ chấp nhận từ IN HOA thuần túy (>= 2 chữ cái)
  const isStrictUpper = (w) => {
    const letters = w.replace(/[^a-zA-Z]/g, '');
    return letters.length >= 2 && letters === letters.toUpperCase();
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // ─── SURNAME ───
    if ((/Surname/i.test(line) || /^H[oọ]\s*\//i.test(line)) && !surname) {
      const after = line.split(/(?:Surname|H[oọ])/i).pop().trim();
      const tokens = removeVietnameseTones(after).split(/\s+/).filter(isStrictUpper);
      if (tokens.length >= 1) {
        surname = tokens.map(t => t.replace(/[^A-Z]/g, '')).join(' ');
      } else {
        surname = findUppercaseWords(lines, i + 1, 3);
      }
    }

    // ─── GIVEN NAME ───
    if ((/Given\s*name/i.test(line) || /Ch[uữ]\s*[dđ][eệ]m/i.test(line)) && !givenName) {
      const after = line.split(/(?:name|t[eê]n)/i).pop().trim();
      const tokens = removeVietnameseTones(after).split(/\s+/).filter(isStrictUpper);
      if (tokens.length >= 1) {
         givenName = tokens.map(t => t.replace(/[^A-Z]/g, '')).join(' ');
      } else {
         givenName = findUppercaseWords(lines, i + 1, 3);
      }
    }

    // ─── PASSPORT NUMBER ─── 1 chữ + 7-8 số
    if (!passportNo) {
      const m = line.match(/\b([A-Z]\d{7,8})\b/);
      if (m && !/Surname|Given|Date|Sex|Nationality|Họ|Chữ/i.test(line)) {
        passportNo = m[1];
      }
    }

    // ─── GENDER ───
    if ((/Sex|Gender/i.test(line) || /Gi[oớ]i\s*t[ií]nh/i.test(line)) && !gender) {
      if (/\bM\b|\bNAM\b|MALE/i.test(line)) gender = 'M';
      else if (/\bF\b|\bNỮ\b|\bNU\b|FEMALE/i.test(line)) gender = 'F';
      if (!gender) {
        const nextL = (lines[i + 1] || '');
        if (/\bM\b|\bNAM\b|MALE/i.test(nextL)) gender = 'M';
        else if (/\bF\b|\bNỮ\b|\bNU\b|FEMALE/i.test(nextL)) gender = 'F';
      }
    }
  }

  return { surname, givenName, passportNo, gender };
}

/**
 * Tìm các từ IN HOA (>= 2 ký tự) trong N dòng tiếp theo.
 */
function findUppercaseWords(lines, startIdx, count) {
  for (let j = startIdx; j < Math.min(startIdx + count, lines.length); j++) {
    const raw = lines[j];
    const words = removeVietnameseTones(raw).split(/\s+/)
      .filter(w => {
        const letters = w.replace(/[^a-zA-Z]/g, '');
        return letters.length >= 2 && letters === letters.toUpperCase();
      })
      .map(w => w.replace(/[^A-Z]/g, ''));
    if (words.length > 0) return words.join(' ');
  }
  return '';
}

// ═══════════════════════════════════════════════════════════
// DATE FINDER: Tìm tất cả ngày DD/MM/YYYY trong text
// ═══════════════════════════════════════════════════════════

function findAllDates(rawText) {
  const dateRx = /(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{4})/g;
  const found = [];
  const seen = new Set();
  let m;
  while ((m = dateRx.exec(rawText)) !== null) {
    let dd = parseInt(m[1], 10);
    let mm = parseInt(m[2], 10);
    const yyyy = m[3];

    // Tự động FIX lỗi Tesseract nhầm số 3 thành 5 (vd: 30 -> 50)
    if (dd >= 50 && dd <= 59) dd -= 20;
    
    // Bỏ qua các ngày tháng không tưởng
    if (dd === 0 || dd > 31 || mm === 0 || mm > 12) continue;

    const display = `${dd.toString().padStart(2, '0')}/${mm.toString().padStart(2, '0')}/${yyyy}`;
    if (!seen.has(display)) {
      seen.add(display);
      found.push({ display, year: parseInt(yyyy), sortKey: parseInt(yyyy + mm.toString().padStart(2, '0') + dd.toString().padStart(2, '0')) });
    }
  }
  found.sort((a, b) => a.sortKey - b.sortKey);
  return found;
}

// ═══════════════════════════════════════════════════════════
// MRZ: FIXED POSITION + ANCHOR FALLBACK
// Hỗ trợ MỌI quốc tịch (không hardcode danh sách)
// ═══════════════════════════════════════════════════════════

function extractMrz(rawText) {
  const allLines = rawText.split('\n').map(l => l.trim().toUpperCase()).filter(Boolean);
  const empty = { surname: '', givenName: '', docId: '', gender: '', nationality: '', dobRaw: '', expiryRaw: '' };

  let candidates = allLines.map(line => {
    let s = line.replace(/\s+/g, '');
    // Thay các ký tự ngoặc, dấu ngoằn ngoèo thường bị nhìn nhầm từ `<` thành chính dấu `<`
    s = s.replace(/[(){}\[\]«»£€¥_\-~|!@#$%^&*+=]/g, '<');
    s = s.replace(/[^A-Z0-9<]/g, '');
    return s;
  });

  // MEGA-STRING V2: Khắc tinh của ảnh mờ đứt dòng
  const megaString = candidates.join('');

  let rawLine1 = '';
  let rawLine2 = '';

  // Về lại chuỗi neo chuẩn xác ICAO (9 chữ số) để KHÔNG BAO GIỜ bị ăn lẹm Index của MRZ
  const line2Regex = /[A-Z0-9<]{9}[0-9OIZSBGCLE][A-Z<]{3}[0-9OIZSBGCLE]{6}[0-9OIZSBGCLE][MF<][0-9OIZSBGCLE]{6}/;
  const match2 = megaString.match(line2Regex);

  if (match2) {
    rawLine2 = megaString.substring(match2.index).padEnd(44, '<').substring(0, 44);
    
    const textBefore = megaString.substring(0, match2.index);
    let pIndex = textBefore.lastIndexOf('P<');

    if (pIndex !== -1) {
      rawLine1 = textBefore.substring(pIndex).padEnd(44, '<').substring(0, 44);
    } else {
      rawLine1 = textBefore.substring(Math.max(0, textBefore.length - 44)).padEnd(44, '<');
    }
  } else {
    let validMrz = candidates.filter(l => l.length >= 30);
    if (validMrz.length >= 2) {
      rawLine1 = validMrz[validMrz.length - 2];
      rawLine2 = validMrz[validMrz.length - 1];
    } else {
      return empty;
    }
  }

  const forceLetters = (str) => {
    return str
      .replace(/0/g, 'O')
      .replace(/1/g, 'I')
      .replace(/2/g, 'Z')
      .replace(/5/g, 'S')
      .replace(/6/g, 'G')
      .replace(/7/g, 'T')
      .replace(/8/g, 'B');
  };

  let line1 = fixLine1(rawLine1.padEnd(44, '<').substring(0, 44));
  const nameSection = line1.substring(5);
  const nameParts = nameSection.split('<<').filter(Boolean);
  let surname = '';
  let givenName = '';

  if (nameParts.length > 1) {
    surname = nameParts[0].replace(/</g, ' ').trim();
    givenName = nameParts.slice(1).map(p => p.replace(/</g, ' ').trim()).filter(Boolean).join(' ');
  } else if (nameParts.length === 1) {
    const singleParts = nameParts[0].split('<').filter(Boolean);
    if (singleParts.length > 1) {
      surname = singleParts[0].trim();
      givenName = singleParts.slice(1).join(' ').trim();
    } else {
      surname = singleParts[0] || '';
    }
  }

  surname = forceLetters(surname);
  givenName = forceLetters(givenName);

  console.log('[MRZ] Line1 parsed:', { rawLine1, surname, givenName });

  let line2Data = tryFixedPosition(rawLine2);
  if (!line2Data && rawLine2) line2Data = tryAnchorBased(rawLine2);

  // Cứu cánh tối thượng: Nếu cả line2 tạch (vì Tesseract làm rớt ký tự như dấu <),
  // Quét Anchor trên TOÀN BỘ MegaString vì nó miễn nhiễm với lỗi độ dài chuỗi!
  if (!line2Data) {
    const rawAnchored = tryAnchorBased(megaString);
    if (rawAnchored) {
      // Khi quét toàn chuỗi, docId và nationality sẽ bị sai vị trí (rơi vào Line 1)
      line2Data = { ...rawAnchored, docId: '', nationality: '' };
    }
  }

  if (!line2Data) return { ...empty, surname, givenName };
  return { surname, givenName, ...line2Data };
}

function tryFixedPosition(rawLine2) {
  const line2 = rawLine2.padEnd(44, '<').substring(0, 44);
  const docId = line2.substring(0, 9).replace(/<+$/, '');
  const nationality = line2.substring(10, 13).replace(/<+$/, '');
  const dobRawOriginal = line2.substring(13, 19);
  const expiryRawOriginal = line2.substring(21, 27);
  
  if (!/^[0-9OIZSBGCLE]{6}$/.test(dobRawOriginal)) return null;
  if (!/^[0-9OIZSBGCLE]{6}$/.test(expiryRawOriginal)) return null;

  const dobDigits = forceDigits(dobRawOriginal);
  const expiryDigits = forceDigits(expiryRawOriginal);
  const gender = line2.substring(20, 21);

  if (!'MF<'.includes(gender)) return null;

  return {
    docId,
    nationality,
    gender: gender === '<' ? '' : gender,
    dobRaw: dobDigits,
    expiryRaw: expiryDigits,
  };
}

function tryAnchorBased(rawLine2) {
  // Mở rộng Anchor: F hay bị Tesseract đọc nhầm thành E, M thành N/H
  const genderMatch = rawLine2.match(/(\d)([MFENH<])(\d)/);
  if (!genderMatch) return null;

  const genderIdx = rawLine2.indexOf(genderMatch[0]) + 1;
  const gender = genderMatch[2];

  const beforeGender = rawLine2.substring(0, genderIdx);
  const digitsBeforeGender = beforeGender.replace(/[^0-9]/g, '');
  const dobRaw = digitsBeforeGender.length >= 7
    ? digitsBeforeGender.substring(digitsBeforeGender.length - 7, digitsBeforeGender.length - 1)
    : digitsBeforeGender.substring(0, 6);

  const afterGender = rawLine2.substring(genderIdx + 1);
  const expiryDigits = afterGender.replace(/[^0-9]/g, '');
  const expiryRaw = expiryDigits.substring(0, 6);

  const docId = rawLine2.substring(0, 9).replace(/<+$/, '');
  const natSection = rawLine2.substring(10, 13);
  const nationality = natSection.replace(/[^A-Z]/g, '').substring(0, 3) || '';

  return { docId, nationality, gender, dobRaw, expiryRaw };
}

function forceDigits(s) {
  return s
    .replace(/O/g, '0').replace(/o/g, '0')
    .replace(/I/g, '1').replace(/l/g, '1')
    .replace(/Z/g, '2').replace(/S/g, '5')
    .replace(/G/g, '6').replace(/T/g, '7')
    .replace(/B/g, '8').replace(/P/g, '0')
    .replace(/[^0-9]/g, '0');
}

// ═══════════════════════════════════════════════════════════
// SMART MERGE: Kết hợp MRZ + Visual bằng Fuzzy Logic
// ═══════════════════════════════════════════════════════════

function mergeNameStr(vis, mrz, isTruncated = false) {
  if (!vis) return mrz || '';
  if (!mrz) return vis || '';
  
  // Phát hiện rác (ví dụ: các chữ mồ côi 1 ký tự tạo ra do hoa văn, hoặc chữ M, K thừa)
  const isTrash = (w) => (w.length === 1 && "MXKLCRSZVWJFQ0123456789".includes(w));
  
  const mWords = mrz.trim().split(/\s+/).filter(Boolean);
  const vWords = vis.trim().split(/\s+/).filter(Boolean);
  
  const mHasGarbage = mWords.some(isTrash);
  const vHasGarbage = vWords.some(isTrash);
  
  const cleanM = mWords.filter(w => !isTrash(w)).join(' ');
  const cleanV = vWords.filter(w => !isTrash(w)).join(' ');

  // Xử lý các từ dính chặt (như MNGUYEN vs NGUYEN)
  let vStr = cleanV.replace(/\s+/g, '');
  let mStr = cleanM.replace(/\s+/g, '');
  
  if (vStr === mStr) return cleanM;

  console.log('[MERGE]', { vis, mrz, cleanV, cleanM, vStr, mStr });

  // Xử lý dính chặt đầu chuỗi cực mạnh (như MNGUYEN với NGUYEN)
  // Nếu MRZ là MNGUYEN (7) và Visual là NGUYEN (6). mStr chứa vStr.
  if (mStr.includes(vStr) && vStr.length >= 2) {
    // Nếu độ dài sát nhau (khác biệt chỉ 1-2 ký tự rác ở đầu) -> Visual sạch hơn -> lấy Visual
    if (mStr.length <= vStr.length + 2) return cleanV;
  }
  
  // Nếu Visual chứa MRZ (như VIS=HDUONG, MRZ=DUONG), lấy MRZ nếu MRZ không có rác
  if (vStr.includes(mStr) && mStr.length >= 2) {
    if (mHasGarbage && !vHasGarbage) return cleanV;
    if (isTruncated) return cleanV;
    return cleanM;
  }
  
  // Nếu hoàn toàn không bao hàm nhau
  // Ưu tiên Visual nếu MRZ có rác và ngược lại
  if (mHasGarbage && !vHasGarbage) return cleanV;
  if (vHasGarbage && !mHasGarbage) return cleanM;
  
  // Rào chắn cuối: nếu sự khác biệt quá lớn (do Tesseract khùng), tin tưởng MRZ nhưng clean lại
  return cleanM;
}

function smartMerge(visual, mrz, allDates) {
  const isNameTruncated = (mrz.surname + mrz.givenName).length >= 37;
  const surname = mergeNameStr(visual.surname, mrz.surname);
  const givenName = mergeNameStr(visual.givenName, mrz.givenName, isNameTruncated);
  
  const docId = mrz.docId || visual.passportNo || '';
  const gender = mrz.gender || visual.gender || '';
  const nationality = mrz.nationality || '';

  const mrzDob = formatMrzDate(mrz.dobRaw, false);
  const mrzExpiry = formatMrzDate(mrz.expiryRaw, true);

  let dobDisplay = mrzDob || '';
  let doiDisplay = '';
  let expiryDisplay = mrzExpiry || '';

  // Ưu tiên TUYỆT ĐỐI ngày tháng từ MRZ (vì font OCR-B chống nhầm lẫn số 1 và 7, số 0 và O cực tốt)
  // Chỉ dùng allDates (visual text) để tìm Ngày Cấp (DOI) hoặc chắp vá nếu MRZ bị rách mờ hoàn toàn
  
  if (allDates.length >= 3) {
    if (!dobDisplay) dobDisplay = allDates[0].display;
    doiDisplay = allDates[1].display;
    if (!expiryDisplay) expiryDisplay = allDates[allDates.length - 1].display;
  } else if (allDates.length === 2) {
    const bothRecent = allDates[0].year >= 2010 && allDates[1].year >= 2010;
    if (bothRecent) {
      // 2 ngày đều dạo gần đây -> chắc chắn là Ngày Cấp và Ngày Hết Hạn
      doiDisplay = allDates[0].display;
      if (!expiryDisplay) expiryDisplay = allDates[1].display;
    } else {
      // 1 cũ 1 mới -> Ngày Sinh và Ngày Hết Hạn
      if (!dobDisplay) dobDisplay = allDates[0].display;
      if (!expiryDisplay) expiryDisplay = allDates[1].display;
    }
  } else if (allDates.length === 1) {
    // 1 ngày duy nhất
    if (allDates[0].year < 2010) {
      if (!dobDisplay) dobDisplay = allDates[0].display;
    } else {
      if (!expiryDisplay) expiryDisplay = allDates[0].display;
    }
  }

  // Nội suy Ngày Cấp (Date of Issue) nếu bị Tesseract làm lơ do hoa văn đè lên ngày cấp
  if (!doiDisplay && expiryDisplay) {
    const parts = expiryDisplay.split('/');
    if (parts.length === 3) {
      const expYear = parseInt(parts[2]);
      const bYYYY = dobDisplay ? parseInt(dobDisplay.split('/')[2]) : null;
      // Trẻ em dưới 14 tuổi hạn 5 năm, trên 14 tuổi hạn 10 năm theo luật Việt Nam
      if (bYYYY && (expYear - 10) - bYYYY >= 14) {
        doiDisplay = `${parts[0]}/${parts[1]}/${expYear - 10}`;
      } else {
        doiDisplay = `${parts[0]}/${parts[1]}/${expYear - 5}`;
      }
    }
  }

  return { surname, givenName, gender, docId, nationality, dobDisplay, doiDisplay, expiryDisplay };
}

// ═══════════════════════════════════════════════════════════
// MRZ LINE 1 HEALER
// ═══════════════════════════════════════════════════════════

function fixLine1(raw) {
  // Tránh việc Tesseract chèn rác < vào giữa mã quốc gia (VD: P<VN<MTRUONG)
  let s = raw.replace(/^P<*/, ''); // Bỏ P và các dấu < ở đầu
  let country = '';
  let namesStartIdx = 0;
  
  // Tìm đúng 3 ký tự (chấp nhận cả số vì Tesseract thỉnh thoảng nhìn chữ thành số VN0, V0M)
  for (let i = 0; i < s.length; i++) {
    if (/[A-Z0-9]/.test(s[i])) {
      country += s[i];
      if (country.length === 3) {
        namesStartIdx = i + 1;
        break;
      }
    }
  }

  // Ép mã quốc gia bằng chữ chuẩn, tránh nhầm lẫn (O->0)
  let prefix = 'P<' + country.replace(/0/g,'O').replace(/1/g,'I').replace(/5/g,'S').replace(/8/g,'B');
  let names = s.substring(namesStartIdx);

  // Dọn dẹp phần đuôi rác: chỉ convert KLC liên tiếp ở CUỐI chuỗi names (không chạm phần tên)
  // Tránh xóa nhầm tên có KLC hợp lệ ở giữa (VD: CLARK, LLC)
  names = names.replace(/[KLC<]{3,}$/, m => '<'.repeat(m.length));

  let lastReal = -1;
  for (let i = names.length - 1; i >= 0; i--) {
    if (!'<KLC'.includes(names[i])) { lastReal = i; break; }
  }
  if (lastReal >= 0 && lastReal < names.length - 3) {
    names = names.substring(0, lastReal + 1) + '<'.repeat(names.length - lastReal - 1);
  }
  return prefix + names;
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function formatMrzDate(yymmdd, isExpiry = false) {
  if (!yymmdd || yymmdd.length < 6) return '';
  let yy = parseInt(yymmdd.substring(0, 2), 10);
  if (isNaN(yy)) return '';
  let mm = parseInt(yymmdd.substring(2, 4), 10);
  let dd = parseInt(yymmdd.substring(4, 6), 10);
  
  // Tự động FIX lỗi Tesseract nhầm số 3 thành 5 (vd: 30 -> 50)
  if (dd >= 50 && dd <= 59) dd -= 20;
  
  // Nếu date vẫn vô lý, trả về rỗng để nhường cho Visual Text
  if (dd === 0 || dd > 31 || mm === 0 || mm > 12) return '';

  const currentYear = new Date().getFullYear();
  const currentYy = currentYear % 100;
  let yyyy = (yy > currentYy + 10) ? 1900 + yy : 2000 + yy;

  if (isExpiry) {
    if (yyyy < 2000) {
      // Hộ chiếu không thể hết hạn vào thế kỷ 20 (vd 1952).
      // Lỗi kinh điển của Tesseract: Nhìn nhầm năm 3x thành 5x (do nhầm số 3 thành chữ S).
      if (yy >= 50 && yy <= 59) {
        yy -= 20;
        yyyy = 2000 + yy; // Tự động sửa 1952 thành 2032!
      } else {
        return ''; // Năm quá ảo, bỏ qua MRZ và dùng Visual
      }
    }
  } else {
    // DOB không thể lớn hơn năm hiện tại
    if (yyyy > currentYear) {
      if (yy >= 50 && yy <= 59) {
        // Tương tự, nếu năm sinh ở tương lai do nhầm 3 -> 5
        yy -= 20;
        yyyy = 1900 + yy; // Hoặc 2000 + yy tuỳ vào khoảng
      } else {
        return '';
      }
    }
  }

  return `${dd.toString().padStart(2, '0')}/${mm.toString().padStart(2, '0')}/${yyyy}`;
}
