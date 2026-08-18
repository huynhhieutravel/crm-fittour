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
          instructions: 'Không tự suy diễn giá hoặc lịch trình. Luôn xin số điện thoại để gửi file PDF.',
          greeting_message: 'Chào Anh/Chị, em là tư vấn viên FIT TOUR. Rất vui được hỗ trợ Anh/Chị! 💚\nAnh/Chị đang quan tâm tour nào hoặc cần em tư vấn gì ạ?'
        },
        purchase_policy: config.purchase_policy || {
          purchase_info: 'Sử dụng link website (fittour.vn) để gửi lịch trình chi tiết nếu khách yêu cầu. Nếu Lịch khởi hành không có link website, khéo léo xin số điện thoại để Chuyên viên tư vấn chuyên Tour đó gửi. CHỈ khéo léo xin số điện thoại/Zalo để tư vấn thêm khi khách hàng có các hành động chốt rõ ràng: 1. Khách yêu cầu báo giá cụ thể hoặc tính chi phí cho nhóm. 2. Khách hỏi thủ tục đăng ký, đặt cọc, thanh toán. 3. Khách chốt số lượng người đi và ngày đi cụ thể để giữ chỗ.',
          promotion_info: 'Các chương trình khuyến mãi của FIT Tour luôn áp dụng với khách đăng ký sớm và đăng ký số lượng theo nhóm hay từ 2-4 khách trở lên, để biết thêm mình xin vui lòng chờ nhân viên của FIT Tour tư vấn cho mình nhé.'
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
      const keyword = (params.tour_keyword || params.destination || params.keyword || '').trim();
      const month = params.month;
      const year = params.year;
      
      let query = `
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
           AND booking_status NOT IN ('Huỷ')) as sold_pax
        FROM tour_departures td
        JOIN tour_templates tt ON td.tour_template_id = tt.id
        WHERE td.status IN ('Open', 'Mở bán', 'Sắp chạy', 'Chắc chắn đi', 'Đang mở')
          AND td.start_date >= CURRENT_DATE
      `;
      const sqlParams = [];
      let pCount = 0;

      if (keyword) {
        pCount++;
        query += ` AND (tt.destination ILIKE $${pCount} OR tt.name ILIKE $${pCount} OR td.code ILIKE $${pCount} OR tt.bu_group ILIKE $${pCount})`;
        sqlParams.push(`%${keyword}%`);
      }

      if (month) {
        pCount++;
        query += ` AND EXTRACT(MONTH FROM td.start_date) = $${pCount}`;
        sqlParams.push(parseInt(month));
      }

      if (year) {
        pCount++;
        query += ` AND EXTRACT(YEAR FROM td.start_date) = $${pCount}`;
        sqlParams.push(parseInt(year));
      }

      query += ` ORDER BY td.start_date ASC LIMIT 5`;

      const result = await db.query(query, sqlParams);
      if (result.rows.length === 0) {
        return {
          found: false,
          message: 'Bảng Lịch khởi hành chưa có ngày đi cụ thể được lên lịch. Hãy tra cứu tài liệu KIẾN THỨC NỘI BỘ (RAG) hoặc Tour Mới để tóm tắt thông tin tour (Tên tour, thời gian dự kiến, mức giá dự kiến, điểm nổi bật) cho khách tham khảo.'
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

        return {
          departure_code: row.departure_code,
          tour_name: row.tour_name,
          destination: row.destination,
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
              consultation_note = COALESCE(consultation_note, '') || E'\n[AI Auto-Captured Phone: ' || $2 || ' lúc ' || NOW() || ']',
              updated_at = NOW()
          WHERE id = $3
          RETURNING id, name, phone, bu_group, tour_id, zalo_uid
        `, [cleanPhone, cleanPhone, leadId]);
        if (updateRes.rows.length > 0) {
          targetLead = updateRes.rows[0];
          targetZaloUid = targetLead.zalo_uid || targetZaloUid;
        }
      } else if (zaloUid) {
        const updateRes = await db.query(`
          UPDATE leads 
          SET phone = $1,
              consultation_note = COALESCE(consultation_note, '') || E'\n[AI Auto-Captured Phone: ' || $2 || ' lúc ' || NOW() || ']',
              updated_at = NOW()
          WHERE zalo_uid = $3
          RETURNING id, name, phone, bu_group, tour_id, zalo_uid
        `, [cleanPhone, cleanPhone, String(zaloUid)]);
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
- BẮT BUỘC GỌI TOOL queryDepartures: Khi khách hỏi về lịch trình, ngày đi, hoặc giá của bất kỳ tour nào (như Ladakh, Đạo Thành Á Đinh, v.v.), BẮT BUỘC PHẢI GỌI TOOL queryDepartures để tra cứu lịch khởi hành chính xác từ hệ thống.
- Khi tra cứu được thông tin từ Tool hoặc RAG, bạn BẮT BUỘC phải trình bày như sau:
1. TUYỆT ĐỐI KHÔNG DÙNG DẤU SAO (**) HAY (*) vì Zalo KHÔNG hỗ trợ in đậm markdown và sẽ hiện ký tự ** thô gây rối mắt khách hàng.
2. Câu mở đầu ngắn gọn (kết thúc bằng dấu : và xuống 2 dòng \n\n).
3. Từng lịch khởi hành phải là TỪNG DÒNG GẠCH ĐẦU DÒNG RIÊNG BIỆT (bắt đầu bằng '- '):
   - Ngày đi - Ngày về (Thời lượng): Giá tiền
4. Link website chi tiết (CỰC KỲ QUAN TRỌNG: Câu dẫn kết thúc bằng dấu : và link website nằm NGAY DÒNG DƯỚI, không để dòng trống thừa ở giữa):
   Anh/Chị có thể tham khảo chi tiết lịch trình và trải nghiệm tại:
   [Link website]
5. Lời hỏi thăm mở nhẹ nhàng trên 1 đoạn riêng (cách 1 dòng trống \n\n sau link web) (Ví dụ: "Anh/Chị dự định đi nhóm mấy người hoặc dự kiến khởi hành vào đợt nào để em hỗ trợ tư vấn chi tiết hơn ạ?"). TUYỆT ĐỐI KHÔNG ĐÒI GỬI PDF KHI ĐÃ CÓ LINK WEB.

QUY TẮC PHẢN HỒI CHUNG & XỬ LÝ KIẾN THỨC RAG:
1. Trả lời bằng tiếng Việt lịch sự, xưng "em", gọi khách là "Anh/Chị".
2. QUY TẮC ĐỘ DÀI & VĂN PHONG CHAT (CỰC KỲ QUAN TRỌNG):
   - ĐỘ DÀI: DƯỚI 120 TỪ (ngắn gọn, súc tích, đi thẳng vào trọng tâm).
   - TUYỆT ĐỐI KHÔNG DÙNG DẤU SAO (** hay *): Zalo không in đậm được nên không được dùng bất kỳ dấu ** nào.
   - DANH SÁCH KHI CẦN: Dùng danh sách gạch đầu dòng ('- ') khi liệt kê các ngày khởi hành, các điểm lưu ý để khách dễ nhìn.
   - TRẢ LỜI THẲNG & ĐÚNG: Đi thẳng trực diện vào câu hỏi của khách hàng, giải thích ngắn gọn, tự nhiên, gần gũi như một tư vấn viên thật đang nhắn tin Zalo.
   - Kết thúc bằng một câu hỏi mở ngắn gọn, tự nhiên để tiếp tục cuộc trò chuyện.
3. BÁM SÁT 100% NỘI DUNG VÀ HƯỚNG DẪN TRONG TÀI LIỆU (SAU KHI SEARCH TOOL):
   - Khi đã dùng Tool \`searchKnowledgeBase\` và nhận được thông tin, bạn BẮT BUỘC phải bám sát chính xác các thông tin đó để trả lời khách.
   - Tuyệt đối không tự bịa thêm các chi tiết ngoài tài liệu. Nếu tìm không thấy, hãy báo khách đợi chuyên viên hỗ trợ.
4. Nếu khách cho số điện thoại (ví dụ: "0849164037", "090..."), hãy gọi Tool saveLeadPhone lưu lại, cảm ơn khách và báo chuyên viên sẽ liên hệ hỗ trợ ngay.
5. Trình bày thoáng, đẹp mắt, chia đoạn bằng dấu xuống dòng (\n\n), không viết một khối chữ đặc.`;

    // Gọi Gemini API (ưu tiên key được cấu hình trong Admin UI, fallback về .env)
    const apiKey = config.system_config?.gemini_api_key?.trim() || process.env.GEMINI_API_KEY;
    const modelName = config.system_config?.gemini_model?.trim() || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    if (!apiKey) {
      console.warn('[ZaloAiService] Thiếu GEMINI_API_KEY!');
      return {
        reply: 'Chào Anh/Chị! Em là tư vấn viên FIT TOUR. Rất vui được hỗ trợ Anh/Chị. Anh/Chị quan tâm tour tuyến nào để em gửi thông tin chi tiết ạ?',
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

      // Định nghĩa Tool Calling cho Gemini tra cứu lịch khởi hành và lưu lead
      const tools = [
        {
          functionDeclarations: [
            {
              name: 'queryDepartures',
              description: 'Tra cứu thông tin lịch khởi hành, giá tour, số chỗ còn trống, và link website lịch trình chi tiết của các tour FIT TOUR.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  tour_keyword: {
                    type: 'STRING',
                    description: 'Tên tour hoặc từ khóa địa danh cần tra cứu (ví dụ: "Đạo Thành Á Đinh", "Ladakh", "Tây Tạng", "Mông Cổ", "Pakistan", "Thổ Nhĩ Kỳ")'
                  },
                  month: {
                    type: 'STRING',
                    description: 'Tháng khởi hành nếu khách có nhắc tới (ví dụ: "08", "09", "10")'
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

      const requestBody = {
        contents: mergedContents.length > 0 ? mergedContents : formattedContents,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        tools: tools,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048
        }
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

      // Kiểm tra xem Gemini có yêu cầu gọi Tool không
      const functionCallPart = candidate?.content?.parts?.find(p => p.functionCall);
      if (functionCallPart) {
        const functionCall = functionCallPart.functionCall;
        let toolResult = null;

        if (functionCall.name === 'queryDepartures') {
          toolResult = await this.queryDepartures(functionCall.args);
        } else if (functionCall.name === 'searchKnowledgeBase') {
          toolResult = await this.searchKnowledgeBase(functionCall.args);
        } else if (functionCall.name === 'saveLeadPhone') {
          toolResult = await this.saveLeadPhone(leadContext, functionCall.args.phone);
        }

        // Gửi kết quả Tool ngược lại cho Gemini để sinh câu trả lời hoàn chỉnh
        const followUpContents = [
          ...formattedContents,
          {
            role: 'model',
            parts: candidate.content.parts
          },
          {
            role: 'user',
            parts: [
              {
                functionResponse: {
                  name: functionCall.name,
                  response: {
                    name: functionCall.name,
                    content: toolResult
                  }
                }
              }
            ]
          }
        ];

        const followUpRes = await axios.post(endpoint, {
          contents: followUpContents,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          tools: tools,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048
          }
        }, { timeout: 25000 });

        const finalReply = followUpRes.data?.candidates?.[0]?.content?.parts?.filter(p => p.text).map(p => p.text).join('\n') || '';
        
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

        return {
          reply: this.formatAiReply(finalReply) || 'Dạ Anh/Chị cho em xin số điện thoại để em hỗ trợ tư vấn chi tiết nhất nhé ạ!',
          tool_used: functionCall.name,
          tool_args: functionCall.args
        };
      }

      const finalReplyText = candidate?.content?.parts?.filter(p => p.text).map(p => p.text).join('\n') || 'Dạ em chào Anh/Chị, FIT TOUR có thể hỗ trợ thông tin gì cho mình ạ?';

      return {
        reply: this.formatAiReply(finalReplyText),
        meta: { model: modelName }
      };

    } catch (err) {
      console.error('[ZaloAiService] Lỗi gọi Gemini API:', err?.response?.data || err.message);
      return {
        reply: `Chào Anh/Chị! Em là tư vấn viên FIT TOUR. Anh/Chị để lại số điện thoại/Zalo để em gửi file PDF lịch trình chi tiết và tư vấn cụ thể cho mình nhé ạ!`,
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

    // 2. Tách dòng giữa các mốc khởi hành khác nhau (sau giá tiền VNĐ/đồng/đ trước dấu gạch đầu dòng tiếp theo)
    formatted = formatted.replace(/(VNĐ|đồng|đ|\))\s*-\s*(\d{1,2}\/\d{1,2})/gi, '$1\n- $2');
    
    // 3. Tách dòng giữa câu mở đầu và bullet point đầu tiên
    formatted = formatted.replace(/([:!?.])\s*-\s*(\d{1,2}\/\d{1,2})/gi, '$1\n\n- $2');
    
    // 4. Tách dòng sau mỗi giá tiền trước câu dẫn link
    formatted = formatted.replace(/(VNĐ|đồng|đ|\))\s+(Anh\/Chị|Chi tiết|Xem thêm|Link|Để xem|Bạn)/gi, '$1\n\n$2');

    // 5. Đảm bảo Link website nằm ngay bên dưới câu dẫn (chỉ ngắt 1 dòng \n, không để dòng trống thừa)
    formatted = formatted.replace(/([:：])\s*\n*\s*(https?:\/\/[^\s]+)/gi, '$1\n$2');
    formatted = formatted.replace(/([^\n:：])\s+(https?:\/\/[^\s]+)/gi, '$1:\n$2');

    // 6. Tách dòng trống (\n\n) SAU Link website trước câu hỏi / CTA tiếp theo
    formatted = formatted.replace(/(https?:\/\/[^\s]+)\s*\n*\s*([A-ZÀ-Ỹa-zà-ỹ])/gi, '$1\n\n$2');

    // 7. Tách dòng trước câu hỏi / CTA cuối cùng nếu chưa có \n\n
    formatted = formatted.replace(/([.!?])\s*(Anh\/Chị|Nếu Anh\/Chị|Để em|Vui lòng|Mình đang)/gi, '$1\n\n$2');

    // 8. Chuẩn hoá khoảng trắng: Không quá 2 dấu xuống dòng liên tiếp
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    return formatted.trim();
  }
}

module.exports = new ZaloAiService();
