const fs = require('fs');
const path = 'client/src/utils/passportOcr.js';
let code = fs.readFileSync(path, 'utf8');

// Replace extractMrz logic
const oldExtractMrz = `  const line2Regex = /[A-Z0-9<]{9}[0-9OIZSBGCLE][A-Z<]{3}[0-9OIZSBGCLE]{6}[0-9OIZSBGCLE][MF<][0-9OIZSBGCLE]{6}/;
  const match2 = megaString.match(line2Regex);

  if (match2) {
    mrz.line2 = match2[0];
    const fixed = tryFixedPosition(mrz.line2);
    if (fixed) {
      Object.assign(mrz, fixed);
    } else {
      const anchored = tryAnchorBased(mrz.line2);
      if (anchored) Object.assign(mrz, anchored);
    }
  }`;

const newExtractMrz = `  // Nới lỏng regex để chấp nhận rớt ký tự (rất hay gặp với dấu <)
  const line2Regex = /[A-Z0-9<]{8,12}[0-9OIZSBGCLE]?[A-Z<]{2,4}[0-9OIZSBGCLE]{5,7}[0-9OIZSBGCLE]?[MF<][0-9OIZSBGCLE]{5,7}/;
  const match2 = megaString.match(line2Regex);

  if (match2) {
    mrz.line2 = match2[0];
    const fixed = tryFixedPosition(mrz.line2);
    if (fixed) {
      Object.assign(mrz, fixed);
    } else {
      const anchored = tryAnchorBased(mrz.line2);
      if (anchored) Object.assign(mrz, anchored);
    }
  }

  // Cứu cánh tối thượng: Nếu cả line2Regex cũng tạch (mất quá nhiều ký tự), 
  // Quét Anchor trên TOÀN BỘ MegaString vì nó miễn nhiễm với lỗi rớt chữ!
  if (!mrz.dobRaw || !mrz.expiryRaw) {
    const anchored = tryAnchorBased(megaString);
    if (anchored) {
      if (!mrz.dobRaw) mrz.dobRaw = anchored.dobRaw;
      if (!mrz.expiryRaw) mrz.expiryRaw = anchored.expiryRaw;
      if (!mrz.gender) mrz.gender = anchored.gender;
    }
  }`;

code = code.replace(oldExtractMrz, newExtractMrz);

const oldAnchor = `  const genderMatch = rawLine2.match(/(\\d)([MF])(\\d)/);`;
const newAnchor = `  // Mở rộng Anchor: F hay bị Tesseract đọc nhầm thành E, M thành N/H
  const genderMatch = rawLine2.match(/(\\d)([MFENH<])(\\d)/);`;

code = code.replace(oldAnchor, newAnchor);

fs.writeFileSync(path, code);
console.log('Patched extracting engine!');
