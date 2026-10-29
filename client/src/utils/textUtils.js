/**
 * Removes Vietnamese diacritics / accents from a string and converts to lowercase.
 * Example: "Nguyễn Tài" -> "nguyen tai"
 */
export const removeVietnameseAccents = (str) => {
  if (!str) return '';
  return str
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim();
};

/**
 * Checks if targetText matches query with accent-insensitive and multi-token support.
 * Example: matchesVietnamese("Hầu Hải Tài (Inbound Tiếng Trung)", "tai") -> true
 * Example: matchesVietnamese("Nguyễn Tài", "tai") -> true
 * Example: matchesVietnamese("Nguyễn Tài", "tai nguyen") -> true
 */
export const matchesVietnamese = (targetText, query) => {
  if (!query || !query.trim()) return true;
  if (!targetText) return false;

  const targetLower = targetText.toLowerCase();
  const queryLower = query.toLowerCase().trim();

  // 1. Direct lowercase substring
  if (targetLower.includes(queryLower)) return true;

  // 2. Accent-free substring
  const targetNorm = removeVietnameseAccents(targetText);
  const queryNorm = removeVietnameseAccents(query);
  if (targetNorm.includes(queryNorm)) return true;

  // 3. Multi-word token match (e.g. "tai nguyen" matches "Nguyễn Tài")
  const tokens = queryNorm.split(/\s+/).filter(Boolean);
  if (tokens.length > 1 && tokens.every(token => targetNorm.includes(token))) {
    return true;
  }

  return false;
};

