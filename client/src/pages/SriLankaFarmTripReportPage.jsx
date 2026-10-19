import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Star, 
  Compass, 
  Bus, 
  Hotel, 
  Utensils, 
  Camera, 
  Award, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  Copy, 
  Check, 
  Info, 
  Sparkles, 
  Printer, 
  ArrowRight, 
  ExternalLink, 
  Plane, 
  Train, 
  Mountain, 
  Waves, 
  DollarSign, 
  Coffee, 
  FileText, 
  ArrowLeft,
  Navigation,
  CloudRain,
  Sun,
  ShieldCheck,
  FolderOpen,
  LayoutGrid,
  Columns
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ── TOÀN BỘ LINK TÀI LIỆU & THƯ VIỆN ẢNH KHẢO SÁT (GOOGLE DOC & GOOGLE DRIVE) ──
const SURVEY_RESOURCES = {
  originalGoogleDoc: {
    title: 'FIT TOUR | Đánh giá tổng quan FARM Trip Sri Lanka',
    subtitle: '10–15/10/2026 | 6 ngày 5 đêm | Đối tác: Victoria Tour Sri Lanka',
    url: 'https://docs.google.com/document/d/1dGAI7RR5ui-3mAOIHJZlufE_DVrs1ndoz6pUkIQA5G0/edit?tab=t.0'
  },
  overviewAlbums: [
    {
      id: 'transport',
      title: 'Xe & Di Chuyển',
      desc: 'Toàn bộ ảnh xe 45 chỗ thực tế, đường đèo Kandy - Ella và ga tàu',
      url: 'https://drive.google.com/drive/folders/1zvjCZrNvqQwwwtafcj_NYnparAZ3HRwR',
      icon: Bus,
      color: '#0284c7',
      count: '32+ file'
    },
    {
      id: 'hotels',
      title: 'Khách Sạn & Resort',
      desc: 'Toàn bộ ảnh lưu trú, phòng ngủ, tiện ích, bữa tối và buffet sáng tại khách sạn',
      url: 'https://drive.google.com/drive/folders/1WcD_8Bz_re2z-pba5CfVsC6bFQgIdT7k',
      icon: Hotel,
      color: '#059669',
      count: '68+ file'
    },
    {
      id: 'dining',
      title: 'Ăn Uống & Bữa Ăn',
      desc: 'Toàn bộ ảnh các bữa ăn, nhà hàng, đặc sản bánh Hopper và thực tế khẩu vị',
      url: 'https://drive.google.com/drive/folders/1XqHzlagbt_nyi_Ql_8plG6j2NQqhLM39',
      icon: Utensils,
      color: '#ea580c',
      count: '45+ file'
    }
  ],
  hotelAlbums: [
    { day: 1, name: 'Pledge Scape Negombo', location: 'Negombo', stars: '4-5★', url: 'https://drive.google.com/drive/folders/1u2U93DzioBOYa9BCx0DTMV6JqP3iafLJ' },
    { day: 2, name: 'Fresco Water Villa', location: 'Sigiriya', stars: '4★', url: 'https://drive.google.com/drive/folders/1vZb0m_HyDjbeeuGs_AlKHy4yIWmcw5HK' },
    { day: 3, name: 'Radisson Hotel Kandy', location: 'Kandy', stars: '4-5★', url: 'https://drive.google.com/drive/folders/17l7xMkHFHG2kasEH2MRCvIeLmF-CYlXI' },
    { day: 4, name: 'Morning Dew Hotel', location: 'Ella', stars: '4★ View Mây', url: 'https://drive.google.com/drive/folders/1JtnwYd4tZtpAm-G7LxOhx9MY_uliMwke' },
    { day: 5, name: 'Radisson Blu Resort Galle', location: 'Galle', stars: '5★ Sát Biển', url: 'https://drive.google.com/drive/folders/1lOG4DiOMS0xQ2C064Zbc29L7F5jg-qpT' }
  ],
  mealAlbums: [
    { day: 1, label: 'Trưa Ngày 1', note: 'Thư mục ảnh trưa N1', url: 'https://drive.google.com/drive/folders/16qSWvmo7qAfVcQVYBl0M0_HDzUF9IP0r' },
    { day: 2, label: 'Trưa Ngày 2', note: 'Nhà hàng địa phương Sigiriya', url: 'https://drive.google.com/drive/folders/1tEHeygW1l8vaA8HRyquEoiohsYTvxurz' },
    { day: 3, label: 'Trưa Ngày 3', note: 'Cung Dambulla – Kandy', url: 'https://drive.google.com/drive/folders/1Wkv7BJFPkuLLqoI1oQPwUFQB24umIyoj' },
    { day: 4, label: 'Trưa Ngày 4', note: 'Nhà hàng gần ga Nanu Oya', url: 'https://drive.google.com/drive/folders/1nzZV9QvyLw2eQhDOXJ98dhuYBh3C-HUX' },
    { day: 5, label: 'Trưa Ngày 5', note: 'Đường đi Galle', url: 'https://drive.google.com/drive/folders/1SWtXC2qqtzI7U58rZfr0N2ausLz7Z47o' },
    { day: 6, label: 'Trưa Ngày 6', note: 'Oak Ray Flower Drum Colombo', url: 'https://drive.google.com/drive/folders/1Ka9XEOyIz6WAhKkShUWrrOfrOeI6JHFx' },
    { day: 6, label: 'Ăn Tối Ngày 6', note: 'Nhà hàng trước khi ra sân bay CMB', url: 'https://drive.google.com/drive/folders/1JVmT5xQSxrG9ESLTzGvSegYZ-Xnenisp' }
  ]
};

