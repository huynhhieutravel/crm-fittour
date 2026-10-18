/**
 * Database Safety Guard for Automated Test Suites
 * 
 * RÀNG BUỘC SỐNG CÒN:
 * 1. Bắt buộc xác minh database hiện tại đang kết nối qua SELECT current_database().
 * 2. Ngăn chặn tuyệt đối việc thực thi integration test trên production database (fittour, fittour_prod...).
 * 3. Ngăn chặn mọi thao tác "DELETE FROM meta_capi_events" không có điều kiện WHERE cụ thể.
 * 4. Chỉ dọn dẹp các entity test ID giả lập (VD: 888101, 777101, 888888, 777777).
 */

async function assertTestDatabaseSafety(db) {
  const dbInfo = await db.query('SELECT current_database() as db_name, current_user as db_user;');
  const currentDb = (dbInfo.rows[0]?.db_name || '').toLowerCase();
  const currentUser = (dbInfo.rows[0]?.db_user || '').toLowerCase();

  const isProduction = (
    currentDb === 'fittour' || 
    currentDb === 'fittour_prod' || 
    currentDb === 'fittour_production' ||
    currentDb === 'crm_fittour' ||
    currentDb === 'fittour_crm'
  );

  const isAllowedTestDb = (
    currentDb.includes('local') || 
    currentDb.includes('test') || 
    currentDb === 'fittour_local' ||
    currentDb === 'postgres'
  );

  if (isProduction || !isAllowedTestDb) {
    const errorMsg = `[CRITICAL DATABASE SAFETY GUARD] CHẶN ĐỨNG: Phát hiện đang kết nối database: "${currentDb}" (User: "${currentUser}"). Tuyệt đối KHÔNG chạy integration test hoặc dọn dẹp dữ liệu trên môi trường production!`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  return { currentDb, currentUser };
}

async function safeCleanupTestEvents(db, { leadIds = [], bookingIds = [] } = {}) {
  // Chỉ xóa các entity test cụ thể đã được chỉ định
  if (leadIds.length === 0 && bookingIds.length === 0) {
    return;
  }

  const query = `
    DELETE FROM meta_capi_events 
    WHERE (business_entity_type = 'lead' AND business_entity_id = ANY($1::int[]))
       OR (business_entity_type = 'booking' AND business_entity_id = ANY($2::int[]));
  `;

  await db.query(query, [leadIds, bookingIds]);
}

module.exports = {
  assertTestDatabaseSafety,
  safeCleanupTestEvents
};
