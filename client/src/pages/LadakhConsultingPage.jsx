import React, { useState, useEffect } from 'react';
import { Briefcase, HeartPulse, CloudSun, BookKey as Passport, Search, Copy, CheckCircle2, ChevronDown, Hash, PhoneCall, Sparkles, MessageSquare, Info, Zap, ChevronRight, Library, ExternalLink, ImageIcon, Image, List, Map, Mountain, Video, Star, Music, Heart, BookOpen, Navigation, Award, Users } from 'lucide-react';

const referenceLinks = [
    { 
        title: "Video Điện Ảnh (Kop Dinh)", 
        desc: "Thước phim siêu đẹp quay bởi nhiếp ảnh gia Kop Dinh", 
        url: "https://www.facebook.com/reel/1754974222353394", 
        icon: "Video", 
        color: "#e11d48",
        type: "marketing",
        copyText: "Dạ cảnh sắc Ladakh thực sự ngoạn mục lắm. Trăm nghe không bằng một thấy, anh/chị lướt qua thử đoạn video cực đẹp này do chính nhiếp ảnh gia Kop Dinh quay lại trong chuyến đi cùng FIT Tour nhé. Cảnh bên ngoài nhìn còn choáng ngợp hơn video nhiều: https://www.facebook.com/reel/1754974222353394"
    },
    { 
        title: "KOL Đặng Thuỳ Dương ở Zanskar", 
        desc: "Câu chuyện chân thực của KOL nổi tiếng từng đi cùng FIT", 
        url: "https://fittour.vn/emagazine-dang-thuy-duong-o-zanskar", 
        icon: "Star", 
        color: "#ec4899",
        type: "marketing",
        copyText: "Dạ anh/chị tham khảo bài viết về hành trình Zanskar Ladakh của Travel Blogger Đặng Thuỳ Dương đồng hành cùng FIT Tour nhé. Cảnh sắc thực sự choáng ngợp và chân thực lắm: https://fittour.vn/emagazine-dang-thuy-duong-o-zanskar"
    },
    { 
        title: "Phương Thanh 3 Lần Đến Ladakh", 
        desc: "Ca sĩ Phương Thanh cạo đầu tại tu viện Hemis", 
        url: "https://fittour.vn/phuong-thanh-lan-3-den-ladakh", 
        icon: "Music", 
        color: "#d946ef",
        type: "marketing",
        copyText: "Dạ anh/chị biết ca sĩ Phương Thanh không? Chị Chanh đã 3 lần đến Ladakh và đều chọn đồng hành cùng FIT Tour đó. Anh/chị xem thêm hành trình đặc biệt của chị ở đây nhé: https://fittour.vn/phuong-thanh-lan-3-den-ladakh"
    },
    { 
        title: "Cô Mây U70 Du Lịch Ladakh", 
        desc: "Sức khỏe tốt là đủ chinh phục mọi giới hạn", 
        url: "https://fittour.vn/co-may", 
        icon: "Heart", 
        color: "#f43f5e",
        type: "marketing",
        copyText: "Dạ anh/chị đừng quá lo lắng về sức khỏe nhé. Vừa rồi bên em có đoàn khách với cô Mây (U70) vẫn chinh phục Ladakh rất khỏe mạnh và nhiều năng lượng. Anh/chị xem câu chuyện truyền cảm hứng của cô ở đây: https://fittour.vn/co-may"
    },
    { 
        title: "Nhật Ký Khám Phá Ladakh", 
        desc: "Tổng hợp trải nghiệm từ các đoàn khách đi trước", 
        url: "https://fittour.vn/nhat-ky-kham-pha-ladakh", 
        icon: "BookOpen", 
        color: "#10b981",
        type: "marketing",
        copyText: "Dạ để dễ hình dung nhất về chuyến đi, anh/chị xem qua Nhật ký hành trình thực tế được ghi lại từ các đoàn khách nhà FIT Tour vừa rồi nhé: https://fittour.vn/nhat-ky-kham-pha-ladakh"
    },
    { 
        title: "Nhật Ký Motor Tour", 
        desc: "Hành trình rong ruổi Ladakh đầy máu lửa trên xe máy", 
        url: "https://fittour.vn/nhat-ky-hanh-trinh-ladakh-bang-xe-may", 
        icon: "Navigation", 
        color: "#059669",
        type: "marketing",
        copyText: "Dạ nếu anh/chị đam mê trải nghiệm mạnh thì bên em có những chuyến Motor Tour cực kỳ máu lửa. Anh/chị xem thử nhật ký rong ruổi Ladakh bằng xe máy này nhé: https://fittour.vn/nhat-ky-hanh-trinh-ladakh-bang-xe-may"
    },
    { 
        title: "Cẩm Nang Du Lịch Ladakh", 
        desc: "Cẩm nang soạn riêng của FIT Tour về thời tiết, văn hóa", 
        url: "https://fittour.vn/du-lich-ladakh", 
        icon: "Library", 
        color: "#3b82f6",
        type: "marketing",
        copyText: "Dạ đây là Cẩm nang du lịch Ladakh do chính đội ngũ FIT Tour biên soạn cực kỳ chi tiết về thời tiết, văn hóa và cách chuẩn bị sức khỏe. Anh/chị lưu lại đọc tham khảo thêm nhé: https://fittour.vn/du-lich-ladakh"
    },
    { 
        title: "Cột Mốc 80 Chuyến Đi", 
        desc: "Đơn vị khẳng định uy tín và năng lực tổ chức tour", 
        url: "https://fittour.vn/cot-moc-80-chuyen-di-ladakh", 
        icon: "Award", 
        color: "#f59e0b",
        type: "marketing",
        copyText: "Dạ về kinh nghiệm tổ chức thì anh/chị hoàn toàn yên tâm. FIT Tour vừa kỷ niệm cột mốc 80 chuyến đi thành công đưa khách Việt đến Ladakh. Anh/chị xem thêm thông tin ở đây nhé: https://fittour.vn/cot-moc-80-chuyen-di-ladakh"
    },
    { 
        title: "Đội Ngũ Thực Chiến", 
        desc: "Team dẫn tour Himalaya giàu kinh nghiệm thực tế", 
        url: "https://fittour.vn/our-team/", 
        icon: "Users", 
        color: "#6366f1",
        type: "marketing",
        copyText: "Dạ đằng sau những chuyến đi thành công là cả một đội ngũ hướng dẫn viên thực chiến dày dặn kinh nghiệm về Himalaya của FIT Tour. Anh/chị xem qua profile của team em để yên tâm hơn nhé: https://fittour.vn/our-team/"
    },
    { 
        title: "Danh Sách Tour Ladakh", 
        desc: "Xem nhanh các lịch trình và ngày khởi hành", 
        url: "https://fittour.vn/country/ladakh/", 
        icon: "List", 
        color: "#8b5cf6",
        type: "tour",
        copyText: "Dạ đây là tổng hợp tất cả các lịch trình và ngày khởi hành tour Ladakh bên em. Anh/chị xem qua thử mình ưng ý lịch trình nào nhất nhé: https://fittour.vn/country/ladakh/"
    },
    { 
        title: "Tour Road Trip", 
        desc: "Hành trình truyền thống khám phá Leh, Nubra", 
        url: "https://fittour.vn/tour/tour-ladakh-roadtrip", 
        icon: "Map", 
        color: "#14b8a6",
        type: "tour",
        copyText: "Dạ đây là hành trình Road Trip, đưa mình đi qua những điểm đến biểu tượng nhất của Ladakh như Leh, thung lũng Nubra và hồ Pangong. Anh/chị xem chi tiết lịch trình ở đây nhé: https://fittour.vn/tour/tour-ladakh-roadtrip"
    },
    { 
        title: "Tour Kashmir - Zanskar", 
        desc: "Cung đường nâng cao dành cho người đam mê", 
        url: "https://fittour.vn/tour/tour-kashmir-zanskar", 
        icon: "Mountain", 
        color: "#0f766e",
        type: "tour",
        copyText: "Dạ nếu anh/chị thích những cung đường độc lạ, ít người đặt chân tới và phong cảnh hoang sơ ngoạn mục thì hành trình Kashmir - Zanskar này là dành cho mình: https://fittour.vn/tour/tour-kashmir-zanskar"
    },
    { 
        title: "Thư Viện Hình Ảnh", 
        desc: "Sưu tầm lại hình ảnh của FIT Tour tại Ladakh", 
        url: "https://fittour.vn/gallery-ladakh", 
        icon: "Image", 
        color: "#84cc16",
        type: "marketing",
        copyText: "Dạ trăm nghe không bằng một thấy, anh/chị lướt qua thư viện hình ảnh thực tế mà FIT Tour đã ghi lại trong các chuyến đi Ladakh vừa qua nhé, cảnh sắc bên ngoài còn đẹp hơn hình rất nhiều: https://fittour.vn/gallery-ladakh"
    }
];