// ── Dữ liệu 6 Ngày Hành Trình Thực Địa ──
const ITINERARY_DAYS = [
  {
    day: 1,
    date: '10/10/2026',
    route: 'TP.HCM → Colombo (CMB) → Negombo',
    hotel: 'Pledge Scape Negombo (4-5★)',
    distance: '~15 km từ sân bay về khách sạn',
    duration: 'Chuyến bay quốc tế + 30-45 phút xe',
    hotelDriveUrl: 'https://drive.google.com/drive/folders/1u2U93DzioBOYa9BCx0DTMV6JqP3iafLJ',
    lunchDriveUrl: 'https://drive.google.com/drive/folders/16qSWvmo7qAfVcQVYBl0M0_HDzUF9IP0r',
    highlights: ['Nhập cảnh sân bay quốc tế Bandaranaike (CMB)', 'Mua SIM & đổi tiền Rupee', 'Check-in khách sạn biển Negombo'],
    meals: {
      breakfast: 'Tự túc tại Việt Nam',
      lunch: 'Trên máy bay / Transit (Thư mục ảnh trưa N1)',
      dinner: 'Tự túc đêm muộn (Hàng quán đóng cửa sớm)'
    },
    keyAlert: 'Chuyến bay hạ cánh muộn, các cửa hàng tại Negombo đóng cửa sớm lúc 19:00 - 20:00. Khách sạn không có sẵn bữa tối.',
    details: [
      {
        title: 'Thủ tục Nhập Cảnh Sân Bay Bandaranaike (CMB)',
        icon: Plane,
        tag: 'Hải quan & Giấy tờ',
        tagColor: '#3b82f6',
        desc: 'Kiểm tra hộ chiếu và visa điện tử (ETA). Lưu ý tử huyệt: BẮT BUỘC kiểm tra mộc nhập cảnh trong hộ chiếu ngay tại quầy xuất nhập cảnh trước khi rời đi, vì thực tế từng có ca nhân viên hải quan quên đóng dấu.',
        actionFor: 'HDV & Khách'
      },
      {
        title: 'Mua SIM Dữ Liệu & Đổi Ngoại Tệ',
        icon: DollarSign,
        tag: 'Tiết kiệm chi phí',
        tagColor: '#10b981',
        desc: 'SIM vật lý tại sân bay rẻ hơn 2-3 lần so với mua eSIM trên mạng trước: Quầy SIM nằm bên PHẢI sảnh đến (Dialog: 20GB $5, 50GB $10; Mobitel: 30GB $7, 50GB $10). Quầy đổi tiền nằm bên TRÁI sảnh đến. Gợi ý khách đổi 50-100 USD sang Rupee (LKR) và chuẩn bị sẵn nhiều tờ 100 LKR.',
        actionFor: 'Sales & HDV'
      },
      {
        title: 'Nghỉ Đêm Tại Negombo & Cảnh Báo Bữa Tối',
        icon: Hotel,
        tag: 'Hậu cần tour',
        tagColor: '#f97316',
        desc: 'Đoàn đến Pledge Scape Negombo khá muộn sau thủ tục sân bay. Khu vực xung quanh không còn hàng quán mở cửa. Khách cần được dặn ăn no trước khi bay hoặc mang sẵn mì gói, snack từ Việt Nam.',
        actionFor: 'Sales & Điều hành'
      }
    ]
  },
  {
    day: 2,
    date: '11/10/2026',
    route: 'Negombo → Sigiriya',
    hotel: 'Fresco Water Villa (Sigiriya)',
    distance: '~150 km',
    duration: '~4 - 4.5 tiếng di chuyển',
    hotelDriveUrl: 'https://drive.google.com/drive/folders/1vZb0m_HyDjbeeuGs_AlKHy4yIWmcw5HK',
    lunchDriveUrl: 'https://drive.google.com/drive/folders/1tEHeygW1l8vaA8HRyquEoiohsYTvxurz',
    highlights: ['Pháo đài đá Sigiriya Lion Rock (Di sản UNESCO)', 'Minneriya Jeep Safari ngắm voi hoang dã'],
    meals: {
      breakfast: 'Buffet tại Pledge Scape Negombo',
      lunch: 'Nhà hàng địa phương khu vực Sigiriya',
      dinner: 'Tại khách sạn Fresco Water Villa'
    },
    keyAlert: 'Leo Sigiriya Rock đòi hỏi thể lực rất cao (mất hơn 2 tiếng bậc thang dốc). Đối với khách lớn tuổi cần cân nhắc kỹ.',
    details: [
      {
        title: 'Chinh Phục Pháo Đài Đá Sigiriya (Lion Rock)',
        icon: Mountain,
        tag: 'Hoạt động thể lực nặng nhất',
        tagColor: '#ef4444',
        desc: 'Thời gian đi bộ, leo lên và xuống núi mất hơn 2 - 2.5 tiếng. Đường leo có nhiều bậc thang hẹp và các đoạn dốc đứng rất mất sức. Cần khuyến nghị khách mang giày trekking êm chân, gậy hỗ trợ và 1 chai nước khoáng.',
        actionFor: 'Sales dặn khách'
      },
      {
        title: 'Minneriya Jeep Safari Ngắm Đàn Voi Tự Nhiên',
        icon: Compass,
        tag: 'Trải nghiệm thiên nhiên',
        tagColor: '#059669',
        desc: 'Xe jeep chuyên dụng chở khách vào công viên quốc gia (mất 20 phút di chuyển vào trung tâm). Khung giờ vàng lý tưởng nhất để đàn voi tụ họp là 15:30 - 16:30. Thời lượng 2 tiếng là vừa đủ để ngắm voi và chim công hoang dã.',
        actionFor: 'Điều hành xếp giờ'
      }
    ]
  },
  {
    day: 3,
    date: '12/10/2026',
    route: 'Sigiriya → Dambulla → Kandy',
    hotel: 'Radisson Hotel Kandy (4-5★)',
    distance: '~95 km',
    duration: '~3 tiếng xe đồi núi',
    hotelDriveUrl: 'https://drive.google.com/drive/folders/17l7xMkHFHG2kasEH2MRCvIeLmF-CYlXI',
    lunchDriveUrl: 'https://drive.google.com/drive/folders/1Wkv7BJFPkuLLqoI1oQPwUFQB24umIyoj',
    highlights: ['Đền hang Dambulla & Cây Bồ Đề tổ', 'Đền Răng Phật Sri Dalada Maligawa', 'Dạo cano điện Hồ Kandy'],
    meals: {
      breakfast: 'Buffet tại Fresco Water Villa',
      lunch: 'Nhà hàng địa phương trên cung Dambulla - Kandy',
      dinner: 'Buffet tại Radisson Hotel Kandy'
    },
    keyAlert: 'Vào đền chùa bắt buộc tháo giày, nền đá phơi nắng rất nóng và đau chân. Cần 2-3 đôi vớ dày mềm!',
    details: [
      {
        title: 'Đền Hang Dambulla Cave Temple & Cây Bồ Đề Tổ',
        icon: Sparkles,
        tag: 'Tâm linh Phật giáo',
        tagColor: '#8b5cf6',
        desc: 'Quần thể hang động Phật giáo cổ kính với hàng trăm tượng Phật và bích họa. Có cây bồ đề quý được chiết cành từ cây bồ đề tổ: Khách có thể nhặt lá rụng làm kỷ niệm cầu an, tuyệt đối KHÔNG bứt lá trên cây. Cần leo bậc thang và tháo giày đi trên nền đá nóng.',
        actionFor: 'HDV dẫn chuyện'
      },
      {
        title: 'Đền Răng Phật (Sri Dalada Maligawa - Kandy)',
        icon: Sparkles,
        tag: 'Thánh địa linh thiêng nhất',
        tagColor: '#d97706',
        desc: 'Nơi lưu giữ Xá lợi Răng Phật linh thiêng của đất nước. Bắt buộc trang phục kín đáo qua đầu gối và phủ vai, tháo giày dép. Không khí hành lễ rất trang nghiêm cùng tiếng trống truyền thống. Lưu ý không gian thờ tự được bảo vệ nghiêm ngặt, khách không thấy trực tiếp răng Phật.',
        actionFor: 'Quy tắc trang phục'
      },
      {
        title: 'Dạo Thuyền Cano Điện Trên Hồ Kandy',
        icon: Waves,
        tag: 'Ngắm cảnh thành phố',
        tagColor: '#0284c7',
        desc: 'Chuyến cano điện 15-20 phút ngắm toàn cảnh cố đô Kandy từ mặt hồ. Lưu ý hạn chế sức chứa: Mỗi cano chỉ chở tối đa 12 khách/lần, nếu đoàn đông từ 20-30 khách phải chia làm 2 lượt luân phiên.',
        actionFor: 'Hậu cần điều phối'
      }
    ]
  },
  {
    day: 4,
    date: '13/10/2026',
    route: 'Kandy → Nanu Oya → Ella',
    hotel: 'Morning Dew Hotel (Ella - View mây núi)',
    distance: '~140 km đường đèo',
    duration: '~5 - 6 tiếng cả đi xe và đi tàu',
    hotelDriveUrl: 'https://drive.google.com/drive/folders/1JtnwYd4tZtpAm-G7LxOhx9MY_uliMwke',
    lunchDriveUrl: 'https://drive.google.com/drive/folders/1nzZV9QvyLw2eQhDOXJ98dhuYBh3C-HUX',
    highlights: ['Cung đường đồi chè cao nguyên', 'Trải nghiệm tàu hỏa Nanu Oya - Ella', 'Khách sạn Morning Dew sương mây bồng bềnh'],
    meals: {
      breakfast: 'Buffet tại Radisson Kandy',
      lunch: 'Nhà hàng địa phương gần ga Nanu Oya',
      dinner: 'Tại Morning Dew Hotel'
    },
    keyAlert: 'Tàu chạy ngang Cầu Chín Nhịp (Nine Arch Bridge) rất nhanh và không dừng. Chỉ 1-2 người kịp chụp ảnh ở cửa sổ.',
    details: [
      {
        title: 'Chuyến Tàu Cao Nguyên Nanu Oya – Ella',
        icon: Train,
        tag: 'Tuyến tàu danh tiếng',
        tagColor: '#0d9488',
        desc: 'Hành trình tàu hỏa kéo dài khoảng 40 phút xuyên qua những đồi trà xanh ngát. Tàu chạy lướt qua Nine Arch Bridge chỉ trong vài giây. Đoàn đông sẽ không thể cùng chụp được. Thợ chụp ảnh địa phương trên tàu báo giá 1.000 LKR, có thể mặc cả xuống 300 LKR nhưng chụp rất tệ, tốt nhất người trong đoàn tự chụp cho nhau.',
        actionFor: 'Trải nghiệm thực tế'
      },
      {
        title: 'Đêm Nghỉ Tại Khách Sạn Morning Dew (Ella)',
        icon: Hotel,
        tag: 'View sương mây Đà Lạt',
        tagColor: '#6366f1',
        desc: 'Nằm trên sườn đồi nhìn xuống thung lũng sương mây tuyệt đẹp, có hồ bơi chân mây để check-in. Điểm trừ: Đường lên dốc gắt, xe lớn không lên được, phải dùng xe trung chuyển hoặc nhờ khách sạn đưa đón.',
        actionFor: 'Phương án xe'
      }
    ]
  },
  {
    day: 5,
    date: '14/10/2026',
    route: 'Ella → Cầu Chín Nhịp → Ravana → Koggala → Galle',
    hotel: 'Radisson Blu Resort Galle (5★ Quốc tế sát biển)',
    distance: '~190 km',
    duration: '~5 tiếng di chuyển và tham quan',
    hotelDriveUrl: 'https://drive.google.com/drive/folders/1lOG4DiOMS0xQ2C064Zbc29L7F5jg-qpT',
    lunchDriveUrl: 'https://drive.google.com/drive/folders/1SWtXC2qqtzI7U58rZfr0N2ausLz7Z47o',
    highlights: ['Đi Tuk Tuk săn ảnh Cầu Chín Nhịp', 'Thác Ravana', 'Nghệ thuật câu cá cà kheo Koggala', 'Di sản Thành Cổ Galle Fort'],
    meals: {
      breakfast: 'Buffet tại Morning Dew Ella',
      lunch: 'Nhà hàng địa phương trên đường đi Galle',
      dinner: 'Buffet/Set menu tại resort Galle'
    },
    keyAlert: 'Câu cá cà kheo là biểu diễn chụp ảnh có thu phí (deal 500 LKR). Thành cổ Galle đẹp nhất khi dạo bộ lúc hoàng hôn.',
    details: [
      {
        title: 'Sáng Sớm Đi Tuk Tuk Quay Lại Cầu Chín Nhịp',
        icon: Camera,
        tag: 'Góc chụp biểu tượng',
        tagColor: '#e11d48',
        desc: 'Vì hôm trước ngồi tàu lướt quá nhanh, sáng nay đoàn thuê tuk tuk (15 phút, giá thương lượng 2.000 LKR / 3 người / xe khứ hồi) xuống sát chân cầu để tự do tạo dáng, ngắm trọn vẹn kết cấu đá và vòm cầu ngoạn mục.',
        actionFor: 'Khắc phục tuyến'
      },
      {
        title: 'Thác Nước Ravana Falls & Câu Cá Cà Kheo Koggala',
        icon: Waves,
        tag: 'Văn hóa bản địa độc đáo',
        tagColor: '#0284c7',
        desc: 'Thác Ravana nằm sát trục đường chính, dừng chân 15-20 phút ngắm cảnh. Tại biển Koggala, những ngư dân trên cà kheo chủ yếu diễn để chụp ảnh du lịch: Cần thương lượng giá trước khi chụp (báo giá ban đầu 3.000 LKR, có thể deal còn 500 LKR).',
        actionFor: 'Chi phí phát sinh'
      },
      {
        title: 'Khám Phá Di Sản UNESCO Phố Cổ & Hải Đăng Galle Fort',
        icon: Compass,
        tag: 'Điểm nhấn đặc sắc nhất ngày',
        tagColor: '#d97706',
        desc: 'Khu thành cổ phong cách thuộc địa Bồ Đào Nha - Hà Lan bên bờ biển Ấn Độ Dương. Gồm ngọn hải đăng trắng Galle Lighthouse, tường thành đá cổ, phố đi bộ đầy quán cà phê boutique và ngắm hoàng hôn rực rỡ.',
        actionFor: 'Trải nghiệm đỉnh cao'
      },
      {
        title: 'Nghỉ Dưỡng 5 Sao Đẳng Cấp Tại Radisson Blu Resort Galle',
        icon: Hotel,
        tag: 'Resort xuất sắc nhất',
        tagColor: '#059669',
        desc: 'Không gian resort 5 sao quốc tế sát bãi biển, hồ bơi vô cực rộng thênh thang mở cửa 07:00 - 19:00. BẮT BUỘC phải sắp xếp cho đoàn về khách sạn sớm để khách tận hưởng hồ bơi và bãi biển riêng.',
        actionFor: 'Điểm cộng vàng'
      }
    ]
  },
  {
    day: 6,
    date: '15/10/2026',
    route: 'Galle → Mount Lavinia → Colombo → Sân bay CMB → TP.HCM',
    hotel: 'Bay về Việt Nam (Chuyến bay đêm)',
    distance: '~160 km đường cao tốc + City tour',
    duration: '~2.5 tiếng cao tốc về thủ đô',
    lunchDriveUrl: 'https://drive.google.com/drive/folders/1Ka9XEOyIz6WAhKkShUWrrOfrOeI6JHFx',
    dinnerDriveUrl: 'https://drive.google.com/drive/folders/1JVmT5xQSxrG9ESLTzGvSegYZ-Xnenisp',
    highlights: ['Buffet sáng 5 sao Radisson Blu', 'Nghi lễ ban phước Tháp Xá Lợi Chùa Gangaramaya', 'Xuất cảnh sân bay Colombo'],
    meals: {
      breakfast: 'Buffet sáng đỉnh cao tại Radisson Blu Galle',
      lunch: 'Nhà hàng Oak Ray Flower Drum (Trung bình)',
      dinner: 'Nhà hàng địa phương gần sân bay Colombo'
    },
    keyAlert: 'Trời mưa lớn làm hủy hầu hết các điểm ngoài trời ở Colombo. Sân bay CMB bắt buộc bỏ chai nước tại cổng boarding!',
    details: [
      {
        title: 'Đề Xuất Dời Giờ Rời Resort Galle Lúc 10:00 - 11:00',
        icon: Sun,
        tag: 'Tối ưu trải nghiệm nghỉ dưỡng',
        tagColor: '#10b981',
        desc: 'Buffet sáng tại Radisson Blu rất đa dạng và ngon miệng. Do chuyến bay về khởi hành lúc 23:00 đêm và Colombo không cần quá nhiều thời gian, nên cho khách ngủ đẫy giấc, thảnh thơi bơi lội và ăn sáng, rời resort lúc 10h-11h thay vì lùa khách đi sớm.',
        actionFor: 'Chiến lược lịch trình'
      },
      {
        title: 'Lễ Gia Trì & Buộc Dây Cầu Nguyện Tại Chùa Gangaramaya',
        icon: Sparkles,
        tag: 'Điểm nhấn tâm linh xúc động',
        tagColor: '#7c3aed',
        desc: 'Ngôi chùa cổ kính và giàu hiện vật nhất Colombo. Đoàn được sư thầy trụ trì hướng dẫn đi vòng quanh Tháp Xá Lợi Tóc, tụng kinh cầu an và làm lễ buộc dây chỉ chúc phúc. Kinh nghiệm: Luôn dùng TAY PHẢI khi đón nhận chỉ và chuẩn bị sẵn chuỗi hạt cá nhân để nhờ sư thầy gia trì.',
        actionFor: 'HDV lưu ý văn hóa'
      },
      {
        title: 'Thực Tế City Tour Colombo & Bài Học Phương Án Khi Mưa',
        icon: CloudRain,
        tag: 'Rủi ro thời tiết',
        tagColor: '#ef4444',
        desc: 'Trời mưa rất to khiến các điểm: Galle Face Green, Quảng trường Độc Lập, Tòa Nghị Viện Cũ, Chợ Pettah đều không thể xuống xe tham quan. Cần có phương án điểm tham quan trong nhà (Bảo tàng, Trung tâm thương mại One Galle Face) dự phòng khi gặp mùa mưa.',
        actionFor: 'Điều hành dự phòng'
      },
      {
        title: 'Quy Trình An Ninh Nghiêm Ngặt Sân Bay Colombo Khi Bay Về',
        icon: ShieldCheck,
        tag: 'Lưu ý xuất cảnh',
        tagColor: '#dc2626',
        desc: 'Sân bay CMB có thêm chốt an ninh kiểm tra lần 2 ngay trước cửa phòng chờ boarding. Khách BẮT BUỘC phải bỏ chai nước tại đây. Phòng chờ không có nhà vệ sinh (phải ngồi đợi 1 tiếng), nhắc khách đi vệ sinh trước khi bước qua chốt cuối!',
        actionFor: 'HDV dặn dò'
      }
    ]
  }
];

