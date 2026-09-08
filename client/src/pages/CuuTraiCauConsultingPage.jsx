import React, { useState, useEffect } from 'react';
import { Briefcase, HeartPulse, CloudSun, BookKey as Passport, Search, Copy, CheckCircle2, ChevronDown, Hash, PhoneCall, Sparkles, MessageSquare, Info, Zap, ChevronRight, ExternalLink, Star, Music, Heart, BookOpen, Navigation, Library, Award, Users, List, Map, Mountain, Image as ImageIcon, Video, ShieldCheck, Wallet, Compass, Smile } from 'lucide-react';
import { Link } from 'react-router-dom';

const referenceLinks = [
    { 
        title: "Lịch Trình Chi Tiết Tour (6N5Đ)", 
        desc: "Tour Thành Đô - Cửu Trại Câu - Đạt Cổ Băng Xuyên - No Shopping", 
        url: "https://fittour.vn/tour/cuu-trai-cau-fittour", 
        icon: "List", 
        color: "#f97316",
        type: "tour",
        copyText: "Dạ đây là lịch trình chi tiết tour Thành Đô - Cửu Trại Câu (6N5Đ) bên em. Tour bay thẳng TP.HCM bằng Sichuan Airlines, trải nghiệm tàu cao tốc xuyên núi, ở khách sạn 4-5 sao và cam kết No Shopping ép buộc. Anh/chị xem chi tiết lịch trình tại đây nhé: https://fittour.vn/tour/cuu-trai-cau-fittour"
    },
    { 
        title: "Emagazine: Hành Trình Đặng Thùy Dương", 
        desc: "Trải nghiệm thực tế đầy cảm xúc của KOL Đặng Thùy Dương cùng FIT Tour", 
        url: "https://fittour.vn/emagazine-cuu-trai-cau", 
        icon: "Star", 
        color: "#ec4899",
        type: "marketing",
        copyText: "Dạ anh/chị xem qua bài Emagazine trải nghiệm Cửu Trại Câu của Travel Blogger Đặng Thùy Dương đồng hành cùng FIT Tour nhé. Bài viết chia sẻ rất chân thực từ cảnh sắc mùa thu hồ Ngũ Sắc, thác Trân Châu cho đến trải nghiệm đi cùng FIT Tour nhóm nhỏ: https://fittour.vn/emagazine-cuu-trai-cau"
    },
    { 
        title: "Gallery Ảnh Thực Tế Cửu Trại Câu", 
        desc: "Bộ sưu tập ảnh thực tế của du khách FIT Tour tại chốn tiên cảnh", 
        url: "https://fittour.vn/gallery-cuu-trai-cau", 
        icon: "Image", 
        color: "#10b981",
        type: "marketing",
        copyText: "Dạ trăm nghe không bằng một thấy, em gửi anh/chị xem album hình ảnh thực tế du khách FIT Tour check-in Cửu Trại Câu nhé. Nước hồ ở ngoài trong vắt đổi màu ngọc bích cực kỳ ảo diệu, cảnh sắc bên ngoài còn lộng lẫy hơn trong hình rất nhiều: https://fittour.vn/gallery-cuu-trai-cau"
    }
];