const groupedFaqs = [
  {
    category: "Chung & Dịch Vụ",
    icon: "Briefcase",
    color: "#f97316",
    items: [
      { 
        id: "q1", 
        q: "1. Tại sao tour bên em giá cao hơn các bên khác?", 
        variants: [
            { type: "Đánh vào giá trị (Thực tế)", text: "Dạ tour bên em là trọn gói (vé máy bay, KS, 3 bữa ăn/ngày) không phát sinh chi phí ẩn. Đoàn nhỏ 9-11 khách để HDV chăm sóc sức khỏe từng người tốt nhất ạ." },
            { type: "Giải quyết so sánh (Logic)", text: "Dạ thoạt nhìn giá có vẻ nhỉnh hơn, nhưng tính kỹ lại tiết kiệm hơn vì bên em bao trọn 3 bữa ăn (nhiều bên cắt bữa) và đi xe riêng chuẩn cao để anh/chị giữ sức khỏe suốt tuyến." }
        ],
        a: ["Dạ, nếu mình so sánh tổng chi phí thì tour bên em gần như đã bao gồm toàn bộ dịch vụ, nên anh/chị sẽ không phải phát sinh nhiều trong quá trình đi.", "Tour đã bao gồm vé máy bay, khách sạn, các bữa ăn đầy đủ 3 bữa/ngày (trong khi nhiều đơn vị chỉ bao gồm bữa sáng hoặc không bao gồm bữa trưa, tối), hướng dẫn viên người Việt có kinh nghiệm dẫn đoàn tại Himalaya, xe riêng và các chi phí theo chương trình.", "Điểm mà FIT TOUR luôn đầu tư nhiều nhất là trải nghiệm và sức khỏe của khách. Những cung như Ladakh, Kashmir hay Himalaya có địa hình và độ cao khá đặc biệt, nên việc ăn uống, nghỉ ngơi và theo dõi sức khỏe mỗi ngày rất quan trọng. Bọn em chuẩn bị bữa ăn rất kỹ để anh/chị vừa được trải nghiệm ẩm thực địa phương nhưng vẫn hợp khẩu vị người Việt, thậm chí có những ngày hướng dẫn viên còn trực tiếp nấu những món quen thuộc để mọi người dễ ăn và giữ sức.", "Ngoài ra, mỗi đoàn bên em chỉ giới hạn khoảng 9–11 khách, để hướng dẫn viên có thể chăm sóc sát sao từng người, hỗ trợ khi cần và đảm bảo mọi người đều có trải nghiệm trọn vẹn nhất. Vì vậy chi phí có thể cao hơn một chút, nhưng đổi lại anh/chị sẽ có một chuyến đi an tâm, thoải mái và được chăm sóc rất kỹ từ đầu đến cuối."] 
      },
      { 
        id: "q7", 
        q: "7. Điều gì khiến Ladakh trở thành một điểm đến đáng để trải nghiệm?", 
        variants: [
            { type: "Truyền cảm hứng (Cảm xúc)", text: "Dạ Ladakh không chỉ đẹp hùng vĩ mà còn mang lại cảm giác bình yên hiếm có. Nơi đây giữ nguyên vẹn văn hóa Himalaya nguyên bản, tu viện cổ và những người dân vô cùng mộc mạc." },
            { type: "Đánh vào sự khác biệt (Độc lạ)", text: "Dạ Ladakh khác hoàn toàn những nơi anh/chị từng đi. Đó là sự đối lập hoàn hảo: sông băng giữa sa mạc cát, hồ nước xanh ngắt đổi màu và không gian yên tĩnh đến mức nghe được tiếng gió thở." }
        ],
        a: ["Dạ, em nghĩ điều khiến Ladakh xứng đáng để đi không chỉ là vì cảnh đẹp, mà vì mỗi khung cảnh ở đây đều gắn với một câu chuyện.", "Ladakh từng nằm trên Con đường Tơ lụa cổ, là nơi giao thoa giữa Tây Tạng, Trung Á, Kashmir và Ấn Độ. Trải qua hàng trăm năm, vùng đất này vẫn giữ được những tu viện Phật giáo cổ, những ngôi làng nhỏ nép mình dưới chân núi và một lối sống rất mộc mạc của người dân Himalaya.", "Đến Ladakh, anh/chị sẽ thấy những dãy núi cao hùng vĩ nối tiếp nhau, những cung đường uốn lượn giữa thung lũng, hồ Pangong xanh ngắt đổi màu theo ánh nắng, dòng sông Indus lặng lẽ chảy qua vùng đất cằn cỗi, hay những cánh đồng lúa mạch và vườn mơ nhỏ xuất hiện giữa sa mạc trên núi cao. Chính sự đối lập đó tạo nên một vẻ đẹp rất đặc biệt mà hiếm nơi nào có được.", "Nhưng điều làm nhiều người nhớ nhất không chỉ là cảnh, mà là cảm giác khi đứng giữa thiên nhiên ấy. Khi lên đến Ladakh, mình sẽ buộc phải đi chậm hơn, hít thở sâu hơn và dành thời gian để cảm nhận nhiều hơn. Không còn tiếng còi xe, không còn nhịp sống vội vã, chỉ còn bầu trời xanh rất gần, những đỉnh núi phủ tuyết và một không gian yên tĩnh đến mức mình có thể nghe thấy tiếng gió.", "Con người Ladakh cũng khiến nhiều người yêu mến. Sống trong điều kiện tự nhiên khắc nghiệt, họ chọn cách hòa hợp với thiên nhiên, luôn nhẹ nhàng, bình thản và trân trọng những điều rất giản dị.", "Đối với em, Ladakh không phải là nơi để đi thật nhiều điểm hay check-in thật nhiều địa danh. Đó là nơi mình được ngắm một trong những cảnh quan hùng vĩ nhất thế giới, được chạm vào một nền văn hóa Himalaya còn nguyên bản và có một hành trình khiến mình nhớ rất lâu sau khi trở về."] 
      },
      { 
        id: "q15", 
        q: "15. Cách đăng ký tour như thế nào em?", 
        variants: [
            { type: "Nhanh gọn (Tiện lợi)", text: "Dạ anh/chị chỉ cần gửi em ảnh chụp mặt hộ chiếu còn hạn và cọc giữ chỗ là hoàn tất. Mọi thủ tục còn lại (E-visa, họp đoàn) bên em lo A-Z ạ." },
            { type: "Tạo khan hiếm (FOMO)", text: "Dạ vì đoàn bên em giới hạn chỉ 9-11 khách/chuyến để đảm bảo chất lượng, nếu anh/chị đã chốt được lịch thì mình tranh thủ gửi hộ chiếu và cọc sớm để bên em giữ chỗ đẹp cho mình nhé." }
        ],
        a: ["Dạ anh/chị chỉ cần gửi em ảnh chụp mặt hộ chiếu còn hạn và cọc giữ chỗ là hoàn tất đăng ký ạ.", "Sau đó bên em sẽ hỗ trợ từ A-Z, từ E-visa, họp đoàn đến chuẩn bị hành lý. Vì mỗi đoàn chỉ nhận 9–11 khách nên nếu anh/chị đã chốt được thời gian thì mình đăng ký sớm để giữ chỗ nhé. 😊"] 
      }
    ]
  },
  {
    category: "Sức Khỏe & Độ Cao",
    icon: "HeartPulse",
    color: "#ef4444",
    items: [
      { 
        id: "q2", 
        q: "2. Đi Ladakh có nguy hiểm vì sốc độ cao không em?", 
        variants: [
            { type: "An tâm (Vỗ về)", text: "Dạ cơ thể cần thời gian thích nghi nên tour bên em thiết kế nhịp độ rất chậm, nghỉ ngơi trọn vẹn 2 ngày đầu tại Leh. Đoàn có HDV nhiều kinh nghiệm đi kèm nên mình yên tâm nhé." },
            { type: "Logic (Khoa học)", text: "Dạ việc hơi đau đầu 1-2 ngày đầu là phản ứng bình thường khi lên cao. Quan trọng là đừng vận động mạnh quá sớm. Lịch trình bên em đã thiết kế khoa học để cơ thể anh/chị thích nghi từng bước một cách an toàn nhất." }
        ],
        a: ["Dạ đây là điều rất nhiều anh/chị lo lắng trước khi đi.", "Thực tế, việc lên độ cao hơn 3.500 m có thể khiến cơ thể cần thời gian để thích nghi. Một số người có thể hơi đau đầu hoặc mệt nhẹ trong 1–2 ngày đầu, nhưng đó là phản ứng khá bình thường.", "Điều quan trọng là đừng lên cao quá nhanh. Chính vì vậy lịch trình bên em được thiết kế theo nguyên tắc thích nghi từng bước, mình sẽ có 2 ngày đầu tiên ở Leh, trong đó ngày đầu đến với Ladakh là mình dùng để nghỉ ngơi hoàn toàn, để cơ thể có thể thích nghi.", "Ngoài ra, trước chuyến đi bên em sẽ hướng dẫn rất kỹ cách chuẩn bị sức khỏe, chế độ ăn uống và vận động. Trong đoàn luôn có hướng dẫn viên giàu kinh nghiệm xử lý các tình huống ở vùng cao nên anh/chị có thể yên tâm hơn rất nhiều."] 
      },
      { 
        id: "q3", 
        q: "3. Mình chưa từng đi vùng cao, liệu mình có đi được Ladakh không?", 
        variants: [
            { type: "Khuyến khích (Tự tin)", text: "Dạ hoàn toàn được ạ. Phần lớn khách FIT TOUR đều lần đầu đi vùng cao. Chỉ cần chuẩn bị sức khỏe tốt và tuân thủ lịch trình thiết kế khoa học của bên em là sẽ thích nghi rất tốt." },
            { type: "Phá bỏ định kiến (Logic)", text: "Dạ kinh nghiệm đi vùng cao không quan trọng bằng việc chuẩn bị đúng cách đâu ạ. Rất nhiều khách trẻ từng leo núi chủ quan vẫn mệt, trong khi các cô chú lần đầu đi nhưng nghe theo HDV thì lại cực kỳ khỏe mạnh." }
        ],
        a: ["Dạ hoàn toàn có thể anh/chị nhé. Thực tế, phần lớn khách của FIT TOUR đều là lần đầu tiên đến Ladakh và chưa từng trải nghiệm vùng cao trước đó.", "Thật ra, việc đã từng đi vùng cao không đồng nghĩa với việc sẽ thích nghi tốt hơn. Bên em từng gặp những anh/chị đã có kinh nghiệm trekking hoặc đi nhiều nơi trên Himalaya, nhưng chỉ vì chủ quan, ngủ không đủ giấc, uống ít nước hoặc cố gắng vận động quá sức trong những ngày đầu mà vẫn gặp triệu chứng say độ cao.", "Ngược lại, rất nhiều anh/chị lần đầu đến Ladakh nhưng chuẩn bị sức khỏe tốt, tuân thủ hướng dẫn của đoàn thì lại thích nghi rất nhẹ nhàng và có một chuyến đi trọn vẹn.", "Điều quan trọng nhất không phải là kinh nghiệm, mà là một lịch trình được thiết kế khoa học để cơ thể có thời gian thích nghi với độ cao. Vì vậy, ngày đầu tiên ở Leh, bên em luôn bố trí để anh/chị nghỉ ngơi, hạn chế vận động mạnh và làm quen với không khí loãng trước khi tiếp tục hành trình.", "Trong suốt chuyến đi, hướng dẫn viên sẽ luôn theo dõi sức khỏe của từng thành viên, nhắc mọi người uống nước, nghỉ ngơi đúng lúc và hỗ trợ ngay nếu có bất kỳ dấu hiệu không thoải mái nào.", "Vì vậy, anh/chị không cần quá lo lắng nếu đây là lần đầu tiên đi vùng cao. Chỉ cần mình chuẩn bị sức khỏe tốt trước chuyến đi và đồng hành cùng hướng dẫn viên, thì đa số khách đều thích nghi rất tốt và có những trải nghiệm tuyệt vời tại Ladakh."] 
      },
      { 
        id: "q4", 
        q: "4. Mình có cần chuẩn bị gì để lên vùng cao không em?", 
        variants: [
            { type: "Ngắn gọn (Thực tế)", text: "Dạ trước chuyến đi 2 tuần mình cần ngủ đủ giấc, uống 2-2.5 lít nước/ngày và tập hít thở sâu. Mọi chuẩn bị khác bên em sẽ có buổi họp đoàn hướng dẫn rất chi tiết ạ." },
            { type: "Chu đáo (Care khách)", text: "Dạ anh/chị cứ yên tâm, bên em có sẵn quy trình chuẩn bị rồi. Từ việc uống thuốc chống say độ cao (nếu cần), chuẩn bị đồ đạc ra sao đều được thông báo kỹ trong nhóm Zalo họp đoàn trước ngày đi ạ." }
        ],
        a: ["Dạ có anh/chị nhé. Trước ngày khởi hành, bên em sẽ tạo một nhóm Zalo để họp đoàn và hướng dẫn rất chi tiết về hành trình, cách chuẩn bị hành lý cũng như những lưu ý về sức khỏe khi đi vùng cao.", "Để cơ thể thích nghi tốt hơn với độ cao, khoảng 2 tuần trước chuyến đi, anh/chị chỉ cần duy trì một số thói quen đơn giản như:", "- Ngủ đủ giấc.", "- Uống khoảng 2–2,5 lít nước mỗi ngày.", "- Tập hít thở sâu hoặc vận động nhẹ để tăng sức bền.", "Ngoài ra, khoảng 1–2 ngày trước khi lên vùng cao, nhiều khách sẽ được bác sĩ tư vấn sử dụng Acetazolamide 250 mg để hỗ trợ phòng ngừa các triệu chứng liên quan đến việc thay đổi độ cao. Tuy nhiên, thuốc cần được sử dụng đúng đối tượng và đúng cách, nên bên em sẽ hướng dẫn kỹ trong buổi họp đoàn và tư vấn cụ thể cho từng anh/chị.", "Anh/chị cũng yên tâm là trong suốt hành trình, hướng dẫn viên sẽ luôn theo dõi tình trạng sức khỏe của đoàn, nhắc mọi người uống nước, nghỉ ngơi hợp lý và hỗ trợ ngay nếu có bất kỳ dấu hiệu không thoải mái nào."] 
      },
      { 
        id: "q8", 
        q: "8. Tour Ladakh có phù hợp với người lớn tuổi không?", 
        variants: [
            { type: "Đồng cảm (An tâm)", text: "Dạ phù hợp ạ, quan trọng là sức khỏe ổn định chứ không phải tuổi tác. Vị khách lớn tuổi nhất của bên em là 74 tuổi, các cô chú tuân thủ kỷ luật tốt nên đôi khi đi còn khỏe hơn cả các bạn trẻ." },
            { type: "Logic (Giải thích)", text: "Dạ tour chủ yếu di chuyển bằng xe, chỉ đi bộ vãn cảnh nhẹ nhàng ở tu viện và hồ, hoàn toàn không phải leo núi hay trekking nên sức khỏe bình thường đều đi được ạ." }
        ],
        a: ["Dạ có anh/chị nhé, điều quan trọng nhất là sức khỏe ổn định, chứ không phải tuổi tác.", "Bên em đã từng đồng hành cùng rất nhiều cô chú từ 60–70 tuổi, và vị khách lớn tuổi nhất của FIT TOUR là 74 tuổi. Điều thú vị là nhiều khi các cô chú còn đi rất tốt hơn cả các bạn trẻ. Theo kinh nghiệm của em, những cô chú vẫn giữ niềm đam mê khám phá ở độ tuổi này thường cũng rất ý thức trong việc rèn luyện sức khỏe và chuẩn bị thể lực trước chuyến đi, nên khả năng thích nghi thường rất tốt.", "Ngoài ra, Ladakh không phải là hành trình leo núi hay trekking liên tục. Phần lớn thời gian mình sẽ di chuyển bằng xe, chỉ đi bộ nhẹ tại các tu viện, hồ hoặc điểm tham quan. Vì vậy, nếu có sức khỏe tốt và tuân thủ lịch trình thì đa số cô chú đều có thể tham gia.", "Tuy nhiên, nếu anh/chị hoặc người thân có tiền sử tim mạch, bệnh phổi, huyết áp chưa ổn định hoặc các bệnh lý cần theo dõi, bên em sẽ trao đổi kỹ hơn về tình trạng sức khỏe và khuyến khích mình tham khảo ý kiến bác sĩ trước chuyến đi để đảm bảo an toàn nhất.", "Điều bên em luôn ưu tiên không phải là đưa thật nhiều khách lên Ladakh, mà là đảm bảo mỗi anh/chị đều có một hành trình an toàn và tận hưởng trọn vẹn vẻ đẹp của vùng Himalaya."] 
      },
      { 
        id: "q9", 
        q: "9. Tour Ladakh có phù hợp với trẻ nhỏ không?", 
        variants: [
            { type: "Logic (Thực tế)", text: "Dạ tour phù hợp với các bé từ 8 tuổi trở lên, vì lúc này bé đã tự chủ sinh hoạt cá nhân và tự đi bộ được mà không cần ba mẹ phải cõng/bế nhiều, tránh làm ba mẹ kiệt sức ở vùng cao." },
            { type: "Cảm xúc (Khuyến khích)", text: "Dạ bé từ 8 tuổi đi tốt chị nhé. Các bạn nhỏ thường thích nghi độ cao rất nhanh và cực kỳ hào hứng khi được ngắm tuyết, cưỡi lạc đà hay xem đàn marmot ngoài tự nhiên." }
        ],
        a: ["Dạ có anh/chị nhé. Tuy nhiên, theo kinh nghiệm tổ chức của bên em, độ tuổi phù hợp nhất là từ khoảng 8 tuổi trở lên.", "Lý do không phải vì các bé không thích nghi được với độ cao, mà ngược lại, trẻ em thường thích nghi khá nhanh nếu sức khỏe tốt. Điều quan trọng hơn là bé đã đủ lớn để tự chủ trong các sinh hoạt cá nhân, biết lắng nghe hướng dẫn và có thể tự đi bộ ở các điểm tham quan mà không cần ba mẹ bế hay chăm sóc liên tục.", "Vì Ladakh là hành trình di chuyển khá nhiều và ở độ cao lớn, nếu bé còn quá nhỏ hoặc vẫn bám ba mẹ thì người vất vả nhất thường là phụ huynh. Khi ba mẹ phải vừa chăm bé, vừa thích nghi với độ cao thì trải nghiệm của cả gia đình sẽ bị ảnh hưởng.", "Bên em cũng đã từng đồng hành cùng nhiều bạn nhỏ từ 8 tuổi trở lên. Các bé đều rất hào hứng với hành trình, nhiều bạn còn tràn đầy năng lượng và chinh phục trọn vẹn chuyến đi. Điều các bé thích nhất thường là được ngắm tuyết, cưỡi lạc đà hai bướu ở thung lũng Nubra, nhìn thấy đàn marmot ngoài tự nhiên và khám phá những tu viện cổ giữa dãy Himalaya.", "Nếu gia đình mình có bé trong độ tuổi này và sức khỏe tốt, em sẽ tư vấn thêm về lịch trình cũng như những lưu ý để cả nhà có một chuyến đi thật an toàn và nhiều kỷ niệm đẹp."] 
      }
    ]
  },
  {
    category: "Thời Tiết & Hành Lý",
    icon: "CloudSun",
    color: "#eab308",
    items: [
      { 
        id: "q5", 
        q: "5. Thời tiết mùa nào đẹp em ha?", 
        variants: [
            { type: "Cảm quan cá nhân (Đẹp nhất)", text: "Dạ đẹp nhất và dễ chịu nhất là tháng 5 đến tháng 7 ạ. Cảnh sắc trong xanh, nhiều lễ hội và là lúc trải nghiệm trọn vẹn nhất." },
            { type: "Mùa đặc biệt (Cảnh sắc)", text: "Dạ tùy sở thích ạ. Tháng 4 thì có hoa mơ nở mộng mơ, tháng 5-7 nắng ấm dễ chịu, còn tháng 9-10 thì Ladakh phủ vàng lá mùa thu và có tuyết rơi siêu đẹp ạ." }
        ],
        a: ["Dạ thật ra Ladakh đẹp từ tháng 4 đến tháng 10, và mỗi mùa sẽ mang một vẻ đẹp rất riêng. Tùy anh/chị thích khung cảnh nào thì em sẽ tư vấn thời điểm phù hợp nhất.", "Tháng 4 – Mùa hoa mơ nở: Đây là thời điểm những vườn hoa mơ bắt đầu bung nở, khung cảnh rất thơ mộng và yên bình. Thời tiết vẫn còn khá lạnh, đặc biệt trên các cung đèo cao vẫn có thể có tuyết rơi, rất phù hợp với anh/chị thích cảm giác mùa xuân vùng Himalaya.", "Tháng 5 – 7: Mùa hè đẹp nhất trong năm. Đây là mùa được nhiều người yêu thích nhất để khám phá Ladakh. Trời nắng đẹp, không khí trong lành, cây cối xanh tươi và diễn ra nhiều lễ hội truyền thống của người Ladakhi.", "Tháng 8 – 9: Mùa trái cây và những gam màu chuyển mùa. Đây là mùa thu hoạch mơ vàng – đặc sản nổi tiếng của Ladakh – cùng với táo và nhiều loại trái cây địa phương.", "Tháng 10 – Mùa thu Ladakh: Ladakh khoác lên mình sắc vàng đặc trưng của mùa thu, không khí trong trẻo và hanh khô, rất đẹp để ngắm cảnh và chụp ảnh. Tuy nhiên, đây cũng là lúc thời tiết bắt đầu khắc nghiệt hơn: nhiệt độ giảm nhanh, trời tối sớm, khu vực hồ và các đèo cao lạnh hơn nhiều, tuyết xuất hiện thường xuyên hơn.", "Nếu anh/chị hỏi em mùa nào đẹp nhất, thì em thường gợi ý tháng 5 đến tháng 7. Đây là thời điểm thời tiết dễ chịu nhất, cảnh sắc rất đẹp, nhiều lễ hội, đường sá thuận lợi và cũng là khoảng thời gian hầu hết khách đi Ladakh đều có trải nghiệm trọn vẹn nhất."] 
      },
      { 
        id: "q6", 
        q: "6. Mình muốn đi tour tháng 12 đến tháng 2 vì lúc đó được nghỉ nhiều.", 
        variants: [
            { type: "Thực tế (Cảnh báo)", text: "Dạ tháng 1-2 Ladakh rất lạnh (-20 độ), tuyết rơi dày đóng băng đường sá nên rất nguy hiểm, bên em không tổ chức tour thời gian này để đảm bảo an toàn tuyệt đối cho khách ạ." },
            { type: "Up-sale (Chuyển hướng)", text: "Dạ mùa đông Ladakh khắc nghiệt quá bên em không nhận khách. Nếu anh/chị nghỉ tầm này thì em khuyên mình chuyển hướng đi Bhutan, thời tiết cực kỳ dễ chịu mà văn hóa Himalaya cũng đặc sắc y hệt ạ." }
        ],
        a: ["Dạ em hiểu mà ạ 😊. Tháng 1–2 cũng là thời điểm nhiều anh/chị có thời gian nghỉ nên rất muốn tranh thủ đi du lịch.", "Tuy nhiên, riêng Ladakh thì đây lại là thời điểm khắc nghiệt nhất trong năm. Nhiệt độ có thể xuống -20 đến -30°C, tuyết rơi dày, nhiều cung đường bị đóng và các chuyến bay đến Leh cũng dễ bị ảnh hưởng bởi thời tiết. Vì vậy bên em không tổ chức tour vào thời gian này để đảm bảo an toàn và trải nghiệm tốt nhất cho khách.", "Nếu anh/chị muốn đi một vùng núi thuộc dãy Himalaya vào tháng 1–2, em rất gợi ý Bhutan ạ. Bhutan cũng có khung cảnh núi non hùng vĩ, tu viện trên núi và văn hóa Phật giáo rất đặc sắc, nhưng độ cao thấp hơn Ladakh nên thời tiết dễ chịu hơn nhiều.", "Còn nếu anh/chị vẫn yêu thích Ladakh thì em khuyên mình nên sắp xếp vào khoảng tháng 4 đến tháng 10. Đây là thời điểm Ladakh đẹp nhất, thời tiết ổn định và anh/chị sẽ cảm nhận được trọn vẹn vẻ đẹp của vùng đất này."] 
      },
      { 
        id: "q10", 
        q: "10. Đi Ladakh có cần mang nhiều đồ lạnh không em?", 
        variants: [
            { type: "An tâm (Thực tế)", text: "Dạ ban ngày đi tháng 5-9 nắng ấm, mặc đồ nhiều lớp (layer) là được. Mình chỉ cần mang đúng 1 cái áo khoác cản gió giữ ấm tốt để mặc sáng sớm hoặc tối ở hồ Pangong thôi ạ." },
            { type: "Hỗ trợ (Tận tâm)", text: "Dạ không cần mang vác quá nhiều đồ cồng kềnh đâu ạ. Trước ngày khởi hành bên em sẽ gửi 1 checklist hành lý chi tiết (từ áo quần, giày dép, thuốc men), mình cứ soạn đúng y chang list đó là đủ ạ." }
        ],
        a: ["Nếu mình đi từ tháng 5 đến tháng 9 thì ban ngày thời tiết khá dễ chịu, trời ban ngày nắng ấm, chỉ cần mặc theo kiểu nhiều lớp (layer) là rất thoải mái. Thông thường chỉ cần áo thun, áo giữ nhiệt mỏng hoặc áo khoác nhẹ là đủ khi di chuyển.", "Tuy nhiên, vào buổi sáng sớm, buổi tối và đặc biệt ở những khu vực như hồ Pangong, Tso Moriri hoặc các cung đèo cao, nhiệt độ sẽ giảm khá nhanh và gió rất lạnh. Vì vậy, em luôn khuyên anh/chị nên mang theo một chiếc áo phao mỏng hoặc áo khoác giữ ấm tốt để mặc khi cần. Mặc dù không dùng cả ngày, nhưng sẽ rất hữu ích ở những thời điểm này.", "Điều mà nhiều anh/chị bất ngờ là không phải lúc nào Ladakh cũng lạnh như mình tưởng. Ban ngày có nắng, cảm giác khá dễ chịu, thậm chí nhiều lúc chỉ cần mặc áo dài tay hoặc áo khoác mỏng là đủ. Vì vậy anh/chị cũng không cần chuẩn bị quá nhiều quần áo dày cồng kềnh.", "Trước ngày khởi hành, bên em sẽ gửi checklist hành lý rất chi tiết, từ quần áo, giày dép, thuốc cá nhân đến các vật dụng cần thiết cho vùng cao. Anh/chị chỉ cần chuẩn bị theo danh sách đó là gần như đầy đủ, không cần phải mua quá nhiều đồ chuyên dụng hay lo lắng mang thiếu."] 
      }
    ]
  },
  {
    category: "Thủ Tục & Khác",
    icon: "Passport",
    color: "#3b82f6",
    items: [
      { 
        id: "q11", 
        q: "11. Có cần xin visa Ấn Độ không? Thủ tục có khó không?", 
        variants: [
            { type: "An tâm (Nhanh gọn)", text: "Dạ thủ tục cực kỳ đơn giản, bên em lo E-visa online từ A-Z. Mình chỉ cần chụp mặt hộ chiếu, 1 ảnh thẻ nền trắng và điền cái form bé xíu là xong ạ." }
        ],
        a: ["Dạ không khó đâu anh/chị nhé.", "Hiện tại, bên em sẽ hỗ trợ anh/chị làm visa Ấn Độ online. Anh/chị chỉ cần chuẩn bị:", "- Ảnh chụp hộ chiếu còn hạn.", "- 01 ảnh thẻ nền trắng theo đúng quy định.", "- Điền form thông tin khai visa.", "Các bước còn lại bên em sẽ hỗ trợ hướng dẫn và xử lý, nên thủ tục khá đơn giản. Thông thường anh/chị chỉ cần chuẩn bị đúng hồ sơ, còn việc khai hồ sơ và theo dõi kết quả bên em sẽ đồng hành cùng mình."] 
      },
      { 
        id: "q12", 
        q: "12. Ở Ladakh có sóng điện thoại và Internet không?", 
        variants: [
            { type: "Logic (Thực tế)", text: "Dạ sim mua ở VN sẽ không dùng được. Tới sân bay Leh, HDV bên em sẽ lo mua và đăng ký sim 4G nội địa bằng hộ chiếu cho cả đoàn. Sóng ở trung tâm rất khỏe, chỉ hơi chập chờn lúc qua đèo thôi ạ." }
        ],
        a: ["Dạ có anh/chị nhé, tuy nhiên Ladakh là khu vực biên giới và có nhiều vùng quân sự, nên sẽ có một số quy định riêng về viễn thông.", "Nếu anh/chị muốn sử dụng 4G trong suốt hành trình thì không nên mua SIM ở Delhi hoặc tại Việt Nam, vì những SIM này thường sẽ không sử dụng được tại Ladakh.", "Bên em sẽ hỗ trợ anh/chị mua và đăng ký SIM ngay tại Leh bằng hộ chiếu. Sau khi kích hoạt, mình có thể sử dụng Internet ở hầu hết các điểm đến trong hành trình.", "Tuy nhiên, tại một số cung đường đèo hoặc khu vực hồ xa trung tâm thì tín hiệu có thể chập chờn hoặc mất sóng trong một khoảng thời gian ngắn, đây là điều khá bình thường ở vùng Himalaya."] 
      },
      { 
        id: "q13", 
        q: "13. Chị đi một mình thì sao?", 
        variants: [
            { type: "Đồng cảm (Xóa rào cản)", text: "Dạ đa số khách FIT TOUR đều đi 1 mình nên chị không lo lạc lõng đâu ạ. Khách đi núi thường cực kỳ cởi mở, sau 1-2 ngày vượt đèo cùng nhau là cả đoàn thân thiết như người nhà luôn ạ." },
            { type: "Kinh tế (Giải quyết chi phí)", text: "Dạ đi 1 mình bên em sẽ chủ động ghép phòng với một khách cùng giới tính trong đoàn để chị đỡ tốn phụ phí phòng đơn. Chị cứ yên tâm nhé." }
        ],
        a: ["Dạ anh/chị cứ yên tâm nhé. Thực tế, đa số khách của bên em đều đăng ký đi một mình, nên anh/chị sẽ không bị lạc lõng đâu ạ.", "Nếu anh/chị đi một mình, bên em sẽ sắp xếp ghép phòng với một khách nữ hoặc nam cùng đoàn (tùy theo giới tính) để mình tiết kiệm chi phí. Nếu anh/chị muốn ở phòng riêng thì bên em cũng có thể hỗ trợ với phụ phí theo nhu cầu.", "Điều em rất thích ở các đoàn Ladakh là mọi người thường rất dễ kết nối với nhau. Sau vài ngày cùng vượt đèo, ngắm cảnh và trải nghiệm, cả đoàn thường trở nên rất thân thiết. Nhiều anh/chị ban đầu đi một mình nhưng khi kết thúc chuyến đi lại có thêm những người bạn đồng hành mới."] 
      },
      { 
        id: "q14", 
        q: "14. Nếu thời tiết xấu hoặc chuyến bay bị hủy thì công ty xử lý như thế nào?", 
        variants: [
            { type: "An tâm (Trách nhiệm)", text: "Dạ bên em ưu tiên an toàn lên hàng đầu. Nếu hoãn/hủy chuyến, FIT TOUR sẽ làm việc trực tiếp với hãng bay đổi chuyến sớm nhất, HDV sẽ đi theo đoàn 24/24. Cả đoàn cũng được mua bảo hiểm du lịch 100% rồi ạ." }
        ],
        a: ["Dạ đây là tình huống thỉnh thoảng vẫn có thể xảy ra khi đi các vùng núi cao như Ladakh, vì thời tiết sẽ ảnh hưởng trực tiếp đến hoạt động của các chuyến bay.", "Trong trường hợp chuyến bay bị hoãn hoặc hủy, bên em sẽ làm việc trực tiếp với hãng hàng không để ưu tiên đổi sang chuyến bay sớm nhất có thể và cập nhật thông tin liên tục cho đoàn. Hướng dẫn viên cũng sẽ đồng hành cùng anh/chị trong suốt quá trình xử lý, nên mình không phải tự làm việc với hãng bay.", "Ngoài ra, tất cả khách tham gia tour đều được bên em mua bảo hiểm du lịch, để tăng thêm sự an tâm trong những tình huống phát sinh theo phạm vi quyền lợi của bảo hiểm.", "Với kinh nghiệm tổ chức các cung đường Himalaya nhiều năm, điều bên em ưu tiên nhất không phải là đi đúng lịch bằng mọi giá, mà là đảm bảo hành trình được xử lý linh hoạt, an toàn và mang lại trải nghiệm tốt nhất cho khách."] 
      }
    ]
  }
];