// ── Bảng Chấm Điểm 5 Khách Sạn Khảo Sát ──
const HOTELS_SCORECARD = [
  {
    name: 'Pledge Scape Negombo',
    location: 'Negombo (Bờ biển gần sân bay)',
    stars: '4 Sao',
    stayNight: 'Đêm 1 (10/10/2026)',
    score: 8.2,
    driveUrl: 'https://drive.google.com/drive/folders/1u2U93DzioBOYa9BCx0DTMV6JqP3iafLJ',
    strengths: ['Sát biển Negombo, kiến trúc hiện đại, sạch sẽ', 'Vị trí lý tưởng chỉ cách sân bay 20-30 phút', 'Buffet sáng ngày hôm sau phong phú, đồ uống ngon'],
    weaknesses: ['Đoàn đến muộn không có bữa tối', 'Xung quanh đóng cửa sớm từ 19:30'],
    recommendation: 'GIỮ LẠI (Lựa chọn đón khách đêm đầu tối ưu nhất)',
    color: '#0284c7'
  },
  {
    name: 'Fresco Water Villa',
    location: 'Sigiriya (Khu vực pháo đài đá)',
    stars: '4 Sao (Resort sinh thái)',
    stayNight: 'Đêm 2 (11/10/2026)',
    score: 7.8,
    driveUrl: 'https://drive.google.com/drive/folders/1vZb0m_HyDjbeeuGs_AlKHy4yIWmcw5HK',
    strengths: ['Không gian sân vườn thoáng đãng, nhiều cây xanh', 'Thuận tiện di chuyển đến Sigiriya Rock và Safari Minneriya', 'Nhân viên nhiệt tình, hỗ trợ hành lý chu đáo'],
    weaknesses: ['Phòng ốc hơi cũ theo phong cách truyền thống', 'Nước nóng và áp lực vòi sen ở mức trung bình'],
    recommendation: 'CÓ THỂ GIỮ hoặc nâng cấp lên Aliya Resort / Heritance Kandalama nếu chạy dòng VIP',
    color: '#d97706'
  },
  {
    name: 'Radisson Hotel Kandy',
    location: 'Cố đô Kandy (Gần hồ & Đền Răng Phật)',
    stars: '4-5 Sao Chuỗi Quốc Tế',
    stayNight: 'Đêm 3 (12/10/2026)',
    score: 8.7,
    driveUrl: 'https://drive.google.com/drive/folders/17l7xMkHFHG2kasEH2MRCvIeLmF-CYlXI',
    strengths: ['Thương hiệu quốc tế Radisson vận hành chuyên nghiệp', 'Phòng ngủ hiện đại, giường đệm êm ái, cách âm tốt', 'Rooftop bar ngắm trọn vẹn thành phố Kandy về đêm', 'Buffet tối và sáng đồ ăn đa dạng, hợp khẩu vị khách Việt'],
    weaknesses: ['Đường xe vào hơi hẹp vào giờ tan tầm'],
    recommendation: 'ƯU TIÊN GIỮ (Đảm bảo chuẩn dịch vụ cho khách FIT TOUR)',
    color: '#7c3aed'
  },
  {
    name: 'Morning Dew Hotel',
    location: 'Ella (Sườn đồi ngắm thung lũng)',
    stars: '4 Sao Boutique',
    stayNight: 'Đêm 4 (13/10/2026)',
    score: 8.5,
    driveUrl: 'https://drive.google.com/drive/folders/1JtnwYd4tZtpAm-G7LxOhx9MY_uliMwke',
    strengths: ['Cảnh quan xuất sắc: Sương mây bồng bềnh như Đà Lạt', 'Hồ bơi chân mây ngắm hoàng hôn và bình minh cực chill', 'Không khí trong lành, yên bình tuyệt đối'],
    weaknesses: ['Đường lên sườn dốc rất hẹp, xe lớn 45 chỗ không lên được', 'Buổi tối không có xe đưa ra trung tâm thị trấn Ella'],
    recommendation: 'GIỮ LẠI NHƯNG BẮT BUỘC có phương án xe trung chuyển hành lý',
    color: '#059669'
  },
  {
    name: 'Radisson Blu Resort Galle',
    location: 'Galle (Sát biển Ấn Độ Dương)',
    stars: '5 Sao Quốc Tế Sang Trọng',
    stayNight: 'Đêm 5 (14/10/2026)',
    score: 9.6,
    driveUrl: 'https://drive.google.com/drive/folders/1lOG4DiOMS0xQ2C064Zbc29L7F5jg-qpT',
    strengths: ['ĐỈNH CAO NHẤT TOÀN TUYẾN: Bãi biển riêng biệt lập', 'Hồ bơi vô cực khổng lồ view biển mở từ 07:00 đến 19:00', 'Buffet sáng thượng hạng với hàng trăm món Á - Âu', 'Kiến trúc sang trọng, phòng 100% hướng biển'],
    weaknesses: ['Giá thành cao, nếu đưa khách về muộn sẽ cực kỳ lãng phí'],
    recommendation: 'TUYỆT ĐỐI GIỮ & TĂNG THỜI GIAN LƯU TRÚ (Rời lúc 10:30-11:00)',
    color: '#e11d48'
  }
];

// ── 10 Bài Học Thực Chiến ──
const PRACTICAL_TIPS = [
  {
    id: 1,
    title: 'Lệch Múi Giờ (-1.5h) & Chiến Lược Đặt Giờ Ăn Sáng',
    category: 'Điều hành & HDV',
    badge: 'Quan trọng',
    color: '#ef4444',
    content: 'Sri Lanka đi sau Việt Nam 1.5 tiếng (ví dụ Việt Nam 8h30 thì Sri Lanka mới 7h00 sáng). Theo cố vấn anh Tuyên, thức dậy lúc 7h00 bên Sri Lanka tương đương 8h30 sáng Việt Nam - tức là quá trễ! Tuy nhiên các khách sạn Sri Lanka chỉ mở buffet từ 7h00. FIT TOUR cần dặn đối tác và HDV làm việc với khách sạn trước để phục vụ ăn sáng lúc 6h00 hoặc 6h30 và xuất phát lúc 7h00 nhằm né kẹt xe và tận dụng ban ngày.',
    copyText: 'Dạ anh/chị lưu ý giờ Sri Lanka đi chậm hơn Việt Nam 1 tiếng 30 phút. Buổi sáng đoàn mình nên dậy sớm lúc 6h00 (tương đương 7h30 sáng giờ VN), ăn sáng và xuất phát lúc 7h00 để có nhiều thời gian tham quan và ngắm cảnh đẹp nhất ạ!'
  },
  {
    id: 2,
    title: 'Đổi Tiền Mặt: Ưu Tiên Tờ 100 LKR Cho Vệ Sinh & Tip Nhỏ',
    category: 'Sales & HDV',
    badge: 'Chi tiêu',
    color: '#059669',
    content: 'Chuẩn bị USD từ Việt Nam rồi đổi sang Rupee Sri Lanka (LKR) tại quầy bên trái sảnh đến sân bay CMB. Khuyến nghị mỗi khách đổi 50–100 USD (khoảng 15.000–30.000 LKR). BẮT BUỘC giữ nhiều tờ 100 LKR lẻ vì phí đi vệ sinh và gửi giày dép vào chùa thường là 100 LKR/lượt, tip cho nhân viên hỗ trợ hoặc tài xế tuk tuk cũng dùng tờ 100 LKR rất tiện.',
    copyText: 'Dạ anh/chị chuẩn bị khoảng 50-100 USD tiền mặt, khi đến sân bay Colombo bên em sẽ hướng dẫn đổi sang tiền Rupee Sri Lanka (LKR). Anh/chị nhớ đổi nhiều tờ 100 LKR lẻ (khoảng 8.000đ tiền Việt) để tiện đi vệ sinh hoặc gửi giày vào viếng đền chùa nhé ạ!'
  },
  {
    id: 3,
    title: 'Tử Huyệt Đền Chùa: Bắt Buộc Mang 2–3 Đôi Vớ Dày',
    category: 'Sales dặn khách',
    badge: 'Sống còn',
    color: '#d97706',
    content: 'Các đền chùa tại Sri Lanka (Dambulla, Đền Răng Phật, Gangaramaya) tuyệt đối cấm mang giày dép vào khu thờ tự. Khách phải đi chân trần trên nền đá phơi nắng gay gắt hoặc đường sỏi dài rất đau và buốt chân. Mang vớ dày mềm là cứu tinh giúp bảo vệ chân. Cần mang tối thiểu 2–3 đôi để thay khi vớ bị bẩn hoặc ướt.',
    copyText: 'Dạ em dặn kỹ phần này cực kỳ quan trọng: Khi vào đền chùa Sri Lanka bắt buộc phải cởi giày dép đi bộ trên nền đá ngoài trời. Anh/chị nhớ mang theo 2-3 đôi vớ (tất) loại dày, êm chân và chuẩn bị quần dài qua gối, áo có tay kín đáo để không bị nóng chân và đúng phong tục nhé ạ!'
  },
  {
    id: 4,
    title: 'Mua SIM Vật Lý Tại Sân Bay Rẻ Gấp 2–3 Lần eSIM Online',
    category: 'Sales & Khách',
    badge: 'Mẹo thông minh',
    color: '#0284c7',
    content: 'SIM vật lý mua trực tiếp tại quầy Dialog hoặc Mobitel ở sảnh đến sân bay Colombo có giá cực rẻ: Dialog 20GB chỉ 5 USD, 50GB chỉ 10 USD (dùng 30 ngày). Rẻ hơn 2-3 lần so với việc mua eSIM du lịch trước qua app/web. Khách chỉ cần đưa hộ chiếu là nhân viên lắp và kích hoạt tại chỗ trong 2 phút.',
    copyText: 'Dạ về SIM 4G, anh/chị không cần mua eSIM online đắt tiền trước đâu ạ. Đến sảnh sân bay Colombo có quầy Dialog/Mobitel bán gói 20GB chỉ khoảng 5 USD (125k) hoặc 50GB chỉ 10 USD (250k), nhân viên hỗ trợ lắp sim ngay rất nhanh và sóng khỏe ạ!'
  },
  {
    id: 5,
    title: 'Đêm Đầu Tiên: Negombo Đóng Cửa Sớm, Chuẩn Bị Đồ Ăn Nhẹ',
    category: 'Sales & Điều hành',
    badge: 'Hậu cần',
    color: '#7c3aed',
    content: 'Các chuyến bay từ Việt Nam thường đến Colombo vào chập tối, sau khi nhập cảnh và về đến khách sạn ở Negombo thì đã 21h00-22h00 đêm. Hàng quán và tạp hóa tại Negombo hầu như đã đóng cửa từ 19h00-20h00. Khách sạn không phục vụ ăn khuya. Cần nhắc khách ăn tối trước khi bay hoặc mang theo mì gói, bánh kẹo lót dạ đêm đầu.',
    copyText: 'Dạ đêm đầu tiên đáp sân bay Colombo và về khách sạn Negombo sẽ khá khuya nên hàng quán địa phương đã đóng cửa. Anh/chị nhớ ăn nhẹ trước khi lên máy bay hoặc mang theo 1-2 gói mì tôm, bánh ngọt để lót dạ đêm đầu về phòng nghỉ ngơi nhé ạ!'
  },
  {
    id: 6,
    title: 'Đề Xuất Chuyển Sang Xe 29 Chỗ (Đường Đèo Cua Gắt Hơn Đà Lạt)',
    category: 'Điều hành & Sản phẩm',
    badge: 'Cốt lõi',
    color: '#e11d48',
    content: 'Cung đường vùng cao nguyên (Kandy - Nanu Oya - Ella) có địa hình đèo dốc uốn lượn liên tục 3-4 tiếng đồng hồ, gắt hơn cả đèo Đà Lạt. Xe lớn 45 chỗ rất cồng kềnh, ôm cua khó, gây say xe nặng và không lên được các khách sạn sườn đồi. FIT TOUR đề xuất dứt khoát chuyển sang sử dụng xe 29 chỗ đời mới để xe cơ động, vào cua êm và đưa đón tận cửa khách sạn.',
    copyText: 'FIT TOUR đề xuất sử dụng xe 29 chỗ cao cấp đời mới cho toàn bộ hành trình Sri Lanka thay vì xe 45 chỗ, giúp đoàn di chuyển êm ái trên các cung đèo uốn lượn và tiếp cận thẳng các resort trên đồi như Morning Dew Ella.'
  },
  {
    id: 7,
    title: 'Nghệ Thuật Mặc Cả Chụp Ảnh Tàu Hỏa & Cà Kheo Koggala',
    category: 'HDV thực địa',
    badge: 'Thực tế',
    color: '#10b981',
    content: 'Tại ga tàu hoặc Cầu Chín Nhịp, người dân chèo kéo chụp ảnh báo giá 1.000 LKR nhưng chụp rất xấu, có thể mặc cả còn 300 LKR hoặc HDV tự chụp cho khách. Tại Koggala, người ngồi câu cá cà kheo là diễn viên du lịch, báo giá 3.000 LKR -> thương lượng dứt khoát 500 LKR là họ đồng ý cho chụp thoải mái. HDV cần thông báo trước đây là chi phí tự túc.',
    copyText: 'Lưu ý HDV: Chủ động đứng ra thương lượng trước giá chụp ảnh cà kheo Koggala (chốt mức 500 LKR) và giá chụp ảnh tàu Ella (300 LKR) để bảo vệ quyền lợi cho du khách, tránh để khách bị người địa phương chặt chém.'
  },
  {
    id: 8,
    title: 'Văn Hóa Làm Lễ & Chỉ Ban Phước Tại Chùa Gangaramaya',
    category: 'HDV & Khách',
    badge: 'Tâm linh',
    color: '#8b5cf6',
    content: 'Trải nghiệm đỉnh cao tại Chùa Gangaramaya là nhờ sư thầy trụ trì làm lễ tụng kinh chúc phúc, đi một vòng quanh Tháp Xá Lợi và buộc sợi chỉ may mắn vào cổ tay. QUY TẮC BẮT BUỘC: Luôn chìa TAY PHẢI khi nhận lộc hoặc bắt tay, tuyệt đối không dùng tay trái. Nên dặn khách chuẩn bị sẵn chuỗi hạt/vòng tay cá nhân mang theo để nhờ sư thầy gia trì năng lượng.',
    copyText: 'Dạ khi viếng chùa Gangaramaya linh thiêng tại Colombo, đoàn mình sẽ được sư thầy trụ trì buộc sợi chỉ cầu an. Theo phong tục Phật giáo Sri Lanka, anh/chị nhớ luôn dùng TAY PHẢI để nhận lời chúc phúc nhé. Anh/chị có thể mang theo chuỗi hạt của mình để nhờ thầy gia trì luôn ạ!'
  },
  {
    id: 9,
    title: 'Tối Đa Hóa Trải Nghiệm Resort 5 Sao Radisson Blu Galle',
    category: 'Điều hành xếp lịch',
    badge: 'Giá trị cao',
    color: '#059669',
    content: 'Radisson Blu Galle là điểm sáng nghỉ dưỡng tuyệt vời nhất chuyến đi với biển xanh và hồ bơi mở 07h00-19h00. Nếu đưa đoàn về quá muộn lúc 19h00 tối và hôm sau lùa đi từ 7h00 sáng là vứt tiền qua cửa sổ! Đề xuất: Ngày 5 phải đưa đoàn về resort trước 16h30. Sáng Ngày 6 cho khách thảnh thơi ăn buffet và bơi lội đến 10h00-10h30 mới checkout.',
    copyText: 'Lịch trình được thiết kế đặc quyền với nửa ngày nghỉ dưỡng trọn vẹn tại Radisson Blu Resort Galle 5 sao bên bờ biển Ấn Độ Dương, quý khách tự do đắm mình trong hồ bơi vô cực và thưởng thức buffet thượng hạng trước khi di chuyển về Colombo.'
  },
  {
    id: 10,
    title: 'Cảnh Báo Xuất Cảnh Sân Bay CMB: Chai Nước & Nhà Vệ Sinh',
    category: 'HDV dặn dò',
    badge: 'Sân bay',
    color: '#dc2626',
    content: 'Sân bay Colombo có quy trình kiểm tra an ninh đặc thù: Sau khi qua hải quan, trước khi bước vào phòng chờ ra máy bay (boarding lounge) có một chốt soi an ninh cuối cùng. Tại đây, tất cả chai nước (kể cả nước mua bên trong sân bay) đều bị tịch thu! Phòng chờ boarding không có nhà vệ sinh và phải ngồi đợi 45-60 phút. Nhắc khách đi vệ sinh và uống hết nước trước khi vào.',
    copyText: 'Lưu ý HDV trước khi ra gate sân bay Colombo: Nhắc toàn bộ đoàn uống hết nước và đi vệ sinh trước khi bước qua chốt an ninh cuối, vì vào phòng chờ boarding sẽ bị bỏ nước và không có nhà vệ sinh bên trong.'
  }
];

