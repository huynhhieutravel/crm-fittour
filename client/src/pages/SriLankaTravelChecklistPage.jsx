import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Compass, 
  Bus, 
  Hotel, 
  Utensils, 
  Sparkles, 
  Printer, 
  Copy, 
  Check, 
  Info, 
  ExternalLink, 
  Plane, 
  Train, 
  Mountain, 
  Waves, 
  DollarSign, 
  Coffee, 
  FileText, 
  ArrowLeft,
  CloudRain,
  Sun,
  ShieldCheck,
  FolderOpen,
  Filter,
  CheckSquare,
  Square,
  HelpCircle,
  Phone,
  MessageSquare,
  Award,
  ChevronDown,
  ChevronUp,
  Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ── DỮ LIỆU CHECKLIST TOÀN DIỆN CHI TIẾT ──
const CHECKLIST_ITEMS = [
  // 1. Giấy Tờ & Hải Quan
  {
    id: 'doc-passport',
    category: 'docs',
    categoryName: '🛂 Giấy Tờ & Hải Quan',
    title: 'Hộ chiếu gốc còn hạn trên 6 tháng & Đúng nhận dạng',
    priority: 'BẮT BUỘC',
    priorityColor: '#ef4444',
    desc: 'Hộ chiếu phải còn hạn ít nhất 06 tháng tính đến ngày bay về. Khách có 2 quốc tịch phải mang đủ cả 2 hộ chiếu. Đặc biệt: Nếu quý khách vừa phẫu thuật thẩm mỹ (sửa mũi, cắt mí, xăm mày...) làm thay đổi đường nét nhận diện, bắt buộc phải đổi lại hộ chiếu mới để tránh bị hải quan từ chối xuất cảnh.',
    farmTripNote: 'Đoàn Farm Trip lưu ý: Trưởng đoàn giữ danh sách kiểm tra số hộ chiếu của khách ngay tại quầy tập trung Tân Sơn Nhất.'
  },
  {
    id: 'doc-tax',
    category: 'docs',
    categoryName: '🛂 Giấy Tờ & Hải Quan',
    title: 'Kiểm tra nghĩa vụ thuế cá nhân qua app "eTax Mobile"',
    priority: 'BẮT BUỘC',
    priorityColor: '#ef4444',
    desc: 'Theo quy định hiện hành, cá nhân còn nợ đọng nghĩa vụ thuế sẽ bị cơ quan thẩm quyền tạm hoãn xuất cảnh tại sân bay. FIT Tour không chịu trách nhiệm và không thể hoàn phí nếu khách bị từ chối xuất cảnh vì lý do thuế cá nhân.',
    farmTripNote: 'Tải app eTax Mobile về máy, đăng nhập bằng CCCD hoặc VNeID để tra cứu ngay trước 3-5 ngày khởi hành.'
  },
  {
    id: 'doc-visa',
    category: 'docs',
    categoryName: '🛂 Giấy Tờ & Hải Quan',
    title: 'Visa điện tử Sri Lanka (ETA) & Bản in xác nhận',
    priority: 'BẮT BUỘC',
    priorityColor: '#ef4444',
    desc: 'Visa Sri Lanka được công ty FIT Tour làm trọn gói theo danh sách đoàn. Bản cứng visa sẽ được HDV phát tận tay quý khách tại sân bay Tân Sơn Nhất kèm thẻ hành lý.',
    farmTripNote: 'Lưu thêm một bản ảnh chụp visa hoặc file PDF trong điện thoại để phòng khi cần xuất trình tại quầy check-in.'
  },
  {
    id: 'doc-cash-limit',
    category: 'docs',
    categoryName: '🛂 Giấy Tờ & Hải Quan',
    title: 'Hạn mức tiền mặt & Ngoại tệ khi xuất cảnh Việt Nam',
    priority: 'LƯU Ý CAO',
    priorityColor: '#f97316',
    desc: 'Theo quy định Hải quan Việt Nam: Tiền mặt mang theo người KHÔNG được vượt quá 5.000 USD (hoặc ngoại tệ tương đương) và không quá 15.000.000 VNĐ. Nếu mang trên mức này phải làm thủ tục khai báo hải quan. Vàng mang theo trên 300g hoặc máy quay loại lớn (>200 USD) phải khai báo.',
    farmTripNote: 'Không nên mang kim cương hoặc trang sức quý có giá trị quá lớn để tránh rủi ro bảo quản.'
  },
  {
    id: 'doc-airport-stamp',
    category: 'docs',
    categoryName: '🛂 Giấy Tờ & Hải Quan',
    title: 'Kiểm tra con dấu mộc nhập cảnh tại sân bay Colombo (CMB)',
    priority: 'TỬ HUYỆT',
    priorityColor: '#dc2626',
    desc: 'Khi bước qua bốt xuất nhập cảnh sân bay Bandaranaike (CMB), BẮT BUỘC phải lật hộ chiếu kiểm tra xem nhân viên hải quan đã đóng dấu mộc nhập cảnh (Entry Stamp) kèm ngày tháng hay chưa trước khi bước rời khỏi bốt!',
    farmTripNote: 'Kinh nghiệm sống còn từ chuyến Farm Trip 10/2026: Đã từng có trường hợp hải quan sơ suất quên dập mộc, đến ngày xuất cảnh về bị giữ lại điều tra rất rắc rối!'
  },
  {
    id: 'doc-exit-water',
    category: 'docs',
    categoryName: '🛂 Giấy Tờ & Hải Quan',
    title: 'Lưu ý chốt an ninh cuối & Nhà vệ sinh tại sân bay CMB lúc về',
    priority: 'TỬ HUYỆT',
    priorityColor: '#dc2626',
    desc: 'Sân bay Colombo có quy trình kiểm tra an ninh đặc biệt: Ngay trước cửa phòng chờ boarding (ra máy bay về lại VN) có 1 chốt soi chiếu an ninh lần 2. Tất cả chai nước suối (dù mới mua bên trong sân bay) đều bị tịch thu! Phòng chờ boarding không có nhà vệ sinh và phải ngồi đợi 45-60 phút.',
    farmTripNote: 'HDV phải nhắc toàn bộ đoàn: Đi vệ sinh và uống hết nước trước khi bước qua chốt an ninh cuối vào cửa ra máy bay.'
  },

  // 2. Hành Lý & Trang Phục
  {
    id: 'pack-airline-rules',
    category: 'luggage',
    categoryName: '🧳 Hành Lý & Trang Phục',
    title: 'Quy chuẩn hành lý Vietjet: 7kg xách tay + 20kg ký gửi',
    priority: 'BẮT BUỘC',
    priorityColor: '#ef4444',
    desc: 'Hành lý xách tay 07kg: Tuyệt đối không để vật sắc nhọn (dao kéo, bấm móng tay) và chai gel/chất lỏng trên 100ml. Hành lý ký gửi 20kg: Tuyệt đối KHÔNG để tiền mặt, trang sức quý, pin sạc dự phòng, laptop trong vali ký gửi.',
    farmTripNote: 'Chuẩn bị 1 bộ quần áo gọn nhẹ ấm áp để trong balo xách tay dùng khi ngồi máy bay vì nhiệt độ khoang bay thường lạnh.'
  },
  {
    id: 'pack-socks',
    category: 'luggage',
    categoryName: '🧳 Hành Lý & Trang Phục',
    title: 'Chuẩn bị 3–4 đôi vớ/tất loại dày (Bắt buộc đi chân trần đền chùa)',
    priority: 'SỐNG CÒN',
    priorityColor: '#dc2626',
    desc: 'Toàn bộ đền chùa ở Sri Lanka (Đền Hang Dambulla, Đền Răng Phật Kandy, Gangaramaya) đều bắt buộc gửi giày dép ở ngoài và đi chân trần vào sân đền. Nền sân đá phơi nắng nhiệt đới buổi trưa rất nóng buốt, nhiều đoạn sỏi đá gồ ghề làm rát chân.',
    farmTripNote: 'Bí kíp thực chiến Farm Trip: Mang theo 3-4 đôi vớ cotton dày dặn hoặc vớ đế mềm để lồng vào chân khi tham quan. Đi xong bỏ vào túi nilon riêng để không làm bẩn balo!'
  },
  {
    id: 'pack-white-clothes',
    category: 'luggage',
    categoryName: '🧳 Hành Lý & Trang Phục',
    title: 'Trang phục màu trắng thanh khiết khi viếng Đền Răng Phật Kandy',
    priority: 'KHUYÊN DÙNG',
    priorityColor: '#d97706',
    desc: 'Tại đền thờ Xá Lợi Răng Phật Sri Dalada Maligawa (Cố đô Kandy), người dân bản địa 100% mặc trang phục màu trắng tinh khiết để thể hiện lòng tôn kính. Du khách nếu có đồ màu trắng nên mang theo 1 bộ.',
    farmTripNote: 'Mặc đồ trắng vừa trang nghiêm, hợp phong tục vừa chụp ảnh lên màu cực kỳ nổi bật và thanh tao giữa thánh địa linh thiêng.'
  },
  {
    id: 'pack-temple-dress',
    category: 'luggage',
    categoryName: '🧳 Hành Lý & Trang Phục',
    title: 'Quy tắc trang phục đền chùa: Che vai, che đầu gối, không xuyên thấu',
    priority: 'BẮT BUỘC',
    priorityColor: '#ef4444',
    desc: 'Áo phải có tay (không mặc áo sát nách, hai dây, khoét sâu ngực), quần hoặc váy dài phủ qua đầu gối, không mặc đồ bó sát hay ren xuyên thấu. Các anh không mặc quần đùi/soóc ngắn. Các chị nên chuẩn bị sẵn 1 chiếc khăn choàng nhẹ trong túi xách để quàng vai khi cần.',
    farmTripNote: 'Bảo vệ đền chùa Sri Lanka kiểm tra trang phục rất nghiêm, nếu mặc sai quy cách sẽ bị chặn ngay từ cổng ngoài.'
  },
  {
    id: 'pack-shoes-hiking',
    category: 'luggage',
    categoryName: '🧳 Hành Lý & Trang Phục',
    title: 'Giày trekking/thể thao êm chân leo Pháo đài đá Sigiriya',
    priority: 'QUAN TRỌNG',
    priorityColor: '#059669',
    desc: 'Leo Pháo đài đá Sigiriya Lion Rock đòi hỏi đi bộ và leo hơn 1.200 bậc thang dốc đứng, thời gian lên xuống mất hơn 2 - 2.5 tiếng. Bắt buộc mang giày thể thao êm chân hoặc giày có độ bám dính tốt. Nên có thêm 1 đôi sandals/dép quai hậu để tiện tháo mở các ngày đi chùa.',
    farmTripNote: 'Khách lớn tuổi hoặc có vấn đề khớp gối nên mang theo gậy leo núi gập gọn và đi với nhịp độ vừa sức.'
  },
  {
    id: 'pack-weather-umbrella',
    category: 'luggage',
    categoryName: '🧳 Hành Lý & Trang Phục',
    title: 'Ô gấp nhỏ, áo gió mỏng & Đồ che nắng',
    priority: 'QUAN TRỌNG',
    priorityColor: '#059669',
    desc: 'Sri Lanka có 2 mùa gió đan xen, thường có những cơn mưa rào bất chợt rồi tạnh nhanh. Luôn để 1 chiếc ô gấp nhỏ hoặc áo mưa tiện lợi trong balo. Vùng cao nguyên Ella / Nuwara Eliya sáng sớm và đêm se lạnh (17-20°C), cần có áo khoác mỏng.',
    farmTripNote: 'Mũ rộng vành, kính râm và kem chống nắng là vật bất ly thân khi tham quan các điểm di sản ngoài trời.'
  },

  // 3. Thiết Bị Điện & Mạng
  {
    id: 'tech-adapter',
    category: 'tech',
    categoryName: '🔌 Thiết Bị Điện & SIM Số',
    title: 'Củ chuyển đổi ổ cắm 3 chấu đa năng (Universal Adapter Type D/G)',
    priority: 'BẮT BUỘC',
    priorityColor: '#ef4444',
    desc: 'Sri Lanka sử dụng ổ cắm 3 chấu đặc thù: Type D (3 chân tròn tam giác) hoặc Type G (3 chân vuông kiểu Anh), điện áp 230V. Phích cắm 2 chấu dẹp hoặc tròn của Việt Nam KHÔNG cắm vừa. Bắt buộc chuẩn bị củ sạc đa năng từ Việt Nam.',
    farmTripNote: 'Khách sạn có thể cho mượn củ chuyển đổi nhưng số lượng rất hạn chế, tự túc 1 củ mang theo là yên tâm nhất.'
  },
  {
    id: 'tech-sim',
    category: 'tech',
    categoryName: '🔌 Thiết Bị Điện & SIM Số',
    title: 'SIM du lịch 4G: Mua ngay tại sảnh đến sân bay Colombo (Rẻ hơn 3 lần)',
    priority: 'MẸO VÀNG',
    priorityColor: '#0284c7',
    desc: 'Nên mua SIM vật lý tại sân bay Bandaranaike (CMB): Vị trí quầy nằm ngay bên PHẢI sảnh đến sau khi ra khỏi hải quan. Mạng Dialog có sóng mạnh và ổn định nhất toàn quốc (kể cả vùng đồi núi Ella). Gói 20GB giá chỉ $5 USD (~130.000đ), gói 50GB giá $10 USD. Nhân viên kích hoạt tại chỗ trong 2 phút.',
    farmTripNote: 'Mua SIM tại sân bay rẻ hơn rất nhiều so với mua eSIM trên mạng ở Việt Nam (thường bị bán giá 250k - 400k với dung lượng ít).'
  },
  {
    id: 'tech-powerbank',
    category: 'tech',
    categoryName: '🔌 Thiết Bị Điện & SIM Số',
    title: 'Pin sạc dự phòng xách tay & Dọn bộ nhớ máy ảnh',
    priority: 'CẦN THIẾT',
    priorityColor: '#059669',
    desc: 'Các cung đường tham quan thiên nhiên và trải nghiệm tàu hỏa Nanu Oya - Ella cảnh sắc tuyệt đẹp, khách sẽ quay chụp liên tục suốt ngày. Dung lượng sạc dự phòng dưới 20.000mAh và bắt buộc để trong túi xách tay.',
    farmTripNote: 'Nên chuẩn bị dung lượng bộ nhớ điện thoại trống ít nhất 15-20GB trước khi bay.'
  },

  // 4. Tiền Tệ & Mua Sắm
  {
    id: 'money-exchange',
    category: 'money',
    categoryName: '💵 Tiền Mặt, Mua Sắm & Tip',
    title: 'Đổi tiền Rupee Sri Lanka (LKR): Đổi tại quầy bên trái sân bay CMB',
    priority: 'QUAN TRỌNG',
    priorityColor: '#059669',
    desc: 'Tiền tệ: Sri Lankan Rupee (LKR). Tỷ giá: 1 USD ~ 300 LKR (1.000 LKR khoảng 80.000đ). Tiền Việt Nam KHÔNG đổi trực tiếp được. Quý khách chuẩn bị USD mới phẳng từ Việt Nam, đổi tại quầy bên TRÁI sảnh đến sân bay Colombo. Mỗi khách đổi khoảng 50 - 100 USD là đủ dùng.',
    farmTripNote: 'Đổi tại sân bay rất an toàn và tỷ giá niêm yết chuẩn của ngân hàng nhà nước Sri Lanka.'
  },
  {
    id: 'money-small-notes',
    category: 'money',
    categoryName: '💵 Tiền Mặt, Mua Sắm & Tip',
    title: 'Bí kíp tiền lẻ: BẮT BUỘC giữ nhiều tờ 100 LKR trong ví',
    priority: 'MẸO VÀNG',
    priorityColor: '#0284c7',
    desc: 'Hầu hết các chi phí dịch vụ lẻ dọc đường: Phí đi vệ sinh công cộng, phí gửi giày dép vào đền chùa, tiền tip mở cửa hoặc bốc vác nhẹ đều có mức giá cố định là 100 LKR/lượt (khoảng 8.000đ).',
    farmTripNote: 'Khi đổi tiền tại sân bay hoặc sau các bữa ăn, hãy chủ động nhờ nhân viên đổi ra 10-20 tờ 100 LKR để luôn có sẵn trong túi.'
  },
  {
    id: 'money-cards',
    category: 'money',
    categoryName: '💵 Tiền Mặt, Mua Sắm & Tip',
    title: 'Sử dụng thẻ tín dụng Visa/Mastercard & Mua quà lưu niệm',
    priority: 'HỮU ÍCH',
    priorityColor: '#6366f1',
    desc: 'Thẻ thanh toán quốc tế được quẹt mượt mà tại các resort 5 sao, chuỗi siêu thị lớn (Keells, Cargills) và trung tâm thương mại One Galle Face ở Colombo. Đặc sản nên mua: Trà đen Ceylon chính hiệu (Dilmah, Mlesna, Basilur), dầu gió thảo dược Siddhalepa, gia vị quế hồi nguyên chất.',
    farmTripNote: 'Mua trà tại các đồn điền cao nguyên hoặc siêu thị lớn giá niêm yết minh bạch, chất lượng hảo hạng.'
  },
  {
    id: 'money-tipping',
    category: 'money',
    categoryName: '💵 Tiền Mặt, Mua Sắm & Tip',
    title: 'Quy chuẩn tiền Tip quốc tế cho HDV, Lái xe & Phụ xe',
    priority: 'QUY CHUẨN',
    priorityColor: '#d97706',
    desc: 'Tiền tip bắt buộc cho Hướng Dẫn Viên địa phương, Tài xế và Phụ xe: Tối thiểu 6 USD/khách/ngày (khoảng 150.000đ). Tiền tip dọn phòng khách sạn để lại bàn khoảng 200 LKR/ngày. Tiền tip nhân viên hỗ trợ hành lý lên phòng khoảng 100 - 200 LKR/lượt.',
    farmTripNote: 'Văn hóa tip tại Sri Lanka thể hiện sự tri ân văn minh đối với đội ngũ phục vụ đã tận tâm chăm sóc đoàn.'
  },

  // 5. Ẩm Thực & Nước Uống
  {
    id: 'food-curry-taste',
    category: 'food',
    categoryName: '🍛 Ăn Uống & Khẩu Vị',
    title: 'Khẩu vị Sri Lanka: Cay nồng, nhiều gia vị & Đồ ăn dặm cho khách Việt',
    priority: 'LƯU Ý CAO',
    priorityColor: '#f97316',
    desc: 'Ẩm thực Sri Lanka chịu ảnh hưởng sâu sắc của gia vị cà ri, tiêu đen, thì là và nước cốt dừa, thường có vị cay nồng và mặn đậm. Các bữa ăn trong tour FIT Tour đa số là Buffet 4-5 sao Á - Âu phong phú để khách dễ chọn lựa. Tuy nhiên, khách Việt nên chuẩn bị sẵn: Chà bông (ruốc thịt), mè rang muối, mì ly, rong biển sấy, tương ớt để ăn kèm nếu chưa quen khẩu vị Nam Á.',
    farmTripNote: 'Kinh nghiệm Farm Trip: Đêm đầu tiên đến Negombo muộn, hàng quán xung quanh đóng cửa sớm lúc 19:30 - 20:00 và khách sạn không có bữa tối. Khách nên chuẩn bị bánh ngọt, mì ly ăn dặm đêm đầu.'
  },
  {
    id: 'food-water-safety',
    category: 'food',
    categoryName: '🍛 Ăn Uống & Khẩu Vị',
    title: 'Tuyệt đối KHÔNG uống nước vòi trực tiếp',
    priority: 'AN TOÀN',
    priorityColor: '#dc2626',
    desc: 'Nước máy tại khách sạn chỉ sử dụng để tắm giặt và đánh răng, tuyệt đối không đun sôi để uống trực tiếp. Luôn sử dụng nước suối đóng chai còn nguyên tem niêm phong. Trên xe tour FIT Tour luôn có tiêu chuẩn nước uống đóng chai phục vụ quý khách mỗi ngày.',
    farmTripNote: 'Tránh dùng đá viên tại các quán cóc ven đường để giữ bụng dạ khỏe mạnh suốt hành trình.'
  },
  {
    id: 'food-must-try',
    category: 'food',
    categoryName: '🍛 Ăn Uống & Khẩu Vị',
    title: 'Đặc sản nhất định phải thử: Bánh Hopper, Dừa vua Thambili & Trà Ceylon',
    priority: 'TRẢI NGHIỆM',
    priorityColor: '#10b981',
    desc: 'Bánh Hopper (Appa) giòn rụm với trứng lòng đào thơm béo; Dừa vua vàng (King Coconut) ngọt mát lành giải nhiệt bán ven đường (giá chỉ 150 - 250 LKR/quả); Trà đen Ceylon nóng hổi thơm nồng trong tiết trời se lạnh tại đồi chè cao nguyên.',
    farmTripNote: 'Dừa vua Sri Lanka có hàm lượng khoáng và điện giải tự nhiên rất cao, uống sau khi leo núi Sigiriya hồi phục sức khỏe cực nhanh.'
  },

  // 6. Văn Hóa & Tâm Linh
  {
    id: 'culture-buddha-photo',
    category: 'culture',
    categoryName: '🛕 Văn Hóa & Đền Chùa',
    title: 'TUYỆT ĐỐI KHÔNG chụp ảnh quay lưng selfie vào tượng Phật',
    priority: 'CẤM TUYỆT ĐỐI',
    priorityColor: '#dc2626',
    desc: 'Đứng quay lưng vào tượng Phật để chụp ảnh selfie hoặc tạo dáng bị coi là hành vi xúc phạm quốc đạo và thiếu tôn trọng nghiêm trọng tại Sri Lanka. Quý khách có thể bị cảnh sát du lịch nhắc nhở, xóa ảnh hoặc phạt tiền.',
    farmTripNote: 'Khi chụp ảnh kỷ niệm tại chùa: Đứng nghiêng người góc 45 độ hướng về tượng Phật, hoặc đứng bên cạnh chụp toàn cảnh trang nghiêm.'
  },
  {
    id: 'culture-bodhi-leaf',
    category: 'culture',
    categoryName: '🛕 Văn Hóa & Đền Chùa',
    title: 'Cây Bồ Đề tổ linh thiêng: Chỉ nhặt lá rụng, CẤM bứt lá trên cây',
    priority: 'CẤM TUYỆT ĐỐI',
    priorityColor: '#dc2626',
    desc: 'Các cây bồ đề tại Đền Hang Dambulla và Đền Răng Phật đều được chiết cành từ cây Bồ Đề lịch sử Jaya Sri Maha Bodhi hơn 2.300 năm tuổi. Quý khách có thể nhặt những chiếc lá đã tự rụng xuống sân để mang về làm kỷ niệm cầu an; TUYỆT ĐỐI KHÔNG được với tay bứt lá trên cây.',
    farmTripNote: 'Lá bồ đề rụng mang về ép vào sổ tay hoặc lồng khung kính là món quà tâm linh vô giá cho gia đình.'
  },
  {
    id: 'culture-right-hand',
    category: 'culture',
    categoryName: '🛕 Văn Hóa & Đền Chùa',
    title: 'Luôn dùng TAY PHẢI khi đón nhận chỉ gia trì & Trao đổi đồ vật',
    priority: 'VĂN HÓA',
    priorityColor: '#7c3aed',
    desc: 'Trong văn hóa Nam Á, tay trái bị xem là không sạch sẽ. Khi nhận dây chỉ chúc phúc từ sư thầy tại Chùa Gangaramaya hoặc khi đưa/nhận tiền bạc, quà tặng với người bản địa, BẮT BUỘC dùng TAY PHẢI (hoặc dùng cả hai tay) để thể hiện sự lễ phép.',
    farmTripNote: 'Quý khách có thể chuẩn bị sẵn chuỗi hạt hoặc vòng phong thủy cá nhân để nhờ sư thầy gia trì cầu an tại Chùa Gangaramaya.'
  },
  {
    id: 'culture-head-bobble',
    category: 'culture',
    categoryName: '🛕 Văn Hóa & Đền Chùa',
    title: 'Văn hóa lắc đầu nhẹ (Head Bobble): Hiểu đúng để không bỡ ngỡ',
    priority: 'THÚ VỊ',
    priorityColor: '#0284c7',
    desc: 'Người Sri Lanka khi đồng ý, hài lòng hoặc nói lời cảm ơn thường lắc nhẹ đầu sang hai bên. Khách mới đi lần đầu hay lầm tưởng là họ đang từ chối hoặc phản đối. Hãy an tâm mỉm cười vì đó là cử chỉ thể hiện sự đồng thuận và lòng mến khách rất dễ thương!',
    farmTripNote: 'Nụ cười thân thiện là chìa khóa vàng giúp bạn kết nối với những người dân bản địa hiền hậu tại hòn đảo này.'
  },

  // 7. Sức Khỏe & Trải Nghiệm
  {
    id: 'health-meds',
    category: 'health',
    categoryName: '💊 Thuốc Men & Sức Khỏe',
    title: 'Túi thuốc y tế cá nhân: Chống say xe, tiêu hóa & Xịt chống muỗi',
    priority: 'CẦN THIẾT',
    priorityColor: '#059669',
    desc: 'Cung đường đồi núi từ Kandy lên Nuwara Eliya và Ella quanh co nhiều khúc cua tay áo hơn cả đèo Đà Lạt, khách dễ say xe cần chuẩn bị thuốc say xe uống trước 30 phút. Chuẩn bị thêm men tiêu hóa, thuốc cảm sốt, băng Urgo và chai xịt chống côn trùng khi đi Safari Minneriya.',
    farmTripNote: 'Quý khách có bệnh lý mãn tính (huyết áp, tim mạch, tiểu đường) bắt buộc mang thuốc đặc trị theo người trong túi xách tay.'
  },
  {
    id: 'health-hotel-card',
    category: 'health',
    categoryName: '💊 Thuốc Men & Sức Khỏe',
    title: 'Lấy card visit khách sạn bỏ túi phòng trường hợp đi lạc',
    priority: 'AN TOÀN',
    priorityColor: '#0284c7',
    desc: 'Khi nhận phòng tại mỗi khách sạn, hãy ghé quầy lễ tân lấy 1 tấm namecard có in sẵn tên, địa chỉ và số điện thoại khách sạn. Nếu buổi tối đi dạo hoặc đi xe tuk tuk, chỉ cần đưa card cho tài xế là sẽ được chở về tận nơi an toàn.',
    farmTripNote: 'Không nên đi dạo một mình vào đêm khuya ở những khu vực vắng vẻ xa trung tâm.'
  },
  {
    id: 'exp-train-nine-arch',
    category: 'health',
    categoryName: '🚂 Trải Nghiệm & Cảnh Giác',
    title: 'Trải nghiệm tàu hỏa Nanu Oya – Ella & Cảnh giác thợ ảnh bản địa',
    priority: 'KINH NGHIỆM',
    priorityColor: '#f59e0b',
    desc: 'Tuyến tàu cao nguyên xuyên đồi chè chạy lướt qua Cầu Chín Nhịp (Nine Arch Bridge) rất nhanh chỉ trong vài giây. Hãy chuẩn bị máy ảnh ở cửa sổ từ sớm. Cảnh báo: Thợ chụp ảnh bản địa trên tàu hay chào giá 1.000 LKR chụp ảnh nhưng tay nghề rất ẩu, tốt nhất người trong đoàn tự chụp cho nhau.',
    farmTripNote: 'Khi đứng ở cửa tàu hỏa, luôn giữ chặt tay vịn, không nhoài hẳn người ra ngoài khi tàu đang chạy qua các khúc quanh hẹp.'
  }
];

