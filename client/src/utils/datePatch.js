/**
 * HIỆU NĂNG & BẢO MẬT (PERFORMANCE & SAFETY PATCH) cho Date.prototype
 * - Khắc phục "White Screen of Death" do RangeError khi parse ngày không hợp lệ.
 * - Khắc phục nghẽn Main Thread (đơ 1-2s) khi khởi tạo Intl liên tục trong vòng lặp.
 */

if (!window.__intlFormattersCache) {
  window.__intlFormattersCache = {};
}

const patchMethod = (methodName) => {
  const original = Date.prototype[methodName];
  Date.prototype[methodName] = function (locales, options) {
    // 2. Tối ưu hiệu năng (Caching Intl.DateTimeFormat)
    if (options && options.timeZone === 'Asia/Ho_Chi_Minh') {
      // 1. Chống sập React (White Screen of Death do RangeError)
      if (isNaN(this.getTime())) return '';
      try {
        const cacheKey = methodName + '_' + String(locales) + '_' + JSON.stringify(options);
        if (!window.__intlFormattersCache[cacheKey]) {
          window.__intlFormattersCache[cacheKey] = new Intl.DateTimeFormat(locales, options);
        }
        return window.__intlFormattersCache[cacheKey].format(this);
      } catch (e) {
        // Fallback an toàn nếu Intl ném lỗi khởi tạo
        return original.call(this, locales, options);
      }
    }

    return original.call(this, locales, options);
  };
};

patchMethod('toLocaleDateString');
patchMethod('toLocaleString');
patchMethod('toLocaleTimeString');

console.log('[FIT Tour CRM] Date prototype patched for performance and safety.');