// ── Bảng Phân Tích SWOT ──
const SWOT_DATA = {
  strengths: [
    'Hệ thống khách sạn & resort 4-5 sao rất tốt, nổi bật nhất là Radisson Blu Galle (5★ sát biển) và Morning Dew Ella (view mây).',
    'Các bữa buffet tại khách sạn phong phú, giúp hóa giải nỗi lo món ăn Sri Lanka nhiều gia vị cà ri gần với món Ấn Độ.',
    'Giá trị văn hóa - tâm linh đặc sắc: Di sản Sigiriya ngoạn mục, Đền Răng Phật Kandy linh thiêng, nghi thức gia trì Tháp Xá Lợi tại Chùa Gangaramaya.',
    'Cảnh quan thiên nhiên biến đổi liên tục: Từ bãi biển Negombo, pháo đài đá Sigiriya, đồi chè Nanu Oya, thung lũng mây Ella đến biển Ấn Độ Dương tại Galle.'
  ],
  weaknesses: [
    'Cách xếp tuyến ban đầu của Victoria Tour chưa hợp lý: Quá nhiều thời gian ngồi xe, ít điểm tham quan nổi bật trong ngày.',
    'Ngày 4 dành trọn cho di chuyển, đi tàu hỏa lướt qua Nine Arch Bridge quá nhanh không kịp chụp ảnh, sáng hôm sau lại phải đi tuk tuk quay lại.',
    'Đoạn đồi núi quanh co gắt hơn cả đèo Đà Lạt, sử dụng xe 45 chỗ gây mệt mỏi và say xe cho du khách.',
    'Nhà hàng trưa Ngày 6 (Oak Ray Flower Drum ở Colombo) chất lượng trung bình kém, không xứng tầm tour FIT TOUR.',
    'City Tour Colombo ngày cuối hoàn toàn phụ thuộc vào thời tiết ngoài trời, khi mưa lớn là bể toàn bộ chương trình.'
  ],
  opportunities: [
    'Thị trường Sri Lanka đang nổi lên là điểm đến tâm linh - chữa lành mới mẻ, phân khúc cao cấp sau Tây Tạng và Ladakh.',
    'Đàm phán lại với đối tác Victoria Tour để tinh chỉnh sản phẩm thành "Hành trình Độc Bản Sri Lanka 6N5Đ - Nghỉ Dưỡng 5 Sao & Chữa Lành Tâm Hồn".',
    'Bổ sung dịch vụ xe 29 chỗ đời mới để tạo điểm bán hàng độc nhất (USP) vượt trội so với các tour giá rẻ trên thị trường.'
  ],
  threats: [
    'Nguy cơ khách phàn nàn: "Đi Sri Lanka 6 ngày mà ngồi xe hết 4 ngày, điểm tham quan quá ít!" nếu giữ nguyên lịch trình cũ.',
    'Mùa mưa tại Colombo dễ làm gián đoạn city tour, gây ức chế cho khách vào ngày cuối cùng trước khi bay về.',
    'Chi phí phát sinh (tiền boa, phí vệ sinh, chụp ảnh cà kheo) nếu không được minh bạch từ đầu sẽ gây hiểu lầm tiêu cực.'
  ]
};

// ── Bảng Kế Hoạch Hành Động (Action Matrix) ──
const ACTION_MATRIX = [
  {
    department: 'Ban Giám Đốc & Product',
    color: '#f97316',
    tasks: [
      { text: 'Làm việc lại với đối tác Victoria Tour: Yêu cầu thiết kế lại tuyến Ngày 4 & 5 dựa trên giờ chạy thực tế.', status: 'Khẩn cấp' },
      { text: 'Chốt hợp đồng xe 29 chỗ đời mới thay cho xe 45 chỗ để phục vụ các cung đường đèo và dốc resort.', status: 'Bắt buộc' },
      { text: 'Thay thế nhà hàng Oak Ray Flower Drum tại Colombo bằng nhà hàng buffet quốc tế hoặc hải sản cao cấp.', status: 'Ưu tiên cao' },
      { text: 'Định vị giá bán tour tương xứng với tiêu chuẩn nghỉ dưỡng Radisson Blu Galle và Morning Dew Ella.', status: 'Chiến lược' }
    ]
  },
  {
    department: 'Bộ Phận Điều Hành (OP)',
    color: '#0284c7',
    tasks: [
      { text: 'Thỏa thuận giờ ăn sáng 6h00 - 6h30 với tất cả khách sạn và xuất phát 7h00 để bù 1.5h chênh lệch múi giờ.', status: 'Bắt buộc' },
      { text: 'Xếp lịch về Radisson Blu Resort Galle trước 16h30 ngày 5 và rời resort lúc 10h30 ngày 6.', status: 'Bắt buộc' },
      { text: 'Lên phương án Indoor Backup cho City tour Colombo khi trời mưa (Bảo tàng Quốc gia, One Galle Face Mall).', status: 'Cần làm ngay' },
      { text: 'Kiểm tra chất lượng xe ngay tại sân bay Bandaranaike khi đoàn đáp, sẵn sàng từ chối nếu xe cũ.', status: 'Quy chuẩn' }
    ]
  },
  {
    department: 'Bộ Phận Kinh Doanh (Sales)',
    color: '#10b981',
    tasks: [
      { text: 'Tư vấn trung thực cho khách về độ dốc pháo đài đá Sigiriya để chuẩn bị thể lực và giày trekking.', status: 'Tư vấn' },
      { text: 'Dặn khách chuẩn bị đồ ăn nhẹ / mì tôm cho đêm đầu tiên tại Negombo vì hàng quán đóng cửa sớm.', status: 'Chăm sóc' },
      { text: 'Nhắc khách chuẩn bị 2-3 đôi vớ dày mềm và trang phục dài qua gối khi đi viếng các đền chùa.', status: 'Dặn dò' },
      { text: 'Làm nổi bật điểm nhấn 5 sao Radisson Blu Galle và view sương mây Morning Dew Ella để chốt hợp đồng.', status: 'Điểm bán' }
    ]
  },
  {
    department: 'Hướng Dẫn Viên (HDV)',
    color: '#7c3aed',
    tasks: [
      { text: 'Kiểm tra dấu mộc nhập cảnh trong hộ chiếu của khách ngay tại quầy hải quan sân bay CMB.', status: 'Thực địa' },
      { text: 'Chủ động đứng ra mặc cả giá chụp ảnh cà kheo Koggala (500 LKR) và tuk tuk Cầu Chín Nhịp (2.000 LKR).', status: 'Bảo vệ khách' },
      { text: 'Hướng dẫn khách dùng TAY PHẢI khi nhận chỉ chúc phúc và chuẩn bị vòng tay gia trì tại Chùa Gangaramaya.', status: 'Văn hóa' },
      { text: 'Nhắc khách uống hết nước và đi vệ sinh trước khi bước qua chốt soi an ninh cuối vào gate sân bay CMB.', status: 'Checklist bay' }
    ]
  }
];