const groupedFaqs = [
  {
    category: "Chi Phí, Thanh Toán & Tiền Tệ (CNY)",
    icon: "Wallet",
    color: "#f97316",
    items: [
      { 
        id: "q_payment_flow", 
        q: "1. Chi phí tour thanh toán như thế nào? Cọc 50-50 trước khi đi và tất toán sau tour, hay 100% trước khi đi?", 
        variants: [
            { 
                type: "Trọng tâm & Rõ ràng (Khuyên dùng)", 
                text: "Dạ về tiến độ thanh toán tour Cửu Trại Câu bên em:\n1. Đợt 1: Anh/chị đặt cọc 50% giá tour để bên em giữ chỗ và tiến hành nộp hồ sơ xin visa đoàn.\n2. Đợt 2: Khi có kết quả visa (khoảng 5-7 ngày làm việc), anh/chị sẽ thanh toán 50% số tiền còn lại trước ngày khởi hành để bên em xuất vé máy bay và hoàn tất đặt dịch vụ.\nToàn bộ chi phí sẽ hoàn tất thanh toán 100% trước khi bay ạ, vì các dịch vụ vé máy bay quốc tế, vé tàu cao tốc và phòng khách sạn mùa thu Cửu Trại Câu đều cần thanh toán xuất vé trước để đảm bảo vị trí tốt nhất cho đoàn ạ." 
            },
            { 
                type: "Minh bạch & An tâm", 
                text: "Dạ bên em nhận cọc giữ chỗ 50% trước. Khi nào visa chính thức được cấp thành công thì anh/chị mới cần thanh toán số tiền còn lại trước ngày khởi hành. Mọi khoản thanh toán đều có hợp đồng, phiếu thu và hóa đơn điện tử đầy đủ của công ty nên mình hoàn toàn yên tâm nhé ạ." 
            }
        ],
        a: [
            "Dạ quy định thanh toán của tour du lịch quốc tế là hoàn tất 100% trước khi khởi hành.",
            "- Đợt 1: Cọc 50% giá tour ngay khi đăng ký. Khoản cọc này để xuất vé máy bay theo đoàn (hãng Sichuan Airlines), đăng ký slot visa đoàn và đặt cọc giữ phòng tại hệ thống khách sạn 4-5 sao.",
            "- Đợt 2: Thanh toán 50% còn lại ngay sau khi có kết quả visa đoàn (thường trước khởi hành 7 - 10 ngày). Lúc này công ty sẽ xuất vé máy bay điện tử chính thức, vé tàu cao tốc định danh theo số hộ chiếu của khách và gửi sổ tay chuẩn bị hành lý cho đoàn.",
            "Lý do không tất toán sau tour: Hãng hàng không quốc tế, đường sắt cao tốc Trung Quốc và các khu danh thắng (Cửu Trại Câu, Đạt Cổ Băng Xuyên) đều yêu cầu xuất vé và thanh toán 100% trước khi cấp mã vào cổng."
        ] 
      },
      { 
        id: "q_all_inclusive", 
        q: "2. Tour này đã bao gồm trọn gói chưa? Cần chuẩn bị thêm bao nhiêu tiền mặt (CNY) mang theo?", 
        variants: [
            { 
                type: "Tư vấn chi phí (Chi tiết)", 
                text: "Dạ tour Cửu Trại Câu bên em là TOUR TRỌN GÓI hoàn toàn từ vé máy bay bay thẳng khứ hồi, khách sạn 4-5 sao, di chuyển tàu cao tốc xuyên núi, vé vào cổng di sản, cáp treo Đạt Cổ Băng Xuyên cho đến tất cả các bữa ăn (lẩu Tây Tạng, ẩm thực Tứ Xuyên giảm cay hợp vị Việt).\n\nMình chỉ cần lưu ý về chi phí shopping cá nhân thôi ạ. Thường anh/chị chỉ cần chuẩn bị tầm 1.000 - 2.000 CNY (khoảng 3.5 - 7 triệu VNĐ) nếu không có nhu cầu mua sắm đặc biệt, số tiền này là rất thoải mái để mua quà lưu niệm, ăn vặt và uống cà phê rồi ạ." 
            },
            { 
                type: "Ngắn gọn & Dễ nhớ", 
                text: "Dạ mọi chi phí ăn uống, khách sạn, xe cộ, vé tham quan và visa bên em đã lo trọn gói từ A-Z. Anh/chị chỉ cần chuẩn bị khoảng 1.000 - 2.000 Nhân Dân Tệ (CNY) để tiêu vặt hoặc mua quà lưu niệm theo sở thích thôi ạ!" 
            }
        ],
        a: [
            "Giá tour Cửu Trại Câu đã bao gồm đầy đủ:",
            "- Vé máy bay bay thẳng khứ hồi TP.HCM – Thành Đô (Sichuan Airlines) + 23kg hành lý ký gửi + 7kg xách tay.",
            "- Khách sạn tiêu chuẩn 4 - 5 sao cao cấp suốt tuyến (2 người/phòng).",
            "- Toàn bộ các bữa ăn theo chương trình, đặc biệt có bữa tiệc Lẩu Tây Tạng truyền thống.",
            "- Vé tàu cao tốc Thành Đô - Tùng Phan / Hoàng Long thế hệ mới.",
            "- Vé tham quan trọn gói: Khu danh thắng Cửu Trại Câu + xe buýt sinh thái nội khu, vé cáp treo khứ hồi Đạt Cổ Băng Xuyên (4.860m), Công viên Gấu Trúc, Phố cổ Cẩm Lý, Đô Giang Yển, Vũ Hầu Từ.",
            "- Visa đoàn nhập cảnh Trung Quốc + Bảo hiểm du lịch quốc tế.",
            "- Khách chỉ tự chi trả: Tiền Tip theo thông lệ quốc tế cho HDV và tài xế (khoảng 5 USD/ngày ~ 30 USD/tour), chi tiêu mua sắm cá nhân, và vé show diễn nghệ thuật Cửu Trại Thiên Cổ Tình (nếu khách có nhu cầu xem thêm)."
        ] 
      },
      { 
        id: "q_currency_exchange", 
        q: "3. Bên shop có hỗ trợ đổi tiền sang CNY không?", 
        variants: [
            { 
                type: "Tư vấn nhanh & Nhẹ nhàng (Khuyên dùng)", 
                text: "Dạ về việc hỗ trợ đổi tiền thì bên em thường có hỗ trợ và hướng dẫn cho mình ạ. Sau khi cọc vào group Zalo của đoàn, Team Leader bên em sẽ hỗ trợ tư vấn và hướng dẫn đầy đủ hết mọi điều cần thiết cho chuyến đi nên mình cứ yên tâm nhé ạ." 
            },
            { 
                type: "Ngắn gọn", 
                text: "Dạ bên em có hỗ trợ và hướng dẫn mình ạ. Khi tham gia group Zalo đoàn, Team Leader bên em sẽ hướng dẫn đầy đủ hết các điều cần thiết cho anh/chị trước ngày khởi hành ạ." 
            }
        ],
        a: [
            "Dạ bên mình có hỗ trợ và hướng dẫn đổi tiền cho khách, nhưng khâu này để Team Leader phụ trách tư vấn trong group Zalo sau khi khách đã cọc.",
            "- Khi tư vấn ban đầu: Sale chỉ cần xác nhận bên mình có hỗ trợ và hướng dẫn để khách an tâm, không nên đi quá sâu vào chi tiết địa điểm hay thao tác kỹ thuật trên khung chat.",
            "- Sau khi khách vào group Zalo đoàn: Team Leader sẽ chủ động gửi cẩm nang chuẩn bị và tư vấn riêng mọi vấn đề cần thiết trước chuyến đi."
        ] 
      }
    ]
  },
  {
    category: "Thủ Tục Visa Đoàn & Sim Data Liên Lạc",
    icon: "Passport",
    color: "#3b82f6",
    items: [
      { 
        id: "q_visa_procedure", 
        q: "4. Visa Trung Quốc là tự làm hay bên mình hỗ trợ? Cần những giấy tờ gì và bao lâu có?", 
        variants: [
            { 
                type: "Nhanh gọn & Yên tâm (Khuyên dùng)", 
                text: "Dạ FIT Tour sẽ hỗ trợ lo TRỌN GÓI visa đoàn Trung Quốc cho mình, anh/chị KHÔNG CẦN phải tự đi làm hay chứng minh tài chính gì phức tạp đâu ạ!\nThủ tục siêu đơn giản, anh/chị chỉ cần gửi cho em:\n1. File hình chụp trang thông tin hộ chiếu (hộ chiếu còn hạn trên 6 tháng).\n2. File hình thẻ 4x6 (nền trắng, chụp thẳng rõ mặt, không đeo kính).\nThời gian xét duyệt chỉ từ 5 - 7 ngày làm việc là có visa rồi ạ. Đến ngày bay, Trưởng đoàn (Tour Leader) bên em sẽ đón và cầm danh sách visa hỗ trợ đoàn làm thủ tục trực tiếp tại sân bay Tân Sơn Nhất luôn ạ." 
            },
            { 
                type: "Ngắn gọn", 
                text: "Dạ visa là trọn gói bên em làm hết cho mình ạ. Thời gian làm từ 5-7 ngày làm việc. Thủ tục chỉ cần gửi file ảnh chụp hộ chiếu (còn hạn 6 tháng) và 1 file ảnh thẻ 4x6 nền trắng là xong ạ!" 
            }
        ],
        a: [
            "FIT Tour sử dụng hình thức Visa Đoàn (Group Visa) nhập cảnh Trung Quốc qua cơ quan quản lý xuất nhập cảnh:",
            "- Ưu điểm vượt trội: Không cần phỏng vấn, không cần nộp hộ chiếu gốc trước, không cần chứng minh tài chính, công việc hay sổ tiết kiệm.",
            "- Hồ sơ yêu cầu cực kỳ tinh gọn: Chỉ cần file ảnh chụp mặt hộ chiếu (rõ nét 4 góc, còn hạn từ 6 tháng trở lên) + file ảnh chân dung 4x6 nền trắng (chụp không quá 6 tháng, không đeo kính, rõ hai tai).",
            "- Thời gian xét duyệt: Khoảng 5 - 7 ngày làm việc.",
            "- Toàn bộ quy trình nộp và nhận visa do FIT Tour phụ trách, Trưởng đoàn sẽ cầm hồ sơ gốc và làm thủ tục thông quan nhập cảnh cho cả đoàn tại sân bay Thiên Phủ (Thành Đô)."
        ] 
      },
      { 
        id: "q_sim_roaming", 
        q: "5. Bên shop có hỗ trợ roaming data cho điện thoại không?", 
        variants: [
            { 
                type: "Tặng eSIM cho chuyến đi (Khuyên dùng)", 
                text: "Dạ về Sim thì bên em có hỗ trợ tặng eSIM cho chuyến đi cho mình ạ." 
            },
            { 
                type: "Ngắn gọn", 
                text: "Dạ bên em có hỗ trợ tặng eSIM cho mình trong chuyến đi ạ, mình cứ yên tâm nhé." 
            }
        ],
        a: [
            "Dạ bên mình có chính sách hỗ trợ tặng eSIM cho khách trong chuyến đi.",
            "- Khi khách hỏi về roaming data hoặc SIM: Sale chỉ cần trả lời ngắn gọn, chuẩn xác là bên mình có hỗ trợ tặng eSIM cho chuyến đi.",
            "- Không vẽ thêm thông tin lan man hay hứa hẹn ngoài quy định của tour."
        ] 
      }
    ]
  },
  {
    category: "Cam Kết Small Group & Shopping",
    icon: "ShieldCheck",
    color: "#10b981",
    items: [
      { 
        id: "q_small_group_shopping", 
        q: "6. Tour có bị ép vào điểm mua sắm (Shopping) không? Đoàn bao nhiêu người?", 
        variants: [
            { 
                type: "Cam kết Small Group & No Shopping (Khuyên dùng)", 
                text: "Dạ bên em cam kết là SMALL GROUP (khoảng 15 - 20 khách), nên mình cứ yên tâm ạ. Tour bên em cam kết không ép buộc vào các điểm mua sắm (No Shopping), toàn bộ thời gian dành trọn vẹn để tham quan ngắm cảnh.\n\nRiêng Shopping thì mình vẫn có thời gian nghỉ ngơi thư thả và tự do mua sắm theo ý thích cá nhân vào các buổi tối tại Thành Đô và Đô Giang Yển ạ!" 
            },
            { 
                type: "Tự do dạo phố & Mua sắm", 
                text: "Dạ tour cam kết Không shopping ép buộc, nhưng vẫn có đầy đủ thời gian nghỉ ngơi và tự do mua sắm theo ý thích cá nhân. Buổi tối mình có thể thảnh thơi dạo phố đi bộ Xuân Hy Lộ sầm uất, mua sắm ở Thái Cổ Lý hoặc khám phá ẩm thực phố cổ Cẩm Lý rất thú vị ạ!" 
            }
        ],
        a: [
            "Triết lý thiết kế tour của FIT Tour: 'No Shopping, Go Deeper'.",
            "- Tour cam kết No Shopping ép buộc: Khách chi trả đúng chi phí tour để đổi lại 100% trải nghiệm tham quan di sản thực chất. Không có bất kỳ điểm mua sắm chỉ định hay dừng chờ bán hàng nào trong suốt hành trình.",
            "- Vẫn đảm bảo nhu cầu mua sắm tự do: Khách có thời gian nghỉ ngơi, tự do dạo phố mua sắm cá nhân vào buổi tối tại các trung tâm thương mại lớn ở Thành Đô (Xuân Hy Lộ, Thái Cổ Lý).",
            "- Quy mô Small Group: Đoàn chỉ từ 15 đến tối đa 20 khách, xe du lịch phục vụ rộng rãi từ 35 - 39 chỗ, lên xuống xe nhanh chóng, chăm sóc chu đáo từng người một."
        ] 
      }
    ]
  },
  {
    category: "Lịch Trình & Điểm Nhấn Khác Biệt",
    icon: "Compass",
    color: "#8b5cf6",
    items: [
      { 
        id: "q_tour_highlights", 
        q: "7. Tour Cửu Trại Câu 6N5Đ của FIT Tour có những điểm nhấn gì đặc biệt?", 
        variants: [
            { 
                type: "4 Điểm nhấn đỉnh cao", 
                text: "Dạ hành trình Cửu Trại Câu 6N5Đ bên em sở hữu 4 điểm nhấn độc bản mà hiếm tour nào có được:\n1. Bay thẳng TP.HCM - Thành Đô (Sichuan Airlines), không tốn thời gian transit.\n2. Trải nghiệm Tàu Cao Tốc xuyên núi thế hệ mới: Rút ngắn thời gian di chuyển, êm ái ngắm núi non hùng vĩ thay vì ngồi ô tô 8-9 tiếng mệt mỏi.\n3. Chạm tay vào Đạt Cổ Băng Xuyên (4.860m): Đi tuyến cáp treo cao nhất thế giới, thưởng thức cà phê giữa biển mây tuyết trắng xóa.\n4. Dành trọn 1 ngày khám phá 'Nhân gian tiên cảnh' Cửu Trại Câu: Hồ Ngũ Sắc, Hồ Ngũ Hoa, Trường Hải, Thác Trân Châu (Tây Du Ký).\nNgoài ra mình còn được thăm Gấu Trúc quốc bảo, ngắm Nam Kiều Đô Giang Yển và phố cổ Cẩm Lý lộng lẫy nữa ạ!" 
            },
            { 
                type: "Trải nghiệm thực tế (Emagazine)", 
                text: "Dạ Cửu Trại Câu được ví như thiên đường nơi hạ giới với hồ nước đổi màu ngọc bích và rừng phong mùa thu tuyệt đẹp. Anh/chị có thể xem qua bài Emagazine trải nghiệm thực tế của Travel Blogger Đặng Thùy Dương đi cùng FIT Tour để cảm nhận rõ từng khung hình của chuyến đi nhé: https://fittour.vn/emagazine-cuu-trai-cau" 
            }
        ],
        a: [
            "Hành trình được tối ưu hóa toàn diện bởi đội ngũ Trip Planner FIT Tour:",
            "- Ngày 1: TP.HCM - Thành Đô. Bay thẳng Sichuan Airlines (3U3904), khám phá phố đi bộ Xuân Hy Lộ, khu phức hợp thời thượng Thái Cổ Lý, ngắm tháp đôi Sinh Khí.",
            "- Ngày 2: Thăm Cơ sở nghiên cứu & bảo tồn Gấu Trúc Thành Đô. Trải nghiệm Tàu Cao Tốc xuyên núi đến Tùng Phan / Cửu Trại Câu. Tối thưởng thức Lẩu Tây Tạng trong không gian văn hóa bản địa.",
            "- Ngày 3: Dành trọn ngày khám phá Khu danh thắng Cửu Trại Câu: Trường Hải, Hồ Ngũ Sắc, Hồ Ngũ Hoa, Thác Trân Châu, Hồ Gấu Trúc. Tối tự do xem show Cửu Trại Thiên Cổ Tình.",
            "- Ngày 4: Cửu Trại Câu - Thành cổ Tùng Phan (di tích lịch sử Văn Thành Công Chúa đi lấy chồng đất Tạng) - Đạt Cổ Băng Xuyên.",
            "- Ngày 5: Đạt Cổ Băng Xuyên (Dagu Glacier) - Chinh phục tuyến cáp treo cao nhất thế giới lên độ cao 4.860m, thưởng thức cà phê cô đơn nhất thế giới giữa sông băng vĩnh cửu. Chiều về Đô Giang Yển, ngắm cảnh đêm Nam Kiều rực rỡ.",
            "- Ngày 6: Thăm Vũ Hầu Từ (đền thờ Lưu Bị & Gia Cát Lượng), phố cổ Cẩm Lý, thị trấn cổ Lạc Đới. Đáp chuyến bay 3U3903 về lại TP.HCM."
        ] 
      },
      { 
        id: "q_best_season", 
        q: "8. Đi Cửu Trại Câu mùa nào là đẹp nhất?", 
        variants: [
            { 
                type: "Tư vấn mùa vàng Cửu Trại Câu", 
                text: "Dạ Cửu Trại Câu đẹp nhất là vào MÙA THU (từ cuối tháng 9 đến giữa tháng 11, rực rỡ nhất là tháng 10) ạ!\nLúc này các cánh rừng nguyên sinh đồng loạt chuyển sang sắc vàng, cam, đỏ rực rỡ, phản chiếu xuống mặt nước hồ xanh ngọc bích trong veo. Thời tiết mùa này se lạnh mát mẻ khoảng 10°C - 20°C, rất lý tưởng để tản bộ ngắm cảnh và chụp lại những bức ảnh kỷ niệm tuyệt đẹp ạ." 
            }
        ],
        a: [
            "- Mùa Thu (Tháng 9 - 11): Mùa cao điểm đẹp nhất trong năm của Cửu Trại Câu. Rừng lá phong chuyển màu rực rỡ, mặt hồ nước trong vắt lấp lánh như pha lê.",
            "- Mùa Đông (Tháng 12 - 2): Thung lũng hóa xứ sở băng giá 'Frozen' với thác nước đóng băng thành những cột nhũ thạch khổng lồ và tuyết trắng phủ kín đồi thông.",
            "- Mùa Xuân & Hè (Tháng 3 - 8): Không khí mát rượi, cây cối đâm chồi xanh mướt, hoa đỗ quyên nở rộ, là điểm trốn nóng tuyệt vời tránh cái nắng oi bức của miền nhiệt đới."
        ] 
      }
    ]
  },
  {
    category: "Sức Khỏe, Sốc Độ Cao & Khẩu Vị Ẩm Thực",
    icon: "HeartPulse",
    color: "#ef4444",
    items: [
      { 
        id: "q_altitude_sickness", 
        q: "9. Lên Cửu Trại Câu và Đạt Cổ Băng Xuyên có bị sốc độ cao không? Người lớn tuổi có đi được không?", 
        variants: [
            { 
                type: "Chu đáo & An tâm (Khuyên dùng)", 
                text: "Dạ anh/chị và các cô chú lớn tuổi hoàn toàn an tâm nhé ạ:\n- Khu thắng cảnh Cửu Trại Câu ở độ cao trung bình khoảng 2.000m - 3.000m, đường đi đều có lối lót sàn gỗ thoai thoải và xe buýt trung chuyển tận nơi nên cơ thể thích nghi rất dễ dàng.\n- Riêng ngày đi Đạt Cổ Băng Xuyên lên đỉnh 4.860m bằng cáp treo kín hiện đại, FIT Tour luôn chuẩn bị sẵn bình oxy cá nhân cho từng khách, thuốc chống sốc độ cao và Tour Leader theo sát hỗ trợ. Lộ trình di chuyển cũng được sắp xếp nâng dần độ cao hợp lý nên các cô chú lớn tuổi vẫn tham gia và ngắm cảnh rất an tâm ạ!" 
            },
            { 
                type: "Thực tế đoàn khách FIT Tour", 
                text: "Dạ các đoàn trước bên em có nhiều cô chú lớn tuổi (U60 - U70) vẫn tham gia và chinh phục Cửu Trại Câu cùng Đạt Cổ Băng Xuyên rất thuận lợi. FIT Tour chuẩn bị chu đáo từ bình oxy cá nhân, xe du lịch VIP đến khách sạn 4-5 sao có hệ thống sưởi ấm đầy đủ nên sức khỏe luôn được chăm sóc tối đa ạ." 
            }
        ],
        a: [
            "Độ cao thực tế của các điểm trong tour:",
            "- Thành Đô: ~500m (đồng bằng bình thường).",
            "- Cửu Trại Câu: ~2.000m - 3.100m. Không khí trong lành, hàm lượng oxy cao do bao phủ bởi rừng nguyên sinh bạt ngàn.",
            "- Đạt Cổ Băng Xuyên: Đi cáp treo lên đỉnh 4.860m. Khách chỉ ở trên đỉnh núi khoảng 1.5 - 2 tiếng để chụp ảnh, uống cà phê rồi xuống lại vùng thấp nên không gây phản ứng say độ cao kéo dài.",
            "Biện pháp chăm sóc sức khỏe của FIT Tour:",
            "- Chuẩn bị sẵn bình oxy cá nhân, thuốc chống sốc độ cao cho từng khách hàng.",
            "- Hướng dẫn kỹ năng thích nghi độ cao: Uống nước ấm từng ngụm nhỏ, giữ ấm đầu cổ và ngực, vận động từ tốn.",
            "- Khách sạn lưu trú đều có máy sưởi ấm, nước nóng 24/24."
        ] 
      },
      { 
        id: "q_food_taste", 
        q: "10. Đồ ăn Tứ Xuyên nổi tiếng cay nóng, du khách Việt Nam có dễ ăn không?", 
        variants: [
            { 
                type: "Khẩu vị điều chỉnh (Chu đáo)", 
                text: "Dạ ẩm thực Tứ Xuyên quả thật nổi tiếng cay nồng, nhưng anh/chị yên tâm là trong tour của FIT Tour, toàn bộ thực đơn tại các nhà hàng đều đã được đặt riêng và dặn dò đầu bếp giảm cay, giảm dầu mỡ để phù hợp nhất với khẩu vị người Việt Nam ạ.\nBàn ăn luôn đa dạng món thịt, cá, canh rau thanh đạm, bữa sáng buffet tại khách sạn 4-5 sao rất phong phú. Đặc biệt đoàn sẽ được thưởng thức bữa Lẩu Tây Tạng nóng hổi cực kỳ ngon miệng và dễ ăn ạ!" 
            }
        ],
        a: [
            "FIT Tour đã có nhiều năm kinh nghiệm phục vụ du khách Việt tại vùng Tây Nam Trung Quốc:",
            "- Yêu cầu nhà bếp giảm tiêu hoa (vị tê) và giảm ớt đỏ trong tất cả các món xào nấu.",
            "- Luôn luôn có các món ăn thanh đạm trên mâm cơm: Trứng chiên, canh rau củ thịt băm, gà hấp / nướng, cá kho, rau xào tỏi.",
            "- Bữa sáng tại khách sạn 4 - 5 sao có quầy bánh mì, trứng ốp la, sữa chua, cháo hoa, trái cây tươi chuẩn quốc tế.",
            "- Lời khuyên: Du khách có thể mang theo 1 hộp chà bông nhỏ hoặc muối vừng để ăn kèm nếu có thói quen ăn nhạt tuyệt đối."
        ] 
      }
    ]
  }
];

