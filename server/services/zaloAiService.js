/**
 * Service: Zalo AI Agent Engine (Gemini + RAG + Tool Calling)
 * Phục vụ riêng cho Zalo Sandbox / Zalo OA
 */
const db = require('../db');
const axios = require('axios');
const telegramService = require('./telegramService');

class ZaloAiService {
  /**
   * Lấy cấu hình đầy đủ của AI Agent
   */
  async getAiConfig() {
    try {
      const res = await db.query(`SELECT setting_key, setting_value FROM ai_agent_settings`);
      const config = {};
      res.rows.forEach(r => {
        config[r.setting_key] = r.setting_value;
      });
      return {
        basic_info: config.basic_info || {
          company_name: 'FIT TOUR - Du lịch có GUU',
          description: 'FIT TOUR - Du lịch có Guu (BEYOND ORDINARY JOURNEYS). Được vinh danh "Best of Bespoke Tour in Viet Nam" bởi Travellive. Khác biệt cốt lõi: cam kết "No Shopping, Go Deeper" - tập trung tối đa trải nghiệm nguyên bản. Tổ chức đa dạng từ tour ghép nhóm nhỏ đến hành trình Bespoke, Tour Doanh Nghiệp (Incentive, MICE). Thế mạnh: Trung Quốc, Himalayas (Ladakh, Tây Tạng, Bhutan, Nepal), Silk Road (Tân Cương, Pakistan), Trung Đông & Châu Phi (Iran, Ai Cập, Maroc), Châu Âu, Châu Mỹ (Alaska, Nam Mỹ), Đông Bắc Á (Nhật, Hàn).',
          website: 'https://fittour.vn/',
          phone: '0836999909',
          email: 'info@fittour.com.vn',
          address: '19 Lương Hữu Khánh, Phường Bến Thành, TP. HCM',
          working_hours: 'Thứ 2 - Thứ 7: 9:00 AM - 6:30 PM | Chủ nhật: 7:00 AM - 8:00 PM'
        },
        chat_instructions: config.chat_instructions || {
          collect_phone: true,
          collect_email: false,
          instructions: 'Không tự suy diễn giá hoặc lịch trình. Luôn xưng em hoặc FIT TOUR, gọi khách là Quý khách (tuyệt đối không đoán giới tính, không ghép tên riêng).',
          greeting_message: 'Dạ FIT TOUR xin chào Quý khách! Em là tư vấn viên FIT TOUR. Rất vui được hỗ trợ Quý khách! 💚\nQuý khách đang quan tâm tour nào hoặc cần em tư vấn thêm thông tin gì ạ?'
        },
        purchase_policy: config.purchase_policy || {
          purchase_info: 'Sử dụng link website (fittour.vn) để gửi lịch trình chi tiết nếu khách yêu cầu. Nếu Lịch khởi hành không có link website, khéo léo xin số điện thoại để Chuyên viên tư vấn chuyên Tour đó gửi. CHỈ khéo léo xin số điện thoại/Zalo để tư vấn thêm khi khách hàng có các hành động chốt rõ ràng: 1. Khách yêu cầu báo giá cụ thể hoặc tính chi phí cho nhóm. 2. Khách hỏi thủ tục đăng ký, đặt cọc, thanh toán. 3. Khách chốt số lượng người đi và ngày đi cụ thể để giữ chỗ.',
          promotion_info: 'Các chương trình khuyến mãi của FIT Tour luôn áp dụng với khách đăng ký sớm và đăng ký số lượng theo nhóm hay từ 2-4 khách trở lên, để biết thêm Quý khách vui lòng chờ nhân viên của FIT Tour tư vấn cho mình nhé ạ.'
        },
        system_config: config.system_config || {
          is_sandbox_bot_enabled: true,
          mute_on_sales_assigned: true
        }
      };
    } catch (err) {
      console.error('[ZaloAiService] Lỗi lấy cấu hình AI:', err);
      return null;
    }
  }

  /**
   * Tool Calling: Tra cứu Kiến thức nội bộ (RAG)
   */
  async searchKnowledgeBase(params = {}) {
    try {
      const keyword = (params.search_query || '').trim();
      if (!keyword) return { found: false, message: 'Vui lòng cung cấp từ khóa tìm kiếm.' };

      // Tìm kiếm các chunks có tiêu đề, nội dung hoặc category chứa từ khóa
      const query = `
        SELECT title, category, content 
        FROM rag_knowledge_chunks 
        WHERE is_active = true 
          AND (title ILIKE $1 OR content ILIKE $1 OR category ILIKE $1)
        LIMIT 3
      `;
      const res = await db.query(query, [`%${keyword}%`]);
      
      if (res.rows.length === 0) {
        return { found: false, message: 'Không tìm thấy thông tin nào trong cẩm nang nội bộ cho từ khóa này.' };
      }
      return { found: true, count: res.rows.length, data: res.rows };
    } catch (err) {
      console.error('[ZaloAiService] Lỗi search RAG knowledge:', err);
      return { found: false, error: err.message };
    }
  }