// ── BẢN SO SÁNH 5 ĐIỂM KHÁC BIỆT THÚ VỊ VỚI VIỆT NAM ──
const SRI_LANKA_VS_VN = [
  {
    title: 'Lệch Múi Giờ (-1.5 Giờ)',
    icon: Clock,
    color: '#0284c7',
    sriLanka: 'Múi giờ GMT +5:30. Chậm hơn Việt Nam 1 tiếng 30 phút. Ví dụ VN 8h30 sáng thì Sri Lanka mới 7h00 sáng.',
    vietnam: 'Múi giờ GMT +7:00.',
    advice: 'Buổi sáng bên Sri Lanka dậy lúc 6h00 tương đương 7h30 giờ VN, nên cơ thể rất tỉnh táo. Cần ăn sáng sớm để xuất phát lúc 7h00 tránh kẹt xe.'
  },
  {
    title: 'Văn Hóa Đi Chân Trần',
    icon: Sparkles,
    color: '#d97706',
    sriLanka: '100% đền chùa, di tích Phật giáo bắt buộc cởi giày dép để ngoài, đi chân trần trên nền đá.',
    vietnam: 'Thường chỉ cởi giày dép khi bước vào chánh điện trong nhà.',
    advice: 'BẮT BUỘC mang 3-4 đôi tất/vớ loại dày để không bị bỏng rát chân khi đi trên sân đá phơi nắng nhiệt đới.'
  },
  {
    title: 'Khẩu Vị & Ẩm Thực',
    icon: Utensils,
    color: '#ea580c',
    sriLanka: 'Nấu đậm đà với nhiều bột cà ri, quế hồi, tiêu đen cay nồng và nước cốt dừa. Rất ít rau xanh luộc hay canh thanh.',
    vietnam: 'Khẩu vị thanh đạm, cân bằng âm dương, nhiều rau sống và nước mắm chấm.',
    advice: 'Nên mang theo chà bông, rong biển sấy, mì ly ăn dặm. Tận dụng buffet 4-5 sao với các quầy đồ Âu và trái cây tươi.'
  },
  {
    title: 'Ổ Cắm Điện 3 Chấu (Type D & G)',
    icon: AlertTriangle,
    color: '#ef4444',
    sriLanka: 'Hầu hết dùng ổ cắm 3 chấu tròn tam giác (Type D) hoặc 3 chấu vuông lớn kiểu Anh (Type G).',
    vietnam: 'Phổ biến ổ cắm 2 chấu tròn hoặc 2 chấu dẹp.',
    advice: 'Củ sạc thông thường ở VN hoàn toàn không cắm vừa. Bắt buộc đem theo củ chuyển đổi Universal Adapter.'
  },
  {
    title: 'Quy Tắc Đi Lại Bên Trái (Tay Lái Nghịch)',
    icon: Bus,
    color: '#059669',
    sriLanka: 'Giao thông theo tiêu chuẩn Anh quốc, xe cộ di chuyển bên trái đường (Left-hand drive).',
    vietnam: 'Di chuyển bên phải đường.',
    advice: 'Khi băng qua đường cần quan sát bên PHẢI trước, tuân thủ hướng dẫn của HDV và luôn đi trên vỉa hè.'
  }
];

