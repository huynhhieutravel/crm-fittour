/**
 * ═══════════════════════════════════════════════════════════════
 *  FIT Tour AI Copilot — Agent Router V2 (Bộ não trung tâm)
 *
 *  Luồng xử lý:
 *  1. Nhận tin nhắn → checkRateLimit()
 *  2. Gửi lên Gemini kèm Brain knowledge + Function Declarations
 *  3. Gemini phân tích → trả về Function Call (hoặc text thuần)
 *  4. Router thực thi Function Call trên Database thật
 *  5. Gửi kết quả về Gemini để tổng hợp câu trả lời cuối cùng
 *  6. logChat() → Trả kết quả cho Frontend
 * ═══════════════════════════════════════════════════════════════
 */

const { GoogleGenAI } = require('@google/genai');
const { SYSTEM_INSTRUCTION } = require('./brainLoader');
const { functionDeclarations, skillHandlers, skillValidators } = require('./skillRegistry');
const { checkRateLimit, logChat } = require('./chatLogger');
const { getUserMergedPerms } = require('../middleware/permCheck');

// ─── KHỞI TẠO GEMINI CLIENT ────────────────────────────
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Lưu trữ lịch sử chat theo user (in-memory, reset khi restart server)
const chatSessions = new Map();

// ─── HÀM RETRY TỰ ĐỘNG ────────────────────────────────
async function generateWithRetry(modelName, contents, config, retries = 3) {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      return await ai.models.generateContent({ model: modelName, contents, config });
    } catch (e) {
      const msg = e.message || '';
      if (msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand')) {
        attempt++;
        if (attempt > retries) throw e;
        console.warn(`[AI Copilot] High demand 503 (Attempt ${attempt}). Ngủ ${attempt * 2}s...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
      } else {
        throw e;
      }
    }
  }
}

// ─── HÀM CHÍNH: XỬ LÝ TIN NHẮN ───────────────────────
async function processMessage(userMessage, user) {
  const startTime = Date.now();
  const userId = user ? user.id : 'anonymous';
  const userName = user ? (user.full_name || user.username) : 'anonymous';
  const role = user ? user.role : 'user';

  // 1. Anti-spam check
  const rateCheck = checkRateLimit(userId, role);
  if (!rateCheck.allowed) {
    return { reply: rateCheck.message, action: null };
  }

  try {
    // 2. Tạo hoặc lấy lại chat session
    if (!chatSessions.has(userId)) {
      chatSessions.set(userId, { history: [], createdAt: Date.now() });
    }
    const session = chatSessions.get(userId);

    // Giới hạn history (giữ 20 tin gần nhất để tiết kiệm token)
    if (session.history.length > 40) {
      session.history = session.history.slice(-20);
    }

    // 3. Xử lý Intercept: Nếu user gõ ID cụ thể ('action_xxx') hoặc gõ xác nhận ("tạo đi", v.v.)
    const msgLower = userMessage.toLowerCase().trim();
    const confirmWords = ['tạo đi', 'chốt', 'đồng ý', 'xác nhận', 'ok tạo đi', 'ừ tạo đi', 'yes tạo đi', 'tạo luôn', 'chốt đi', 'ok chốt'];
    const isDirectConfirm = confirmWords.includes(msgLower);
    
    if ((userMessage.startsWith('action_') || isDirectConfirm) && session.pendingActions && Object.keys(session.pendingActions).length > 0) {
      console.log(`[AI Copilot] Cache HIT! Bulk Intercept Execution.`);
      
      // TTL Check: Xóa các action đã quá 5 phút
      const TTL_MS = 5 * 60 * 1000; // 5 phút
      const now = Date.now();
      for (const actionId of Object.keys(session.pendingActions)) {
        if (session.pendingActions[actionId].createdAt && (now - session.pendingActions[actionId].createdAt) > TTL_MS) {
          console.log(`[AI Copilot] TTL expired for ${actionId}, removing.`);
          delete session.pendingActions[actionId];
        }
      }
      
      // Nếu tất cả đã hết hạn
      if (Object.keys(session.pendingActions).length === 0) {
        return { reply: '⏳ Phiên xác nhận đã hết hạn (quá 5 phút). Sếp vui lòng gửi lại yêu cầu tạo mới nhé!', action: null };
      }
      
      let actionsToRun = [];
      if (userMessage === 'action_all' || isDirectConfirm) {
        // Chạy tất cả
        actionsToRun = Object.keys(session.pendingActions).map(id => ({ id, ...session.pendingActions[id] }));
      } else if (session.pendingActions[userMessage]) {
        // Chạy ID cụ thể
        actionsToRun = [{ id: userMessage, ...session.pendingActions[userMessage] }];
      }

      if (actionsToRun.length > 0) {
        if (user && user.id) {
          try { user.perms = await getUserMergedPerms(user.id, user.role); } catch(e) {}
        }
        
        let resultMessages = [];
        let finalAction = 'WRITE';
        let finalData = null;

        for (const act of actionsToRun) {
          const handler = skillHandlers[act.name];
          if (handler) {
            const res = await handler(act.args, user);
            const icon = res.status === 'ERROR' ? '❌' : (res.status === 'WARNING' ? '⚠️' : '✅');
            resultMessages.push(`${icon} **${act.name}**: ${res.message || 'Thành công'}`);
            finalAction = res.action;
            finalData = res.data;
          }
          delete session.pendingActions[act.id]; // Xóa khỏi bộ nhớ đệm sau khi chạy
        }
        
        const aiReply = resultMessages.join('\n\n');
        
        // Update history
        session.history.push(
          { role: 'user', parts: [{ text: userMessage }] },
          { role: 'model', parts: [{ text: aiReply }] }
        );
        
        logChat({ userId, userName, userMessage, aiReply, functionCalled: 'bulk_execute', functionArgs: actionsToRun, actionType: finalAction, modelUsed: 'cache/direct', responseTimeMs: Date.now() - startTime });
        
        return { reply: aiReply, action: finalAction, functionName: 'bulk_execute', data: finalData, needs_confirmation: false };
      }
    }

    // Nếu không phải chạy từ Cache, nạp Context vào Vòng lặp Agentic (Multi-Hop ReAct)
    let currentContents = [
      ...session.history,
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    const currentModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    let iterationCount = 0;
    const MAX_ITERATIONS = 5; // Giới hạn suy luận để chống Infinite Loop

    let totalTokenIn = 0;
    let totalTokenOut = 0;
    
    let finalAction = null;
    let finalData = null;
    let finalFunctionName = null;

    while (iterationCount < MAX_ITERATIONS) {
      iterationCount++;
      console.log(`[AI Copilot] ReAct Loop Iteration: ${iterationCount}`);
      
      const dynamicInstruction = `${SYSTEM_INSTRUCTION}\n\n[CONTEXT] Hiện tại là: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} (Giờ Việt Nam). Trả về dữ liệu ngày tháng luôn kèm theo năm mặc định là năm nay nếu User không nói rõ.`;

      const response = await generateWithRetry(currentModel, currentContents, {
        systemInstruction: dynamicInstruction,
        tools: [{ functionDeclarations }],
      });

      // Theo dõi Token
      const usage = response.usageMetadata || {};
      totalTokenIn += (usage.promptTokenCount || 0);
      totalTokenOut += (usage.candidatesTokenCount || 0);

      const candidate = response.candidates?.[0];
      if (!candidate) {
        return { reply: 'Xin lỗi, em không xử lý được yêu cầu này. Sếp thử lại nhé!', action: null };
      }

      const parts = candidate.content?.parts || [];
      const functionCalls = parts.filter(p => p.functionCall).map(p => p.functionCall);

      if (functionCalls.length > 0) {
        // 1. Phân tách Write Calls vs Read Calls
        const writeCalls = functionCalls.filter(fc => fc.name.startsWith('create_') || fc.name.startsWith('add_') || fc.name.startsWith('update_') || fc.name.startsWith('delete_'));
        
        // Từ điển dịch biến nội bộ ra tiếng Việt cho Nhân Viên dễ hiểu (Exhaustive List cho toàn bộ module)
        const keyMap = {
          // Tên Hàm (Lệnh)
          create_travel_support: 'Tạo Dịch vụ (Travel Support)',
          create_supplier: 'Tạo Nhà Cung Cấp',
          create_customer: 'Tạo Khách Hàng',
          create_lead: 'Tạo Lead (Khách Tiềm Năng)',
          create_booking: 'Tạo Booking (Giữ Chỗ)',
          create_op_tour: 'Tạo Lịch Khởi Hành (Op Tour)',
          add_customer_note: 'Thêm Ghi Chú Khách Hàng',

          // Các biến chung
          name: 'Tên', full_name: 'Họ tên', phone: 'SĐT', email: 'Email', 
          notes: 'Ghi chú', note: 'Ghi chú', note_content: 'Nội dung ghi chú',
          customer_name_or_phone: 'Khách hàng (Tên/SĐT)',
          quantity: 'Số lượng', type: 'Phân loại', contact_person: 'Người liên hệ',
          
          // Travel Support
          service_type: 'Loại dịch vụ', service_name: 'Tên DV', 
          unit_price: 'Đơn giá / Bán', unit_cost: 'Giá vốn', collected_amount: 'Đã thu',
          usage_date: 'Ngày sử dụng',
          
          // Leads
          source: 'Nguồn khách', consultation_note: 'Ghi chú tư vấn', bu_group: 'Nhóm Kinh Doanh (BU)',
          
          // Op Tours
          tour_name: 'Tên Tour gốc', code: 'Mã (Code)', start_date: 'Ngày khởi hành', 
          end_date: 'Ngày kết thúc', total_seats: 'Tổng số chỗ', market: 'Thị trường',
          
          // Bookings
          customer_id: 'Mã Khách Hàng (ID)', tour_departure_id: 'Mã Lịch KH (ID)',
          pax_count: 'Số lượng khách (Pax)', total_price: 'Tổng tiền (Giá Bán Booking)', 
          initial_deposit_amount: 'Tiền cọc ban đầu (Tiền mặt)', customer_name: 'Tên khách', tour_id: 'Mã Tour'
        };
        const formatVal = (k, v) => {
          if ((k.includes('price') || k.includes('cost') || k.includes('amount')) && !isNaN(v)) {
            return Number(v).toLocaleString('vi-VN') + 'đ';
          }
          return v;
        };

        // ─── XỬ LÝ INTERCEPT BULK (WRITE) -> PHÁ VỠ VÒNG LẶP VÀ TRẢ VỀ FORM XÁC NHẬN ───
        if (writeCalls.length > 0) {
          
          // ─── 0. PRE-VALIDATION: CHẠY HÀM VALIDATE (NẾU CÓ) ĐỂ BẮT LỖI SỚM ───
          for (let i = 0; i < writeCalls.length; i++) {
            const { name, args } = writeCalls[i];
            const validator = skillValidators[name];
            if (validator) {
              const valRes = await validator(args, user);
              if (valRes.status === 'ERROR') {
                 // Ngắt ngang: Báo lỗi thẳng, KHÔNG HIỆN FORM XÁC NHẬN
                 const aiReply = valRes.message;
                 session.history.push(
                    { role: 'user', parts: [{ text: userMessage }] },
                    { role: 'model', parts: [{ text: aiReply }] }
                 );
                 logChat({ userId, userName, userMessage, aiReply, functionCalled: name, functionArgs: args, actionType: 'ERROR', modelUsed: currentModel, responseTimeMs: Date.now() - startTime });
                 return { reply: aiReply, action: 'ERROR', functionName: name, data: null, needs_confirmation: false };
              }
            }
          }

          // ─── 1. NẾU VALIDATE PASSED: KHỞI TẠO FORM XÁC NHẬN ───
          session.pendingActions = session.pendingActions || {}; // Khởi tạo dictionary
          
          let confirmText = `📝 Em xác nhận **tạo mới ${writeCalls.length} lệnh** với các thông số sau:\n\n`;
          
          writeCalls.forEach((fc, idx) => {
            const { name, args } = fc;
            const actionId = `action_${Date.now()}_${idx}`;
            session.pendingActions[actionId] = { name, args, createdAt: Date.now() };
            
            const functionLabel = keyMap[name] || name;
            confirmText += `**${idx + 1}. Lệnh: ${functionLabel}**\n`;
            confirmText += Object.keys(args).map(k => `- ${keyMap[k] || k}: ${formatVal(k, args[k])}`).join('\n');
            confirmText += `\n[confirm_action:${actionId}|🚀 Xác nhận ${functionLabel}]\n\n`;
          });

          if (writeCalls.length > 1) {
            confirmText += `[confirm_action:action_all|🚀 Xác nhận Tạo tất cả ${writeCalls.length} mục]\n`;
          }

          const confirmMsg = confirmText.trim();
          
          session.history.push(
            { role: 'user', parts: [{ text: userMessage }] },
            { role: 'model', parts: [{ text: confirmMsg }] }
          );
          
          logChat({ userId, userName, userMessage, aiReply: confirmMsg, functionCalled: 'bulk_prepare', functionArgs: writeCalls, actionType: 'PENDING', modelUsed: currentModel, responseTimeMs: Date.now() - startTime });
          return { reply: confirmMsg, action: 'PENDING', functionName: 'bulk', data: null, needs_confirmation: true };
        }

        // ─── XỬ LÝ READ CALLS SONG SONG ───
        
        // Inject perms
        if (user && user.id) {
          try { user.perms = await getUserMergedPerms(user.id, user.role); } catch(e) {}
        }

        const functionResponses = [];
        
        for (const fc of functionCalls) {
          const { name, args } = fc;
          const handler = skillHandlers[name];
          let slimResponse = { status: 'ERROR', message: `System Error: Unknown skill ${name}` };
          
          if (handler) {
            const res = await handler(args, user);
            // ĐƯA DATA VÀO LẠI SLIM RESPONSE (Cắt bớt để tránh ngốn token, max 10 kết quả)
            slimResponse = { 
              action: res.action, 
              status: res.status, 
              message: res.message, 
              data: res.data ? (Array.isArray(res.data) ? res.data.slice(0, 10) : res.data) : undefined,
              needs_confirmation: res.needs_confirmation 
            };
            finalAction = res.action;
            finalData = res.data || finalData;
            finalFunctionName = name;
          }
          
          functionResponses.push({
            functionResponse: { name, response: slimResponse }
          });
        }

        // Lưu ngữ cảnh Function Call của Gemini vào Context để nó nhớ nó đã gọi gì
        currentContents.push({
          role: 'model',
          parts: parts.filter(p => p.functionCall)
        });

        // Nạp kết quả Function về làm User Context để Gemini xử lý ở Vòng Lặp tiếp theo
        currentContents.push({
          role: 'user',
          parts: functionResponses
        });
        
        // TIẾP TỤC VÒNG LẶP MỚI ĐỂ GEMINI XỬ LÝ DỮ LIỆU HOẶC GỌI TIẾP HÀM KHÁC
        continue;
      }

      // ─── KHÔNG CÓ FUNCTION CALL -> ĐÓ LÀ TEXT RESPONSE -> KẾT THÚC VÒNG LẶP ───
      const textReply = parts.filter(p => p.text).map(p => p.text).join('') || 'Em đã thực hiện xong nhưng không tổng hợp được kết quả.';
      
      session.history.push(
        { role: 'user', parts: [{ text: userMessage }] },
        { role: 'model', parts: [{ text: textReply }] }
      );

      // Log DB với tổng Token đã cộng dồn
      logChat({
        userId, userName, userMessage, aiReply: textReply,
        functionCalled: finalFunctionName, functionArgs: null, actionType: finalAction,
        modelUsed: currentModel,
        responseTimeMs: Date.now() - startTime,
        tokenInput: totalTokenIn, tokenOutput: totalTokenOut
      });

      return { reply: textReply, action: finalAction, functionName: finalFunctionName, data: finalData, needs_confirmation: false };
    }

    // Nếu thoát vòng lặp vì vượt MAX_ITERATIONS (Prevent ngốn Token)
    return { reply: '⚠️ Tiến trình phân tích quá phức tạp (vượt 5 vòng lặp). Sếp vui lòng chia nhỏ câu hỏi ra nhé!', action: null };

  } catch (error) {
    console.error('[AI Copilot] Error:', error);

    const errorMsg = error.message || '';
    let friendlyReply;

    if (errorMsg.includes('API key')) {
      friendlyReply = '❌ API Key Gemini không hợp lệ. Vui lòng kiểm tra lại file .env!';
    } else if (errorMsg.includes('quota') || errorMsg.includes('429')) {
      friendlyReply = '⏳ Đã vượt giới hạn request. Vui lòng thử lại sau 1 phút.';
    } else if (errorMsg.includes('503') || errorMsg.includes('UNAVAILABLE') || errorMsg.includes('high demand')) {
      friendlyReply = '🏄‍♂️ Server AI của Google đang bị kẹt xe. Sếp chờ vài giây rồi gửi lại lệnh nha!';
    } else {
      friendlyReply = '❌ Em gặp trục trặc kỹ thuật. Sếp thử lại sau ít giây nhé!';
    }

    // Log lỗi vào DB
    logChat({
      userId, userName, userMessage, aiReply: friendlyReply,
      functionCalled: null, functionArgs: null, actionType: 'ERROR',
      modelUsed: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      responseTimeMs: Date.now() - startTime,
      tokenInput: null, tokenOutput: null
    });

    return { reply: friendlyReply, action: null };
  }
}

// Hàm xóa history (reset conversation)
function clearHistory(userId) {
  chatSessions.delete(userId);
}

module.exports = { processMessage, clearHistory };
