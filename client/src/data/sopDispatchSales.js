export const SOP_DISPATCH_MARKDOWN = `
# SOP: Vận hành Trung tâm Điều phối (Dispatch Center)

> [!NOTE]
> Tài liệu này chuẩn hóa quy trình tiếp nhận Khách hàng tiềm năng (Lead) từ các kênh (Fanpage, Zalo, Website, Hotline) để phân bổ cho **Sales (Tư vấn viên)**. Mục tiêu cốt lõi của Trung tâm Điều phối là: **Không bỏ sót khách hàng - Phân bổ đúng người - Luân chuyển siêu tốc**.

---

## 1. Sơ đồ Phối hợp Chớp nhoáng (Workflow)

\`\`\`mermaid
sequenceDiagram
    autonumber
    participant Khách hàng
    participant Hệ thống (ERP/Chat)
    participant Điều phối
    participant Sales
    
    Khách hàng->>Hệ thống (ERP/Chat): Nhắn tin hoặc Gọi điện
    Hệ thống (ERP/Chat)->>Điều phối: Tự động ghi nhận thành [Lead Mới]
    
    Note over Điều phối: Vòng lặp Kiểm soát
    Điều phối->>Sales: Phân bổ trực tiếp (Push) / Hoặc Sale tự nhận (Claim)
    
    Sales-->>Điều phối: Bắt buộc xác nhận nhận Lead (SLA < 10 phút)
    alt Không phản hồi
        Điều phối->>Sales: Thu hồi Lead & Chuyển cho người khác
    else Đã xác nhận
        Sales->>Khách hàng: Chào sân & Bắt đầu tư vấn
    end
\`\`\`

## 2. Trách nhiệm Cốt lõi của Điều phối (Dispatch Role)
*Điều phối viên đóng vai trò là "Người gác cổng" và "Định tuyến" của toàn bộ hệ thống bán hàng.*

<div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
  <h4 style="color: #166534; margin-top: 0; margin-bottom: 8px;">📍 Bước 1.1: Các kênh tiếp nhận Lead</h4>
  <p style="color: #374151; margin-top: 0; margin-bottom: 8px;">Điều phối cần nắm rõ các luồng dữ liệu đổ về hệ thống để không bỏ sót bất kỳ khách hàng nào:</p>
  <ul style="color: #374151; margin: 0; padding-left: 20px; margin-bottom: 16px;">
    <li style="margin-bottom: 6px;"><b>Tự động 100%:</b> Kênh <b>Fanpage Messenger</b> được kết nối trực tiếp. Mọi tin nhắn khách gửi sẽ tự động sinh ra một Lead mới trên ERP.</li>
    <li style="margin-bottom: 0;"><b>Tạo thủ công (Manual):</b> Với các kênh khác như <b>Tiktok, Zalo, Khách Walk-in (đến trực tiếp VP), hoặc gọi Hotline</b>... Điều phối phải tự tay bấm nút Tạo Lead mới ngay khi có phát sinh.</li>
  </ul>
  
  <h4 style="color: #166534; margin-top: 0; margin-bottom: 8px;">📍 Bước 1.2: Phân loại Nhu cầu & Lọc Lead tiềm năng</h4>
  <ul style="color: #374151; margin: 0; padding-left: 20px;">
    <li style="margin-bottom: 6px;"><b>Nhận diện Khách tiềm năng (Lead thật):</b> Điều phối phải xem nhanh nội dung tin nhắn để nắm bắt nhu cầu cốt lõi (Khách muốn đi đâu? Đi mấy người?). Đây là bước lọc <b>quan trọng nhất</b> để có cơ sở chọn đúng Sale phân bổ.</li>
    <li style="margin-bottom: 0;"><b>Bỏ qua Data Rác:</b> Do số lượng tin nhắn rác (Spam) hoặc chào hàng rất nhiều, Điều phối <b>không cần mất thời gian thao tác Đóng (Close)</b> từng Lead. Chỉ cần mặc kệ (bỏ qua) các data này, tuyệt đối không phân bổ (Push) chúng để tránh làm rác hệ thống của Sales.</li>
  </ul>
</div>

<div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
  <h4 style="color: #92400e; margin-top: 0; margin-bottom: 8px;">📍 Bước 2: Kỹ năng Phân bổ (Assign) "Đúng người, đúng việc"</h4>
  <p style="color: #374151; margin-top: 0; margin-bottom: 8px;">Điều phối không chia số theo kiểu "phát bài" ngẫu nhiên, mà phải đánh giá nhanh:</p>
  <ul style="color: #374151; margin: 0; padding-left: 20px;">
    <li style="margin-bottom: 6px;"><b>Nhận diện Chân dung:</b> Khách đang hỏi thị trường nào? Châu Âu, Mỹ, Nhật Bản hay Đông Nam Á?</li>
    <li style="margin-bottom: 6px;"><b>Kiểm tra "Độ rảnh":</b> Xem xét tải công việc hiện tại của các Sales. Không dồn quá nhiều Lead vào một người đang bận xử lý đoàn.</li>
    <li style="margin-bottom: 0;"><b>Giao việc (Push):</b> Sử dụng chức năng <i>Assign</i> để đẩy trực tiếp Lead cho Sale có chuyên môn tuyến điểm phù hợp nhất. <b>BẮT BUỘC</b> phải cung cấp đủ các thông tin sau trước khi chuyển:
      <ul style="color: #374151; padding-left: 20px; margin-top: 4px; margin-bottom: 0;">
        <li style="margin-bottom: 4px;">Đã gửi <b>Lịch khởi hành</b> và <b>Lịch trình chi tiết</b> cho khách.</li>
        <li style="margin-bottom: 4px;">Đã gửi <b>thông tin Nhân viên tư vấn</b> (Info/Card) mà khách đã chọn.</li>
        <li style="margin-bottom: 0;">Đi kèm một <b>Ghi chú (Note)</b> tóm tắt (nếu đã khai thác đủ): <i>Nhu cầu cốt lõi, nguồn khách đến từ đâu, và các thông tin quan trọng khác để làm "vũ khí" cho Sales chốt deal</i>.</li>
      </ul>
    </li>
  </ul>
</div>

<div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 16px;">
  <h4 style="color: #9f1239; margin-top: 0; margin-bottom: 8px;">📍 Bước 3: Đôn đốc & Thu hồi (Quyền lực tối cao)</h4>
  <ul style="color: #374151; margin: 0; padding-left: 20px;">
    <li style="margin-bottom: 6px;"><b>Giám sát SLA:</b> Sau khi phân bổ, Điều phối phải liếc mắt theo dõi xem Sale đã "Claim" (Xác nhận) Lead đó hay chưa.</li>
    <li style="margin-bottom: 0;"><b>Thu hồi tàn nhẫn:</b> Nếu sau <b>5-10 phút</b> mà Sale vẫn "im hơi lặng tiếng", Điều phối phải gọi tên nhắc nhở trực tiếp. Nếu vẫn không phản hồi -> Lập tức thu hồi Lead và chuyển cho người khác để đảm bảo "nhiệt" của khách hàng không bị nguội lạnh.</li>
  </ul>
</div>

## 3. Bảng Tiêu chuẩn SLA (Cam kết Thời gian)

*Bất kỳ sự chậm trễ nào trong 2 chỉ số dưới đây đều ảnh hưởng trực tiếp đến tỷ lệ chốt Sale (Conversion Rate).*

| Quy trình | Người chịu trách nhiệm | SLA cam kết tối đa | Hình thức Xử lý khi quá hạn |
| :--- | :--- | :--- | :--- |
| **Phân bổ Lead** | Điều phối | **Dưới 5 phút** kể từ lúc khách nhắn | Trừ điểm KPI phản hồi |
| **Xác nhận nhận Lead** | Nhân viên Sales | **5 - 10 phút** kể từ lúc được giao | **Thu hồi Lead** & Cảnh báo |

> [!TIP]
> **Bí quyết thành công của Điều phối viên:** Đừng chỉ là người "chia bài". Hãy là một vị nhạc trưởng đọc vị khách hàng siêu nhanh và ghim sẵn các "Note" thần thánh để làm bệ phóng cho Sales chốt deal dễ dàng hơn!
`;