// ── BẢNG DO\'S & DON\'TS TỔNG HỢP ──
const DOS_AND_DONTS = {
  dos: [
    'Luôn kiểm tra con dấu mộc nhập cảnh trong hộ chiếu ngay tại bốt hải quan sân bay Colombo.',
    'Mang theo 3–4 đôi vớ/tất loại dày để đi lại êm chân trên nền đá nóng trong đền chùa.',
    'Mặc trang phục kín đáo che vai và qua đầu gối khi viếng các di tích tôn giáo linh thiêng.',
    'Mặc đồ màu trắng thanh tịnh khi đến viếng Đền Xá Lợi Răng Phật tại Cố đô Kandy.',
    'Dùng TAY PHẢI hoặc cả 2 tay khi nhận dây chỉ chúc phúc, đưa tiền hoặc nhận đồ vật.',
    'Đổi sẵn nhiều tờ tiền lẻ mệnh giá 100 LKR để tiện trả phí vệ sinh và gửi giày dép.',
    'Uống nhiều nước đóng chai và thưởng thức dừa vua vàng Thambili giải nhiệt bổ dưỡng.',
    'Lấy card visit khách sạn bỏ vào ví ngay khi nhận phòng để phòng khi đi lạc.'
  ],
  donts: [
    'TUYỆT ĐỐI KHÔNG quay lưng selfie hoặc tạo dáng chụp ảnh quay lưng vào tượng Phật.',
    'TUYỆT ĐỐI KHÔNG bứt lá hay hái hoa trên cây Bồ Đề tổ (chỉ được nhặt lá đã rụng).',
    'TUYỆT ĐỐI KHÔNG uống nước trực tiếp từ vòi máy trong phòng tắm khách sạn.',
    'TUYỆT ĐỐI KHÔNG mang chai nước qua chốt an ninh cuối ra cửa máy bay sân bay Colombo.',
    'Không mang theo tiền mặt vượt quá 5.000 USD mà không làm thủ tục khai báo hải quan.',
    'Không mặc áo sát nách, quần đùi ngắn hoặc đồ ren xuyên thấu khi vào tham quan chùa chiền.',
    'Không nhoài hẳn người ra ngoài cửa sổ khi tàu hỏa cao nguyên đang chạy qua cầu Nine Arch.',
    'Không tách đoàn đi dạo một mình vào đêm muộn tại những khu vực đường vắng xa trung tâm.'
  ]
};