  /**
   * Tool Calling: Tra cứu Lịch khởi hành và link lịch trình thực tế
   */
  async queryDepartures(params = {}) {
    try {
      const rawKeyword = (params.tour_keyword || params.destination || params.keyword || '').trim();
      let keyword = rawKeyword;
      const month = params.month;
      const year = params.year;

      // 1. Nhận diện điểm khởi hành (departure_city) từ tham số hoặc trích xuất từ keyword
      let detectedCity = (params.departure_city || params.departure_location || params.city || '').trim().toLowerCase();
      if (!detectedCity && keyword) {
        if (/\b(hcm|tp\.?hcm|sài gòn|sai gon|tsn|tân sơn nhất|sgn)\b/i.test(keyword)) {
          detectedCity = 'hcm';
        } else if (/\b(hà nội|ha noi|hn|han|nội bài|noi bai)\b/i.test(keyword)) {
          detectedCity = 'hanoi';
        }
      }

      // 2. Làm sạch keyword tìm kiếm để tránh bỏ sót tour (loại bỏ từ khóa điểm bay như "HCM", "Hà Nội")
      if (keyword) {
        const cleaned = keyword
          .replace(/\b(từ|ở|khởi hành|tại)\s+(hcm|tp\.?hcm|sài gòn|hà nội|hn|sgn|han)\b/gi, '')
          .replace(/\b(hcm|tp\.?hcm|sài gòn|hà nội|hn|sgn|han)\b/gi, '')
          .trim();
        if (cleaned.length >= 2) {
          keyword = cleaned;
        }
      }

      let cityCondition = '';
      if (detectedCity) {
        if (/hcm|sài gòn|sai gon|tân sơn nhất|tsn|sgn/i.test(detectedCity)) {
          cityCondition = ` AND (
            td.code ILIKE '%SGN%' 
            OR td.code ILIKE '%HCM%'
            OR tt.name ILIKE '%HCM%'
            OR td.tour_info->>'pickup_point' ILIKE '%HCM%' 
            OR td.tour_info->>'pickup_point' ILIKE '%Tân Sơn Nhất%' 
            OR td.tour_info->>'pickup_point' ILIKE '%TSN%'
            OR td.tour_info->>'flight_itinerary' ILIKE '%SGN%'
          )`;
        } else if (/hà nội|ha noi|hn|han|nội bài|noi bai/i.test(detectedCity)) {
          cityCondition = ` AND (
            td.code ILIKE '%HAN%' 
            OR td.code ILIKE '%HN%'
            OR tt.name ILIKE '%Hà Nội%'
            OR tt.name ILIKE '%HN%'
            OR td.tour_info->>'pickup_point' ILIKE '%Hà Nội%' 
            OR td.tour_info->>'pickup_point' ILIKE '%Nội Bài%' 
            OR td.tour_info->>'pickup_point' ILIKE '%HAN%' 
            OR td.tour_info->>'flight_itinerary' ILIKE '%HAN%'
          )`;
        }
      }
      
      let baseQuery = `
        SELECT 
          td.id,
          td.code as departure_code,
          tt.name as tour_name,
          tt.destination,
          tt.duration,
          tt.bu_group,
          tt.highlights,
          TO_CHAR(td.start_date, 'DD/MM/YYYY') as start_date_str,
          TO_CHAR(td.end_date, 'DD/MM/YYYY') as end_date_str,
          td.start_date,
          td.actual_price,
          td.discount_price,
          td.max_participants,
          td.status,
          td.tour_info,
          td.departure_card_data,
          (SELECT COALESCE(SUM(pax_count), 0) 
           FROM bookings 
           WHERE tour_departure_id = td.id 
           AND booking_status NOT IN ('Huỷ', 'Hủy', 'CANCELLED', 'EXPIRED')) as sold_pax
        FROM tour_departures td
        JOIN tour_templates tt ON td.tour_template_id = tt.id
        WHERE td.status IN ('Open', 'Mở bán', 'Sắp chạy', 'Chắc chắn đi', 'Đang mở')
          AND td.start_date >= CURRENT_DATE
      `;
      const sqlParams = [];
      let pCount = 0;

      if (keyword) {
        pCount++;
        baseQuery += ` AND (tt.destination ILIKE $${pCount} OR tt.name ILIKE $${pCount} OR td.code ILIKE $${pCount} OR tt.bu_group ILIKE $${pCount})`;
        sqlParams.push(`%${keyword}%`);
      }

      if (month) {
        pCount++;
        baseQuery += ` AND EXTRACT(MONTH FROM td.start_date) = $${pCount}`;
        sqlParams.push(parseInt(month));
      }

      if (year) {
        pCount++;
        baseQuery += ` AND EXTRACT(YEAR FROM td.start_date) = $${pCount}`;
        sqlParams.push(parseInt(year));
      }

      // 3. Ưu tiên tra cứu có bộ lọc điểm khởi hành trước
      let result = await db.query(baseQuery + cityCondition + ` ORDER BY td.start_date ASC LIMIT 5`, sqlParams);

      // Nếu không có lịch theo điểm khởi hành yêu cầu, fallback tra cứu lịch khởi hành chung
      if (result.rows.length === 0 && cityCondition) {
        result = await db.query(baseQuery + ` ORDER BY td.start_date ASC LIMIT 5`, sqlParams);
      }

      if (result.rows.length === 0) {
        return {
          found: false,
          message: 'Hệ thống hiện tại chưa có lịch khởi hành ghép đoàn cho tuyến này. Bạn HÃY GỌI TOOL searchKnowledgeBase (RAG) để tìm thông tin chung về điểm đến (nếu cần). Sau đó, hãy khéo léo báo với khách là "Dạ hiện tại lịch khởi hành mới nhất của tuyến này bên em đang được cập nhật lại", và NGAY LẬP TỨC xin số điện thoại thật tự nhiên, ví dụ: "Quý khách có thể cho em xin số điện thoại/Zalo để chuyên viên phụ trách tuyến này bên em liên hệ tư vấn chi tiết và báo lịch sớm nhất cho mình được không ạ?"'
        };
      }

      const departures = result.rows.map(row => {
        const remaining = Number(row.max_participants || 0) - Number(row.sold_pax || 0);
        const cardData = row.departure_card_data || {};
        const tourInfo = row.tour_info || {};

        let price = 'Liên hệ';
        if (tourInfo.price_adult) {
          price = Number(tourInfo.price_adult).toLocaleString('vi-VN') + ' VNĐ';
        } else if (row.actual_price) {
          price = Number(row.actual_price).toLocaleString('vi-VN') + ' VNĐ';
        }

        const link = tourInfo.tour_itinerary_web_link || tourInfo.tour_itinerary_link || cardData.itinerary_link || null;

        let departureCity = 'Khởi hành: Toàn quốc / Liên hệ';
        const pickupStr = (tourInfo.pickup_point || '').toUpperCase();
        const codeStr = (row.departure_code || '').toUpperCase();
        const flightStr = (tourInfo.flight_itinerary || '').toUpperCase();

        if (pickupStr.includes('HCM') || pickupStr.includes('TÂN SƠN NHẤT') || pickupStr.includes('TSN') || codeStr.includes('SGN') || flightStr.includes('SGN')) {
          departureCity = 'TP.HCM';
        } else if (pickupStr.includes('HÀ NỘI') || pickupStr.includes('NỘI BÀI') || pickupStr.includes('HAN') || codeStr.includes('HAN') || flightStr.includes('HAN')) {
          departureCity = 'Hà Nội';
        }

        return {
          departure_code: row.departure_code,
          tour_name: row.tour_name,
          destination: row.destination,
          departure_city: departureCity,
          duration: row.duration,
          start_date: row.start_date_str,
          end_date: row.end_date_str,
          price: price,
          seats_remaining: remaining,
          itinerary_link: link,
          special_notes: cardData.special_notes || null
        };
      });

      return {
        found: true,
        detected_city: detectedCity || null,
        count: departures.length,
        departures
      };
    } catch (err) {
      console.error('[ZaloAiService] Lỗi query departures:', err);
      return { found: false, error: err.message };
    }
  }