export const SOP_SALES_MARKDOWN = `
# SOP: Tiếp nhận Lead & Quản lý Workplace cho Sales

> [!NOTE]
> Hướng dẫn Sales cách nhận Lead từ Điều phối, cập nhật trạng thái Pipeline (Giai đoạn tư vấn) và tối ưu hóa Lịch hẹn để chăm sóc khách hàng tốt nhất.

## 1. Nhận Lead & Xử lý Giai đoạn (Pipeline)

### Bước 1: Tiếp nhận Lead
- Khi có thông báo Lead được assign từ Điều phối, Sales phải click vào nhận ngay lập tức.
- Bắt đầu chat/gọi điện để khai thác nhu cầu thực tế của khách hàng (Ngày đi, Điểm đến, Ngân sách, Số lượng người...).

### Bước 2: Cập nhật Giai đoạn tư vấn trên ERP
Đây là bước **bắt buộc** để quản lý có thể theo dõi tỷ lệ chuyển đổi. Quá trình chat/gọi điện diễn ra song song với việc cập nhật ERP.
- *Ví dụ các giai đoạn:* Mới tiếp cận ➜ Đang tư vấn ➜ Đã gửi báo giá ➜ Đang thương lượng ➜ Theo dõi lại.
- Luôn ghi chú (Note) lại các điểm quan trọng sau mỗi lần tương tác với khách.

### Bước 3: Nguyên tắc "Chốt Cọc = Tạo Khách hàng"
- Tuyệt đối KHÔNG tạo dữ liệu "Khách hàng" (Customer) khi mới chỉ ở giai đoạn hỏi giá.
- Chỉ khi khách hàng **đã chuyển khoản cọc**, Sales mới thực hiện convert (chuyển đổi) Lead đó thành Khách hàng chính thức và tạo Booking.

## 2. Tối ưu hóa Workplace Sales & Lịch (Calendar)

### Quản lý thông tin trên Workplace Sales
- **Giao diện Kanban/List:** Sử dụng Workplace để nhìn tổng quan toàn bộ Lead mình đang ôm. Bạn có thể kéo thả Lead qua các Giai đoạn tư vấn khác nhau trực quan.
- **Ghi chú (Note) là vàng:** Đừng để thông tin khách trôi tuột. 
  - Các note này hiển thị ở cột bên phải của Lead, giúp bạn mở máy lên là nhớ ngay câu chuyện ngày hôm trước.
- **Sử dụng Tag/Bộ lọc (Filter):** Gắn thẻ (Tag) cho các Lead như "Ưu tiên cao", "Đợi lương", "Khách VIP" để dùng bộ lọc lọc ra nhanh chóng danh sách cần chăm sóc gấp.

### Cách tối ưu Lịch hẹn (Calendar) để Follow-up
Đừng dùng sổ tay hay giấy nhớ, hãy đưa mọi thứ lên Calendar của ERP.
- **Tạo Activity / Task (Hoạt động/Nhiệm vụ):** 
  - Đang chat mà khách bảo: *"Anh đang bận họp, chiều 3h gọi lại nhé"*. Ngay lập tức mở ERP tạo Task: \`Gọi lại anh A báo giá - 15:00\`.
  - Khách hứa chiều mai chuyển cọc? Tạo Task: \`Check biến động số dư cọc chị B - 16:00 mai\`.
- **Review Lịch đầu ngày:** Buổi sáng, việc đầu tiên khi mở Workplace là nhìn vào **Calendar Dashboard**. Nó sẽ list ra chính xác hôm nay bạn phải gọi cho ai, giục cọc ai, gửi báo giá cho ai.
- **Sức mạnh của Reminders:** Hệ thống sẽ bắn Notification nhắc nhở bạn trước giờ hẹn, đảm bảo 0% tỷ lệ quên việc.

## 3. Các Lỗi Thường Gặp Cần Tránh

> [!WARNING]
> 1. **"Om" Lead:** Sales nhận Lead từ Điều phối nhưng bận không tư vấn ngay, để khách đợi lâu -> Khách sang công ty khác mua.
> 2. **Tư vấn "Tàng hình":** Sales ôm 20 khách, tư vấn rôm rả trên Zalo cá nhân nhưng lười cập nhật Giai đoạn tư vấn lên ERP -> Quản lý không biết tiến độ, Lead bị đánh dấu là "Chết/Lost" oan.
> 3. **Tạo Data "Rác":** Sales vội tạo thành Khách hàng chính thức khi chưa có cọc.
`;