// ── CÁC MẪU TIN NHẮN ZALO CHO SALES & HDV (ONE-CLICK COPY) ──
const ZALO_TEMPLATES = [
  {
    id: 'zalo-prep',
    title: '1. Tin nhắn dặn dò chuẩn bị hành lý trước ngày khởi hành (Trước 3–5 ngày)',
    tag: 'Sales & CSKH',
    color: '#0284c7',
    content: `Chào anh/chị, FIT Tour xin gửi các lưu ý quan trọng chuẩn bị cho chuyến đi Sri Lanka sắp tới:
1. Giấy tờ: Hộ chiếu gốc còn hạn trên 6 tháng. Quý khách nhớ tải app "eTax Mobile" để kiểm tra thuế cá nhân trước khi đi ạ.
2. Ổ cắm điện: Sri Lanka dùng ổ cắm 3 chấu (Type D/G), anh/chị nhớ mang theo củ sạc đa năng (Adapter chuyển đổi) từ Việt Nam nhé.
3. Đền chùa: Bắt buộc mặc áo có tay, quần/váy dài qua gối. BẮT BUỘC chuẩn bị 3-4 đôi vớ/tất dày vì vào chùa phải đi chân trần trên nền đá nóng. Nếu có 1 bộ đồ màu trắng thì mặc ngày viếng Đền Răng Phật Kandy rất đẹp và trang nghiêm ạ.
4. Tiền bạc: Chuẩn bị 50-100 USD tiền mặt, sang sân bay Colombo bên em hướng dẫn đổi sang tiền Rupee (nhớ đổi nhiều tờ 100 LKR lẻ để tiện đi vệ sinh và gửi giày).
5. Ẩm thực: Đồ ăn nhiều gia vị cà ri, anh/chị có thể mang theo ít ruốc/chà bông, rong biển, mì ly ăn dặm.
Chúc anh/chị chuẩn bị hành lý chu đáo, hẹn gặp anh/chị tại sân bay ạ!`
  },
  {
    id: 'zalo-meeting',
    title: '2. Tin nhắn nhắc giờ tập trung tại sân bay Tân Sơn Nhất',
    tag: 'HDV gửi đoàn',
    color: '#059669',
    content: `Kính gửi Quý đoàn Sri Lanka FIT Tour:
Chuyến bay VJ1875 khởi hành lúc 18:15 ngày 10/10.
- Thời gian tập trung: Đúng 15:30 chiều nay.
- Địa điểm: Ga đi quốc tế Tầng 2, Sân bay Tân Sơn Nhất (Cột số 10-11, quầy Vietjet quốc tế).
- Trưởng đoàn hỗ trợ: Mrs. Thanh Tuyền - 0937.000.345.
Quý khách vui lòng cầm theo hộ chiếu gốc trên tay. Chúc cả đoàn mình có một chuyến đi bình an và tràn ngập niềm vui!`
  },
  {
    id: 'zalo-airport-exit',
    title: '3. Tin nhắn nhắc nhở chốt an ninh cuối tại sân bay Colombo khi bay về',
    tag: 'HDV nhắc ngày về',
    color: '#dc2626',
    content: `LƯU Ý QUAN TRỌNG TẠI SÂN BAY COLOMBO (CMB):
Cả nhà mình lưu ý: Trước khi bước qua chốt an ninh cuối cùng vào cửa ra máy bay (Gate Boarding):
1. Vui lòng uống hết nước hoặc bỏ chai nước tại đây vì nhân viên an ninh sẽ tịch thu toàn bộ chất lỏng.
2. Hãy đi vệ sinh ngay trước khi vào phòng chờ, vì phòng chờ boarding hoàn toàn KHÔNG CÓ NHÀ VỆ SINH và mình phải ngồi đợi khoảng 45-60 phút.
Quý khách kiểm tra lại hộ chiếu và thẻ lên máy bay trước khi vào gate nhé ạ!`
  }
];

