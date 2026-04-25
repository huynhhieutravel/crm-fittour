# AI Copilot - System Design & Changelog

Tài liệu này ghi chú lại quá trình tiến hóa của hệ thống "FIT AI Copilot" từ phiên bản Single-Shot nguyên thủy lên Agentic Multi-Hop, cùng với các bài học xương máu về UX và Logic nội bộ. 
> Dùng tài liệu này để tra cứu trước khi mở rộng thêm Skill hoặc thay đổi luồng ReAct Loop.

---

## 1. Kiến trúc ReAct Loop (Multi-Hop)
**Phiên bản: V2 (Nâng cấp ngày 20/04/2026)**
- **Logic cũ (Single-Shot):** User hỏi -> Gọi function -> Kết thúc. AI không thể nối tiếp nhiều hành động (VD: Không thể tự tìm ID khách xong rồi tự nhảy qua check Tour).
- **Logic mới (While Loop):** Cài đặt `MAX_ITERATIONS = 5` trong `agentRouter.js`.
   - AI được phép tự động gọi chuỗi các hàm **READ** liên tiếp nhau. 
   - Sau khi gọi hàm 1, kết quả được `agentRouter` nạp thẳng vào mảng `currentContents` (đóng vai trò như bộ nhớ ngắn hạn) và vòng lặp tiếp tục đẩy lên Gemini.
   - Vòng lặp sẽ dừng khi AI trả về chuỗi văn bản (Text Response) HOẶC xuất hiện hàm **WRITE** (`create_...`).

## 2. Bài Học Xương Máu: Mất Trí Nhớ Vị Khi Lọc Dữ Liệu
**Vấn đề (Bug: Amputated Data):**
- Lập trình viên cố gắng tiết kiệm Token bằng cách cắt bỏ trường `res.data` khỏi đối tượng `slimResponse` gửi ngược lại cho AI. 
- **Kết quả:** AI gọi hàm `search_customer` và `check_tour` KHÔNG LỖI, nhưng nó không nhìn thấy dữ liệu ID trả về! Đẫn đến việc nó đành ngậm ngùi báo với người dùng "Tìm ra rồi nhưng sếp cho em xin tên và ngày cụ thể để tìm ID". (Bị mù thông tin).
- **Cách Fix:** 
   - Trong `agentRouter.js`, ép buộc trả lại `data: res.data.slice(0,10)` vào `slimResponse`.
   - Trong các module truy vấn (`search_customer.js`, `check_tour.js`), phải ĐẢM BẢO trả về đầy đủ thuộc tính `id` trong mảng `data` thay vì chỉ format mỗi tên. Mặc định `id` dùng để làm "cầu nối" cho hàm WRITE (`create_booking`).

## 3. UI/UX: Interactive Prompting (Trải nghiệm tương tác Mượt)
Khắc phục 2 nhược điểm "Chê Nặng" của giao diện Web tĩnh:

### 3.1. Tính năng Quick Reply (Nút Lựa Chọn Nhanh)
- Thay vì AI trả về List: "1. Tour A, 2. Tour B" rồi bắt user tự gõ lại "Tạo tour 1".
- **Giải pháp:** Cấy Regex `\[quick_reply:(.+?)\|(.+?)\]` vào `AIChatDrawer.jsx`.
- **Huấn luyện não bộ (`brain/rules.md`):** Yêu cầu AI hễ tìm được Option thì in ra cú pháp trên. Frontend sẽ biến nó thành Outline Buttons. User click phát ăn ngay.
- **Bug Cảm Lạnh:** Vì luật sinh Nút được viết hơi "Lễ phép", Gemini đâm ra lười biếng, thay vì nó tự nhảy số gọi hàm READ, nó quay xe hỏi user "Sếp có muốn em tìm giùm không?" kèm cái nút!
- **Cách Fix:** Ghi Đè chữ in Hoa vào `rules.md`: *"TỰ ĐỘNG GỌI HÀM READ NGAY LẬP TỨC ĐỂ TÌM THÔNG TIN. TUYỆT ĐỐI KHÔNG ĐƯỢC HỎI XIN PHÉP."*

### 3.2. Quyền năng Hồi Tác (5-Second Undo Snackbar)
- Bất cứ hành động **WRITE** nào (Create Booking, Create Lead) đều sinh ra CTA Button. 
- Nút CTA phải có màu nổi bật (`#10b981` Xanh Ngọc) đi kèm Label tường minh (Ví dụ: `🚀 Xác nhận Tạo Booking`).
- Tránh việc đè DB lập tức: Add bộ đếm `pendingExecution` 5s ngay trên Frontend React (`AIChatDrawer`). 
- Khi bấm: Nút chuyển Vàng Cam đếm ngược 5..4..3..2..1. Bấm đúp vào để Hủy.

## 4. Bơm Dữ Liệu Ngầm cho Lệnh Gọi Bóng
**Vấn đề:** Khi Backend generate message xác nhận lệnh WRITE để user xem, các argument yêu cầu của Gemini chĩa về backend chỉ có các con số lạnh lẽo `(customer_id: 870, tour_departure_id: 918)`. Khi in ra màn hình, Sale chửi thề vì không hiểu ID 870 là ai!
**Cách Fix:** Add thêm `customer_name` và `tour_name` vào mảng `required` của Function Declaration (`create_booking.js`). Dù Backend API không dùng 2 trường này để INSERT SQL (chỉ cần ID), hệ thống vẫn ép AI phải sinh ra để `agentRouter` bốc ra In lên màn hình cho User dễ Review.

---

### Tóm lại: Quy Trình Phát Triển 1 Skill Mới
1. **WRITE Skill (`create_xxx.js`):** Bắt buộc phải có các trường `_name` phụ để in UI rõ ràng. Lệnh sẽ bị Intercept ở Router để hỏi User.
2. **READ Skill (`search_xxx.js`):** Bắt buộc phải `return { data: [{id: ...}] }` có chứa `id`.
3. Nếu AI lưỡng lự không chạy ngầm, kiểm tra lại Prompts ở `brain/rules.md`.
4. Mọi thay đổi Frontend (`AIChatDrawer`) phải `npm run build` và deploy thư mục `dist`.
5. Mọi thay đổi Backend AI phải `pm2 restart crm-fittour` LẪN Localhost (nếu dev).
