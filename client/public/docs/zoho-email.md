# Hướng Dẫn Kết Nối Zoho Mail Với Ứng Dụng Mail Qua IMAP (Outlook, Apple Mail, Spark...)

![Hướng dẫn cấu hình Outlook Zoho](/docs/images/huong-dan-outlook-zoho.png)

## Khi nào cần làm?

Nếu Zoho Mail web chạy chậm hoặc bạn muốn đọc email bằng:

* Outlook
* Apple Mail
* Spark
* Thunderbird
* Edison Mail

thì nên kết nối trực tiếp qua IMAP.

Ưu điểm:

* Không phụ thuộc giao diện web Zoho.
* Tốc độ tải email thường nhanh hơn.
* Nhận thông báo email ngay trên máy tính.
* Làm việc offline được.

---

# Bước 1: Bật IMAP Trong Zoho Mail

Đăng nhập Zoho Mail:

https://mail.zoho.com

Vào:

⚙️ Cài đặt → Tài khoản Mail → Chọn tài khoản email → IMAP

Kiểm tra:

* IMAP đã được bật.
* Mục cấu hình máy chủ hiển thị như:

### IMAP (Nhận thư)

Server:

```text
imappro.zoho.com
```

Port:

```text
993
```

Bảo mật:

```text
SSL
```

### SMTP (Gửi thư)

Server:

```text
smtppro.zoho.com
```

Port:

```text
465
```

Bảo mật:

```text
SSL
```

---

# Bước 2: Tạo Mật Khẩu Ứng Dụng (App Password)

Zoho thường không cho ứng dụng mail bên thứ ba sử dụng trực tiếp mật khẩu đăng nhập.

Cần tạo App Password riêng.

Vào:

https://accounts.zoho.com

Sau đó:

An ninh → Mật khẩu ứng dụng

Hoặc:

My Account → Security → App Passwords

Nhấn:

```text
Lập Mật Khẩu Mới
```

Đặt tên:

```text
Outlook Mac
```

hoặc

```text
Apple Mail
```

Zoho sẽ sinh một mật khẩu mới dạng:

```text
abcd-efgh-ijkl-mnop
```

Lưu lại ngay.

Lưu ý:

* Đây không phải mật khẩu đăng nhập Zoho.
* Đây là mật khẩu dành riêng cho ứng dụng mail.

---

# Bước 3: Cấu Hình Trong Outlook

Mở Outlook:

Settings → Accounts → Add Account

Chọn:

```text
IMAP
```

Điền:

## Email

```text
hauhung@fittour.vn
```

## Username

```text
hauhung@fittour.vn
```

## IMAP Password

Dùng:

```text
App Password vừa tạo
```

---

### Incoming Mail (IMAP)

Server:

```text
imappro.zoho.com
```

Port:

```text
993
```

Encryption:

```text
SSL
```

---

### Outgoing Mail (SMTP)

SMTP Username:

```text
hauhung@fittour.vn
```

SMTP Password:

```text
App Password vừa tạo
```

SMTP Server:

```text
smtppro.zoho.com
```

Port:

```text
465
```

Encryption:

```text
SSL
```

Nhấn:

```text
Add Account
```

---

# Bước 4: Cấu Hình Trong Apple Mail

Mở ứng dụng Mail trên macOS.

Chọn:

```text
Mail
→ Add Account
→ Other Mail Account
```

Nhập:

* Tên
* Email
* App Password

Nếu Apple Mail không tự nhận cấu hình:

### Incoming

```text
imappro.zoho.com
993
SSL
```

### Outgoing

```text
smtppro.zoho.com
465
SSL
```

Username:

```text
hauhung@fittour.vn
```

Password:

```text
App Password
```

---

# Các Lỗi Thường Gặp

## Unable to sign in. Try again or create an app password

Nguyên nhân:

* Chưa tạo App Password.
* Đang dùng mật khẩu đăng nhập Zoho.

Cách xử lý:

* Tạo App Password mới.
* Dùng App Password thay cho mật khẩu tài khoản.

---

## Authentication Failed

Kiểm tra:

* Username phải là email đầy đủ.
* SMTP Username không được để trống.
* SMTP Password không được để trống.

---

## Không Nhận Được Email

Kiểm tra:

* IMAP đã bật.
* Port 993.
* SSL đang bật.

---

## Gửi Được Nhưng Không Nhận Được

Kiểm tra:

```text
imappro.zoho.com
```

và

```text
993
```

---

## Nhận Được Nhưng Không Gửi Được

Kiểm tra:

```text
smtppro.zoho.com
```

và

```text
465
```

SMTP Username phải là:

```text
hauhung@fittour.vn
```

---

# Khuyến Nghị Cho FIT TOUR

Đối với người dùng Mac:

Ưu tiên:

1. Apple Mail
2. Outlook
3. Spark

Chỉ sử dụng Zoho Web để:

* Quản trị tài khoản.
* Tạo Alias.
* Tạo Filter.
* Quản lý Domain.

Việc đọc và gửi email hàng ngày nên thực hiện bằng ứng dụng mail để có tốc độ và độ ổn định tốt hơn.