const LadakhConsultingPage = () => {
    const [openIds, setOpenIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState('');
    const [copiedLink, setCopiedLink] = useState('');
    const [showDetailsIds, setShowDetailsIds] = useState([]); // Array to store IDs of expanded detailed sections
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
        navigator.clipboard.writeText(link.copyText).then(() => {
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
        link.type !== 'tour' && (link.title.toLowerCase().includes(normalizedSearch) || 
        link.desc.toLowerCase().includes(normalizedSearch))
    );

    const filteredTourLinks = referenceLinks.filter(link => 
        link.type === 'tour' && (link.title.toLowerCase().includes(normalizedSearch) || 
        link.desc.toLowerCase().includes(normalizedSearch))
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
            case "Briefcase": return <Briefcase size={20} />;
            case "HeartPulse": return <HeartPulse size={20} />;
            case "CloudSun": return <CloudSun size={20} />;
            case "Passport": return <Passport size={20} />;
            case "Star": return <Star size={20} />;
            case "Music": return <Music size={20} />;
            case "Heart": return <Heart size={20} />;
            case "BookOpen": return <BookOpen size={20} />;
            case "Navigation": return <Navigation size={20} />;
            case "Library": return <Library size={20} />;
            case "Award": return <Award size={20} />;
            case "Users": return <Users size={20} />;
            case "List": return <List size={20} />;
            case "Map": return <Map size={20} />;
            case "Mountain": return <Mountain size={20} />;
            case "Image": return <ImageIcon size={20} />;
            case "Video": return <Video size={20} />;
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
                        <div style={{ width: '40px', height: '40px', background: '#f97316', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)' }}>
                            <PhoneCall size={20} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Kịch Bản Sale</h2>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Hành Trình Ladakh</p>
                        </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm (Cmd+K)..." 
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
                                padding: '10px 10px 10px 36px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                background: '#f8fafc',
                                fontSize: '0.9rem',
                                color: '#334155',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                </div>

                <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filteredFaqs.map((group, gIdx) => (
                        <div key={gIdx} style={{ marginBottom: '12px' }}>
                            <div style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {group.category}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {group.items.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            scrollTo('cat-' + gIdx);
                                            if (!openIds.includes(item.id)) {
                                                setOpenIds(prev => [...prev, item.id]);
                                            }
                                        }}
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: 'transparent',
                                            color: '#475569',
                                            fontWeight: '500',
                                            fontSize: '0.9rem',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '10px',
                                            transition: 'all 0.2s',
                                            lineHeight: '1.4'
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9' }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = 'transparent' }}
                                    >
                                        <div style={{ marginTop: '2px', opacity: 0.4 }}>
                                            <Hash size={14} />
                                        </div>
                                        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {item.q.replace(/^[0-9]+[.,]\s*/, '')}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ====== RIGHT CONTENT ====== */}
            <div className="ladakh-content" style={{ flex: 1, padding: '40px 60px', maxWidth: '1200px', margin: '0 auto' }}>
                <button className="mobile-menu-toggle" onClick={() => setShowMobileSidebar(!showMobileSidebar)}>
                    {showMobileSidebar ? <ChevronDown size={18} /> : <Search size={18} />}
                    {showMobileSidebar ? 'Ẩn mục lục' : 'Mục lục & Tìm kiếm'}
                </button>
                
                <div style={{ marginBottom: '48px', borderBottom: '1px solid #e2e8f0', paddingBottom: '32px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ffedd5', color: '#ea580c', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', marginBottom: '16px' }}>
                        <Sparkles size={16} /> 
                        Cẩm Nang Chốt Sale BU4
                    </div>
                    <h1 className="ladakh-title" style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 16px 0', letterSpacing: '-0.02em' }}>
                        Thư Viện Kịch Bản Ladakh
                    </h1>
                    <p style={{ fontSize: '1rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                        Bấm vào câu hỏi để copy kịch bản chốt sale, hoặc xem giải thích (Đào tạo nội bộ).
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
                    {/* ====== Reference Links Section ====== */}
                    {filteredMarketingLinks.length > 0 && (
                        <div id="references-section" style={{ display: 'flex', flexDirection: 'column', gap: '24px', scrollMarginTop: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '8px' }}>
                                <div style={{ color: '#0284c7' }}>
                                    <Library size={24} />
                                </div>
                                <h2 className="faq-header-title" style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                                    Tài Liệu Đào Tạo & Marketing
                                </h2>
                            </div>
                            
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                                gap: '16px' 
                            }}>
                                {filteredMarketingLinks.map((link, idx) => (
                                    <a 
                                        key={idx} 
                                        href={link.url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '10px',
                                            background: '#ffffff',
                                            padding: '14px',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            textDecoration: 'none',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                                            transition: 'all 0.2s',
                                            position: 'relative'
                                        }}
                                        onMouseOver={(e) => { 
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 8px 12px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.025)';
                                            e.currentTarget.style.borderColor = link.color;
                                        }}
                                        onMouseOut={(e) => { 
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                            <div style={{ 
                                                width: '32px', height: '32px', borderRadius: '8px', 
                                                background: `${link.color}15`, color: link.color,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <div style={{ transform: 'scale(0.85)' }}>
                                                    {getIcon(link.icon)}
                                                </div>
                                            </div>
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', margin: 0, flex: 1, lineHeight: '1.4' }}>
                                                {link.title}
                                            </h3>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: '1.5' }}>
                                            {link.desc}
                                        </p>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '10px' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#0ea5e9', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                Mở xem <ExternalLink size={10} />
                                            </span>
                                            <button 
                                                onClick={(e) => handleCopyLink(e, link)}
                                                style={{
                                                    background: copiedLink === link.url ? '#10b981' : '#f8fafc',
                                                    color: copiedLink === link.url ? '#fff' : '#475569',
                                                    border: copiedLink === link.url ? '1px solid #10b981' : '1px solid #e2e8f0',
                                                    padding: '4px 10px', borderRadius: '6px',
                                                    fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '4px',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {copiedLink === link.url ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                                                {copiedLink === link.url ? 'Đã copy' : 'Copy gửi khách'}
                                            </button>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ====== Tour Links Section ====== */}
                    {filteredTourLinks.length > 0 && (
                        <div id="tours-section" style={{ display: 'flex', flexDirection: 'column', gap: '24px', scrollMarginTop: '40px', marginBottom: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '8px' }}>
                                <div style={{ color: '#059669' }}>
                                    <Map size={24} />
                                </div>
                                <h2 className="faq-header-title" style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                                    Sản Phẩm & Lịch Trình Tour
                                </h2>
                            </div>
                            
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                                gap: '16px' 
                            }}>
                                {filteredTourLinks.map((link, idx) => (
                                    <a 
                                        key={idx} 
                                        href={link.url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '10px',
                                            background: '#ffffff',
                                            padding: '14px',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            textDecoration: 'none',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                                            transition: 'all 0.2s',
                                            position: 'relative'
                                        }}
                                        onMouseOver={(e) => { 
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 8px 12px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.025)';
                                            e.currentTarget.style.borderColor = link.color;
                                        }}
                                        onMouseOut={(e) => { 
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                            <div style={{ 
                                                width: '32px', height: '32px', borderRadius: '8px', 
                                                background: `${link.color}15`, color: link.color,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <div style={{ transform: 'scale(0.85)' }}>
                                                    {getIcon(link.icon)}
                                                </div>
                                            </div>
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', margin: 0, flex: 1, lineHeight: '1.4' }}>
                                                {link.title}
                                            </h3>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: '1.5' }}>
                                            {link.desc}
                                        </p>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '10px' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#0ea5e9', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                Mở xem <ExternalLink size={10} />
                                            </span>
                                            <button 
                                                onClick={(e) => handleCopyLink(e, link)}
                                                style={{
                                                    background: copiedLink === link.url ? '#10b981' : '#f8fafc',
                                                    color: copiedLink === link.url ? '#fff' : '#475569',
                                                    border: copiedLink === link.url ? '1px solid #10b981' : '1px solid #e2e8f0',
                                                    padding: '4px 10px', borderRadius: '6px',
                                                    fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '4px',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {copiedLink === link.url ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                                                {copiedLink === link.url ? 'Đã copy' : 'Copy gửi khách'}
                                            </button>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                    

                    {filteredFaqs.map((group, gIdx) => (
                        <div key={gIdx} id={'cat-' + gIdx} style={{ display: 'flex', flexDirection: 'column', gap: '24px', scrollMarginTop: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '8px' }}>
                                <div style={{ color: group.color }}>
                                    {getIcon(group.icon)}
                                </div>
                                <h2 className="faq-header-title" style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                                    {group.category}
                                </h2>
                            </div>

                            {group.items.map((item) => {
                                const isOpen = openIds.includes(item.id);
                                const isDetailsOpen = showDetailsIds.includes(item.id);
                                
                                return (
                                <div key={item.id} style={{ 
                                    background: '#ffffff',
                                    borderRadius: '16px',
                                    boxShadow: isOpen ? '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.025)' : '0 1px 3px rgba(0,0,0,0.05)',
                                    border: isOpen ? `1px solid ${group.color}40` : '1px solid #e2e8f0',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s'
                                }}>
                                    {/* Accordion Header */}
                                    <button 
                                        onClick={() => toggleAccordion(item.id)}
                                        className="faq-accordion-header"
                                        style={{
                                            width: '100%',
                                            padding: '16px 24px',
                                            background: isOpen ? '#f8fafc' : 'transparent',
                                            border: 'none',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            justifyContent: 'space-between',
                                            cursor: 'pointer',
                                            textAlign: 'left'
                                        }}
                                    >
                                        <h3 className="faq-accordion-title" style={{ fontSize: '1.05rem', fontWeight: '600', color: '#0f172a', margin: '0 24px 0 0', lineHeight: '1.5' }}>
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

                                    {/* Accordion Content */}
                                    <div style={{ 
                                        maxHeight: isOpen ? '3000px' : '0', 
                                        opacity: isOpen ? 1 : 0, 
                                        transition: 'all 0.4s ease-in-out',
                                        background: '#ffffff'
                                    }}>
                                        <div className="faq-inner-padding" style={{ padding: '0 24px 24px 24px', borderTop: '1px solid #f1f5f9' }}>
                                            
                                            {/* Tùy chọn kịch bản chốt Sale */}
                                            <div style={{ marginTop: '24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '16px' }}>
                                                    <Zap size={16} /> Kịch bản Chat & Chốt Sale
                                                </div>
                                                
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                    {item.variants.map((variant, vIdx) => (
                                                        <div key={vIdx} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px' }}>
                                                            <div className="faq-variant-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                                                                <div>
                                                                    <span style={{ display: 'inline-block', background: '#dcfce7', color: '#166534', fontSize: '0.75rem', fontWeight: '700', padding: '4px 8px', borderRadius: '4px', marginBottom: '8px' }}>
                                                                        {variant.type}
                                                                    </span>
                                                                    <p style={{ margin: 0, color: '#14532d', fontSize: '1rem', lineHeight: '1.6' }}>
                                                                        {variant.text}
                                                                    </p>
                                                                </div>
                                                                <button 
                                                                    onClick={(e) => handleCopy(e, item.id, variant.text, vIdx)}
                                                                    style={{
                                                                        flexShrink: 0,
                                                                        display: 'flex', alignItems: 'center', gap: '6px',
                                                                        padding: '6px 12px', borderRadius: '6px',
                                                                        background: copiedId === item.id + vIdx ? '#166534' : '#ffffff',
                                                                        color: copiedId === item.id + vIdx ? '#ffffff' : '#166534',
                                                                        border: '1px solid #bbf7d0',
                                                                        fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
                                                                        transition: 'all 0.2s'
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

                                            {/* Giải thích kỹ (Inner Accordion) */}
                                            <div style={{ marginTop: '24px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                                                {/* Inner Header - Clickable */}
                                                <div 
                                                    onClick={() => toggleDetails(item.id)}
                                                    style={{ 
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                                                        padding: '16px 20px', cursor: 'pointer', background: isDetailsOpen ? '#f1f5f9' : 'transparent',
                                                        transition: 'background 0.2s'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                                                        <Info size={16} /> Kiến thức đào tạo (Để Sale hiểu sâu)
                                                    </div>
                                                    <div style={{ 
                                                        transform: isDetailsOpen ? 'rotate(90deg)' : 'rotate(0deg)', 
                                                        transition: 'transform 0.3s ease',
                                                        color: '#94a3b8'
                                                    }}>
                                                        <ChevronRight size={20} />
                                                    </div>
                                                </div>
                                                
                                                {/* Inner Content */}
                                                <div style={{ 
                                                    maxHeight: isDetailsOpen ? '2000px' : '0', 
                                                    opacity: isDetailsOpen ? 1 : 0, 
                                                    transition: 'all 0.3s ease-in-out',
                                                    borderTop: isDetailsOpen ? '1px solid #e2e8f0' : 'none'
                                                }}>
                                                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', color: '#334155', lineHeight: '1.7', fontSize: '1rem' }}>
                                                        {item.a.map((p, pIdx) => (
                                                            <p key={pIdx} style={{ 
                                                                margin: 0, 
                                                                paddingLeft: p.startsWith('-') ? '20px' : '0',
                                                                position: 'relative'
                                                            }}>
                                                                {p.startsWith('-') && (
                                                                    <span style={{ position: 'absolute', left: '4px', top: '8px', width: '6px', height: '6px', background: '#64748b', borderRadius: '50%' }}></span>
                                                                )}
                                                                {p.startsWith('-') ? p.substring(1).trim() : p}
                                                            </p>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    ))}
                    
                    {filteredFaqs.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
                            <Search size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                            <p style={{ fontSize: '1.1rem', margin: 0 }}>Không tìm thấy kết quả nào cho "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LadakhConsultingPage;