const CuuTraiCauConsultingPage = () => {
    const [openIds, setOpenIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState('');
    const [copiedLink, setCopiedLink] = useState('');
    const [showDetailsIds, setShowDetailsIds] = useState([]);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    const toggleAccordion = (id) => {
        setOpenIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleDetails = (id) => {
        setShowDetailsIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleCopy = (e, id, text, type) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id + type);
            setTimeout(() => setCopiedId(''), 2000);
        });
    };

    const handleCopyLink = (e, link) => {
        e.preventDefault();
        e.stopPropagation();
        const textToCopy = link.copyText || (link.desc + '\n' + link.url);
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopiedLink(link.url);
            setTimeout(() => setCopiedLink(''), 2000);
        });
    };

    const scrollTo = (catId) => {
        const element = document.getElementById(catId);
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const normalizedSearch = searchQuery.toLowerCase();

    const filteredMarketingLinks = referenceLinks.filter(link => 
        link.title.toLowerCase().includes(normalizedSearch) || 
        link.desc.toLowerCase().includes(normalizedSearch)
    );

    const filteredFaqs = groupedFaqs.map(group => {
        const filteredItems = group.items.filter(item => {
            const matchQ = item.q.toLowerCase().includes(normalizedSearch);
            const matchVariants = item.variants.some(v => v.text.toLowerCase().includes(normalizedSearch) || v.type.toLowerCase().includes(normalizedSearch));
            const matchA = item.a.some(p => p.toLowerCase().includes(normalizedSearch));
            return matchQ || matchVariants || matchA;
        });
        return { ...group, items: filteredItems };
    }).filter(group => group.items.length > 0);

    const getIcon = (iconName) => {
        switch(iconName) {
            case "Wallet": return <Wallet size={20} />;
            case "Passport": return <Passport size={20} />;
            case "ShieldCheck": return <ShieldCheck size={20} />;
            case "Compass": return <Compass size={20} />;
            case "HeartPulse": return <HeartPulse size={20} />;
            case "Briefcase": return <Briefcase size={20} />;
            case "CloudSun": return <CloudSun size={20} />;
            case "Star": return <Star size={20} />;
            case "Image": return <ImageIcon size={20} />;
            case "List": return <List size={20} />;
            case "Award": return <Award size={20} />;
            case "Library": return <Library size={20} />;
            case "Users": return <Users size={20} />;
            default: return <Hash size={20} />;
        }
    };

    return (
        <div className="ladakh-container" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: '"Inter", "Segoe UI", sans-serif', color: '#0f172a' }}>
            <style>{`
                .mobile-menu-toggle { display: none; margin-bottom: 16px; width: 100%; align-items: center; justify-content: center; gap: 8px; padding: 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; color: #475569; font-weight: 600; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.2s; }
                .mobile-menu-toggle:active { background: #f8fafc; }
                @media (max-width: 1024px) {
                    .ladakh-content { padding: 32px !important; }
                }
                @media (max-width: 768px) {
                    .ladakh-container { flex-direction: column !important; }
                    .mobile-menu-toggle { display: flex !important; }
                    .ladakh-sidebar { 
                        width: 100% !important; min-width: 100% !important; 
                        height: auto !important; max-height: 400px !important; 
                        position: relative !important; border-right: none !important; 
                        border-bottom: 1px solid #e2e8f0 !important; padding: 16px 0 !important;
                        display: ${showMobileSidebar ? 'flex' : 'none'} !important;
                    }
                    .ladakh-content { padding: 20px 16px !important; }
                    .ladakh-title { font-size: 1.8rem !important; }
                    .faq-variant-card { flex-direction: column !important; align-items: stretch !important; gap: 12px !important; }
                    .faq-variant-card button { width: 100% !important; justify-content: center !important; padding: 10px !important; }
                    .faq-inner-padding { padding: 0 16px 16px 16px !important; }
                    .faq-header-title { font-size: 1.25rem !important; }
                    .faq-accordion-header { padding: 12px 16px !important; }
                    .faq-accordion-title { font-size: 0.95rem !important; margin-right: 12px !important; }
                }
            `}</style>
            
            {/* ====== LEFT SIDEBAR (TOC) ====== */}
            <div className="ladakh-sidebar" style={{ 
                width: '320px', 
                minWidth: '320px',
                height: '100vh', 
                position: 'sticky', 
                top: 0, 
                background: '#ffffff', 
                borderRight: '1px solid #e2e8f0',
                padding: '24px 0',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
                boxShadow: '4px 0 24px rgba(0,0,0,0.02)',
                zIndex: 10
            }}>
                <div style={{ padding: '0 24px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ width: '40px', height: '40px', background: '#ea580c', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)' }}>
                            <PhoneCall size={20} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Kịch Bản Sale</h2>
                            <p style={{ fontSize: '0.85rem', color: '#ea580c', fontWeight: 600, margin: 0 }}>Cửu Trại Câu (BU1)</p>
                        </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                        <input 
                            type="text" 
                            placeholder="Tìm câu hỏi, từ khóa..." 
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (e.target.value) {
                                    const allIds = groupedFaqs.flatMap(g => g.items.map(i => i.id));
                                    setOpenIds(allIds);
                                } else {
                                    setOpenIds([]);
                                }
                            }}
                            style={{
                                width: '100%',
                                padding: '8px 12px 8px 36px',
                                background: '#f1f5f9',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                color: '#0f172a',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

                {/* Danh mục câu hỏi */}
                <div style={{ flex: 1, padding: '0 16px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', padding: '0 8px 8px 8px', letterSpacing: '0.05em' }}>
                        Chủ đề tư vấn
                    </div>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {groupedFaqs.map((group, idx) => (
                            <button
                                key={idx}
                                onClick={() => scrollTo('cat-' + idx)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#475569',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
                            >
                                <span style={{ color: group.color }}>{getIcon(group.icon)}</span>
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{group.category}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Quick copy resources */}
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', padding: '24px 8px 8px 8px', letterSpacing: '0.05em' }}>
                        Link gửi khách nhanh
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {referenceLinks.map((link, idx) => (
                            <div 
                                key={idx}
                                style={{
                                    padding: '8px 10px',
                                    borderRadius: '8px',
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    fontSize: '0.8rem'
                                }}
                            >
                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '8px' }}>
                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{link.title}</div>
                                </div>
                                <button
                                    onClick={(e) => handleCopyLink(e, link)}
                                    title="Copy kịch bản gửi khách"
                                    style={{
                                        border: 'none',
                                        background: copiedLink === link.url ? '#10b981' : '#e2e8f0',
                                        color: copiedLink === link.url ? '#fff' : '#475569',
                                        borderRadius: '4px',
                                        padding: '4px 6px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '2px',
                                        fontSize: '0.7rem',
                                        fontWeight: '600',
                                        flexShrink: 0
                                    }}
                                >
                                    {copiedLink === link.url ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                                    {copiedLink === link.url ? 'Xong' : 'Copy'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer status */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
                    <span>FIT Tour CRM • Cửu Trại Câu BU1</span>
                </div>
            </div>

            {/* ====== MAIN CONTENT ====== */}
            <div className="ladakh-content" style={{ flex: 1, padding: '40px 60px', overflowY: 'auto' }}>
                <button 
                    className="mobile-menu-toggle"
                    onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                >
                    <List size={18} /> {showMobileSidebar ? 'Đóng Danh Mục' : 'Mở Danh Mục Kịch Bản'}
                </button>

                {/* Header Banner */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ffedd5', color: '#c2410c', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', marginBottom: '12px' }}>
                        <Sparkles size={14} /> FIT TOUR KNOWLEDGE BASE • BU1 (TRUNG QUỐC)
                    </div>
                    <h1 className="ladakh-title" style={{ fontSize: '2.4rem', fontWeight: '900', color: '#0f172a', margin: '0 0 12px 0', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                        Cẩm Nang Tư Vấn & Chốt Sale Cửu Trại Câu (6N5Đ)
                    </h1>
                    <p style={{ fontSize: '1.05rem', color: '#64748b', margin: 0, lineHeight: 1.6, maxWidth: '850px' }}>
                        Tài liệu hướng dẫn kịch bản chat trực tiếp, giải đáp tiến độ thanh toán cọc 50/50, tư vấn tiền tệ CNY, thủ tục visa đoàn 5-7 ngày, tặng eSIM và cam kết Small Group "No Shopping ép buộc".
                    </p>
                </div>

                {/* Quick Highlights Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ background: '#fff', border: '1px solid #fed7aa', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ea580c', fontWeight: '700', fontSize: '0.85rem', marginBottom: '4px' }}>
                            <Wallet size={16} /> Thanh Toán Cọc 50/50
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
                            Cọc 50% giữ chỗ và làm visa; 50% còn lại thanh toán khi có visa trước ngày bay.
                        </div>
                    </div>

                    <div style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: '700', fontSize: '0.85rem', marginBottom: '4px' }}>
                            <Passport size={16} /> Visa Đoàn 5 - 7 Ngày
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
                            FIT Tour lo trọn gói từ A-Z, chỉ cần chụp ảnh mặt hộ chiếu & 1 file hình thẻ 4x6.
                        </div>
                    </div>

                    <div style={{ background: '#fff', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: '700', fontSize: '0.85rem', marginBottom: '4px' }}>
                            <Sparkles size={16} /> Tặng eSIM Du Lịch
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
                            FIT Tour có hỗ trợ tặng eSIM cho chuyến đi của khách.
                        </div>
                    </div>

                    <div style={{ background: '#fff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9333ea', fontWeight: '700', fontSize: '0.85rem', marginBottom: '4px' }}>
                            <ShieldCheck size={16} /> Small Group • No Shopping
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
                            Đoàn nhỏ tinh gọn 15-20 khách, không mua sắm ép buộc, thong thả dạo phố.
                        </div>
                    </div>
                </div>

                {/* Resource Cards Grid */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', color: '#0f172a', fontSize: '1.15rem' }}>
                            <ImageIcon size={20} color="#ea580c" /> Tài Liệu & Link Gửi Khách Nhanh
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Bấm nút để copy nội dung tư vấn soạn sẵn kèm link</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                        {filteredMarketingLinks.map((link, lIdx) => (
                            <div 
                                key={lIdx}
                                style={{
                                    background: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                }}
                            >
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ color: link.color }}>{getIcon(link.icon)}</span>
                                            <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>{link.title}</span>
                                        </div>
                                        <a href={link.url} target="_blank" rel="noreferrer" style={{ color: '#94a3b8' }}>
                                            <ExternalLink size={16} />
                                        </a>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                                        {link.desc}
                                    </p>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                                    <button
                                        onClick={(e) => handleCopyLink(e, link)}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            padding: '8px 12px',
                                            background: copiedLink === link.url ? '#10b981' : '#f8fafc',
                                            color: copiedLink === link.url ? '#ffffff' : '#334155',
                                            border: copiedLink === link.url ? '1px solid #10b981' : '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {copiedLink === link.url ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                        {copiedLink === link.url ? 'Đã copy kịch bản & link' : 'Copy gửi khách'}
                                    </button>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                            padding: '8px 12px',
                                            background: '#f1f5f9',
                                            color: '#475569',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            textDecoration: 'none',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        Mở xem
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ Groups */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    {filteredFaqs.map((group, gIdx) => (
                        <div key={gIdx} id={'cat-' + gIdx} style={{ scrollMarginTop: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '2px solid #e2e8f0', marginBottom: '20px' }}>
                                <div style={{ color: group.color }}>{getIcon(group.icon)}</div>
                                <h2 className="faq-header-title" style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                                    {group.category}
                                </h2>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {group.items.map((item) => {
                                    const isOpen = openIds.includes(item.id);
                                    const isDetailsOpen = showDetailsIds.includes(item.id);

                                    return (
                                        <div 
                                            key={item.id}
                                            style={{
                                                background: '#ffffff',
                                                borderRadius: '16px',
                                                border: isOpen ? `1px solid ${group.color}40` : '1px solid #e2e8f0',
                                                boxShadow: isOpen ? '0 10px 20px -5px rgba(0,0,0,0.05)' : '0 1px 3px rgba(0,0,0,0.02)',
                                                overflow: 'hidden',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            {/* Accordion Header */}
                                            <button
                                                onClick={() => toggleAccordion(item.id)}
                                                className="faq-accordion-header"
                                                style={{
                                                    width: '100%',
                                                    padding: '18px 24px',
                                                    background: isOpen ? '#f8fafc' : 'transparent',
                                                    border: 'none',
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    justifyContent: 'space-between',
                                                    cursor: 'pointer',
                                                    textAlign: 'left'
                                                }}
                                            >
                                                <h3 className="faq-accordion-title" style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', margin: '0 24px 0 0', lineHeight: '1.5' }}>
                                                    {item.q}
                                                </h3>
                                                <div style={{
                                                    padding: '4px',
                                                    borderRadius: '50%',
                                                    background: isOpen ? '#e2e8f0' : 'transparent',
                                                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                    transition: 'all 0.3s',
                                                    flexShrink: 0
                                                }}>
                                                    <ChevronDown size={20} color="#64748b" />
                                                </div>
                                            </button>

                                            {/* Accordion Body */}
                                            {isOpen && (
                                                <div className="faq-inner-padding" style={{ padding: '0 24px 24px 24px', borderTop: '1px solid #f1f5f9' }}>
                                                    
                                                    {/* Kịch bản Chat & Chốt Sale */}
                                                    <div style={{ marginTop: '20px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '14px' }}>
                                                            <Zap size={16} /> Kịch bản Chat & Chốt Sale (Bấm để Copy)
                                                        </div>

                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                                            {item.variants.map((variant, vIdx) => (
                                                                <div key={vIdx} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px' }}>
                                                                    <div className="faq-variant-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                                                                        <div>
                                                                            <span style={{ display: 'inline-block', background: '#dcfce7', color: '#166534', fontSize: '0.75rem', fontWeight: '700', padding: '4px 8px', borderRadius: '4px', marginBottom: '8px' }}>
                                                                                {variant.type}
                                                                            </span>
                                                                            <p style={{ margin: 0, color: '#14532d', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                                                                                {variant.text}
                                                                            </p>
                                                                        </div>
                                                                        <button 
                                                                            onClick={(e) => handleCopy(e, item.id, variant.text, vIdx)}
                                                                            style={{
                                                                                flexShrink: 0,
                                                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                                                padding: '8px 14px', borderRadius: '8px',
                                                                                background: copiedId === item.id + vIdx ? '#166534' : '#ffffff',
                                                                                color: copiedId === item.id + vIdx ? '#ffffff' : '#166534',
                                                                                border: '1px solid #bbf7d0',
                                                                                fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer',
                                                                                transition: 'all 0.2s',
                                                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                                            }}
                                                                        >
                                                                            {copiedId === item.id + vIdx ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                                                            {copiedId === item.id + vIdx ? 'Đã copy' : 'Copy'}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Kiến thức đào tạo sale */}
                                                    <div style={{ marginTop: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                                                        <div 
                                                            onClick={() => toggleDetails(item.id)}
                                                            style={{ 
                                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                                                                padding: '14px 18px', cursor: 'pointer', background: isDetailsOpen ? '#f1f5f9' : 'transparent',
                                                                transition: 'background 0.2s'
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                                                <Info size={16} /> Kiến thức đào tạo (Để Sale hiểu sâu vấn đề)
                                                            </div>
                                                            <div style={{ 
                                                                transform: isDetailsOpen ? 'rotate(90deg)' : 'rotate(0deg)', 
                                                                transition: 'transform 0.3s ease',
                                                                color: '#94a3b8'
                                                            }}>
                                                                <ChevronRight size={18} />
                                                            </div>
                                                        </div>

                                                        {isDetailsOpen && (
                                                            <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px', color: '#334155', lineHeight: '1.7', fontSize: '0.925rem' }}>
                                                                {item.a.map((p, pIdx) => (
                                                                    <p key={pIdx} style={{ 
                                                                        margin: 0, 
                                                                        paddingLeft: p.startsWith('-') ? '18px' : '0',
                                                                        position: 'relative'
                                                                    }}>
                                                                        {p.startsWith('-') && (
                                                                            <span style={{ position: 'absolute', left: '4px', top: '9px', width: '5px', height: '5px', background: '#64748b', borderRadius: '50%' }}></span>
                                                                        )}
                                                                        {p.startsWith('-') ? p.substring(1).trim() : p}
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredFaqs.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
                        <Search size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                        <p style={{ fontSize: '1.1rem', margin: 0 }}>Không tìm thấy câu hỏi hoặc kịch bản nào khớp với "{searchQuery}"</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CuuTraiCauConsultingPage;
