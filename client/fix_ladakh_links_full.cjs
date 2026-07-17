const fs = require('fs');

let code = fs.readFileSync('src/pages/LadakhConsultingPage.jsx', 'utf8');

const fullArray = `const referenceLinks = [
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
];`;

const startIdx = code.indexOf('const referenceLinks = [');
const endIdx = code.indexOf('];', startIdx) + 2;

code = code.substring(0, startIdx) + fullArray + code.substring(endIdx);

// Fix getIcon
const getIconAdd = `
            case "Video": return <Video size={20} />;
            case "Star": return <Star size={20} />;
            case "Music": return <Music size={20} />;
            case "Heart": return <Heart size={20} />;
            case "BookOpen": return <BookOpen size={20} />;
            case "Navigation": return <Navigation size={20} />;
            case "Award": return <Award size={20} />;
            case "Users": return <Users size={20} />;`;
code = code.replace('case "List": return <List size={20} />;', getIconAdd + '\\n            case "List": return <List size={20} />;');

// Fix imports
code = code.replace(/import { Briefcase.* } from 'lucide-react';/, "import { Briefcase, HeartPulse, CloudSun, BookKey as Passport, Search, Copy, CheckCircle2, ChevronDown, Hash, PhoneCall, Sparkles, MessageSquare, Info, Zap, ChevronRight, Library, ExternalLink, ImageIcon, Image, List, Map, Mountain, Video, Star, Music, Heart, BookOpen, Navigation, Award, Users } from 'lucide-react';");

fs.writeFileSync('src/pages/LadakhConsultingPage.jsx', code);
console.log("Restored full Ladakh referenceLinks array!");
