const { processOutboxBatch, recoverStaleLocks } = require('../services/metaCapiV3Service');
const metaCapiCrmService = require('../services/metaCapiCrmService');

let isProcessing = false;

/**
 * Kích hoạt một chu kỳ quét và gửi Outbox cho cả CRM CAPI và Business Messaging
 */
async function triggerBatch() {
  if (isProcessing) {
    return; // Tránh chồng chéo nếu đợt trước đang gửi mạng
  }
  isProcessing = true;
  try {
    // 1. Quét Outbox CRM Standard (action_source: system_generated)
    await metaCapiCrmService.processCrmOutboxBatch({ limit: 10 });
    // 2. Quét Outbox Business Messaging v3 (action_source: business_messaging)
    await processOutboxBatch({ limit: 10 });
  } catch (err) {
    console.error('[CAPI Outbox Engine] Lỗi trong chu trình Outbox:', err.message);
  } finally {
    isProcessing = false;
  }
}

/**
 * Khởi động Background Engine cho Meta CAPI v3
 */
function startMetaCapiOutboxEngine() {
  console.log('🚀 [CAPI-v3] Khởi động Meta CAPI v3 Outbox Engine (Chu kỳ 30s, Safe Lock SKIP LOCKED)...');

  // 1. Phục hồi các task bị kẹt nếu trước đó server bị crash/restart giữa chừng
  recoverStaleLocks().catch(err => {
    console.error('[CAPI-v3 Engine] Lỗi khi phục hồi stale locks khi khởi động:', err.message);
  });

  // 2. Chạy đợt đầu tiên sau 5 giây để server ổn định kết nối DB
  const initialTimeout = setTimeout(triggerBatch, 5000);

  // 3. Đặt lịch chạy định kỳ mỗi 30 giây
  const interval = setInterval(triggerBatch, 30000);

  // Hỗ trợ graceful shutdown nếu cần dọn dẹp
  return {
    stop: () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
      console.log('[CAPI-v3] Đã dừng Meta CAPI v3 Outbox Engine.');
    },
    triggerNow: triggerBatch
  };
}

module.exports = {
  startMetaCapiOutboxEngine,
  triggerBatch
};
