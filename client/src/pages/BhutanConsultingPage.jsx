import React, { useState, useEffect } from 'react';
import { Briefcase, HeartPulse, CloudSun, BookKey as Passport, Search, Copy, CheckCircle2, ChevronDown, Hash, PhoneCall, Sparkles, MessageSquare, Info, Zap, ChevronRight, ExternalLink, Star, Music, Heart, BookOpen, Navigation, Library, Award, Users, List, Map, Mountain, Image as ImageIcon, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

const groupedFaqs = [
  {
    category: "Chung & Dịch Vụ",
    icon: "Briefcase",
    color: "#f97316",
    items: [
      { 
        id: "q1", 
        q: "1. Tại sao tour Bhutan lại có mức giá 62.490.000đ?", 
        variants: [
            { type: "Giải quyết chi phí (Logic)", text: "Dạ chính phủ Bhutan có chính sách thu phí Phát triển Bền vững (SDF) khá cao nên chi phí tour Bhutan luôn cao hơn các nước khác.\nĐổi lại, tour bên em đã bao trọn gói: Vé máy bay bay thẳng khứ hồi, KS 4 sao, 3 bữa/ngày và phí tham quan.\n\nBên em còn có các Tour khám phá đặc biệt:\n- Vùng đất Lạt Ma Ladakh: 39,990,000\n- Núi lửa Bromo: GIÁ: 29.990.000 VNĐ/ khách\nHoặc các tour đặc biệt khác, anh/chị muốn tư vấn thêm thông tin cụ thể không?" },
            { type: "Cam kết chất lượng", text: "Dạ tour bên em là trọn gói (vé máy bay thẳng, KS 4 sao, ăn uống, visa) không phát sinh chi phí ẩn. Mình được ở tại Pelyang Boutique (Thimphu), ZEN Hotel (Punakha) và Tashi Namgay Resort (Paro). Hành trình thiết kế riêng rất chất lượng." }
        ],
        a: ["Dạ, chính phủ Bhutan áp dụng mức phí Phát triển Bền vững (SDF) khá cao nhằm bảo tồn văn hóa và môi trường, nên du lịch Bhutan mặc định ở phân khúc cao cấp.", "Tuy nhiên, giá tour 62.490.000đ bên em đã bao gồm gần như TRỌN GÓI mọi dịch vụ từ A-Z: Vé máy bay bay thẳng khứ hồi, hành lý 37kg, lưu trú tại hệ thống khách sạn 4 sao tiêu chuẩn, các bữa ăn Set menu/Buffet chất lượng cao, vé tham quan và bảo hiểm du lịch.", "Vì vậy, ngoại trừ tiền Tip cho HDV (50 USD/khách) và chi phí mua sắm cá nhân, anh/chị gần như không phải phát sinh thêm chi phí nào trên đường tour."] 
      },
      { 
        id: "q2", 
        q: "2. Tại sao lại chọn Bhutan làm điểm đến?", 
        variants: [
            { type: "Truyền cảm hứng (Cảm xúc)", text: "Dạ Bhutan là một trong những quốc gia hiếm hoi trên thế giới lấy 'Chỉ số Hạnh phúc Quốc gia' (GNH) làm thước đo phát triển thay vì GDP. Nơi đây giữ nguyên vẹn văn hóa Phật giáo Himalaya, không khói bụi, không ồn ào. Một chuyến đi để tìm về sự bình yên thực sự trong tâm hồn.\n\nAnh/chị có thể xem những hình ảnh thực tế rất bình yên của Bhutan tại đây nhé: https://fittour.vn/gallery-bhutan" }
        ],
        a: ["Bhutan được mệnh danh là 'Vương quốc hạnh phúc nhất thế giới'. Khi đến đây, anh/chị sẽ cảm nhận được nhịp sống rất chậm, con người cực kỳ thân thiện và trân trọng những giá trị tinh thần.", "Cảnh sắc thiên nhiên hùng vĩ của dãy Himalaya hòa quyện với những tu viện cổ kính nằm cheo leo trên vách núi (như Tiger's Nest) tạo nên một không gian vô cùng huyền bí và tĩnh lặng.", "Đây là nơi hoàn hảo để 'chữa lành', thoát khỏi sự ồn ào và áp lực của cuộc sống hiện đại, tìm lại sự cân bằng và bình yên cho bản thân."] 
      },
      { 
        id: "q3", 
        q: "3. Điểm nhấn của hành trình 5 ngày 4 đêm này là gì?", 
        variants: [
            { type: "Ngắn gọn (Hấp dẫn)", text: "Dạ hành trình này đưa anh/chị qua 3 thung lũng đẹp nhất Bhutan: Paro, Thimphu và Punakha. Đặc biệt là trải nghiệm trekking lên tu viện Tiger's Nest linh thiêng cheo leo trên vách đá 900m." }
        ],
        a: ["Hành trình của chúng ta sẽ đi qua những địa danh biểu tượng nhất của Vương quốc Bhutan:", "- Thimphu: Thủ đô không có đèn giao thông, nơi có tượng Phật Dordenma khổng lồ che chở cả đất nước và Hoàng cung Tashichho Dzong.", "- Punakha: Từng là cố đô, nổi tiếng với Punakha Dzong - pháo đài đẹp nhất Bhutan nằm giữa hai dòng sông và cầu treo dài nhất Bhutan.", "- Paro: Điểm đến tâm linh với tu viện Tiger's Nest (Paro Taktsang) linh thiêng nằm cheo leo trên vách đá cao 900m. Một trải nghiệm trekking để đời mà bất cứ ai đến Bhutan cũng phải thử."] 
      },
      { 
        id: "q3_1", 
        q: "4. Lễ Puja trong tour là gì? Có gì đặc biệt không?", 
        variants: [
            { type: "Tâm linh (Độc quyền)", text: "Dạ điểm nhấn tâm linh đặc biệt của tour là vào ngày cuối cùng, đoàn sẽ được đến Học Viện Phật Giáo Bhutan gặp trực tiếp các Lạt Ma để làm lễ Puja. Đây là nghi lễ gia trì bình an, ban phước lành rất thiêng liêng trước khi mình rời Vương quốc Hạnh phúc ạ." }
        ],
        a: ["Lễ Puja là một nghi lễ cầu nguyện truyền thống rất quan trọng trong văn hóa Phật giáo Kim Cương Thừa tại Bhutan.", "Trong hành trình này, FIT Tour thiết kế riêng một buổi lễ Puja tại Học Viện Phật Giáo. Quý khách sẽ được diện kiến các Lạt Ma, nghe tụng kinh cầu bình an, sức khỏe và may mắn.", "Đây là một trải nghiệm tâm linh sâu sắc, giúp du khách cảm nhận trọn vẹn sự thanh tịnh và năng lượng tích cực của Vương quốc Hạnh phúc trước khi kết thúc chuyến đi."] 
      }
    ]
  },
  {
    category: "Thủ Tục Visa & Đăng Ký",
    icon: "Passport",
    color: "#3b82f6",
    items: [
      { 
        id: "q4", 
        q: "4. Xin visa Bhutan có khó không? Cần giấy tờ gì?", 
        variants: [
            { type: "An tâm (Nhanh gọn)", text: "Dạ thủ tục xin visa Bhutan cực kỳ đơn giản vì công ty em sẽ lo trọn gói. Anh/chị chỉ cần chụp mặt hộ chiếu (còn hạn 6 tháng) và 2 tấm hình 4x6 là xong ạ." }
        ],
        a: ["Dạ thủ tục vô cùng đơn giản. Trái với nhiều người nghĩ xin visa Bhutan rất khó, thực tế công ty du lịch sẽ đại diện xin visa cho khách hàng.", "Anh/chị chỉ cần cung cấp:", "1. Hộ chiếu còn hạn trên 6 tháng.", "2. File ảnh thẻ 4x6.", "Thời gian xét duyệt visa chỉ khoảng 8 ngày làm việc. Mọi thủ tục còn lại bên em sẽ lo hết."] 
      },
      { 
        id: "q5", 
        q: "5. Chị muốn đăng ký thì thanh toán thế nào?", 
        variants: [
            { type: "Hướng dẫn (Chi tiết)", text: "Dạ để giữ chỗ, anh/chị chỉ cần chuyển khoản cọc 25.000.000 VNĐ/khách. Phần còn lại mình thanh toán sau theo tiến độ ạ. Em gửi thông tin tài khoản công ty nhé." }
        ],
        a: ["Dạ để tiến hành đặt dịch vụ và làm visa, anh/chị cần đặt cọc giữ chỗ 25.000.000 VNĐ/khách.", "Số tiền còn lại sẽ được thanh toán trước ngày khởi hành (tùy theo mốc thời gian trong quy định của tour).", "Bên em nhận chuyển khoản vào tài khoản công ty và xuất phiếu thu/hóa đơn đầy đủ để anh/chị an tâm."] 
      }
    ]
  },
  {
    category: "Sức Khỏe & Vận Động",
    icon: "HeartPulse",
    color: "#ef4444",
    items: [
      { 
        id: "q6", 
        q: "6. Lên Bhutan có bị sốc độ cao không? Có khó thở không?", 
        variants: [
            { type: "Khoa học (An tâm)", text: "Dạ Bhutan nằm ở độ cao trung bình khoảng 2.000m - 2.500m (Thimphu, Paro), thấp hơn nhiều so với Tây Tạng hay Ladakh. Ở độ cao này cơ thể con người hoàn toàn thích nghi bình thường, không gây sốc độ cao hay khó thở đâu ạ." }
        ],
        a: ["Dạ Bhutan nằm trên dãy Himalaya nhưng các thành phố chúng ta đi qua như Paro, Thimphu, Punakha chỉ ở độ cao khoảng hơn 2.000m so với mực nước biển (Punakha thậm chí chỉ khoảng 1.200m).", "Độ cao này rất an toàn, không khí vẫn đủ oxy nên hầu hết du khách mọi lứa tuổi đều cảm thấy thoải mái và không gặp tình trạng sốc độ cao (AMS) như khi đi các vùng cao 3.500m - 4.000m.", "Chỉ có ngày trekking lên Tiger's Nest là có độ dốc và cao hơn một chút (lên mức ~3.100m), nhưng chúng ta sẽ đi rất từ từ, vừa đi vừa nghỉ ngắm cảnh nên cơ thể sẽ thích nghi tốt."] 
      },
      { 
        id: "q7", 
        q: "7. Đường lên tu viện Tiger's Nest có khó đi không? Sức khỏe yếu có đi được không?", 
        variants: [
            { type: "Động viên (Hỗ trợ)", text: "Dạ ngày lên Tiger's Nest là ngày trekking (đi bộ đường núi) khoảng 5-6 tiếng khứ hồi. Đường đất có độ dốc nhưng đi bộ chầm chậm thì đa số mọi người đều chinh phục được. Nếu mỏi chân, mình có thể thuê ngựa chở lên nửa đoạn đường đầu (chi phí tự túc)." }
        ],
        a: ["Hành trình lên Tiger's Nest là điểm nhấn tuyệt vời nhất, mất khoảng 2-3 tiếng đi lên và 1.5-2 tiếng đi xuống.", "Đường đi khá dốc, là đường đất len lỏi giữa rừng thông, nhưng phong cảnh vô cùng tuyệt mỹ. Giữa đường sẽ có quán Cafeteria để mình dừng chân uống trà, ăn bánh và ngắm tu viện từ xa.", "Đối với cô chú lớn tuổi hoặc người ít vận động, mình có thể thuê ngựa để cưỡi lên đến khu vực Cafeteria (nửa đường, phần còn lại bắt buộc phải đi bộ qua các bậc thang).", "Quan trọng nhất là không cần vội vàng, cứ đi theo nhịp độ của bản thân, hít thở không khí trong lành, HDV sẽ luôn đồng hành hỗ trợ."] 
      }
    ]
  },
  {
    category: "Thời Tiết, Hành Lý & Ẩm Thực",
    icon: "CloudSun",
    color: "#eab308",
    items: [
      { 
        id: "q8", 
        q: "8. Thời tiết Bhutan thế nào? Đi mùa nào là đẹp nhất?", 
        variants: [
            { type: "Tư vấn (Chân thực)", text: "Dạ tour bên em có lịch khởi hành quanh năm. Tuy nhiên, thời điểm đẹp nhất để đi Bhutan là mùa Xuân (Tháng 3 - 5) với muôn hoa đua nở, hoặc mùa Thu (Tháng 9 - 11) với bầu trời xanh vắt, không khí mát mẻ dễ chịu." }
        ],
        a: ["Bhutan có 4 mùa khá rõ rệt nhưng nhìn chung khí hậu vô cùng mát mẻ, trong lành.", "- Mùa Xuân (Tháng 3 - 5): Thời tiết ấm áp dần, thung lũng ngập tràn các loài hoa đỗ quyên, hoa phượng tím nở rộ.", "- Mùa Thu (Tháng 9 - 11): Là mùa cao điểm du lịch Bhutan vì bầu trời trong xanh tuyệt đẹp, khí hậu se lạnh, rất lý tưởng để trekking lên Tiger's Nest và ngắm nhìn dãy Himalaya quang đãng.", "- Mùa Đông và Hè: Vẫn có những nét đẹp riêng, mùa hè thì xanh mướt, mùa đông thì có thể ngắm tuyết rơi rải rác.", "Trước khi đi, bên em sẽ cập nhật tình hình thời tiết chi tiết để đoàn chuẩn bị quần áo phù hợp."] 
      },
      { 
        id: "q9", 
        q: "9. Đồ ăn ở Bhutan có dễ ăn không?", 
        variants: [
            { type: "Thực tế (Chu đáo)", text: "Dạ người Bhutan thích ăn cay và béo (nhiều ớt và phô mai). Tuy nhiên, bên em đã sắp xếp các bữa ăn (Set menu, Buffet khách sạn) được tinh chỉnh khẩu vị cho gần giống với người Việt Nam nhất, đa dạng thịt cá rau củ nên mình yên tâm dễ ăn ạ." }
        ],
        a: ["Đặc trưng ẩm thực của người Bhutan là món Ema Datshi (ớt nấu với phô mai) - họ ăn rất cay và chuộng các món từ bơ sữa.", "Tuy nhiên, anh/chị đừng lo lắng! Trong tour, các bữa ăn đều được nhà hàng và khách sạn chuẩn bị riêng cho du khách quốc tế, đặc biệt FIT Tour đã lưu ý để khẩu vị phù hợp với người Việt: giảm cay, giảm béo, đa dạng các món thịt (gà, lợn, bò), cá và rất nhiều rau xanh sạch.", "Các bữa sáng đều là buffet tại khách sạn 4 sao rất dễ ăn. Nếu anh/chị cẩn thận, có thể mang theo một ít chà bông, mỳ gói, hạt hoặc đồ ăn vặt quen thuộc từ Việt Nam."] 
      },
      { 
        id: "q10", 
        q: "10. Tiền tệ và Sim điện thoại ở đó thế nào?", 
        variants: [
            { type: "Thực tế (Tiện lợi)", text: "Dạ Bhutan dùng tiền Ngultrum (NU). 100 USD đổi được khoảng 8.000 NU. Tới sân bay HDV sẽ hỗ trợ mình đổi tiền và mua Sim 4G luôn nên cực kỳ tiện lợi ạ." }
        ],
        a: ["Dạ về tiền tệ: Bhutan sử dụng đồng Ngultrum (NU), tỷ giá tương đương với đồng Rupee của Ấn Độ (INR). Khoảng 100 USD đổi được 8.000 NU (100 NU ~ 30.000 VNĐ).", "Anh/chị nên mang theo USD từ Việt Nam (ưu tiên các tờ tiền mới, không nhàu nát). Khi đến sân bay Paro hoặc vào trung tâm thị trấn, HDV sẽ hỗ trợ đoàn đổi sang tiền NU để mua sắm lặt vặt.", "Về liên lạc: Sim Việt Nam roaming thường rất đắt hoặc sóng không ổn định. Đến sân bay, HDV sẽ hỗ trợ mua Sim du lịch nội địa của Bhutan ngay tại sảnh với giá cả hợp lý, có 4G để anh/chị truy cập Internet thoải mái."] 
      }
    ]
  }
];

const referenceLinks = [
    { 
        title: "Danh Sách Tour Bhutan", 
        desc: "Hành trình về miền hạnh phúc - 5 Ngày 4 Đêm", 
        url: "https://fittour.vn/tour/tour-bhutan-5n4d", 
        icon: "List", 
        color: "#8b5cf6",
        type: "tour",
        copyText: "Dạ đây là lịch trình chi tiết tour Bhutan 5 Ngày 4 Đêm bên em, đưa mình đến Vương quốc Hạnh Phúc với các điểm Thimphu, Punakha và tu viện Tiger's Nest linh thiêng. Anh/chị xem qua nhé: https://fittour.vn/tour/tour-bhutan-5n4d"
    },
    { 
        title: "Thư Viện Hình Ảnh Bhutan", 
        desc: "Cảnh sắc hùng vĩ và bình yên của Vương quốc Bhutan", 
        url: "https://fittour.vn/gallery-bhutan", 
        icon: "Image", 
        color: "#84cc16",
        type: "marketing",
        copyText: "Dạ trăm nghe không bằng một thấy, anh/chị lướt qua thư viện hình ảnh thực tế về đất nước Bhutan thanh bình, để cảm nhận rõ hơn nét đẹp văn hóa Himalaya nhé: https://fittour.vn/gallery-bhutan"
    },
    { 
        title: "Lễ Puja Gia Trì Bình An", 
        desc: "Hình ảnh du khách hòa nhịp cùng lễ Puja thiêng liêng", 
        url: "https://media.fittour.vn/uploads/2023/07/du-khach-fit-tour-hoa-nhip-cung-le-puja.webp", 
        icon: "Heart", 
        color: "#f43f5e",
        type: "marketing",
        copyText: "Dạ điểm nhấn tâm linh rất đặc biệt của tour là nghi lễ Puja. Đoàn sẽ được gặp các Lạt Ma, làm lễ cầu bình an và gia trì sức khỏe. Anh/chị xem hình ảnh thực tế khách nhà em tham gia lễ vô cùng thiêng liêng tại đây nhé: https://media.fittour.vn/uploads/2023/07/du-khach-fit-tour-hoa-nhip-cung-le-puja.webp"
    }
];


const BhutanConsultingPage = () => {
    const [openIds, setOpenIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState('');
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
    
    const [copiedLink, setCopiedLink] = useState('');
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
            case "Briefcase": return <Briefcase size={20} />;
            case "HeartPulse": return <HeartPulse size={20} />;
            case "CloudSun": return <CloudSun size={20} />;
            case "Passport": return <Passport size={20} />;
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
                        Kịch bản chốt Sale
                    </div>
                    <h1 className="ladakh-title" style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 16px 0', letterSpacing: '-0.02em' }}>
                        Tư vấn Tour Bhutan (5N4Đ)
                    </h1>
                    <p style={{ fontSize: '1rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                        Bấm vào câu hỏi để copy kịch bản chốt sale, hoặc xem giải thích (Đào tạo nội bộ).
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
                    {/* ====== Combined Links Section ====== */}
                    {filteredMarketingLinks.length > 0 && (
                        <div id="references-section" style={{ display: 'flex', flexDirection: 'column', gap: '24px', scrollMarginTop: '40px', marginBottom: '60px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '8px' }}>
                                <div style={{ color: '#0284c7' }}>
                                    <Library size={24} />
                                </div>
                                <h2 className="faq-header-title" style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                                    Link / Bài Viết Gửi Khách
                                </h2>
                            </div>
                            
                            <div className="ladakh-grid" style={{ 
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
                                        {link.url.match(/\.(jpeg|jpg|gif|png|webp)$/i) && (
                                            <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                                                <img src={link.url} alt={link.title} style={{ width: '100%', height: '140px', display: 'block', objectFit: 'cover' }} />
                                            </div>
                                        )}
                                        
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

export default BhutanConsultingPage;