// ── 12 CÂU HỎI THƯỜNG GẶP (FAQ ACCORDION) ──
const FAQ_LIST = [
  {
    q: 'Đi du lịch Sri Lanka có cần xin visa không và thủ tục như thế nào?',
    a: 'Có. Du khách Việt Nam cần có thị thực điện tử (ETA). Trong tour FIT Tour, công ty đã hỗ trợ xin visa trọn gói theo đoàn. Quý khách chỉ cần cung cấp ảnh chụp trang thông tin hộ chiếu (còn hạn trên 6 tháng). Bản visa điện tử sẽ được in sẵn và trao tận tay quý khách tại sân bay khởi hành.'
  },
  {
    q: 'Có đổi trực tiếp tiền Việt Nam (VND) sang tiền Rupee Sri Lanka (LKR) được không?',
    a: 'Không. Tiền đồng Việt Nam không được lưu hành hay quy đổi tại các ngân hàng hay quầy đổi tiền Sri Lanka. Quý khách cần đổi tiền Việt sang Đô la Mỹ (USD) từ Việt Nam, sau đó mang sang sân bay Colombo để đổi sang Rupee Sri Lanka (LKR) với tỷ giá niêm yết minh bạch (1 USD ~ 300 LKR).'
  },
  {
    q: 'Khách sạn tại Sri Lanka có trang bị bàn chải, kem đánh răng và máy sấy tóc không?',
    a: 'Các khách sạn và resort 4-5 sao trong tour FIT Tour đều trang bị khăn tắm, sữa tắm, dầu gội, máy sấy tóc và ấm đun nước. Tuy nhiên, theo xu hướng bảo vệ môi trường toàn cầu (hạn chế rác thải nhựa), bàn chải đánh răng và dao cạo râu thường không có sẵn trong phòng hoặc chất lượng đơn giản. Quý khách nên chủ động chuẩn bị bộ bàn chải và kem đánh răng cá nhân của mình.'
  },
  {
    q: 'Leo Pháo đài đá Sigiriya Lion Rock có mệt không? Người lớn tuổi có leo được không?',
    a: 'Sigiriya Lion Rock cao khoảng 200m so với mặt đất, gồm hơn 1.200 bậc thang bằng đá và cầu thang xoắn ốc bằng kim loại. Thời gian leo lên và xuống mất khoảng 2 - 2.5 tiếng. Đối với du khách lớn tuổi hoặc có tiền sử tim mạch, thoái hóa khớp gối, có thể chọn đi dạo tham quan khuôn viên vườn ngự uyển chân núi đá rất thoáng mát hoặc leo đến khu vực Bàn chân sư tử (Lion Paws - lưng chừng núi) rồi nghỉ ngơi ngắm cảnh mà không cần leo lên tận đỉnh.'
  },
  {
    q: 'Đồ ăn Sri Lanka có quá cay không? Người ăn chay hoặc ăn kiêng có dùng bữa được không?',
    a: 'Ẩm thực bản địa truyền thống khá cay và đậm vị cà ri. Tuy nhiên, toàn bộ thực đơn trong chương trình tour FIT Tour được phục vụ dưới hình thức Buffet tại các khách sạn 4-5 sao quốc tế và nhà hàng địa phương chọn lọc. Quầy buffet luôn có đa dạng món Á, đồ Âu (pasta, súp kem, khoai tây, bánh mì), quầy salad tươi và nhiều món rau củ chay thanh đạm nên người ăn chay hoặc ăn kiêng hoàn toàn yên tâm dùng bữa thoải mái.'
  },
  {
    q: 'Tại sao lại bắt buộc phải mang 3–4 đôi vớ/tất loại dày khi đi chùa?',
    a: 'Khi vào các khu di tích Phật giáo như Đền Hang Dambulla, Đền Răng Phật Kandy hay Chùa Gangaramaya, quý khách bắt buộc phải cởi toàn bộ giày dép gửi bên ngoài cổng và đi chân trần. Dưới cái nắng nhiệt đới buổi trưa, nền gạch đá hấp thụ nhiệt độ rất cao, nóng rát chân, kèm theo các hạt sỏi nhỏ sắc nhọn. Việc mang một đôi vớ dày bằng cotton sẽ giúp cách nhiệt, bảo vệ đôi chân êm ái và không bị đau rát suốt quá trình chiêm bái.'
  },
  {
    q: 'Sim 4G mua ở sân bay Colombo sóng có mạnh không? Vùng đồi núi có kết nối được không?',
    a: 'Rất mạnh. Mạng viễn thông Dialog là nhà mạng số 1 tại Sri Lanka với độ phủ sóng 4G/5G rất rộng khắp. Kể cả khi di chuyển qua các cung đường đồi núi cao nguyên Kandy - Ella hay đồn điền chè, sóng mạng vẫn duy trì ổn định để quý khách lướt web, gọi điện Zalo về Việt Nam và livestream chia sẻ khoảnh khắc đẹp.'
  },
  {
    q: 'Đi tàu hỏa cao nguyên Sri Lanka có được ngồi ghế riêng không?',
    a: 'FIT Tour đặt vé tàu hỏa toa ngồi có số ghế đàng hoàng cho du khách trên cung đường danh tiếng Nanu Oya - Ella. Tàu chạy chầm chậm xuyên qua những đồi chè xanh mướt và băng qua Cầu Chín Nhịp (Nine Arch Bridge) hùng vĩ. Quý khách nên chuẩn bị điện thoại và góc ngồi gần cửa sổ để bắt trọn những khung hình thiên nhiên ngoạn mục.'
  },
  {
    q: 'Du lịch Sri Lanka có an toàn không? Có xảy ra biểu tình hay bất ổn không?',
    a: 'Sri Lanka hiện tại rất an toàn, thanh bình và người dân vô cùng thân thiện mến khách. Tình hình kinh tế và chính trị đã ổn định vững chắc, ngành du lịch đang bùng nổ đón hàng triệu lượt khách quốc tế mỗi năm. Cảnh sát du lịch có mặt tại tất cả các điểm di sản để bảo đảm an ninh tối đa cho du khách.'
  },
  {
    q: 'Có cần tiêm phòng vaccine hay uống thuốc sốt rét trước khi đi không?',
    a: 'Không bắt buộc. Sri Lanka đã được Tổ chức Y tế Thế giới (WHO) công nhận loại trừ hoàn toàn bệnh sốt rét từ năm 2016. Quý khách chỉ cần chuẩn bị một chai xịt chống muỗi côn trùng thông thường khi đi Safari ngắm voi và mang theo các loại thuốc cảm mạo, tiêu hóa cá nhân.'
  },
  {
    q: 'Nên mua quà gì ý nghĩa và chất lượng nhất mang về tặng người thân?',
    a: '3 món quà nổi tiếng và ý nghĩa nhất của Sri Lanka gồm có: (1) Trà đen Ceylon thượng hạng (thương hiệu Dilmah, Basilur, Mlesna) với hương thơm tinh khiết; (2) Tinh dầu thảo dược và dầu xoa bóp Siddhalepa trứ danh; (3) Đá quý thiên nhiên (Sapphire xanh Ceylon) được chế tác tinh xảo tại các xưởng kim hoàn uy tín ở Kandy.'
  },
  {
    q: 'Nếu lỡ quên không mang củ sạc chuyển đổi 3 chấu thì có mua được bên đó không?',
    a: 'Có. Tại các khách sạn 4-5 sao quý khách có thể liên hệ quầy lễ tân để mượn củ chuyển đổi (Adapter). Ngoài ra, tại sân bay Colombo hoặc các cửa hàng tạp hóa tiện lợi ven đường cũng có bán các củ chuyển đổi 3 chấu với giá rất rẻ (khoảng 300 - 500 LKR ~ 25.000 - 40.000đ).'
  }
];