// ── Danh Mục Album Ảnh Khảo Sát ──
const PHOTO_ALBUMS = [
  {
    category: 'Phương Tiện & Cung Đường',
    icon: Bus,
    color: '#0284c7',
    driveUrl: 'https://drive.google.com/drive/folders/1zvjCZrNvqQwwwtafcj_NYnparAZ3HRwR',
    desc: 'Hình ảnh thực tế xe 45 chỗ đời mới, tình trạng cung đèo dốc quanh co Kandy - Ella và ga tàu Nanu Oya.',
    count: '32 ảnh',
    albums: [
      { name: 'Xe 45 chỗ đoàn khảo sát & sườn xe', tag: 'Phương tiện' },
      { name: 'Khúc cua tay áo đèo Kandy - Ella', tag: 'Đường sá' },
      { name: 'Chuyến tàu Nanu Oya & Ga xe lửa', tag: 'Tàu hỏa' },
      { name: 'Tuk Tuk săn ảnh Cầu Chín Nhịp', tag: 'Tuk Tuk' }
    ]
  },
  {
    category: 'Khách Sạn & Resort Lưu Trú',
    icon: Hotel,
    color: '#059669',
    driveUrl: 'https://drive.google.com/drive/folders/1WcD_8Bz_re2z-pba5CfVsC6bFQgIdT7k',
    desc: 'Bộ ảnh mặt tiền, sảnh đón, phòng ngủ, phòng tắm và view cảnh quan 5 khách sạn theo từng đêm.',
    count: '68 ảnh',
    albums: [
      { name: 'Ngày 1: Pledge Scape Negombo (Bờ biển)', tag: '4-5 Sao' },
      { name: 'Ngày 2: Fresco Water Villa Sigiriya (Sân vườn)', tag: '4 Sao' },
      { name: 'Ngày 3: Radisson Hotel Kandy (Phố cổ)', tag: '4-5 Sao' },
      { name: 'Ngày 4: Morning Dew Hotel Ella (View sương mây)', tag: '4 Sao' },
      { name: 'Ngày 5: Radisson Blu Resort Galle (Hồ bơi sát biển)', tag: '5 Sao' }
    ]
  },
  {
    category: 'Ẩm Thực & Bữa Ăn Theo Ngày',
    icon: Utensils,
    color: '#ea580c',
    driveUrl: 'https://drive.google.com/drive/folders/1XqHzlagbt_nyi_Ql_8plG6j2NQqhLM39',
    desc: 'Hình ảnh chi tiết các bữa trưa, bữa tối, quầy buffet sáng và đặc sản Bánh Hopper truyền thống.',
    count: '45 ảnh',
    albums: [
      { name: 'Bữa trưa Ngày 1 – 6 (Nhà hàng địa phương)', tag: 'Bữa trưa' },
      { name: 'Buffet sáng 5 sao Radisson Blu Galle', tag: 'Buffet 5★' },
      { name: 'Đặc sản Bánh Hopper (Appa) trứng & dừa', tag: 'Đặc sản' },
      { name: 'Nhà hàng Oak Ray Flower Drum Colombo', tag: 'Thực tế' }
    ]
  },
  {
    category: 'Điểm Nhấn Sống Ảo & Văn Hóa',
    icon: Camera,
    color: '#7c3aed',
    driveUrl: 'https://drive.google.com/drive/folders/1zvjCZrNvqQwwwtafcj_NYnparAZ3HRwR',
    desc: 'Góc chụp đắt giá nhất hành trình phục vụ Marketing và tài liệu tư vấn chốt sale của đội ngũ Sales.',
    count: '85 ảnh',
    albums: [
      { name: 'Cầu Chín Nhịp (Nine Arch Bridge) góc chụp từ chân cầu', tag: 'Triệu view' },
      { name: 'Câu cá cà kheo Koggala (Stilt Fishing)', tag: 'Văn hóa' },
      { name: 'Phố cổ & Ngọn Hải Đăng Galle Lighthouse', tag: 'Di sản' },
      { name: 'Lễ ban phước Tháp Xá Lợi Chùa Gangaramaya', tag: 'Tâm linh' },
      { name: 'Minneriya Jeep Safari ngắm đàn voi', tag: 'Hoang dã' }
    ]
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT CHÍNH: Báo Cáo Khảo Sát FARM Trip Sri Lanka
// ═══════════════════════════════════════════════════════════════════════════════
const SriLankaFarmTripReportPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDay, setSelectedDay] = useState(1);
  const [swotCols, setSwotCols] = useState('2col'); // '2col' (2 ô 1 hàng) hoặc '4col' (4 ô 1 hàng)
  const [copiedId, setCopiedId] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Scroll listener for Back to Top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Copy helper with mobile & legacy fallback
  const handleCopy = (id, text) => {
    const fallbackCopy = () => {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2500);
      } catch (err) {
        console.error('Fallback copy error:', err);
      }
    };

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopiedId(id);
          setTimeout(() => setCopiedId(null), 2500);
        })
        .catch(() => fallbackCopy());
    } else {
      fallbackCopy();
    }
  };

  // Smooth scroll back to top of page
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Day selector with smooth auto-scroll to day detail
  const handleSelectDay = (dayNum) => {
    setSelectedDay(dayNum);
    const daySection = document.getElementById('day-detail-section');
    if (daySection) {
      // Offset for sticky tab nav (~52px) + sticky day bar (~68px)
      const yOffset = -125;
      const y = daySection.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="srilanka-report-page">
      
      {/* ── EMBEDDED SCOPED RESPONSIVE CSS STYLES ── */}
      <style>{`
        .srilanka-report-page {
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

        /* Sticky Main Tab Navigation */
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

        /* Sticky Day Navigation Bar in Tab 2 */
        .sticky-day-bar {
          position: sticky;
          top: 52px;
          z-index: 90;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 4px 10px -2px rgba(0, 0, 0, 0.06);
          padding: 10px 0 12px;
          margin-bottom: 24px;
        }

        /* Responsive Breakpoints for Mobile (< 768px) */
        @media (max-width: 768px) {
          .breadcrumb-nav-bar {
            padding: 10px 14px !important;
          }
          .breadcrumb-title-text {
            max-width: 150px !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            font-size: 0.85rem !important;
          }
          .btn-print-text {
            display: none !important;
          }
          .btn-doc-text {
            display: none !important;
          }

          .hero-banner-container {
            padding: 28px 16px 24px !important;
          }
          .hero-title {
            font-size: 1.55rem !important;
            line-height: 1.3 !important;
            margin-bottom: 10px !important;
          }
          .hero-desc {
            font-size: 0.88rem !important;
            line-height: 1.55 !important;
            margin-bottom: 18px !important;
          }
          .hero-meta-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }
          .hero-meta-card {
            padding: 10px 12px !important;
          }
          .hero-meta-title {
            font-size: 0.68rem !important;
          }
          .hero-meta-val {
            font-size: 0.88rem !important;
          }

          .top-resources-wrapper {
            padding: 16px 14px !important;
          }
          .top-resources-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .resource-subrow {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
          }
          .resource-subrow-pills {
            width: 100% !important;
            overflow-x: auto !important;
            flex-wrap: nowrap !important;
            padding-bottom: 6px !important;
            -webkit-overflow-scrolling: touch;
          }
          .resource-subrow-pills a {
            white-space: nowrap !important;
            flex-shrink: 0 !important;
          }

          .main-content-layout {
            padding: 0 14px !important;
            margin: 20px auto 60px !important;
          }

          .tab-btn {
            padding: 8px 12px !important;
            font-size: 0.82rem !important;
          }

          .day-pill-btn {
            padding: 8px 12px !important;
            min-width: 135px !important;
          }

          .swot-grid-responsive {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .swot-switcher-box {
            display: none !important;
          }

          .responsive-cards-1col {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }

          .day-header-top {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .day-header-actions {
            width: 100% !important;
            flex-direction: column !important;
            gap: 6px !important;
          }
          .day-header-actions a {
            width: 100% !important;
            justify-content: center !important;
          }

          .day-meta-chips-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
        }

        @media (max-width: 480px) {
          .hero-meta-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      
      {/* ── BREADCRUMB & TOP NAV BAR (CHỈ 1 CẤP ĐỂ TRÁNH LỖI 404 THEO YÊU CẦU) ── */}
      <div className="breadcrumb-nav-bar" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '12px 24px', position: 'relative', zIndex: 50 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          
          {/* Breadcrumb đúng 1 cấp: Tài Liệu Nội Bộ -> Trang hiện tại */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#64748b', minWidth: 0 }}>
            <Link to="/tai-lieu" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <ArrowLeft size={16} /> Tài Liệu Nội Bộ
            </Link>
            <ChevronRight size={14} style={{ flexShrink: 0 }} />
            <span className="breadcrumb-title-text" style={{ color: '#0f172a', fontWeight: 700 }}>
              FARM Trip Sri Lanka 2026
            </span>
          </div>

          {/* Quick Actions Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a 
              href={SURVEY_RESOURCES.originalGoogleDoc.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 12px', borderRadius: '8px',
                border: '1px solid #0284c7', background: '#eff6ff',
                color: '#0284c7', fontSize: '0.85rem', fontWeight: 700,
                textDecoration: 'none', transition: 'all 0.2s'
              }}
            >
              <FileText size={15} /> <span className="btn-doc-text">Google Doc Gốc</span> <ExternalLink size={12} />
            </a>
            <button 
              onClick={() => window.print()}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 12px', borderRadius: '8px',
                border: '1px solid #cbd5e1', background: '#ffffff',
                color: '#334155', fontSize: '0.85rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
            >
              <Printer size={15} /> <span className="btn-print-text">In / Xuất PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── HERO BANNER SECTION (RESPONSIVE CHUẨN ĐIỆN THOẠI & DESKTOP) ── */}
      <div className="hero-banner-container" style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 70%, #0f766e 100%)',
        color: '#ffffff',
        padding: '42px 24px 34px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative circles */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '10%', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span style={{ 
              background: 'linear-gradient(135deg, #ea580c, #f97316)', 
              color: '#ffffff', 
              fontSize: '0.75rem', 
              fontWeight: 800, 
              padding: '4px 10px', 
              borderRadius: '20px', 
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Sparkles size={12} /> BÁO CÁO KHẢO SÁT THỰC ĐỊA FIT TOUR
            </span>
            <span style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', fontSize: '0.78rem', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
              🇱🇰 Sri Lanka · 6N5Đ
            </span>
            <span style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', fontSize: '0.78rem', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
              📅 10–15/10/2026
            </span>
          </div>

          <h1 className="hero-title" style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1.25, margin: '0 0 14px 0', letterSpacing: '-0.02em', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            Đánh Giá Tổng Quan FARM Trip Sri Lanka & Giải Pháp Tối Ưu Sản Phẩm
          </h1>

          <p className="hero-desc" style={{ fontSize: '1rem', color: '#d1fae5', maxWidth: '960px', margin: '0 0 22px 0', lineHeight: 1.6 }}>
            Báo cáo kiểm định thực tế chất lượng tuyến điểm, dịch vụ lưu trú 4-5 sao, nhà hàng ẩm thực, giao thông đồi đèo và cẩm nang 10 bài học sống còn phục vụ đàm phán đối tác Victoria Tour, đào tạo Hướng Dẫn Viên và tư vấn bán hàng cho đội ngũ Sales FIT TOUR.
          </p>

          {/* Meta Grid Pills (2x2 on Mobile, 4 in 1 on Desktop) */}
          <div className="hero-meta-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div className="hero-meta-card" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="hero-meta-title" style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#a7f3d0', fontWeight: 700, marginBottom: '2px' }}>Đối tác thực địa</div>
              <div className="hero-meta-val" style={{ fontSize: '0.96rem', fontWeight: 800 }}>Victoria Tour Sri Lanka</div>
            </div>

            <div className="hero-meta-card" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="hero-meta-title" style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#a7f3d0', fontWeight: 700, marginBottom: '2px' }}>Cố vấn khảo sát</div>
              <div className="hero-meta-val" style={{ fontSize: '0.96rem', fontWeight: 800 }}>Anh Tuyên (10 lần đi SL) & FIT</div>
            </div>

            <div className="hero-meta-card" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="hero-meta-title" style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#a7f3d0', fontWeight: 700, marginBottom: '2px' }}>Cung đường khảo sát</div>
              <div className="hero-meta-val" style={{ fontSize: '0.96rem', fontWeight: 800 }}>Negombo · Sigiriya · Kandy · Ella · Galle</div>
            </div>

            <div className="hero-meta-card" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="hero-meta-title" style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#fef08a', fontWeight: 700, marginBottom: '2px' }}>Khuyến nghị then chốt</div>
              <div className="hero-meta-val" style={{ fontSize: '0.96rem', fontWeight: 800, color: '#fef08a' }}>Đổi xe 29 chỗ & Tăng time Galle</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KHỐI GHIM TÀI LIỆU GỐC & THƯ VIỆN ẢNH (TỐI ƯU CẢ ĐIỆN THOẠI & MÁY TÍNH) ── */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div className="top-resources-wrapper" style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px 24px' }}>
          
          {/* Header section with badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                background: '#0284c7', color: '#ffffff', 
                fontSize: '0.72rem', fontWeight: 800, 
                padding: '3px 8px', borderRadius: '6px',
                display: 'flex', alignItems: 'center', gap: '4px' 
              }}>
                <FolderOpen size={13} /> TÀI LIỆU & KHO ẢNH THỰC TẾ
              </span>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                Thư Viện Ảnh Khảo Sát & Tài Liệu Gốc (Google Drive)
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Nhấp trực tiếp từng mục để mở Google Drive tương ứng
            </span>
          </div>

          {/* Hàng 1: 4 Thư mục lớn (Tài liệu gốc + 3 Album tổng quan) */}
          <div className="top-resources-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px', marginBottom: '14px' }}>
            
            {/* Link Doc Gốc */}
            <a 
              href={SURVEY_RESOURCES.originalGoogleDoc.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                border: '1.5px solid #93c5fd', textDecoration: 'none',
                color: '#1e3a8a', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(30,58,138,0.06)'
              }}
            >
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 800, color: '#2563eb' }}>Google Doc Gốc</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Báo Cáo Khảo Sát FIT TOUR</div>
                <div style={{ fontSize: '0.72rem', color: '#475569' }}>Xem văn bản ghi chép gốc</div>
              </div>
              <ExternalLink size={15} style={{ flexShrink: 0, opacity: 0.7 }} />
            </a>

            {/* 3 Kho Ảnh Tổng Hợp */}
            {SURVEY_RESOURCES.overviewAlbums.map(album => {
              const Icon = album.icon;
              return (
                <a
                  key={album.id}
                  href={album.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px', borderRadius: '12px',
                    background: '#ffffff',
                    border: `1.5px solid ${album.color}35`,
                    textDecoration: 'none', color: '#0f172a',
                    transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: album.color + '15', color: album.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 800 }}>{album.title}</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, background: album.color + '15', color: album.color, padding: '1px 6px', borderRadius: '4px' }}>{album.count}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {album.desc}
                    </div>
                  </div>
                  <ExternalLink size={14} style={{ color: album.color, flexShrink: 0, opacity: 0.8 }} />
                </a>
              );
            })}

          </div>

          {/* Hàng 2: Chi tiết 5 Khách Sạn theo ngày & 7 Bữa Ăn theo ngày (Scroll ngang mượt mà trên Mobile) */}
          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* Row Khách Sạn */}
            <div className="resource-subrow" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', minWidth: '135px', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <Hotel size={14} /> Ảnh KS Theo Ngày:
              </span>
              <div className="resource-subrow-pills no-scrollbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', flex: 1 }}>
                {SURVEY_RESOURCES.hotelAlbums.map(h => (
                  <a
                    key={h.day}
                    href={h.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '4px 10px', borderRadius: '6px',
                      background: '#ffffff', border: '1px solid #cbd5e1',
                      color: '#0f172a', fontSize: '0.78rem', fontWeight: 600,
                      textDecoration: 'none', transition: 'all 0.15s'
                    }}
                  >
                    <span>N{h.day}: <strong>{h.name}</strong> ({h.location})</span>
                    <ExternalLink size={11} style={{ opacity: 0.6 }} />
                  </a>
                ))}
              </div>
            </div>

            {/* Row Bữa Ăn */}
            <div className="resource-subrow" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', minWidth: '135px', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <Utensils size={14} /> Ảnh Bữa Ăn Ngày:
              </span>
              <div className="resource-subrow-pills no-scrollbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', flex: 1 }}>
                {SURVEY_RESOURCES.mealAlbums.map((m, idx) => (
                  <a
                    key={idx}
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '4px 10px', borderRadius: '6px',
                      background: '#ffffff', border: '1px solid #cbd5e1',
                      color: '#0f172a', fontSize: '0.78rem', fontWeight: 600,
                      textDecoration: 'none', transition: 'all 0.15s'
                    }}
                  >
                    <span><strong>{m.label}</strong> ({m.note})</span>
                    <ExternalLink size={11} style={{ opacity: 0.6 }} />
                  </a>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ── STICKY TAB NAVIGATION (PINNED CHUẨN TOP: 0) ── */}
      <div className="sticky-tab-nav">
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', overflowX: 'auto' }} className="no-scrollbar">
          
          <div style={{ display: 'flex', gap: '4px', padding: '8px 0' }}>
            {[
              { id: 'overview', label: '🌟 Tổng Quan & SWOT', icon: Award },
              { id: 'itinerary', label: '🗺️ Hành Trình 6N5Đ', icon: Compass },
              { id: 'hotels', label: '🏨 Khách Sạn & Resort', icon: Hotel },
              { id: 'dining', label: '🍲 Ẩm Thực & Bữa Ăn', icon: Utensils },
              { id: 'transport', label: '🚌 Xe & Di Chuyển', icon: Bus },
              { id: 'tips', label: '💡 10 Bài Học Thực Chiến', icon: Sparkles },
              { id: 'action', label: '📋 Kế Hoạch Hành Động', icon: CheckCircle2 },
              { id: 'gallery', label: '📸 Kho Ảnh Khảo Sát', icon: Camera }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                  }}
                  className="tab-btn"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '9px 15px', borderRadius: '10px',
                    border: 'none',
                    background: isActive ? '#059669' : 'transparent',
                    color: isActive ? '#ffffff' : '#64748b',
                    fontSize: '0.88rem', fontWeight: isActive ? 700 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="main-content-layout" style={{ maxWidth: '1280px', margin: '28px auto 80px', padding: '0 24px' }}>

        {/* ════════════════════════════════════════════════════════════════════
            TAB 1: TỔNG QUAN & ĐÁNH GIÁ CHIẾN LƯỢC (OVERVIEW & SWOT)
           ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
            
            {/* 2 Big Critical Findings Callouts */}
            <div className="responsive-cards-1col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              
              {/* Điểm cộng */}
              <div style={{ 
                background: '#ffffff', 
                borderRadius: '16px', 
                padding: '22px', 
                border: '1px solid #bbf7d0', 
                borderLeft: '6px solid #10b981',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534', flexShrink: 0 }}>
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 800, textTransform: 'uppercase' }}>Điểm Cộng Lớn Nhất</span>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Khách Sạn Sang Trọng & Bữa Ăn Buffet Phong Phú</h3>
                  </div>
                </div>
                <p style={{ margin: 0, color: '#334155', lineHeight: 1.6, fontSize: '0.92rem' }}>
                  Hầu hết điểm lưu trú thuộc nhóm <strong>4–5 sao</strong> chất lượng cao. Khách sạn <strong>Morning Dew Ella</strong> có view sương mây ngắm núi thung lũng tuyệt đẹp; <strong>Radisson Blu Galle</strong> sát biển, hồ bơi vô cực rộng lớn và buffet sáng chuẩn 5 sao quốc tế. Đồ ăn Sri Lanka tuy có nhiều gia vị tiệm cận món Ấn Độ nhưng chuỗi buffet tại khách sạn giúp khách Việt cực kỳ dễ dàng lựa chọn món ăn hợp khẩu vị.
                </p>
              </div>

              {/* Điểm trừ / Rủi ro */}
              <div style={{ 
                background: '#ffffff', 
                borderRadius: '16px', 
                padding: '22px', 
                border: '1px solid #fecaca', 
                borderLeft: '6px solid #ef4444',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#991b1b', flexShrink: 0 }}>
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#991b1b', fontWeight: 800, textTransform: 'uppercase' }}>Tử Huyệt Cần Sửa Ngay</span>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Tuyến Điểm Xếp Chưa Hợp Lý · Ngồi Xe Quá Nhiều</h3>
                  </div>
                </div>
                <p style={{ margin: 0, color: '#334155', lineHeight: 1.6, fontSize: '0.92rem' }}>
                  Nhiều ngày chỉ có 1–2 điểm tham quan chính, còn lại ngồi xe kéo dài mệt mỏi. Điển hình <strong>Ngày 4</strong> gần như dành trọn cho di chuyển, tàu hỏa lướt qua Nine Arch Bridge chỉ trong vài giây; sáng hôm sau lại phải đi tuk tuk quay lại chụp ảnh rồi mới về Galle. Nếu giữ nguyên lịch này mở bán, khách FIT TOUR chắc chắn sẽ đặt câu hỏi: <em>“Đi Sri Lanka 6 ngày mà ít điểm thế, có đáng tiền không?”</em>
                </p>
              </div>

            </div>

            {/* Strategic Advice Card */}
            <div style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
              border: '1px solid #bfdbfe',
              borderRadius: '16px',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8', fontWeight: 800, fontSize: '1rem' }}>
                <Sparkles size={18} /> ĐỀ XUẤT CẢI TIẾN TRỌNG TÂM TỪ ĐOÀN KHẢO SÁT CHO BAN GIÁM ĐỐC
              </div>
              <div className="responsive-cards-1col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
                <div style={{ background: '#ffffff', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ background: '#dbeafe', color: '#1d4ed8', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>1</span>
                    Thiết Kế Tuyến Dựa Trên Giờ Thật
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5 }}>
                    Không tính giờ theo Google Maps. Cung đường Kandy - Ella - Galle phải tính bù độ quanh co của đèo và thời gian dừng nghỉ chân.
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ background: '#dbeafe', color: '#1d4ed8', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>2</span>
                    Dời Giờ Xuất Phát 7h00 Sáng
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5 }}>
                    Do Sri Lanka chậm 1.5h so với VN, đoàn dậy 6h00 (7h30 VN), ăn sáng 6h30 và xuất phát lúc 7h00 để có thêm 2 tiếng tham quan ban ngày.
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ background: '#dbeafe', color: '#1d4ed8', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>3</span>
                    Dành Trọn Nửa Ngày Nghỉ Dưỡng Galle
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5 }}>
                    Cho khách ở Radisson Blu Galle đến 10h30 sáng Ngày 6 để hưởng trọn hồ bơi biển và buffet thay vì vội vã đưa đi City Tour Colombo sớm.
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ background: '#dbeafe', color: '#1d4ed8', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>4</span>
                    Phương Án Dự Phòng Mùa Mưa
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5 }}>
                    Khi Colombo mưa lớn, lập tức chuyển sang các điểm Indoor (Bảo tàng Quốc Gia, One Galle Face Mall, Cafe Trà Ceylon truyền thống).
                  </div>
                </div>
              </div>
            </div>

            {/* SWOT Matrix Grid: 2 Ô 1 HÀNG (2x2 Matrix) hoặc 4 Ô 1 HÀNG */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 800, textTransform: 'uppercase' }}>Ma Trận Chiến Lược Sản Phẩm</span>
                  <h2 style={{ margin: '4px 0 0 0', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Phân Tích SWOT Tuyến Tour Sri Lanka 6N5Đ</h2>
                </div>

                {/* Layout Switcher (Ẩn trên điện thoại vì màn hình nhỏ luôn stack 1 cột tối ưu) */}
                <div className="swot-switcher-box" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                  <button
                    onClick={() => setSwotCols('2col')}
                    style={{
                      border: 'none',
                      background: swotCols === '2col' ? '#ffffff' : 'transparent',
                      color: swotCols === '2col' ? '#0f172a' : '#64748b',
                      fontWeight: swotCols === '2col' ? 700 : 500,
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      boxShadow: swotCols === '2col' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <LayoutGrid size={14} /> 2 Ô / Hàng (2x2 Matrix)
                  </button>
                  <button
                    onClick={() => setSwotCols('4col')}
                    style={{
                      border: 'none',
                      background: swotCols === '4col' ? '#ffffff' : 'transparent',
                      color: swotCols === '4col' ? '#0f172a' : '#64748b',
                      fontWeight: swotCols === '4col' ? 700 : 500,
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      boxShadow: swotCols === '4col' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <Columns size={14} /> 4 Ô / Hàng (Trải Ngang)
                  </button>
                </div>
              </div>

              <div className="swot-grid-responsive" style={{ 
                display: 'grid', 
                gridTemplateColumns: swotCols === '4col' ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)', 
                gap: '18px' 
              }}>
                
                {/* S - Điểm mạnh */}
                <div style={{ background: '#f0fdf4', padding: '18px', borderRadius: '12px', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 800, marginBottom: '10px' }}>
                    <span style={{ background: '#166534', color: '#ffffff', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>S</span>
                    STRENGTHS (ĐIỂM MẠNH)
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#14532d', fontSize: '0.88rem', lineHeight: 1.6, flex: 1 }}>
                    {SWOT_DATA.strengths.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '8px' }}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* W - Điểm yếu */}
                <div style={{ background: '#fff1f2', padding: '18px', borderRadius: '12px', border: '1px solid #fecdd3', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9f1239', fontWeight: 800, marginBottom: '10px' }}>
                    <span style={{ background: '#9f1239', color: '#ffffff', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>W</span>
                    WEAKNESSES (ĐIỂM YẾU)
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#881337', fontSize: '0.88rem', lineHeight: 1.6, flex: 1 }}>
                    {SWOT_DATA.weaknesses.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '8px' }}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* O - Cơ hội */}
                <div style={{ background: '#eff6ff', padding: '18px', borderRadius: '12px', border: '1px solid #bfdbfe', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af', fontWeight: 800, marginBottom: '10px' }}>
                    <span style={{ background: '#1e40af', color: '#ffffff', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>O</span>
                    OPPORTUNITIES (CƠ HỘI)
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#1e3a8a', fontSize: '0.88rem', lineHeight: 1.6, flex: 1 }}>
                    {SWOT_DATA.opportunities.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '8px' }}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* T - Thách thức */}
                <div style={{ background: '#fffbeb', padding: '18px', borderRadius: '12px', border: '1px solid #fde68a', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e', fontWeight: 800, marginBottom: '10px' }}>
                    <span style={{ background: '#92400e', color: '#ffffff', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>T</span>
                    THREATS (THÁCH THỨC & RỦI RO)
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#78350f', fontSize: '0.88rem', lineHeight: 1.6, flex: 1 }}>
                    {SWOT_DATA.threats.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '8px' }}>{item}</li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB 2: HÀNH TRÌNH THỰC TẾ 6N5Đ (STICKY DAY NAVIGATION THEO YÊU CẦU)
           ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'itinerary' && (
          <div>
            
            {/* ── STICKY DAY SELECTOR BAR (GHIM CỐ ĐỊNH KHI CUỘN ĐỂ XEM DỄ DÀNG) ── */}
            <div className="sticky-day-bar">
              <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 4px', display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }} className="no-scrollbar">
                
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', paddingLeft: '6px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} /> Chọn Ngày:
                </span>

                <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                  {ITINERARY_DAYS.map(d => {
                    const isSelected = selectedDay === d.day;
                    return (
                      <button
                        key={d.day}
                        onClick={() => handleSelectDay(d.day)}
                        className="day-pill-btn"
                        style={{
                          flexShrink: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          padding: '8px 14px',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid #059669' : '1px solid #cbd5e1',
                          background: isSelected ? '#ecfdf5' : '#ffffff',
                          color: isSelected ? '#065f46' : '#475569',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 2px 6px rgba(5,150,105,0.18)' : 'none'
                        }}
                      >
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: isSelected ? '#059669' : '#64748b' }}>
                          Ngày {d.day} · {d.date}
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '2px', color: '#0f172a', whiteSpace: 'nowrap' }}>
                          {d.route.split('→').slice(-2).join('→').trim()}
                        </div>
                      </button>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* Selected Day Full View */}
            {(() => {
              const current = ITINERARY_DAYS.find(d => d.day === selectedDay) || ITINERARY_DAYS[0];
              return (
                <div id="day-detail-section" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Day Header Banner */}
                  <div style={{ background: '#ffffff', borderRadius: '16px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div className="day-header-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ background: '#059669', color: 'white', padding: '3px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800 }}>
                            NGÀY {current.day}
                          </span>
                          <span style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>{current.date}</span>
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                          {current.route}
                        </h2>
                      </div>

                      <div className="day-header-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {current.hotelDriveUrl && (
                          <a 
                            href={current.hotelDriveUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              padding: '8px 12px', borderRadius: '8px',
                              background: '#ecfdf5', border: '1px solid #a7f3d0',
                              color: '#065f46', fontSize: '0.8rem', fontWeight: 700,
                              textDecoration: 'none'
                            }}
                          >
                            <Camera size={14} /> Ảnh KS (Drive) <ExternalLink size={12} />
                          </a>
                        )}

                        {current.lunchDriveUrl && (
                          <a 
                            href={current.lunchDriveUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              padding: '8px 12px', borderRadius: '8px',
                              background: '#fff7ed', border: '1px solid #fed7aa',
                              color: '#c2410c', fontSize: '0.8rem', fontWeight: 700,
                              textDecoration: 'none'
                            }}
                          >
                            <Utensils size={14} /> Ảnh Trưa (Drive) <ExternalLink size={12} />
                          </a>
                        )}

                        {current.dinnerDriveUrl && (
                          <a 
                            href={current.dinnerDriveUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              padding: '8px 12px', borderRadius: '8px',
                              background: '#f5f3ff', border: '1px solid #ddd6fe',
                              color: '#6d28d9', fontSize: '0.8rem', fontWeight: 700,
                              textDecoration: 'none'
                            }}
                          >
                            <Utensils size={14} /> Ảnh Tối (Drive) <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="day-meta-chips-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '16px' }}>
                      <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>Khoảng cách</span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{current.distance}</span>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>Thời gian xe</span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{current.duration}</span>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>Lưu trú đêm</span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0284c7' }}>{current.hotel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Key Alert Warning for Day */}
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderLeft: '5px solid #d97706', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <AlertTriangle size={22} style={{ color: '#d97706', flexShrink: 0 }} />
                    <div style={{ fontSize: '0.9rem', color: '#92400e', fontWeight: 600, lineHeight: 1.5 }}>
                      <strong>LƯU Ý QUAN TRỌNG:</strong> {current.keyAlert}
                    </div>
                  </div>

                  {/* Meals of the Day */}
                  <div style={{ background: '#ffffff', borderRadius: '16px', padding: '18px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.78rem', color: '#ea580c', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Utensils size={15} /> Khẩu Phần & Bữa Ăn Trong Ngày
                    </div>
                    <div className="responsive-cards-1col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                      <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Bữa Sáng:</span>
                        <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>{current.meals.breakfast}</div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Bữa Trưa:</span>
                        <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>{current.meals.lunch}</div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Bữa Tối:</span>
                        <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>{current.meals.dinner}</div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Step-by-Step Experience Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h3 style={{ margin: '6px 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                      Nhật Ký Khảo Sát Từng Hoạt Động Cốt Lõi:
                    </h3>

                    {current.details.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div key={idx} style={{ 
                          background: '#ffffff', 
                          borderRadius: '14px', 
                          padding: '18px', 
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ 
                                background: item.tagColor + '15', 
                                color: item.tagColor, 
                                fontSize: '0.7rem', 
                                fontWeight: 800, 
                                padding: '3px 8px', 
                                borderRadius: '6px',
                                textTransform: 'uppercase'
                              }}>
                                {item.tag}
                              </span>
                              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                                {item.title}
                              </h4>
                            </div>

                            <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                              📌 {item.actionFor}
                            </span>
                          </div>

                          <p style={{ margin: 0, color: '#334155', lineHeight: 1.6, fontSize: '0.9rem' }}>
                            {item.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })()}

          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB 3: KHÁCH SẠN & RESORT (HOTEL SCORECARD & AUDIT)
           ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'hotels' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            
            {/* Header info */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '22px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 800, textTransform: 'uppercase' }}>Kiểm Định Dịch Vụ Lưu Trú</span>
              <h2 style={{ margin: '4px 0 8px', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Đánh Giá Chi Tiết 5 Khách Sạn & Resort Đoàn Đã Trải Nghiệm</h2>
              <p style={{ margin: 0, color: '#475569', lineHeight: 1.6, fontSize: '0.92rem' }}>
                Khảo sát thực tế cơ sở vật chất, chất lượng phòng, tiện ích hồ bơi, buffet sáng, khả năng tiếp cận của xe 45 chỗ và khuyến nghị giải pháp cho tour chính thức của FIT TOUR.
              </p>
            </div>

            {/* Hotel Cards Grid */}
            <div className="hotel-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '18px' }}>
              {HOTELS_SCORECARD.map((hotel, idx) => (
                <div key={idx} style={{ 
                  background: '#ffffff', 
                  borderRadius: '16px', 
                  border: '1px solid #e2e8f0', 
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
                }}>
                  {/* Hotel Header */}
                  <div style={{ background: hotel.color, color: '#ffffff', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', opacity: 0.9, textTransform: 'uppercase', fontWeight: 700 }}>{hotel.stayNight}</div>
                      <h3 style={{ margin: '2px 0 0', fontSize: '1.2rem', fontWeight: 800 }}>{hotel.name}</h3>
                      <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>📍 {hotel.location} · {hotel.stars}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', padding: '6px 10px', borderRadius: '10px', textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{hotel.score}</div>
                      <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', fontWeight: 700 }}>/ 10 ĐIỂM</div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    {/* Strengths */}
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={14} /> Ưu Điểm Nổi Bật:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '18px', color: '#334155', fontSize: '0.86rem', lineHeight: 1.55 }}>
                        {hotel.strengths.map((s, sIdx) => (
                          <li key={sIdx} style={{ marginBottom: '4px' }}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#991b1b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={14} /> Điểm Cần Lưu Ý:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '18px', color: '#64748b', fontSize: '0.86rem', lineHeight: 1.55 }}>
                        {hotel.weaknesses.map((w, wIdx) => (
                          <li key={wIdx} style={{ marginBottom: '4px' }}>{w}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendation Badge */}
                    <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Khuyến Nghị FIT TOUR:</div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: hotel.color, background: hotel.color + '12', padding: '8px 10px', borderRadius: '8px', lineHeight: 1.4, marginBottom: '10px' }}>
                        {hotel.recommendation}
                      </div>

                      {/* Direct Google Drive Link Button */}
                      <a 
                        href={hotel.driveUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          padding: '10px 14px', borderRadius: '8px',
                          background: '#ffffff', border: `1.5px solid ${hotel.color}`,
                          color: hotel.color, fontSize: '0.82rem', fontWeight: 700,
                          textDecoration: 'none', transition: 'all 0.15s'
                        }}
                      >
                        <Camera size={14} /> Mở Album Ảnh Khách Sạn (Drive) <ExternalLink size={12} />
                      </a>
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB 4: ẨM THỰC & NHÀ HÀNG (FOOD & DINING AUDIT)
           ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'dining' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            
            {/* Header info */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '22px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 800, textTransform: 'uppercase' }}>Khẩu Vị & Trải Nghiệm Ăn Uống</span>
                  <h2 style={{ margin: '4px 0 8px', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Thực Tế Ẩm Thực Sri Lanka & Lời Khuyên Cho Khách Việt</h2>
                  <p style={{ margin: 0, color: '#475569', lineHeight: 1.6, fontSize: '0.92rem' }}>
                    Đồ ăn bản địa Sri Lanka sử dụng rất nhiều hương liệu và gia vị, khẩu vị khá cay và gần với món Ấn Độ. Tuy nhiên, chuyến đi đã chứng minh việc lựa chọn các bữa <strong>Buffet tại khách sạn 4–5 sao</strong> là chiến lược cực kỳ đúng đắn, giúp du khách dễ dàng chọn các món Á - Âu trung tính, rau xanh, hoa quả tươi và bánh ngọt.
                  </p>
                </div>
                <a 
                  href="https://drive.google.com/drive/folders/1XqHzlagbt_nyi_Ql_8plG6j2NQqhLM39" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '8px 12px', borderRadius: '8px',
                    background: '#fff7ed', border: '1px solid #fed7aa',
                    color: '#c2410c', fontSize: '0.82rem', fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <Utensils size={15} /> Toàn Bộ Ảnh Ăn Uống (Drive) <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Special highlights grid */}
            <div className="responsive-cards-1col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              
              {/* Bánh Hopper */}
              <div style={{ background: '#ffffff', borderRadius: '14px', padding: '18px', border: '1px solid #fed7aa', borderLeft: '5px solid #f97316' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>🥞</span>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Đặc Sản Bánh Hopper (Appa)</h3>
                </div>
                <p style={{ margin: 0, color: '#334155', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  Đây là món ăn truyền thống đặc trưng không thể bỏ qua của người Sri Lanka. Bánh làm từ bột gạo lên men và nước cốt dừa tráng giòn như một chiếc bát nhỏ, bên trong có thể ốp thêm trứng gà (Egg Hopper) hoặc sốt sambol cay nhẹ.
                </p>
              </div>

              {/* Review Oak Ray Flower Drum */}
              <div style={{ background: '#ffffff', borderRadius: '14px', padding: '18px', border: '1px solid #fecaca', borderLeft: '5px solid #ef4444' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>⚠️</span>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#991b1b' }}>Nhà Hàng Cần Đổi: Oak Ray Flower Drum</h3>
                </div>
                <p style={{ margin: 0, color: '#334155', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  Bữa trưa Ngày 6 tại Colombo ăn ở nhà hàng Oak Ray Flower Drum chỉ ở mức trung bình. Tên là nhà hàng Trung Hoa nhưng món ăn nấu lai tạp kiểu Ấn Độ, không gian gượng ép. <strong>Đề xuất:</strong> Đổi ngay sang nhà hàng buffet quốc tế hoặc hải sản Colombo.
                </p>
              </div>

              {/* Buffet Radisson Blu Galle */}
              <div style={{ background: '#ffffff', borderRadius: '14px', padding: '18px', border: '1px solid #bbf7d0', borderLeft: '5px solid #10b981' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>👑</span>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#166534' }}>Bữa Sáng Đỉnh Cao: Radisson Blu Galle</h3>
                </div>
                <p style={{ margin: 0, color: '#334155', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  Buffet sáng tại Radisson Blu Resort Galle được toàn bộ thành viên đoàn khảo sát đánh giá 10/10. Đa dạng từ quầy bánh ngọt nướng nóng hổi, phô mai thượng hạng, quầy trứng theo yêu cầu đến hoa quả nhiệt đới tươi rói.
                </p>
              </div>

            </div>

            {/* Daily Meals Breakdown Table */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '6px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  Bảng Tổng Hợp & Đánh Giá Thực Tế Từng Bữa Ăn (Ngày 1 Đến Ngày 6)
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  👉 Vuốt ngang bảng để xem chi tiết & link ảnh từng bữa
                </span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem', minWidth: '600px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 12px' }}>Ngày</th>
                    <th style={{ padding: '10px 12px' }}>Bữa Sáng (Khách sạn)</th>
                    <th style={{ padding: '10px 12px' }}>Bữa Trưa (Nhà hàng)</th>
                    <th style={{ padding: '10px 12px' }}>Bữa Tối (Địa phương/KS)</th>
                    <th style={{ padding: '10px 12px' }}>Đánh Giá Chung</th>
                    <th style={{ padding: '10px 12px' }}>Kho Ảnh Drive</th>
                  </tr>
                </thead>
                <tbody style={{ divideY: '1px solid #e2e8f0' }}>
                  <tr>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>Ngày 1</td>
                    <td style={{ padding: '10px 12px', color: '#64748b' }}>Tự túc tại VN</td>
                    <td style={{ padding: '10px 12px', color: '#64748b' }}>Trên máy bay</td>
                    <td style={{ padding: '10px 12px', color: '#ef4444', fontWeight: 600 }}>Tự túc đêm muộn (Hàng quán đóng cửa)</td>
                    <td style={{ padding: '10px 12px' }}><span style={{ background: '#fee2e2', color: '#991b1b', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>Cần chuẩn bị đồ ăn</span></td>
                    <td style={{ padding: '10px 12px' }}>
                      <a href="https://drive.google.com/drive/folders/16qSWvmo7qAfVcQVYBl0M0_HDzUF9IP0r" target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        Trưa N1 <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>Ngày 2</td>
                    <td style={{ padding: '10px 12px' }}>Buffet Pledge Scape Negombo</td>
                    <td style={{ padding: '10px 12px' }}>Nhà hàng địa phương Sigiriya</td>
                    <td style={{ padding: '10px 12px' }}>Buffet Fresco Water Villa</td>
                    <td style={{ padding: '10px 12px' }}><span style={{ background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>Tốt · Dễ ăn</span></td>
                    <td style={{ padding: '10px 12px' }}>
                      <a href="https://drive.google.com/drive/folders/1tEHeygW1l8vaA8HRyquEoiohsYTvxurz" target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        Trưa N2 <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>Ngày 3</td>
                    <td style={{ padding: '10px 12px' }}>Buffet Fresco Water Villa</td>
                    <td style={{ padding: '10px 12px' }}>Nhà hàng Dambulla - Kandy</td>
                    <td style={{ padding: '10px 12px' }}>Buffet Radisson Hotel Kandy</td>
                    <td style={{ padding: '10px 12px' }}><span style={{ background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>Rất Tốt · Radisson</span></td>
                    <td style={{ padding: '10px 12px' }}>
                      <a href="https://drive.google.com/drive/folders/1Wkv7BJFPkuLLqoI1oQPwUFQB24umIyoj" target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        Trưa N3 <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>Ngày 4</td>
                    <td style={{ padding: '10px 12px' }}>Buffet Radisson Kandy</td>
                    <td style={{ padding: '10px 12px' }}>Nhà hàng ga Nanu Oya</td>
                    <td style={{ padding: '10px 12px' }}>Buffet Morning Dew Ella</td>
                    <td style={{ padding: '10px 12px' }}><span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>Khá · View đẹp</span></td>
                    <td style={{ padding: '10px 12px' }}>
                      <a href="https://drive.google.com/drive/folders/1nzZV9QvyLw2eQhDOXJ98dhuYBh3C-HUX" target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        Trưa N4 <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>Ngày 5</td>
                    <td style={{ padding: '10px 12px' }}>Buffet Morning Dew Ella</td>
                    <td style={{ padding: '10px 12px' }}>Nhà hàng đường đi Galle</td>
                    <td style={{ padding: '10px 12px' }}>Buffet Radisson Blu Galle</td>
                    <td style={{ padding: '10px 12px' }}><span style={{ background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>Xuất Sắc · 5 Sao</span></td>
                    <td style={{ padding: '10px 12px' }}>
                      <a href="https://drive.google.com/drive/folders/1SWtXC2qqtzI7U58rZfr0N2ausLz7Z47o" target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        Trưa N5 <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>Ngày 6</td>
                    <td style={{ padding: '10px 12px' }}>Buffet 5★ Radisson Blu Galle</td>
                    <td style={{ padding: '10px 12px', color: '#ef4444' }}>Oak Ray Flower Drum (Trung bình)</td>
                    <td style={{ padding: '10px 12px' }}>Nhà hàng gần sân bay CMB</td>
                    <td style={{ padding: '10px 12px' }}><span style={{ background: '#fee2e2', color: '#991b1b', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>Cần thay bữa trưa</span></td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <a href="https://drive.google.com/drive/folders/1Ka9XEOyIz6WAhKkShUWrrOfrOeI6JHFx" target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                          Trưa N6 <ExternalLink size={11} />
                        </a>
                        <span>|</span>
                        <a href="https://drive.google.com/drive/folders/1JVmT5xQSxrG9ESLTzGvSegYZ-Xnenisp" target="_blank" rel="noopener noreferrer" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                          Tối N6 <ExternalLink size={11} />
                        </a>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB 5: XE CỘ & VẬN CHUYỂN (TRANSPORT & FLEET STRATEGY)
           ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'transport' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            
            {/* The Big Vehicle Debate Card */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '22px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338ca', flexShrink: 0 }}>
                    <Bus size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#4338ca', fontWeight: 800, textTransform: 'uppercase' }}>Bài Toán Vận Tải Chiến Lược</span>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>Cuộc Tranh Luận: Xe 45 Chỗ vs Đề Xuất Xe 29 Chỗ Đời Mới</h2>
                  </div>
                </div>

                <a 
                  href="https://drive.google.com/drive/folders/1zvjCZrNvqQwwwtafcj_NYnparAZ3HRwR" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '8px 12px', borderRadius: '8px',
                    background: '#eff6ff', border: '1px solid #bfdbfe',
                    color: '#1d4ed8', fontSize: '0.82rem', fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <Bus size={15} /> Xem Kho Ảnh Xe & Đường Đèo (Drive) <ExternalLink size={12} />
                </a>
              </div>

              <p style={{ color: '#334155', lineHeight: 1.65, fontSize: '0.92rem', margin: '0 0 18px 0' }}>
                Trong chuyến FARM Trip, đoàn đã trải nghiệm xe 45 chỗ đời mới. Dù xe mới và điều hòa tốt, nhưng kích thước cồng kềnh bộc lộ nhiều nhược điểm nghiêm trọng khi đi vào các cung đường cao nguyên miền Trung Sri Lanka.
              </p>

              <div className="responsive-cards-1col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                
                {/* Xe 45 Chỗ */}
                <div style={{ background: '#fef2f2', padding: '18px', borderRadius: '12px', border: '1px solid #fecaca' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#991b1b', fontWeight: 800, marginBottom: '8px' }}>
                    <XCircle size={18} /> THỰC TẾ XE 45 CHỖ (ĐỐI TÁC DÙNG)
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#7f1d1d', fontSize: '0.86rem', lineHeight: 1.6 }}>
                    <li><strong>Quá cồng kềnh trên đường đèo:</strong> Cung đường Kandy - Ella có nhiều khúc cua tay áo hẹp, xe to phải giảm tốc tối đa và lấn làn nguy hiểm.</li>
                    <li><strong>Gây say xe nặng:</strong> Thời gian đu đưa trên đèo dốc kéo dài 3 tiếng liên tục, đuôi xe văng làm khách mệt lử.</li>
                    <li><strong>Không tiếp cận được khách sạn:</strong> Đường lên sườn đồi Morning Dew Ella quá dốc và hẹp, xe 45 chỗ bắt buộc phải đỗ dưới chân dốc.</li>
                  </ul>
                </div>

                {/* Xe 29 Chỗ */}
                <div style={{ background: '#f0fdf4', padding: '18px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 800, marginBottom: '8px' }}>
                    <CheckCircle2 size={18} /> ĐỀ XUẤT CỦA FIT TOUR: XE 29 CHỖ ĐỜI MỚI
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#14532d', fontSize: '0.86rem', lineHeight: 1.6 }}>
                    <li><strong>Linh hoạt và an toàn:</strong> Dễ dàng vào cua, bám đường tốt, hạn chế tối đa say xe cho các cung đèo quanh co.</li>
                    <li><strong>Đón trả tận sảnh khách sạn:</strong> Dễ dàng leo dốc lên các khách sạn và resort boutique phong cảnh đẹp.</li>
                    <li><strong>Tiêu chuẩn vàng:</strong> Quan trọng nhất không phải số chỗ, mà là <em>xe phải đời mới, nội thất thơm sạch và máy lạnh êm</em>. Phải kiểm tra xe ngay sân bay và kiên quyết yêu cầu đổi nếu đối tác giao xe cũ!</li>
                  </ul>
                </div>

              </div>
            </div>

            {/* Driving Rules & Safety in Sri Lanka */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '22px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Đặc Điểm Giao Thông & Lưu Ý An Toàn Cho Trưởng Đoàn / HDV
              </h3>

              <div className="responsive-cards-1col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>⬅️ Lưu Thông Bên Trái</div>
                  <div style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5 }}>
                    Sri Lanka chạy làn tay lái nghịch bên trái (theo hệ thống Anh Quốc). HDV nhắc khách cẩn thận quan sát khi bước xuống xe hoặc băng qua đường.
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>🛑 Bắt Buộc Thắt Dây An Toàn</div>
                  <div style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5 }}>
                    Kể cả trên đường cao tốc, thỉnh thoảng có động vật (chó, trâu, kỳ đà) bất ngờ băng ngang khiến tài xế phanh gấp. Nhắc khách thắt dây an toàn 100%.
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>⏱️ Tốc Độ Di Chuyển Chậm</div>
                  <div style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5 }}>
                    Đường cao tốc tốc độ tối đa 60–70 km/h; đường quốc lộ chỉ 40–50 km/h do nhiều xe tuk tuk và người đi bộ. Khoảng cách 100km có thể mất tới 3 tiếng.
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>💊 Thuốc Chống Say Xe</div>
                  <div style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5 }}>
                    Chặng Kandy – Nanu Oya – Ella có địa hình đèo cua liên tục 3-4 tiếng. HDV phải phát thuốc say xe cho khách trước giờ khởi hành 30 phút.
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB 6: 10 BÀI HỌC THỰC CHIẾN (PRACTICAL TIPS - TOÀN BỘ 10 BÍ KÍP)
           ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'tips' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 800, textTransform: 'uppercase' }}>Cẩm Nang Thực Địa Sống Còn</span>
                  <h2 style={{ margin: '4px 0 0', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>10 Bí Kíp Thực Chiến Dành Cho Toàn Đội Ngũ FIT TOUR</h2>
                </div>
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  Được đúc kết trực tiếp từ 6 ngày trải nghiệm thực địa tại Sri Lanka
                </div>
              </div>
            </div>

            {/* List of Tips with copy button (All 10 shown directly) */}
            <div className="tips-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
              {PRACTICAL_TIPS.map(tip => (
                <div key={tip.id} style={{ 
                  background: '#ffffff', 
                  borderRadius: '16px', 
                  padding: '20px', 
                  border: '1px solid #e2e8f0', 
                  borderLeft: `5px solid ${tip.color}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ 
                        background: tip.color + '15', 
                        color: tip.color, 
                        fontSize: '0.72rem', 
                        fontWeight: 800, 
                        padding: '3px 8px', 
                        borderRadius: '6px' 
                      }}>
                        {tip.badge} · #{tip.id}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                        {tip.category}
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 10px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.35 }}>
                      {tip.title}
                    </h3>

                    <p style={{ margin: '0 0 14px', color: '#334155', fontSize: '0.88rem', lineHeight: 1.6 }}>
                      {tip.content}
                    </p>
                  </div>

                  {/* Copy Action Box (Tối ưu tap thumb trên điện thoại) */}
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>💬 Tin nhắn mẫu gửi khách / đoàn:</span>
                      <button
                        onClick={() => handleCopy(`tip-${tip.id}`, tip.copyText)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          border: 'none', background: copiedId === `tip-${tip.id}` ? '#10b981' : '#0284c7',
                          color: '#ffffff', padding: '6px 10px', borderRadius: '6px',
                          fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                          minHeight: '34px', transition: 'all 0.2s'
                        }}
                      >
                        {copiedId === `tip-${tip.id}` ? <Check size={13} /> : <Copy size={13} />}
                        {copiedId === `tip-${tip.id}` ? 'Đã copy' : 'Copy'}
                      </button>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic', lineHeight: 1.45 }}>
                      "{tip.copyText}"
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB 7: KẾ HOẠCH HÀNH ĐỘNG (ACTION PLAN MATRIX)
           ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'action' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            
            <div style={{ background: '#ffffff', padding: '22px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 800, textTransform: 'uppercase' }}>Kế Hoạch Triển Khai Thực Tế</span>
              <h2 style={{ margin: '4px 0 6px', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Checklist Nhiệm Vụ Các Phòng Ban Cần Xử Lý Ngay</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                Để biến kết quả khảo sát thành sản phẩm tour thương mại thắng lớn, các phòng ban cần bám sát danh mục đầu việc dưới đây.
              </p>
            </div>

            <div className="actions-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              {ACTION_MATRIX.map((dept, idx) => (
                <div key={idx} style={{ 
                  background: '#ffffff', 
                  borderRadius: '16px', 
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
                }}>
                  <div style={{ background: dept.color, color: '#ffffff', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{dept.department}</div>
                  </div>

                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {dept.tasks.map((task, tIdx) => (
                      <div key={tIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ 
                          fontSize: '0.68rem', 
                          fontWeight: 800, 
                          padding: '2px 7px', 
                          borderRadius: '4px',
                          background: task.status === 'Khẩn cấp' || task.status === 'Bắt buộc' ? '#fee2e2' : '#dbeafe',
                          color: task.status === 'Khẩn cấp' || task.status === 'Bắt buộc' ? '#991b1b' : '#1e40af',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>
                          {task.status}
                        </span>
                        <span style={{ fontSize: '0.86rem', color: '#1e293b', lineHeight: 1.5 }}>
                          {task.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB 8: KHO ẢNH KHẢO SÁT (PHOTO GALLERIES & ASSETS)
           ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'gallery' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            
            <div style={{ background: '#ffffff', padding: '22px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 800, textTransform: 'uppercase' }}>Tư Liệu Thực Địa & Truyền Thông</span>
                  <h2 style={{ margin: '4px 0 6px', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Thư Viện Album Ảnh Khảo Sát Sri Lanka 2026</h2>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                    Phân loại chi tiết toàn bộ ảnh phương tiện, khách sạn 5 sao, các bữa ăn thực tế và góc chụp biểu tượng cho Marketing & Sales.
                  </p>
                </div>
                <div style={{ background: '#f5f3ff', color: '#7c3aed', padding: '6px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
                  📸 4 Album Trọng Điểm · 230+ File Tư Liệu
                </div>
              </div>
            </div>

            <div className="gallery-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
              {PHOTO_ALBUMS.map((album, idx) => {
                const Icon = album.icon;
                return (
                  <div key={idx} style={{ 
                    background: '#ffffff', 
                    borderRadius: '16px', 
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ background: album.color, color: '#ffffff', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.9, fontWeight: 700 }}>Album Chuyên Đề</span>
                          <h3 style={{ margin: '2px 0 0', fontSize: '1.1rem', fontWeight: 800 }}>{album.category}</h3>
                        </div>
                      </div>
                      <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                        {album.count}
                      </span>
                    </div>

                    <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <p style={{ margin: 0, color: '#475569', fontSize: '0.86rem', lineHeight: 1.55 }}>
                        {album.desc}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: 'auto', paddingTop: '8px' }}>
                        {album.albums.map((item, iIdx) => (
                          <div key={iIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '0.82rem', color: '#1e293b', fontWeight: 600 }}>{item.name}</span>
                            <span style={{ fontSize: '0.68rem', background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{item.tag}</span>
                          </div>
                        ))}
                      </div>

                      <a
                        href={album.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          padding: '10px 14px', borderRadius: '10px',
                          background: album.color, color: '#ffffff',
                          fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none',
                          marginTop: '4px', transition: 'all 0.15s'
                        }}
                      >
                        <Camera size={15} /> Mở Album Google Drive <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>

      {/* ── FLOATING BACK TO TOP BUTTON (TIỆN LỢI TRÊN ĐIỆN THOẠI) ── */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          aria-label="Lên đầu trang"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '20px',
            zIndex: 99,
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: '#059669',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(5,150,105,0.35)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <ChevronUp size={22} />
        </button>
      )}

    </div>
  );
};

export default SriLankaFarmTripReportPage;
