/**
 * B2C Market Taxonomy Config
 * 
 * Map CRM market values → B2C display labels + URL slugs.
 * Sếp có thể sửa label/slug tùy ý — chỉ cần giữ đúng key (= giá trị trong DB).
 * 
 * Key format: giá trị `market` trong bảng tour_departures (string, có thể chứa dấu phẩy nếu multi-market)
 */

const B2C_MARKET_CONFIG = {
  // === Châu Á ===
  'HIMALAYAS,LADAKH':            { label: 'Ladakh - Himalayas', slug: 'ladakh' },
  'LADAKH':                      { label: 'Ladakh', slug: 'ladakh' },
  'TÂN CƯƠNG':                  { label: 'Tân Cương', slug: 'tan-cuong' },
  'TÂY TẠNG':                   { label: 'Tây Tạng', slug: 'tay-tang' },
  'TRUNG QUOC CHUNG':           { label: 'Trung Quốc', slug: 'trung-quoc' },
  'TRUNG QUOC CHUNG,BẮC KINH': { label: 'Trung Quốc - Bắc Kinh', slug: 'trung-quoc' },
  'GIANG NAM':                   { label: 'Giang Nam', slug: 'giang-nam' },
  'GIANG NAM,TRUNG QUOC CHUNG': { label: 'Giang Nam', slug: 'giang-nam' },
  'LÊ GIANG':                   { label: 'Lệ Giang', slug: 'le-giang' },
  'LÊ GIANG,TRUNG QUOC CHUNG': { label: 'Lệ Giang', slug: 'le-giang' },
  'MÔNG CỔ':                    { label: 'Mông Cổ', slug: 'mong-co' },
  'NHẬT BẢN':                   { label: 'Nhật Bản', slug: 'nhat-ban' },
  'HÀN QUỐC':                  { label: 'Hàn Quốc', slug: 'han-quoc' },
  'SRI LANKA':                 { label: 'Sri Lanka', slug: 'sri-lanka' },

  // === Trung Đông ===
  'Ả ĐÌNH':                     { label: 'Ả Rập', slug: 'a-rap' },

  // === Châu Âu ===
  'CHÂU ÂU':                    { label: 'Châu Âu', slug: 'chau-au' },

  // === Châu Mỹ ===
  'MỸ':                          { label: 'Mỹ', slug: 'my' },

  // === Đông Nam Á ===
  'BROMO':                       { label: 'Indonesia', slug: 'indonesia' },
};

/**
 * Resolve market string → B2C label + slug
 * Trả fallback nếu không tìm thấy trong config (dùng raw market value)
 */
function resolveMarket(marketStr) {
  if (!marketStr) return { label: 'Khác', slug: 'khac' };

  const normalized = marketStr.trim().toUpperCase();

  // Exact match first
  if (B2C_MARKET_CONFIG[normalized]) {
    return B2C_MARKET_CONFIG[normalized];
  }

  // Case-insensitive search
  for (const [key, value] of Object.entries(B2C_MARKET_CONFIG)) {
    if (key.toUpperCase() === normalized) {
      return value;
    }
  }

  // Fallback: dùng raw market, tự generate slug
  return {
    label: marketStr.trim(),
    slug: marketStr.trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  };
}

module.exports = { B2C_MARKET_CONFIG, resolveMarket };