export default function SriLankaTravelChecklistPage() {
  const [activeTab, setActiveTab] = useState('checklist'); // 'checklist' | 'srilanka101' | 'dosdonts' | 'templates' | 'faq'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [checkedItems, setCheckedItems] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Load checklist state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('srilanka_travel_checklist_v1');
      if (saved) {
        setCheckedItems(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Cannot load checklist from localStorage', e);
    }
  }, []);

  // Save checklist state to localStorage
  const toggleItem = (id) => {
    setCheckedItems(prev => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('srilanka_travel_checklist_v1', JSON.stringify(updated));
      } catch (e) {
        console.warn('Cannot save checklist to localStorage', e);
      }
      return updated;
    });
  };

  const handleSelectAll = () => {
    const all = {};
    CHECKLIST_ITEMS.forEach(item => {
      all[item.id] = true;
    });
    setCheckedItems(all);
    try {
      localStorage.setItem('srilanka_travel_checklist_v1', JSON.stringify(all));
    } catch (e) {}
  };

  const handleClearAll = () => {
    setCheckedItems({});
    try {
      localStorage.removeItem('srilanka_travel_checklist_v1');
    } catch (e) {}
  };

  // Copy helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }).catch(err => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  // Calculate progress
  const totalCount = CHECKLIST_ITEMS.length;
  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Filter items
  const filteredItems = categoryFilter === 'all' 
    ? CHECKLIST_ITEMS 
    : CHECKLIST_ITEMS.filter(item => item.category === categoryFilter);

  return (
    <div className="srilanka-checklist-page">
      {/* ── STYLES SCOPED CHO TRANG ── */}
      <style>{`
        .srilanka-checklist-page {
          background: #f8fafc;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #0f172a;
          -webkit-text-size-adjust: 100%;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .sticky-tab-nav {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 95;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
        }

        @media (max-width: 768px) {
          .hero-banner-container {
            padding: 24px 16px 20px !important;
          }
          .hero-title {
            font-size: 1.45rem !important;
            line-height: 1.3 !important;
          }
          .hero-meta-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }
          .main-content-layout {
            padding: 0 14px !important;
            margin: 18px auto 50px !important;
          }
          .checklist-filter-bar {
            overflow-x: auto !important;
            flex-wrap: nowrap !important;
            padding-bottom: 6px !important;
          }
        }

        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: #fff !important;
          }
          .srilanka-checklist-page {
            background: #fff !important;
          }
        }
      `}</style>

      {/* ── 1. TOP BREADCRUMB & ACTION BAR ── */}
      <div className="no-print" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '10px 24px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
            <Link to="/tai-lieu" style={{ color: '#0284c7', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowLeft size={14} /> Tài liệu nội bộ
            </Link>
            <span>/</span>
            <Link to="/tai-lieu/bao-cao-farm-trip-sri-lanka" style={{ color: '#475569', textDecoration: 'none' }}>
              Sri Lanka
            </Link>
            <span>/</span>
            <span style={{ color: '#0f172a', fontWeight: 600 }}>Checklist Chuẩn Bị</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => window.print()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem', color: '#334155', cursor: 'pointer', fontWeight: 500 }}
            >
              <Printer size={14} /> In bản checklist
            </button>
            <Link 
              to="/tai-lieu/bao-cao-farm-trip-sri-lanka"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#0284c7', border: 'none', borderRadius: '6px', fontSize: '0.8rem', color: '#ffffff', textDecoration: 'none', fontWeight: 500 }}
            >
              <FileText size={14} /> Báo cáo Farm Trip 6N5Đ
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. HERO HEADER BANNER ── */}
      <div className="hero-banner-container" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%)', color: '#ffffff', padding: '36px 24px 30px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          {/* Tagline badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px', alignItems: 'center' }}>
            <span style={{ background: '#f59e0b', color: '#0f172a', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              FIT TOUR CẨM NANG HÀNH TRÌNH
            </span>
            <span style={{ background: 'rgba(255,255,255,0.15)', color: '#e2e8f0', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500 }}>
              Cập nhật thực địa 10/2026
            </span>
            <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#7dd3fc', border: '1px solid rgba(56, 189, 248, 0.4)', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
              Dành Cho Khách & Sales / HDV
            </span>
          </div>

          {/* Main Title */}
          <h1 className="hero-title" style={{ fontSize: '2.1rem', fontWeight: 800, lineHeight: 1.25, margin: '0 0 12px', color: '#ffffff', letterSpacing: '-0.5px' }}>
            Checklist & Những Điều Cần Biết Trước Khi Du Lịch Sri Lanka
          </h1>
          <p style={{ fontSize: '0.96rem', color: '#cbd5e1', margin: '0 0 24px', maxWidth: '900px', lineHeight: 1.6 }}>
            Tổng hợp toàn diện từ <strong>Hồ sơ Họp Đoàn FIT Tour</strong> và <strong>Khảo sát thực địa Farm Trip 6N5Đ</strong>. Giúp người mới đi lần đầu hiểu trọn vẹn văn hóa, chuẩn bị trang phục đền chùa đúng chuẩn, tránh các bẫy chi phí và tự tin tận hưởng hòn ngọc Ấn Độ Dương.
          </p>

          {/* Quick Fact Strip (6 ô thông số) */}
          <div className="hero-meta-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={12} color="#38bdf8" /> Múi giờ
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                GMT +5:30 <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 500 }}>(-1.5h so với VN)</span>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <DollarSign size={12} color="#4ade80" /> Tiền tệ
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                Rupee (LKR) <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: 500 }}>1 USD ~ 300 LKR</span>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <AlertTriangle size={12} color="#fbbf24" /> Ổ cắm điện
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                3 chấu Type D / G <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 500 }}>(Cần Adapter)</span>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sun size={12} color="#f97316" /> Thời tiết
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                24°C – 30°C <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>(Đồi cao 17-20°C)</span>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Plane size={12} color="#c084fc" /> Hàng không
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                Vietjet Airs <span style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 500 }}>7kg XT + 20kg KG</span>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Phone size={12} color="#34d399" /> Hotline 24/7
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                0836 999 909 <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 500 }}>(FIT TOUR)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. STICKY MAIN TAB NAVIGATION ── */}
      <div className="sticky-tab-nav no-print">
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', padding: '8px 16px' }} className="no-scrollbar">
          <button
            onClick={() => setActiveTab('checklist')}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'checklist' ? '#0284c7' : 'transparent',
              color: activeTab === 'checklist' ? '#ffffff' : '#475569',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <CheckSquare size={16} /> Checklist Chuẩn Bị ({completedCount}/{totalCount})
          </button>

          <button
            onClick={() => setActiveTab('srilanka101')}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'srilanka101' ? '#0284c7' : 'transparent',
              color: activeTab === 'srilanka101' ? '#ffffff' : '#475569',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <Compass size={16} /> Sri Lanka 101: 5 Khác Biệt
          </button>

          <button
            onClick={() => setActiveTab('dosdonts')}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'dosdonts' ? '#0284c7' : 'transparent',
              color: activeTab === 'dosdonts' ? '#ffffff' : '#475569',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <ShieldCheck size={16} /> Nên Làm & Cấm Kỵ (Do & Don't)
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'templates' ? '#0284c7' : 'transparent',
              color: activeTab === 'templates' ? '#ffffff' : '#475569',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <MessageSquare size={16} /> Mẫu Tin Nhắn Dặn Khách
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'faq' ? '#0284c7' : 'transparent',
              color: activeTab === 'faq' ? '#ffffff' : '#475569',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <HelpCircle size={16} /> 12 Câu Hỏi Thường Gặp
          </button>
        </div>
      </div>

      {/* ── 4. MAIN CONTENT CONTAINER ── */}
      <div className="main-content-layout" style={{ maxWidth: '1240px', margin: '24px auto 60px', padding: '0 20px' }}>
        
        {/* TAB 1: INTERACTIVE CHECKLIST */}
        {activeTab === 'checklist' && (
          <div>
            {/* Progress Card */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px 24px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                    Tiến độ hoàn thành: {completedCount} / {totalCount} mục ({progressPercent}%)
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                    {progressPercent === 100 
                      ? '🎉 Tuyệt vời! Bạn đã sẵn sàng 100% cho chuyến hành trình Sri Lanka!' 
                      : 'Hãy tích chọn từng mục khi bạn đã hoàn tất chuẩn bị để không bỏ sót.'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={handleSelectAll}
                    style={{ padding: '6px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem', color: '#334155', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Chọn tất cả
                  </button>
                  <button 
                    onClick={handleClearAll}
                    style={{ padding: '6px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem', color: '#dc2626', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${progressPercent}%`, 
                    height: '100%', 
                    background: progressPercent === 100 ? '#10b981' : 'linear-gradient(90deg, #0284c7, #38bdf8)', 
                    borderRadius: '999px',
                    transition: 'width 0.3s ease'
                  }} 
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="checklist-filter-bar no-scrollbar" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', overflowX: 'auto' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px', fontWeight: 600 }}>
                <Filter size={14} /> Lọc:
              </span>
              {[
                { id: 'all', label: 'Tất cả mục' },
                { id: 'docs', label: '🛂 Giấy tờ & Hải quan' },
                { id: 'luggage', label: '🧳 Hành lý & Vớ chùa' },
                { id: 'tech', label: '🔌 Ổ cắm & SIM số' },
                { id: 'money', label: '💵 Tiền lẻ & Tip' },
                { id: 'food', label: '🍛 Ẩm thực & Đồ khô' },
                { id: 'culture', label: '🛕 Đền chùa & Cấm kỵ' },
                { id: 'health', label: '💊 Sức khỏe & Tàu' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setCategoryFilter(f.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    border: '1px solid',
                    borderColor: categoryFilter === f.id ? '#0284c7' : '#e2e8f0',
                    background: categoryFilter === f.id ? '#0284c7' : '#ffffff',
                    color: categoryFilter === f.id ? '#ffffff' : '#475569',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Checklist Items Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
              {filteredItems.map(item => {
                const isChecked = !!checkedItems[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    style={{
                      background: isChecked ? '#f8fafc' : '#ffffff',
                      border: '1px solid',
                      borderColor: isChecked ? '#cbd5e1' : '#e2e8f0',
                      borderRadius: '12px',
                      padding: '18px 20px',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'flex-start',
                      boxShadow: isChecked ? 'none' : '0 2px 5px rgba(0,0,0,0.02)',
                      transition: 'all 0.15s ease',
                      position: 'relative'
                    }}
                  >
                    {/* Checkbox Icon */}
                    <div style={{ marginTop: '2px', color: isChecked ? '#0284c7' : '#94a3b8', flexShrink: 0 }}>
                      {isChecked ? (
                        <CheckSquare size={22} color="#0284c7" />
                      ) : (
                        <Square size={22} color="#94a3b8" />
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                        <span 
                          style={{ 
                            fontSize: '0.72rem', 
                            fontWeight: 700, 
                            padding: '2px 8px', 
                            borderRadius: '4px', 
                            background: `${item.priorityColor}15`, 
                            color: item.priorityColor,
                            border: `1px solid ${item.priorityColor}30`
                          }}
                        >
                          {item.priority}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                          {item.categoryName}
                        </span>
                      </div>

                      <div 
                        style={{ 
                          fontSize: '1.02rem', 
                          fontWeight: 700, 
                          color: isChecked ? '#64748b' : '#0f172a',
                          textDecoration: isChecked ? 'line-through' : 'none',
                          marginBottom: '6px'
                        }}
                      >
                        {item.title}
                      </div>

                      <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.55, marginBottom: item.farmTripNote ? '10px' : 0 }}>
                        {item.desc}
                      </div>

                      {/* Farm Trip Pro Tip Callout */}
                      {item.farmTripNote && (
                        <div 
                          style={{ 
                            background: '#f0fdf4', 
                            borderLeft: '3px solid #16a34a', 
                            padding: '8px 12px', 
                            borderRadius: '0 8px 8px 0', 
                            fontSize: '0.83rem', 
                            color: '#166534',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Sparkles size={14} color="#16a34a" style={{ flexShrink: 0 }} />
                          <span><strong>Mẹo thực tế Farm Trip:</strong> {item.farmTripNote}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: SRI LANKA 101 */}
        {activeTab === 'srilanka101' && (
          <div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
                Sri Lanka 101: 5 Khác Biệt Lớn Nhất Khách Việt Cần Nắm Rõ
              </h2>
              <p style={{ fontSize: '0.92rem', color: '#475569', margin: '0 0 20px', lineHeight: 1.6 }}>
                Sri Lanka là quốc đảo Phật giáo Nam truyền (Theravada) nằm tại vịnh Bengal, Ấn Độ Dương. Dù có nhiều nét tương đồng về khí hậu nhiệt đới, nhưng văn hóa, phong tục sinh hoạt và quy tắc tôn giáo có những nét rất độc đáo. Hiểu trước những điểm này sẽ giúp chuyến đi của bạn thư thái và trọn vẹn nhất.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                {SRI_LANKA_VS_VN.map((item, idx) => {
                  const IconComp = item.icon;
                  return (
                    <div 
                      key={idx}
                      style={{ 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '12px', 
                        padding: '18px 20px', 
                        background: '#f8fafc',
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        gap: '16px',
                        alignItems: 'flex-start'
                      }}
                    >
                      <div 
                        style={{ 
                          width: '42px', 
                          height: '42px', 
                          borderRadius: '10px', 
                          background: `${item.color}15`, 
                          color: item.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <IconComp size={22} />
                      </div>

                      <div>
                        <div style={{ fontSize: '1.08rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                          {idx + 1}. {item.title}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                          <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#0284c7', fontWeight: 700, marginBottom: '4px' }}>
                              🇱🇰 Tại Sri Lanka
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                              {item.sriLanka}
                            </div>
                          </div>

                          <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>
                              🇻🇳 Tại Việt Nam
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                              {item.vietnam}
                            </div>
                          </div>
                        </div>

                        {/* Practical Advice */}
                        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', color: '#065f46' }}>
                          <strong>💡 Lời khuyên cho bạn:</strong> {item.advice}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cung đường hành trình mẫu 6N5Đ */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 14px' }}>
                🗺️ Cung Đường Hành Trình Độc Bản 6N5Đ FIT Tour
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {[
                  { day: 'Ngày 1', name: 'TP.HCM → Negombo', desc: 'Bay Vietjet thẳng, đáp sân bay CMB, check-in resort biển Negombo.' },
                  { day: 'Ngày 2', name: 'Negombo → Sigiriya', desc: 'Leo Pháo đài đá Sigiriya Lion Rock di sản & Jeep Safari ngắm voi hoang dã.' },
                  { day: 'Ngày 3', name: 'Sigiriya → Kandy', desc: 'Đền Hang Dambulla, viếng Xá Lợi Răng Phật & dạo cano Hồ Kandy.' },
                  { day: 'Ngày 4', name: 'Kandy → Nuwara Eliya → Ella', desc: 'Đồi chè Ceylon, đi tàu hỏa cao nguyên & khách sạn sương mây Morning Dew.' },
                  { day: 'Ngày 5', name: 'Ella → Galle', desc: 'Cầu Chín Nhịp (Nine Arch Bridge), Pháo đài Galle & Radisson Blu 5★ sát biển.' },
                  { day: 'Ngày 6', name: 'Galle → Colombo → TP.HCM', desc: 'Nghi lễ gia trì Chùa Gangaramaya, City Tour thủ đô & bay đêm về VN.' }
                ].map((d, i) => (
                  <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                    <span style={{ background: '#0284c7', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                      {d.day}
                    </span>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '8px 0 4px' }}>
                      {d.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.45 }}>
                      {d.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DO'S & DON'TS */}
        {activeTab === 'dosdonts' && (
          <div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
                Bảng Quy Tắc Hành Xử: Nên Làm (Do's) & Cấm Kỵ Tuyệt Đối (Don'ts)
              </h2>
              <p style={{ fontSize: '0.92rem', color: '#475569', margin: '0 0 24px', lineHeight: 1.6 }}>
                Ghi nhớ các quy tắc này sẽ giúp bạn tránh khỏi những rắc rối pháp lý, không vi phạm tín ngưỡng tôn giáo của người dân sở tại và trở thành một vị khách văn minh, được người bản địa hết lòng yêu mến.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {/* CỘT NÊN LÀM */}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#166534' }}>
                    <CheckCircle2 size={24} color="#16a34a" />
                    <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>NÊN LÀM (DO'S)</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                    {DOS_AND_DONTS.dos.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                        <span style={{ color: '#16a34a', fontWeight: 700, marginTop: '2px' }}>✓</span>
                        <span style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.5 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CỘT CẤM KỴ */}
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#991b1b' }}>
                    <XCircle size={24} color="#dc2626" />
                    <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>CẤM KỴ TUYỆT ĐỐI (DON'TS)</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                    {DOS_AND_DONTS.donts.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                        <span style={{ color: '#dc2626', fontWeight: 700, marginTop: '2px' }}>✕</span>
                        <span style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.5 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MẪU TIN NHẮN */}
        {activeTab === 'templates' && (
          <div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Mẫu Soạn Tin Nhắn Nhanh Gửi Zalo Cho Khách Hàng
                </h2>
                <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.78rem', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
                  Sao chép 1 chạm (Click to Copy)
                </span>
              </div>
              <p style={{ fontSize: '0.92rem', color: '#475569', margin: '0 0 20px', lineHeight: 1.6 }}>
                Các mẫu tin nhắn chuẩn hóa câu từ, đã chắt lọc đầy đủ các lưu ý sống còn (vớ chùa, củ sạc Type D/G, đổi tiền lẻ, chốt an ninh sân bay). Sales và HDV chỉ cần bấm Copy và gửi cho khách trước và trong chuyến đi.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '18px' }}>
                {ZALO_TEMPLATES.map(tpl => (
                  <div key={tpl.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: `${tpl.color}15`, color: tpl.color, fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>
                          {tpl.tag}
                        </span>
                        <span style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a' }}>
                          {tpl.title}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopy(tpl.content, tpl.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          background: copiedId === tpl.id ? '#10b981' : '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {copiedId === tpl.id ? <Check size={14} /> : <Copy size={14} />}
                        {copiedId === tpl.id ? 'Đã sao chép!' : 'Sao chép tin nhắn'}
                      </button>
                    </div>

                    <pre 
                      style={{ 
                        background: '#ffffff', 
                        border: '1px solid #cbd5e1', 
                        borderRadius: '8px', 
                        padding: '14px 16px', 
                        fontSize: '0.86rem', 
                        color: '#1e293b', 
                        whiteSpace: 'pre-wrap', 
                        fontFamily: 'inherit',
                        lineHeight: 1.6,
                        margin: 0
                      }}
                    >
                      {tpl.content}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: 12 CÂU HỎI THƯỜNG GẶP */}
        {activeTab === 'faq' && (
          <div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
                12 Câu Hỏi Thường Gặp Của Khách Du Lịch Lần Đầu Đến Sri Lanka
              </h2>
              <p style={{ fontSize: '0.92rem', color: '#475569', margin: '0 0 20px', lineHeight: 1.6 }}>
                Giải đáp chi tiết tất cả các băn khoăn về visa, tiền tệ, ăn uống, thể lực leo núi Sigiriya và kết nối 4G.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                {FAQ_LIST.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div 
                      key={idx}
                      style={{ 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '10px', 
                        overflow: 'hidden',
                        background: isOpen ? '#f8fafc' : '#ffffff',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '16px 20px',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px'
                        }}
                      >
                        <span style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a' }}>
                          {idx + 1}. {faq.q}
                        </span>
                        <span style={{ color: '#64748b', flexShrink: 0 }}>
                          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </span>
                      </button>

                      {isOpen && (
                        <div style={{ padding: '0 20px 18px', fontSize: '0.9rem', color: '#475569', lineHeight: 1.65, borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── 5. LIÊN HỆ HỖ TRỢ KHẨN CẤP FOOTER STRIP ── */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
              Cần Tư Vấn Thêm Hoặc Hỗ Trợ Khẩn Cấp?
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
              Đội ngũ điều hành & Hướng dẫn viên FIT Tour luôn túc trực 24/7 đồng hành cùng quý khách.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <a 
              href="tel:0836999909"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#0284c7', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600 }}
            >
              <Phone size={15} /> Hotline: 0836 999 909
            </a>
            <a 
              href="tel:0937000345"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600 }}
            >
              Mrs. Thanh Tuyền (HDV): 0937.000.345
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