export const SOP_OVERVIEW_MARKDOWN = `
## 🚀 Tổng quan Quy trình Xử lý Lead: Từ Fanpage đến Chốt Cọc

> [!NOTE]
> Quy trình này mô tả chi tiết hành trình của một Lead từ lúc là người lạ trên mạng xã hội cho đến khi trở thành khách hàng thực sự. Hãy nắm rõ "luật chơi" để phối hợp nhịp nhàng và chăm sóc khách hàng tốt nhất!

---

### 🗺️ Bản đồ Luồng Công Việc (Workflow)

![Bản đồ Luồng Công Việc](/thu-vien-input/lo-trinh-sale.png)

---

### 🚢 Hành trình chi tiết: 4 Điểm chạm "Vàng"

<div style="border-left: 4px solid #bfdbfe; margin-left: 16px; padding-left: 32px; font-family: sans-serif; padding-top: 8px;">
  
  <!-- STEP 1 -->
  <div style="position: relative; margin-bottom: 40px;">
    <div style="position: absolute; left: -50px; top: 0; background-color: #3b82f6; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 0 0 4px #fff; font-size: 16px;">1</div>
    <h4 style="font-size: 18px; font-weight: bold; color: #1d4ed8; margin: 0 0 12px 0;">Điểm chạm 1: "Cửa ngõ" Lọc phễu (Trực Page)</h4>
    <p style="color: #374151; margin-top: 0; margin-bottom: 8px;">Mọi cuộc hành trình đều bắt đầu từ một lời chào. Khi khách hàng nhắn tin qua Fanpage, <b>BotAI của Meta hoặc Nhân viên trực page</b> sẽ tiếp đón đầu tiên để trò chuyện, đưa thông tin và khai thác nhu cầu cơ bản. Tại đây, hệ thống ghi nhận ngay một <b>Lead</b>.</p>
    <ul style="color: #374151; padding-left: 20px; margin: 0;">
      <li style="margin-bottom: 4px;"><b>Dữ liệu Rác (Spam, Không nhu cầu):</b> Sẽ bị chặn lại, <b>không</b> chuyển cho Khối Tư vấn để tránh mất thời gian.</li>
      <li style="margin-bottom: 4px;"><b>Dữ liệu Tốt (Hỏi tour, Cần tư vấn):</b> Nhân viên trực page ghi nhận và chuyển tiếp ngay vào Hub Điều Phối.</li>
    </ul>
  </div>

  <!-- STEP 2 -->
  <div style="position: relative; margin-bottom: 40px;">
    <div style="position: absolute; left: -50px; top: 0; background-color: #f59e0b; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 0 0 4px #fff; font-size: 16px;">2</div>
    <h4 style="font-size: 18px; font-weight: bold; color: #b45309; margin: 0 0 12px 0;">Điểm chạm 2: Tranh tài (Trung tâm Điều phối)</h4>
    <p style="color: #374151; margin-top: 0; margin-bottom: 8px;">Data sau khi lọc sẽ đổ về vùng chứa tổng: <b>Trung tâm Điều Phối & Chat</b>. Tại đây, một "cuộc đua" nhỏ sẽ diễn ra:</p>
    <ul style="color: #374151; padding-left: 20px; margin: 0;">
      <li style="margin-bottom: 4px;"><b>Tự do lựa chọn (Claim):</b> Khi ở trạng thái Mở, các nhân viên Sale được quyền xem xét và chủ động nhận tư vấn khách hàng này.</li>
      <li style="margin-bottom: 4px;"><b>Cảnh báo SLA (30p - 60p):</b> Đừng để khách hàng đợi lâu! Nếu sau 30-60 phút mà Lead vẫn "vô chủ", hệ thống sẽ tự động nhắc nhở.</li>
      <li style="margin-bottom: 4px;"><b>Phân bổ (Push/Assign):</b> Quản lý cũng có thể can thiệp phân bổ trực tiếp cho Sale có chuyên môn phù hợp (Xác định thị trường, Ghi chú thần tốc).</li>
    </ul>
  </div>

  <!-- STEP 3 -->
  <div style="position: relative; margin-bottom: 40px;">
    <div style="position: absolute; left: -50px; top: 0; background-color: #10b981; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 0 0 4px #fff; font-size: 16px;">3</div>
    <h4 style="font-size: 18px; font-weight: bold; color: #047857; margin: 0 0 12px 0;">Điểm chạm 3: "Sân khấu" Workplace Sale</h4>
    <p style="color: #374151; margin-top: 0; margin-bottom: 8px;">Khi đã xác nhận nhận Lead, Sale phải tiến hành chat ngay trên Messenger/Zalo và <b>báo lại rõ ràng danh tính</b> <i>(VD: Dạ em là Hưng, chuyên viên tư vấn của FIT Tour...)</i>. Để hệ thống đồng hành cùng bạn, 3 thao tác sau là <b>bắt buộc</b>:</p>
    <ul style="color: #374151; padding-left: 20px; margin: 0;">
      <li style="margin-bottom: 4px;"><b>Kéo Giai đoạn tư vấn (Pipeline):</b> Khách đang ở bước nào? (Mới tiếp cận, Đang tư vấn, Đã gửi báo giá). Kéo thả liên tục để tracking!</li>
      <li style="margin-bottom: 4px;"><b>Lưu Lịch sử Ghi chú (Notes):</b> Ghi lại mọi kết quả sau mỗi cuộc gọi. Đừng để trí nhớ đánh lừa bạn.</li>
      <li style="margin-bottom: 4px;"><b>Lên Lịch hẹn (Tasks):</b> Đặt nhắc nhở gọi lại để không bao giờ bỏ rơi khách hàng.</li>
    </ul>
  </div>

  <!-- STEP 4 -->
  <div style="position: relative; margin-bottom: 0px;">
    <div style="position: absolute; left: -50px; top: 0; background-color: #f43f5e; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 0 0 4px #fff; font-size: 16px;">4</div>
    <h4 style="font-size: 18px; font-weight: bold; color: #be123c; margin: 0 0 12px 0;">Điểm chạm 4: Vạch đích & Đánh giá (Tổng kết)</h4>
    <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 16px; margin-top: 12px;">
      <p style="color: #9f1239; font-weight: bold; margin: 0; display: flex; align-items: center; gap: 8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
        <span>Hãy nhớ: Lead chưa cọc thì mãi chỉ là Lead!</span>
      </p>
      <p style="color: #be123c; margin-top: 8px; margin-bottom: 0;">Tiền chưa vào tài khoản thì tuyệt đối <b>KHÔNG</b> được biến họ thành "Khách hàng" trên hệ thống để tránh rác dữ liệu. Chỉ khi khách chốt cọc, Sale mới được phép ấn nút <b>Tạo Khách hàng (Customer)</b> và sinh ra một <b>Booking</b> bàn giao cho Điều hành.</p>
    </div>
    <p style="color: #374151; margin-top: 12px; margin-bottom: 0;">Vào <b>cuối mỗi tuần</b>, hệ thống sẽ tự động tổng kết báo cáo: Nhân viên nào tư vấn bao nhiêu khách, tỷ lệ chốt (Conversion Rate) ra sao... từ đó làm cơ sở khen thưởng và tối ưu chiến dịch.</p>
  </div>

</div>

🎉 **Chúc mừng! Bạn đã hoàn tất một vòng đời xuất sắc, biến một người lạ thành khách hàng trung thành của FIT Tour!**
`;