  /**
   * Tool Calling: Lưu số điện thoại khách hàng vào Lead & Tự động tắt AI chuyển giao Sale
   */
  async saveLeadPhone(leadContext, phone, customerName = null) {
    if (!phone) return { success: false, message: 'Số điện thoại không hợp lệ' };
    try {
      const cleanPhone = phone.replace(/[^0-9+]/g, '');
      const leadId = typeof leadContext === 'object' ? leadContext?.id : leadContext;
      const zaloUid = typeof leadContext === 'object' ? leadContext?.zalo_uid : null;

      let targetZaloUid = zaloUid;
      let targetLead = null;

      if (leadId) {
        const updateRes = await db.query(`
          UPDATE leads 
          SET phone = $1,
              updated_at = NOW()
          WHERE id = $2
          RETURNING id, name, phone, bu_group, tour_id, zalo_uid
        `, [cleanPhone, leadId]);
        if (updateRes.rows.length > 0) {
          targetLead = updateRes.rows[0];
          targetZaloUid = targetLead.zalo_uid || targetZaloUid;
        }
      } else if (zaloUid) {
        const updateRes = await db.query(`
          UPDATE leads 
          SET phone = $1,
              updated_at = NOW()
          WHERE zalo_uid = $2
          RETURNING id, name, phone, bu_group, tour_id, zalo_uid
        `, [cleanPhone, String(zaloUid)]);
        if (updateRes.rows.length > 0) {
          targetLead = updateRes.rows[0];
        }
      }

      // Tự động ngắt AI Agent sau khi bắt được SĐT (để chuyển giao hoàn toàn cho Sales)
      if (targetZaloUid) {
        await db.query(`
          INSERT INTO zalo_ai_sessions (zalo_uid, is_ai_active, muted_by, muted_at, updated_at, notes)
          VALUES ($1, false, 'phone_captured', NOW(), NOW(), 'Khách đã cung cấp SĐT, chuyển giao cho Sale')
          ON CONFLICT (zalo_uid) DO UPDATE
          SET is_ai_active = false, muted_by = 'phone_captured', muted_at = NOW(), updated_at = NOW(), notes = 'Khách đã cung cấp SĐT, chuyển giao cho Sale'
        `, [String(targetZaloUid)]).catch(e => console.error('[ZaloAiService] Lỗi auto-mute sau khi lưu SĐT:', e.message));

        if (global.io) {
          global.io.emit('zalo_ai_session_update', {
            zalo_uid: targetZaloUid,
            is_ai_active: false,
            muted_by: 'phone_captured'
          });
        }
      }

      // Bắn thông báo Telegram Hot Lead cho đội ngũ tư vấn
      if (targetLead) {
        telegramService.sendHotLeadPhoneCapturedAlert(targetLead, cleanPhone).catch(console.error);
      }

      return { success: true, phone: cleanPhone };
    } catch (err) {
      console.error('[ZaloAiService] Lỗi lưu số điện thoại lead:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Xử lý tin nhắn khách hàng bằng Gemini + RAG + Tool
   */
  async processCustomerMessage({ message, conversationHistory = [], leadContext = {} }) {
    const config = await this.getAiConfig();

    if (!config || !config.system_config?.is_sandbox_bot_enabled) {
      return { reply: null, is_enabled: false };
    }

    const { basic_info, chat_instructions, purchase_policy } = config;

    // Xây dựng System Prompt với đầy đủ danh tính (KHÔNG CÒN LOAD RAG VÀO ĐÂY NỮA)
    const systemPrompt = `BẠN LÀ CHUYÊN VIÊN TƯ VẤN DU LỊCH CỦA "FIT TOUR - DU LỊCH CÓ GUU".
Dưới đây là TOÀN BỘ thông tin nền tảng, quy tắc của công ty. Bạn BẮT BUỘC phải tuân thủ 100%:

THÔNG TIN DOANH NGHIỆP:
- Tên công ty: FIT TOUR - Du lịch có Guu (Chuyên tour độc lạ, cao cấp, trải nghiệm có chiều sâu).
- Hotline tư vấn: 0977 110 110
- Website chính thức: https://fittour.vn
- Fanpage / Zalo OA: FIT TOUR - Du lịch có Guu

HƯỚNG DẪN TƯ VẤN & BẢN SẮC THƯƠNG HIỆU:
${chat_instructions || '- Tư vấn tận tâm, am hiểu văn hóa địa phương, tạo cảm giác an tâm và ấm áp cho khách.'}

CHÍNH SÁCH MUA HÀNG & ĐẶT CỌC:
${purchase_policy || '- Hỗ trợ tư vấn lịch trình chi tiết, giữ chỗ và hỗ trợ thanh toán linh hoạt theo từng chặng.'}

HƯỚNG DẪN TRA CỨU KIẾN THỨC NỘI BỘ (CỰC KỲ QUAN TRỌNG):
- Khi khách hỏi bất kỳ thông tin nào về tư vấn tour, điểm đến, thời tiết, visa, chính sách cho người lớn tuổi, hoặc lịch trình chi tiết của một vùng đất (ví dụ: Ladakh, Tân Cương, Pakistan...), BẮT BUỘC bạn phải gọi Tool \`searchKnowledgeBase\` với từ khóa tương ứng để tìm kiếm thông tin trong Cẩm nang công ty trước khi trả lời. Tuyệt đối không tự bịa ra nếu chưa tra cứu.

CÁCH TRÌNH BÀY KHI TRẢ VỀ LỊCH TRÌNH & GIÁ TOUR (BẮT BUỘC TUÂN THỦ):
- BẮT BUỘC GỌI TOOL queryDepartures: Khi khách hỏi về lịch trình, ngày đi, hoặc giá của bất kỳ tour nào (như Bắc Kinh, Ladakh, Đạo Thành Á Đinh, v.v.), BẮT BUỘC PHẢI GỌI TOOL queryDepartures để tra cứu lịch khởi hành chính xác từ hệ thống. Nếu khách có nhắc đến nơi khởi hành (ví dụ: "HCM", "TP.HCM", "Hà Nội"), hãy truyền vào tham số departure_city tương ứng.
- Khi tra cứu được thông tin từ Tool hoặc RAG, bạn BẮT BUỘC phải trình bày như sau:
1. TUYỆT ĐỐI KHÔNG DÙNG DẤU SAO (**) HAY (*) vì Zalo KHÔNG hỗ trợ in đậm markdown và sẽ hiện ký tự ** thô gây rối mắt khách hàng.
2. Câu mở đầu ngắn gọn (kết thúc bằng dấu : và xuống 2 dòng \n\n).
3. Từng lịch khởi hành phải là TỪNG DÒNG GẠCH ĐẦU DÒNG RIÊNG BIỆT (bắt đầu bằng '- '):
   - Ngày đi - Ngày về (Thời lượng): Giá tiền
4. Link website chi tiết (CỰC KỲ QUAN TRỌNG: Câu dẫn kết thúc bằng dấu : và link website nằm NGAY DÒNG DƯỚI, không để dòng trống thừa ở giữa):
   Quý khách có thể tham khảo chi tiết lịch trình và trải nghiệm tại:
   [Link website]
5. QUY TẮC CÂU KẾT THÚC (CỰC KỲ QUAN TRỌNG - CHỐT HỘI THOẠI):
   - NẾU KHÁCH CHƯA ĐỂ LẠI SỐ ĐIỆN THOẠI: Kết thúc bằng 1 câu hỏi mở ngắn gọn, tự nhiên để tiếp tục trao đổi hoặc khéo léo xin số điện thoại (Ví dụ: "Quý khách dự định đi nhóm mấy người hoặc dự kiến khởi hành vào đợt nào để em hỗ trợ tư vấn chi tiết hơn ạ?").
   - NẾU KHÁCH ĐÃ ĐỂ LẠI SỐ ĐIỆN THOẠI (HOẶC GỌI TOOL saveLeadPhone):
     + TUYỆT ĐỐI KHÔNG ĐƯỢC HỎI THÊM BẤT KỲ CÂU HỎI MỞ NÀO NỮA! (CẤM hỏi visa, CẤM hỏi số người, CẤM hỏi ngày đi, CẤM hỏi bất cứ điều gì).
     + Lý do sống còn: Hệ thống sẽ tự động tắt AI ngay lập tức để chuyển giao cho Chuyên viên tư vấn (Sales) người thật gọi điện trực tiếp. Nếu hỏi tiếp mà AI im lặng không trả lời thì khách hàng sẽ thấy khó chịu vì bị bỏ rơi!
     + Chỉ kết thúc bằng câu chốt chuyển giao: "Chuyên viên tư vấn FIT TOUR sẽ liên hệ trực tiếp qua số điện thoại/Zalo để tư vấn chi tiết và hỗ trợ ưu đãi cho đoàn mình ngay nhé ạ!". Dừng lại tại đây bằng dấu chấm hoặc chấm than, TUYỆT ĐỐI KHÔNG CÓ DẤU HỎI (?) Ở ĐOẠN CUỐI.

QUY TẮC XƯNG HÔ & PHẢN HỒI CHUNG (CỰC KỲ QUAN TRỌNG - TUÂN THỦ 100%):
1. QUY TẮC XƯNG HÔ BẮT BUỘC (QUY TẮC VÀNG):
   - Xưng: "em" hoặc "FIT TOUR".
   - Gọi khách: BẮT BUỘC VÀ CHỈ DÙNG TỪ "Quý khách".
   - TUYỆT ĐỐI KHÔNG ghép thêm tên riêng sau Quý khách (CẤM gọi "Quý khách Linh", "Quý khách An", "Quý khách [Tên]..."). Chỉ gọi đơn thuần là "Quý khách".
   - TUYỆT ĐỐI KHÔNG tự phỏng đoán giới tính của khách (CẤM dùng "anh", "chị", "anh/chị", "anh Linh", "chị Linh").
   - Đuôi câu lịch sự: Dùng "...ạ", "...nhé ạ" (TUYỆT ĐỐI CẤM dùng "anh nhé", "chị nhé", "anh nhé!").
   - Khi nhắc tới đoàn/nhóm: Dùng "nhóm mình", "đoàn mình", "nhà mình" hoặc "Quý khách".
2. QUY TẮC ĐỘ DÀI & VĂN PHONG CHAT (CỰC KỲ QUAN TRỌNG):
   - ĐỘ DÀI: DƯỚI 120 TỪ (ngắn gọn, súc tích, đi thẳng vào trọng tâm).
   - TUYỆT ĐỐI KHÔNG DÙNG DẤU SAO (** hay *): Zalo không in đậm được nên không được dùng bất kỳ dấu ** nào.
   - DANH SÁCH KHI CẦN: Dùng danh sách gạch đầu dòng ('- ') khi liệt kê các ngày khởi hành, các điểm lưu ý để khách dễ nhìn.
   - TRẢ LỜI THẲNG & ĐÚNG: Đi thẳng trực diện vào câu hỏi của khách hàng, giải thích ngắn gọn, tự nhiên, gần gũi như một tư vấn viên thật đang nhắn tin Zalo.
   - CHỈ ĐẶT CÂU HỎI MỞ KHI KHÁCH CHƯA ĐỂ LẠI SỐ ĐIỆN THOẠI. Khi khách đã để lại SĐT thì TUYỆT ĐỐI KHÔNG hỏi thêm.
3. BÁM SÁT 100% NỘI DUNG VÀ HƯỚNG DẪN TRONG TÀI LIỆU (SAU KHI SEARCH TOOL):
   - Khi đã dùng Tool \`searchKnowledgeBase\` và nhận được thông tin, bạn BẮT BUỘC phải bám sát chính xác các thông tin đó để trả lời khách.
   - Tuyệt đối không tự bịa thêm các chi tiết ngoài tài liệu. Nếu tìm không thấy hoặc chưa có lịch, hãy báo khéo léo (ví dụ: "Dạ hiện tại tour này bên em đang cập nhật lịch mới...") và xin số điện thoại/Zalo thật mềm mỏng, tự nhiên để chuyên viên tư vấn gửi lịch trình chi tiết (KHÔNG xin số kiểu cứng nhắc như cái máy).
4. Nếu khách cho số điện thoại (ví dụ: "0849164037", "090..."), hãy gọi Tool saveLeadPhone lưu lại, cảm ơn Quý khách và báo chuyên viên tư vấn sẽ liên hệ hỗ trợ ngay nhé ạ. TUYỆT ĐỐI KHÔNG HỎI THÊM BẤT KỲ CÂU GÌ NỮA.
5. Trình bày thoáng, đẹp mắt, chia đoạn bằng dấu xuống dòng (\n\n), không viết một khối chữ đặc.`;

    // Gọi Gemini API (ưu tiên key được cấu hình trong Admin UI, fallback về .env)
    const apiKey = config.system_config?.gemini_api_key?.trim() || process.env.GEMINI_API_KEY;
    const modelName = config.system_config?.gemini_model?.trim() || process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    if (!apiKey) {
      console.warn('[ZaloAiService] Thiếu GEMINI_API_KEY!');
      return {
        reply: 'Dạ FIT TOUR xin chào Quý khách! Em là tư vấn viên FIT TOUR. Rất vui được hỗ trợ Quý khách. Quý khách đang quan tâm tour tuyến nào để em gửi thông tin chi tiết ạ?',
        is_fallback: true
      };
    }

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      // Chuẩn bị context hội thoại (Merge consecutive roles if any to satisfy Gemini API)
      const formattedContents = [];
      if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
        for (const msg of conversationHistory) {
          formattedContents.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          });
        }
      }

      // Thêm câu hỏi hiện tại của khách hàng
      formattedContents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      // Merge các tin nhắn cùng role liên tiếp
      const mergedContents = [];
      for (const item of formattedContents) {
        if (mergedContents.length > 0 && mergedContents[mergedContents.length - 1].role === item.role) {
          mergedContents[mergedContents.length - 1].parts[0].text += `\n${item.parts[0].text}`;
        } else {
          mergedContents.push({
            role: item.role,
            parts: [{ text: item.parts[0].text }]
          });
        }
      }

      // Đảm bảo tin nhắn đầu tiên gửi cho Gemini API luôn phải có role 'user' (Quy định bắt buộc của Gemini)
      while (mergedContents.length > 0 && mergedContents[0].role === 'model') {
        mergedContents.shift();
      }

      if (mergedContents.length === 0) {
        mergedContents.push({
          role: 'user',
          parts: [{ text: message }]
        });
      }

      // Định nghĩa Tool Calling cho Gemini tra cứu lịch khởi hành và lưu lead
      const tools = [
        {
          functionDeclarations: [
            {
              name: 'queryDepartures',
              description: 'Tra cứu thông tin lịch khởi hành, giá tour, điểm khởi hành (TP.HCM / Hà Nội), số chỗ còn trống, và link website lịch trình chi tiết của các tour FIT TOUR.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  tour_keyword: {
                    type: 'STRING',
                    description: 'Tên tour hoặc từ khóa địa danh cần tra cứu (ví dụ: "Bắc Kinh", "Đạo Thành Á Đinh", "Ladakh", "Tây Tạng", "Mông Cổ", "Pakistan", "Thổ Nhĩ Kỳ")'
                  },
                  departure_city: {
                    type: 'STRING',
                    description: 'Điểm khởi hành của khách nếu khách có nhắc tới (ví dụ: "HCM", "TP.HCM", "Hà Nội")'
                  },
                  month: {
                    type: 'STRING',
                    description: 'Tháng khởi hành nếu khách có nhắc tới (ví dụ: "08", "09", "10", "11")'
                  }
                },
                required: ['tour_keyword']
              }
            },
            {
              name: 'searchKnowledgeBase',
              description: 'Tra cứu Cẩm nang kiến thức nội bộ để tư vấn thông tin điểm đến, thời tiết, visa, độ cao, điểm tham quan chi tiết, hoặc quy tắc bán hàng.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  search_query: {
                    type: 'STRING',
                    description: 'Từ khóa ngắn gọn cần tìm kiếm (ví dụ: "thời tiết ladakh tháng 9", "visa ấn độ", "người lớn tuổi ladakh")'
                  }
                },
                required: ['search_query']
              }
            },
            {
              name: 'saveLeadPhone',
              description: 'Lưu số điện thoại khách hàng cung cấp vào hệ thống CRM để nhân viên tư vấn gọi điện trực tiếp.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  phone: {
                    type: 'STRING',
                    description: 'Số điện thoại của khách hàng (ví dụ: "0901234567", "0849164037")'
                  }
                },
                required: ['phone']
              }
            }
          ]
        }
      ];

      const isThinkingSupported = modelName.includes('3.');
      const generationConfig = {
        temperature: 0.4,
        maxOutputTokens: 2048,
        ...(isThinkingSupported ? { thinkingConfig: { thinkingLevel: 'low' } } : {})
      };

      const requestBody = {
        contents: mergedContents.length > 0 ? mergedContents : formattedContents,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        tools: tools,
        generationConfig: generationConfig
      };

      const response = await axios.post(endpoint, requestBody, { timeout: 25000 });
      const candidate = response.data?.candidates?.[0];
      const part = candidate?.content?.parts?.[0];

      // Lưu trữ Token Usage
      const usage = response.data?.usageMetadata;
      if (usage) {
        await db.query(`
          INSERT INTO gemini_api_usage (date, prompt_tokens, candidate_tokens, cached_tokens, total_tokens)
          VALUES (CURRENT_DATE, $1, $2, $3, $4)
          ON CONFLICT (date) DO UPDATE SET 
              prompt_tokens = gemini_api_usage.prompt_tokens + EXCLUDED.prompt_tokens,
              candidate_tokens = gemini_api_usage.candidate_tokens + EXCLUDED.candidate_tokens,
              cached_tokens = gemini_api_usage.cached_tokens + EXCLUDED.cached_tokens,
              total_tokens = gemini_api_usage.total_tokens + EXCLUDED.total_tokens
        `, [
          usage.promptTokenCount || 0, 
          usage.candidatesTokenCount || 0, 
          usage.cachedContentTokenCount || 0,
          usage.totalTokenCount || 0
        ]).catch(e => console.error('[ZaloAiService] Lỗi lưu token usage:', e.message));
      }

      // Khởi tạo vòng lặp cho tool calling (tối đa 3 lần)
      let currentCandidate = candidate;
      let currentContents = mergedContents.length > 0 ? mergedContents : formattedContents;
      let iterations = 0;
      const MAX_ITERATIONS = 3;
      const executedTools = [];
      let lastToolName = null;
      let lastToolArgs = null;

      while (currentCandidate?.content?.parts?.some(p => p.functionCall) && iterations < MAX_ITERATIONS) {
        iterations++;
        const functionCallParts = currentCandidate.content.parts.filter(p => p.functionCall);
        const responseParts = [];

        for (const fcp of functionCallParts) {
          const functionCall = fcp.functionCall;
          let toolResult = null;
          lastToolName = functionCall.name;
          lastToolArgs = functionCall.args;
          executedTools.push(functionCall.name);

          if (functionCall.name === 'queryDepartures') {
            toolResult = await this.queryDepartures(functionCall.args);
          } else if (functionCall.name === 'searchKnowledgeBase') {
            toolResult = await this.searchKnowledgeBase(functionCall.args);
          } else if (functionCall.name === 'saveLeadPhone') {
            toolResult = await this.saveLeadPhone(leadContext, functionCall.args.phone);
          }

          responseParts.push({
            functionResponse: {
              name: functionCall.name,
              response: {
                name: functionCall.name,
                content: toolResult
              }
            }
          });
        }

        // Gửi kết quả Tool ngược lại cho Gemini để sinh câu trả lời hoàn chỉnh hoặc gọi tool tiếp theo
        currentContents = [
          ...currentContents,
          {
            role: 'model',
            parts: currentCandidate.content.parts
          },
          {
            role: 'user',
            parts: responseParts
          }
        ];

        const followUpRes = await axios.post(endpoint, {
          contents: currentContents,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          tools: tools,
          generationConfig: generationConfig
        }, { timeout: 25000 });

        currentCandidate = followUpRes.data?.candidates?.[0];
        
        // Lưu trữ Token Usage cho cuộc gọi follow up (Tool Call)
        const followUpUsage = followUpRes.data?.usageMetadata;
        if (followUpUsage) {
          await db.query(`
            INSERT INTO gemini_api_usage (date, prompt_tokens, candidate_tokens, cached_tokens, total_tokens)
            VALUES (CURRENT_DATE, $1, $2, $3, $4)
            ON CONFLICT (date) DO UPDATE SET 
                prompt_tokens = gemini_api_usage.prompt_tokens + EXCLUDED.prompt_tokens,
                candidate_tokens = gemini_api_usage.candidate_tokens + EXCLUDED.candidate_tokens,
                cached_tokens = gemini_api_usage.cached_tokens + EXCLUDED.cached_tokens,
                total_tokens = gemini_api_usage.total_tokens + EXCLUDED.total_tokens
          `, [
            followUpUsage.promptTokenCount || 0, 
            followUpUsage.candidatesTokenCount || 0, 
            followUpUsage.cachedContentTokenCount || 0,
            followUpUsage.totalTokenCount || 0
          ]).catch(e => console.error('[ZaloAiService] Lỗi lưu follow-up token usage:', e.message));
        }
      }

      let finalReplyText = currentCandidate?.content?.parts?.filter(p => p.text && !p.thought).map(p => p.text).join('\n') || '';

      if (!finalReplyText && iterations > 0) {
        finalReplyText = 'Dạ hiện tại em đang kiểm tra thông tin trên hệ thống. Quý khách có thể để lại số điện thoại để chuyên viên tư vấn bên em liên hệ hỗ trợ và gửi lịch trình cụ thể cho mình được không ạ?';
      } else if (!finalReplyText) {
        finalReplyText = 'Dạ FIT TOUR xin chào Quý khách, FIT TOUR có thể hỗ trợ thông tin gì cho mình ạ?';
      }

      // Xử lý chuẩn hoá xưng hô và ngắt dòng
      let formattedReply = this.formatAiReply(finalReplyText);

      // Nếu khách đã để lại số điện thoại (hoặc đã gọi tool saveLeadPhone):
      // Tuyệt đối không để lại câu hỏi mở ở cuối tin nhắn vì AI sẽ ngắt phiên chuyển giao cho Sale
      const isPhoneProvided = executedTools.includes('saveLeadPhone') || Boolean(leadContext?.phone) || /(03|05|07|08|09)\d{8}/.test(message);
      if (isPhoneProvided) {
        formattedReply = this.removeTrailingQuestions(formattedReply);
      }

      return {
        reply: formattedReply,
        tool_used: executedTools.includes('saveLeadPhone') ? 'saveLeadPhone' : (executedTools[0] || lastToolName),
        tool_args: lastToolArgs,
        tools_executed: executedTools,
        meta: { model: modelName }
      };

    } catch (err) {
      console.error('[ZaloAiService] Lỗi gọi Gemini API:', err?.response?.data || err.message);
      return {
        reply: `Dạ hiện tại hệ thống tra cứu lịch trình bên em đang xử lý hơi chậm một chút. Quý khách có thể để lại số điện thoại/Zalo để em nhờ chuyên viên trực tiếp kiểm tra và gửi thông tin sớm nhất cho nhà mình được không ạ?`,
        error: err.message
      };
    }
  }

  /**
   * Định dạng chuẩn văn bản trả về của AI: Đảm bảo ngắt dòng và gạch đầu dòng rõ ràng
   */
  formatAiReply(text) {
    if (!text) return text;
    let formatted = text;

    // 1. Xoá hoàn toàn tất cả dấu ** và * vì ứng dụng Zalo không hỗ trợ markdown và sẽ hiện ký tự ** thô
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '$1');
    formatted = formatted.replace(/\*(.*?)\*/g, '$1');
    formatted = formatted.replace(/\*\*/g, '');

    // 2. CHUẨN HOÁ XƯNG HÔ (GUARDRAIL): Đảm bảo chỉ dùng "Quý khách", không đoán giới tính, không ghép tên riêng
    // Bảo vệ từ 'Anh' mang nghĩa quốc gia (Vương quốc Anh, nước Anh, visa Anh, tour Anh, đi Anh, tới Anh, tại Anh)
    const UK_MARKER = '___UK_COUNTRY___';
    formatted = formatted.replace(/\b(Vương quốc|nước|visa|tour|đi|tới|sang|du lịch|tại)\s+Anh\b/gi, (m, p1) => `${p1} ${UK_MARKER}`);

    const commonWords = ['có', 'vui', 'hãy', 'đã', 'sẽ', 'cần', 'đang', 'muốn', 'ơi', 'ạ', 'nhé', 'cho', 'cùng', 'tham', 'yêu', 'an', 'thể'];

    // 2.1. Đuôi câu: thay 'ngay anh nhé', 'ngay chị nhé' -> 'ngay nhé ạ!', 'anh/chị nhé' -> 'nhé ạ!' TRƯỚC
    formatted = formatted.replace(/ngay\s+(?:anh|chị)\s+nhé(!|\.|\?|$)?/gi, 'ngay nhé ạ!');
    formatted = formatted.replace(/(?:anh|chị)\s+nhé(!|\.|\?|$)?/gi, 'nhé ạ!');
    formatted = formatted.replace(/Quý khách\s+nhé(!|\.|\?|$)?/gi, 'Quý khách nhé ạ!');

    // 2.2. Thay các cụm 'anh/chị [Tên Viết Hoa]' (anh Linh, chị Linh, anh Hùng...) thành 'Quý khách' (Case-sensitive chữ hoa cho tên)
    formatted = formatted.replace(/(^|[\s,.:;!?])(?:anh|chị|Anh|Chị)\s+([A-ZÀ-Ỹ][a-zà-ỹ]*)(?=[\s!?,.:]|$)/gu, (match, prefix, name) => {
      if (commonWords.includes(name.toLowerCase())) return match;
      return prefix + 'Quý khách';
    });

    // 2.3. Chào hỏi: thay "chào anh/chị" -> "chào Quý khách"
    formatted = formatted.replace(/(chào|dạ chào|dạ em chào)\s+(?:anh|chị)(?=[\s!?,.:]|$)/gi, '$1 Quý khách');

    // 2.4. Đại từ 'chị' (trong tiếng Việt luôn là từ xưng hô, thay thế 100% sang Quý khách)
    formatted = formatted.replace(/(^|[\s,.:;!?])chị(?=[\s!?,.:]|$)/gi, '$1Quý khách');

    // 2.5. Các cụm hành động/quan hệ với 'anh' (hỗ trợ anh, tư vấn cho anh, gửi anh, của anh, với anh...)
    formatted = formatted.replace(/(hỗ trợ|tư vấn|phục vụ|chăm sóc|giúp)\s+(cho\s+)?anh(?=[\s!?,.:]|$)/gi, '$1 Quý khách');
    formatted = formatted.replace(/(gửi|báo|thông báo|nhắn|liên hệ)\s+(cho\s+|với\s+)?anh(?=[\s!?,.:]|$)/gi, '$1 Quý khách');
    formatted = formatted.replace(/(của|cho|với|từ)\s+anh(?=[\s!?,.:]|$)/gi, '$1 Quý khách');

    // 2.6. 'Anh' đứng đầu câu hoặc làm chủ ngữ trước động từ
    formatted = formatted.replace(/(^|[\s,.:;!?])Anh\s+(có\s+thể|hãy|vui\s+lòng|đang|cần|muốn|tham\s+khảo|dự\s+định|đi|chọn|xem|quan\s+tâm|nhớ|đã|sẽ)(?=[\s!?,.:]|$)/gi, '$1Quý khách $2');

    // 2.7. BỎ TÊN RIÊNG SAU QUÝ KHÁCH (CHẠY CUỐI CÙNG ĐỂ DỌN SẠCH MỌI TRƯỜNG HỢP)
    formatted = formatted.replace(/Quý khách\s+([A-ZÀ-Ỹ][a-zà-ỹ]*)(?=[\s!?,.:]|$)/gu, (match, p1) => {
      if (commonWords.includes(p1.toLowerCase())) return match;
      return 'Quý khách';
    });

    // Khôi phục từ 'Anh' quốc gia nếu có
    formatted = formatted.replace(new RegExp(UK_MARKER, 'g'), 'Anh');

    // 3. Tách dòng giữa các mốc khởi hành khác nhau (sau giá tiền VNĐ/đồng/đ trước dấu gạch đầu dòng tiếp theo)
    formatted = formatted.replace(/(VNĐ|đồng|đ|\))\s*-\s*(\d{1,2}\/\d{1,2})/gi, '$1\n- $2');
    
    // 4. Tách dòng giữa câu mở đầu và bullet point đầu tiên
    formatted = formatted.replace(/([:!?.])\s*-\s*(\d{1,2}\/\d{1,2})/gi, '$1\n\n- $2');
    
    // 5. Tách dòng sau mỗi giá tiền trước câu dẫn link
    formatted = formatted.replace(/(VNĐ|đồng|đ|\))\s+(Quý khách|Anh\/Chị|Chi tiết|Xem thêm|Link|Để xem|Bạn)/gi, '$1\n\n$2');

    // 6. Đảm bảo Link website nằm ngay bên dưới câu dẫn (chỉ ngắt 1 dòng \n, không để dòng trống thừa)
    formatted = formatted.replace(/([:：])\s*\n*\s*(https?:\/\/[^\s]+)/gi, '$1\n$2');
    formatted = formatted.replace(/([^\n:：])\s+(https?:\/\/[^\s]+)/gi, '$1:\n$2');

    // 7. Tách dòng trống (\n\n) SAU Link website trước câu hỏi / CTA tiếp theo
    formatted = formatted.replace(/(https?:\/\/[^\s]+)\s*\n*\s*([A-ZÀ-Ỹa-zà-ỹ])/gi, '$1\n\n$2');

    // 8. Tách dòng trước câu hỏi / CTA cuối cùng nếu chưa có \n\n
    formatted = formatted.replace(/([.!?])\s*(Quý khách|Nếu Quý khách|Anh\/Chị|Nếu Anh\/Chị|Để em|Vui lòng|Mình đang)/gi, '$1\n\n$2');

    // 9. Chuẩn hoá khoảng trắng: Không quá 2 dấu xuống dòng liên tiếp
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    return formatted.trim();
  }

  /**
   * Bỏ câu hỏi thừa ở đoạn cuối khi khách đã để lại số điện thoại và chuyển giao cho Sales
   */
  removeTrailingQuestions(text) {
    if (!text) return text;
    let formatted = text.trim();

    // 1. Tách thành các đoạn văn
    const paragraphs = formatted.split(/\n\n+/);
    
    // 2. Nếu các đoạn cuối cùng kết thúc bằng dấu hỏi ? hoặc ạ?
    while (paragraphs.length > 1) {
      const lastP = paragraphs[paragraphs.length - 1].trim();
      if (lastP.endsWith('?') || /([?]|ạ\?)\s*$/.test(lastP)) {
        paragraphs.pop();
      } else {
        break;
      }
    }

    // 3. Nếu trong đoạn cuối cùng còn sót câu hỏi ở cuối đoạn
    let lastP = paragraphs[paragraphs.length - 1];
    if (lastP && (lastP.endsWith('?') || /([?]|ạ\?)\s*$/.test(lastP))) {
      lastP = lastP.replace(/([^.!?\n]+(?:\?|ạ\?)\s*)$/, '').trim();
      paragraphs[paragraphs.length - 1] = lastP;
    }

    formatted = paragraphs.join('\n\n').trim();

    // 4. Đảm bảo nếu chưa có câu chốt liên hệ thì bổ sung câu chốt liên hệ chuẩn
    if (!formatted.includes('liên hệ')) {
      formatted += '\n\nChuyên viên tư vấn FIT TOUR sẽ liên hệ trực tiếp qua số điện thoại/Zalo để tư vấn chi tiết và hỗ trợ ưu đãi cho đoàn mình ngay nhé ạ!';
    }

    return formatted;
  }
}

module.exports = new ZaloAiService();
