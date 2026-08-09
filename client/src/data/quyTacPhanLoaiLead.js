export const QUY_TAC_PHAN_LOAI_LEAD_MARKDOWN = `
# Quy Tắc Phân Loại & Dọn Dẹp Lead Marketing (Auto-Fail & Re-open)

> [!NOTE]
> Tài liệu này chuẩn hóa quy tắc hệ thống tự động xử lý các Lead rác/mồ côi trong Hộp thư đến. Quy trình này hoạt động tự động và độc lập, không làm ảnh hưởng đến các phân loại Lead hiện có.

---

## 1. Cơ Chế Auto-Fail (Dọn Dẹp Lead Ảo)

Hệ thống sẽ chạy ngầm và **âm thầm** xử lý Lead (không gửi tin nhắn làm phiền khách) khi thoả mãn **TẤT CẢ** các điều kiện sau:

1. **Sale đang xử lý:** Trạng thái phải là \`Chưa phân\` (Chỉ dọn dẹp các lead mồ côi chưa có ai nhận).
2. **Thông tin liên hệ:** Trống hoàn toàn. Tức là chưa lấy được SĐT **VÀ** chưa lấy được Email. *(Lưu ý: Nếu khách có để lại Email dù chưa có SĐT thì đó vẫn là Lead có giá trị, hệ thống sẽ không Auto-Fail).*
3. **Thời gian chờ:** Đã qua **7 ngày (168 giờ)** kể từ thời điểm Bot gửi tin nhắn cuối cùng **VÀ** không có bất kỳ tin nhắn nào từ khách hàng gửi tới trong suốt 7 ngày đó.

**Hành động của Hệ thống:**
- Hệ thống chỉ cập nhật duy nhất cột **Thao tác Sale** (dòng chữ in đậm hiển thị tiến độ).
- Trạng thái Thao tác Sale của Lead sẽ tự động đổi thành: **\`Không phản hồi\`**.

---

## 2. Cơ Chế Tái Kích Hoạt (Re-open) Dành Riêng Cho Auto-Fail

Cơ chế này là "chốt chặn an toàn" để đảm bảo không bao giờ bỏ sót khách hàng nếu họ đột nhiên nhắn tin lại sau khi đã bị hệ thống gán nhãn Không phản hồi.

- **Điều kiện kích hoạt:** Khách nhắn tin lại trên một Lead đang có Thao tác Sale là \`Không phản hồi\`.
- **Quy trình Khôi phục:**
  1. Đổi Thao tác Sale từ \`Không phản hồi\` về lại **\`Mới\`**.
  2. Vẫn giữ nguyên \`Sale: Chưa phân\`.
  3. Đẩy đoạn chat lên vị trí đầu tiên của Hộp thư đến để mọi người chú ý.
  4. Reset lại toàn bộ các bộ đếm thời gian (Vòng đời của Lead được tính lại từ đầu).

---

## 3. Bảo Vệ KPI Cho Đội Ngũ Sale

Để việc hệ thống dọn dẹp hàng loạt lead rác không làm hỏng báo cáo kinh doanh:
- Trên các báo cáo đo lường KPI cá nhân của Sale (ví dụ: Tỷ lệ chuyển đổi, Tỷ lệ chốt deal), hệ thống sẽ **tự động lọc (filter) và loại trừ hoàn toàn** các lead mang Thao tác Sale là \`Không phản hồi\`.
- Tệp dữ liệu rác này chỉ được dùng trong phễu của team Marketing để đo lường và tối ưu hiệu quả quảng cáo.
`;
