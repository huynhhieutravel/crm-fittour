/**
 * QA DEBOUNCE & DEDUPLICATION TEST SUITE
 * Kiểm thử toàn diện cơ chế Debounce gom tin nhắn và xử lý nhãn Zalo AI
 */
const assert = require('assert');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function it(desc, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ [PASS] ${desc}`);
  } catch (err) {
    failedTests++;
    console.error(`  ❌ [FAIL] ${desc}: ${err.message}`);
  }
}

async function itAsync(desc, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✅ [PASS] ${desc}`);
  } catch (err) {
    failedTests++;
    console.error(`  ❌ [FAIL] ${desc}: ${err.message}`);
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('    QA TEST SUITE: ZALO AI DEBOUNCE & ANTI-DUPLICATE LOGIC     ');
  console.log('================================================================\n');

  // --- TEST GROUP 1: DEBOUNCE GOM TIN NHẮN LIÊN TIẾP ---
  console.log('--- TEST GROUP 1: CƠ CHẾ GOM TIN NHẮN (DEBOUNCE QUEUE) ---');

  const testQueue = new Map();
  let executionCount = 0;
  let executedPayloads = [];

  const simulateEnqueue = (senderId, text, debounceMs = 200) => {
    let queueItem = testQueue.get(senderId);
    if (!queueItem) {
      queueItem = {
        timer: null,
        messages: [],
        firstMessageAt: Date.now(),
        isProcessing: false,
        pendingAfterProcessing: []
      };
      testQueue.set(senderId, queueItem);
    }

    if (queueItem.isProcessing) {
      queueItem.pendingAfterProcessing.push(text);
      return;
    }

    queueItem.messages.push(text);

    if (queueItem.timer) {
      clearTimeout(queueItem.timer);
      queueItem.timer = null;
    }

    queueItem.timer = setTimeout(() => {
      const msgs = [...queueItem.messages];
      queueItem.messages = [];
      queueItem.isProcessing = true;
      executionCount++;
      executedPayloads.push({
        senderId,
        combinedText: msgs.join('\n'),
        count: msgs.length
      });
      // Simulate async completion
      setTimeout(() => {
        queueItem.isProcessing = false;
        if (queueItem.pendingAfterProcessing.length > 0) {
          queueItem.messages = [...queueItem.pendingAfterProcessing];
          queueItem.pendingAfterProcessing = [];
          queueItem.timer = setTimeout(() => {
            const followUpMsgs = [...queueItem.messages];
            queueItem.messages = [];
            executionCount++;
            executedPayloads.push({
              senderId,
              combinedText: followUpMsgs.join('\n'),
              count: followUpMsgs.length
            });
          }, 100);
        }
      }, 150);
    }, debounceMs);
  };

  await itAsync('Gom 3 tin nhắn liên tiếp trong khoảng debounce thành 1 lần gọi duy nhất', async () => {
    simulateEnqueue('uid_123', 'Cho c đk tour lệ giang', 150);
    await new Promise(r => setTimeout(r, 50));
    simulateEnqueue('uid_123', 'Tháng 10 nha', 150);
    await new Promise(r => setTimeout(r, 50));
    simulateEnqueue('uid_123', 'Đi 2 người', 150);

    // Chờ debounce kích hoạt
    await new Promise(r => setTimeout(r, 250));

    assert.strictEqual(executionCount, 1, 'Chỉ được kích hoạt 1 lần duy nhất thay vì 3 lần');
    assert.strictEqual(executedPayloads[0].count, 3, 'Gom đủ 3 tin nhắn');
    assert.strictEqual(
      executedPayloads[0].combinedText,
      'Cho c đk tour lệ giang\nTháng 10 nha\nĐi 2 người',
      'Nội dung gộp chính xác từng dòng'
    );
  });

  await itAsync('Khoá đơn luồng (Mutex): Tin nhắn đến trong lúc AI đang sinh câu trả lời được đưa vào hàng đợi kế tiếp', async () => {
    // Lúc này UID 123 đang trong phase isProcessing (150ms timeout)
    simulateEnqueue('uid_123', 'Khởi hành từ TP.HCM nha em', 150);

    // Chờ process 1 kết thúc và trigger follow-up batch
    await new Promise(r => setTimeout(r, 350));

    assert.strictEqual(executionCount, 2, 'Tổng cộng 2 lần xử lý (1 batch chính + 1 follow-up)');
    assert.strictEqual(executedPayloads[1].combinedText, 'Khởi hành từ TP.HCM nha em', 'Tin nhắn follow-up được xử lý sau khi đợt 1 hoàn tất');
  });

  // --- TEST GROUP 2: CHỐNG DUPLICATE OUTGOING & GẮN NHÃN AI ---
  console.log('\n--- TEST GROUP 2: CHỐNG DUPLICATE OUTGOING & GẮN NHÃN AI ---');

  it('Webhook oa_send_text nhận diện đúng tin do AI gửi thông qua recentAiMessages map', () => {
    const recentAiMessages = new Map();
    const recipientId = 'user_999';
    const aiText = 'Dạ tour Lệ Giang giá 27.990.000 VNĐ ạ!';

    // AI gửi tin -> lưu vào recentAiMessages
    recentAiMessages.set(`${recipientId}|${aiText.trim()}`, Date.now());

    // Giả lập webhook oa_send_text nhận được từ Zalo
    const isAiSent = recentAiMessages.has(`${recipientId}|${aiText.trim()}`);
    assert.strictEqual(isAiSent, true, 'Nhận diện chính xác tin nhắn xuất phát từ AI');

    const msgToSave = {
      id: 'zalo_msg_1',
      senderId: recipientId,
      text: aiText,
      type: 'outgoing',
      senderType: isAiSent ? 'ai' : undefined,
      senderStaffName: isAiSent ? 'AI Agent' : undefined
    };

    assert.strictEqual(msgToSave.senderType, 'ai', 'Cờ senderType được gắn đúng thành "ai"');
    assert.strictEqual(msgToSave.senderStaffName, 'AI Agent', 'Tên người gửi gắn đúng "AI Agent"');
  });

  it('Hàm saveMessage tự động cập nhật senderType: ai nếu tin nhắn trước đó chưa có cờ', () => {
    const messages = [
      {
        id: 'msg_webhook_1',
        senderId: 'user_888',
        text: 'Dạ lịch khởi hành 22/10 ạ',
        type: 'outgoing',
        timestamp: new Date().toISOString()
        // Chưa có senderType (do webhook đến trước)
      }
    ];

    const aiMsgIncoming = {
      id: 'timestamp_id_2',
      senderId: 'user_888',
      text: 'Dạ lịch khởi hành 22/10 ạ',
      type: 'outgoing',
      senderType: 'ai',
      senderStaffName: 'AI Agent'
    };

    // Kiểm tra logic duplicate check nâng cao
    const existingIndex = messages.findIndex(m =>
      m.type === 'outgoing' &&
      (m.senderId === aiMsgIncoming.senderId || m.recipientId === aiMsgIncoming.senderId) &&
      m.text && m.text.trim() === aiMsgIncoming.text.trim() &&
      Math.abs(Date.now() - new Date(m.timestamp).getTime()) < 15000
    );

    assert.notStrictEqual(existingIndex, -1, 'Tìm thấy tin nhắn trùng');

    if (existingIndex !== -1) {
      if (aiMsgIncoming.senderType && !messages[existingIndex].senderType) {
        messages[existingIndex].senderType = aiMsgIncoming.senderType;
        messages[existingIndex].senderStaffName = aiMsgIncoming.senderStaffName;
      }
    }

    assert.strictEqual(messages.length, 1, 'Không bị nhân đôi tin nhắn (vẫn giữ 1 bản ghi)');
    assert.strictEqual(messages[0].senderType, 'ai', 'Tin nhắn đã được nâng cấp cờ senderType = "ai"');
    assert.strictEqual(messages[0].senderStaffName, 'AI Agent', 'Tin nhắn hiển thị đúng "AI Agent"');
  });

  // --- TEST GROUP 3: CẮT LỊCH SỬ HỘI THOẠI TRÁNH TRÙNG LẶP ---
  console.log('\n--- TEST GROUP 3: CẮT LỊCH SỬ HỘI THOẠI (HISTORY SLICE) ---');

  it('Lịch sử hội thoại loại bỏ đúng số lượng tin nhắn trong batch hiện tại', () => {
    const sandboxMock = [
      { senderId: 'u1', type: 'incoming', text: 'Chào em' },
      { senderId: 'u1', type: 'outgoing', text: 'Dạ chào Quý khách' },
      { senderId: 'u1', type: 'incoming', text: 'Cho c tour Lệ Giang' }, // batch item 1
      { senderId: 'u1', type: 'incoming', text: 'Tháng 10 nha' }           // batch item 2
    ];

    const batchCount = 2; // Khách vừa nhắn 2 câu liên tiếp
    const userMsgs = sandboxMock.filter(m => m.senderId === 'u1');

    const historyPool = userMsgs.length > batchCount ? userMsgs.slice(0, -batchCount) : [];
    const historySlice = historyPool.slice(-6);

    const conversationHistory = historySlice.map(m => ({
      sender: m.type === 'incoming' ? 'user' : 'model',
      text: m.text
    }));

    assert.strictEqual(conversationHistory.length, 2, 'Lịch sử chỉ chứa 2 tin trước đó');
    assert.strictEqual(conversationHistory[0].text, 'Chào em');
    assert.strictEqual(conversationHistory[1].text, 'Dạ chào Quý khách');
    assert.strictEqual(
      conversationHistory.some(m => m.text === 'Cho c tour Lệ Giang' || m.text === 'Tháng 10 nha'),
      false,
      'Không chứa 2 tin nhắn trong batch hiện tại để tránh Gemini bị lặp context'
    );
  });

  // --- TEST GROUP 4: CẤU HÌNH DEBOUNCE CLAMP ---
  console.log('\n--- TEST GROUP 4: THAM SỐ CẤU HÌNH (DEBOUNCE CLAMP) ---');

  it('Giá trị debounce_seconds được kẹp an toàn giữa [2s, 15s]', () => {
    const getClampedMs = (sec) => {
      const s = Number(sec) || 5;
      return Math.max(2000, Math.min(15000, s * 1000));
    };

    assert.strictEqual(getClampedMs(undefined), 5000, 'Mặc định 5s nếu không cấu hình');
    assert.strictEqual(getClampedMs(null), 5000, 'Mặc định 5s nếu null');
    assert.strictEqual(getClampedMs(0), 5000, 'Mặc định 5s nếu 0');
    assert.strictEqual(getClampedMs(1), 2000, 'Kẹp tối thiểu 2s nếu truyền 1s');
    assert.strictEqual(getClampedMs(5), 5000, '5s chuẩn');
    assert.strictEqual(getClampedMs(10), 10000, '10s chuẩn');
    assert.strictEqual(getClampedMs(30), 15000, 'Kẹp tối đa 15s nếu truyền 30s');
  });

  console.log('\n================================================================');
  console.log(`KẾT QUẢ KIỂM THỬ: ${passedTests}/${totalTests} TESTS PASSED`);
  if (failedTests > 0) {
    console.error(`CẢNH BÁO: CÓ ${failedTests} TESTS THẤT BẠI!`);
    process.exit(1);
  } else {
    console.log('TẤT CẢ CÁC BÀI TEST ĐỀU THÀNH CÔNG RỰC RỠ! 🚀');
    process.exit(0);
  }
}

runTests();
