const fs = require('fs');
const path = require('path');
const db = require('../db'); // Adjust if db path is different

/**
 * Trích xuất text thuần túy từ file JSX/React.
 * Loại bỏ code, giữ lại nội dung text mà người dùng nhìn thấy trên giao diện.
 */
function extractTextFromJSX(jsxContent) {
  // Bước 1: Chỉ lấy phần JSX return (nội dung render)
  // Tìm phần return ( ... ) chính
  let text = jsxContent;

  // Xóa import statements (single + multi-line)
  text = text.replace(/^import\s+[\s\S]*?from\s+['"][^'"]*['"];?\s*$/gm, '');
  text = text.replace(/^import\s+.*$/gm, '');
  // Xóa dòng } from 'xxx'; (phần cuối của multi-line import)
  text = text.replace(/^\s*\}\s*from\s+['"][^'"]*['"];?\s*$/gm, '');

  // Xóa JSX comments {/* ... */}
  text = text.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

  // Xóa JS line comments
  text = text.replace(/\/\/[^\n]*/g, '');

  // Xóa style={{ ... }} (nested braces)
  text = text.replace(/style=\{\{[^}]*\}\}/g, '');

  // Xóa className="..." và className={...}
  text = text.replace(/className="[^"]*"/g, '');
  text = text.replace(/className=\{[^}]*\}/g, '');

  // Xóa các thuộc tính JSX khác: onClick, onChange, ref, key, etc.
  text = text.replace(/\s(?:onClick|onChange|onSubmit|onScroll|ref|key|id|alt|src|href|target|rel|type|size|fill|color|background|width|height|display|gap|padding|margin|fontSize|fontWeight|position|top|right|left|bottom|flex|textAlign|borderRadius|border|cursor|mixBlendMode|overflow|maxWidth|marginTop|marginBottom|textDecoration|opacity|justifyContent|alignItems)=\{[^}]*\}/g, '');
  text = text.replace(/\s(?:alt|src|href|target|rel|type)="[^"]*"/g, '');

  // Xóa self-closing component tags: <ComponentName ... />
  text = text.replace(/<[A-Z]\w*\s*[^>]*\/>/g, '');
  // Xóa opening/closing component tags (nhưng giữ nội dung): <ComponentName> ... </ComponentName>
  text = text.replace(/<\/?[A-Z]\w*[^>]*>/g, '');

  // Thay thế <br/> <br /> bằng newline
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Xóa <img ... />
  text = text.replace(/<img\s+[^>]*\/?>/gi, '');

  // Xóa tất cả HTML tags còn lại, GIỮ nội dung bên trong
  text = text.replace(/<\/?[a-z][a-z0-9]*[^>]*>/gi, ' ');

  // Giải mã HTML entities
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&quot;/g, '"');

  // Xóa các JSX expression đơn giản còn sót (giữ string literals)
  text = text.replace(/\{`([^`]*)`\}/g, '$1');
  text = text.replace(/\{"([^"]*)"\}/g, '$1');
  text = text.replace(/\{'([^']*)'\}/g, '$1');
  // Xóa expressions còn lại (biến, hàm...)
  text = text.replace(/\{[^{}]*\}/g, '');

  // Xóa các ký tự code còn sót
  text = text.replace(/^\s*export\s+default\s+.*$/gm, '');
  text = text.replace(/^\s*const\s+\w+\s*=.*$/gm, '');
  text = text.replace(/^\s*return\s*\(\s*$/gm, '');
  text = text.replace(/^\s*\)\s*;\s*$/gm, '');
  text = text.replace(/^\s*[(){};\[\]]+\s*$/gm, '');

  // Dọn dẹp khoảng trắng
  text = text.replace(/[ \t]+/g, ' ');      // Multiple spaces -> 1 space
  text = text.replace(/\n\s*\n/g, '\n');    // Multiple newlines -> 1
  
  // Lọc dòng có ý nghĩa
  const lines = text.split('\n')
    .map(l => l.trim())
    .filter(l => {
      if (!l || l.length < 3) return false;
      // Bỏ dòng chỉ có ký hiệu
      if (/^[(){};,<>\/\\=\s\[\]]+$/.test(l)) return false;
      // Phải chứa ít nhất 1 ký tự chữ cái
      if (!/[\p{L}\d]/u.test(l)) return false;
      // Bỏ các dòng code JavaScript rõ ràng
      if (/^(const |let |var |function |return |if \(|else |import |export |module\.)/.test(l)) return false;
      if (/\b(useState|useEffect|useRef|useCallback|useMemo|useLocation|addEventListener|removeEventListener|observer\.|IntersectionObserver|scrollIntoView|disconnect)\b/.test(l)) return false;
      if (/^\s*\/\*.*\*\/\s*$/.test(l)) return false; // Block comment single line
      if (/^\([^)]*\)\s*=>/.test(l)) return false; // Arrow function
      if (/^\.\w+\(/.test(l)) return false; // Method call like .observe(
      if (/^\{[!?]?\w+.*\?\s*\($/.test(l)) return false; // JSX conditional: {isDashboard ? (
      if (/^\{.*\.map\(/.test(l)) return false; // JSX map: {[5,4,3].map(
      if (/^\?\s*\(/.test(l)) return false; // Ternary continuation
      if (/^:\s*\(/.test(l)) return false; // Ternary else
      return true;
    });

  return lines.join('\n');
}


const STATIC_DOCS = [
  { title: 'Brand Identity Guideline', description: 'Tài liệu hướng dẫn nhận diện thương hiệu FIT Tour, bao gồm logo, màu sắc, font chữ...', category: 'Marketing', path: '/tai-lieu/brand-guideline', icon: '🎨' },
  { title: 'HUB Hướng Dẫn Viên', description: 'Bàn làm việc của HDV — checklist, SOP, sự cố, case study', category: 'HDV', path: '/hdv', icon: '👨‍✈️' },
  { title: 'HUB Marketing', description: 'Tài liệu Marketing, chuẩn mực content, format bài đăng & Báo cáo hiệu suất team', category: 'Marketing', path: '/tai-lieu/marketing', icon: '📈' },
  { title: 'HUB Kinh Doanh (Sale)', description: 'Tài liệu dành cho phòng kinh doanh, quy trình bán hàng', category: 'Sale', path: '/tai-lieu/sale', icon: '💼' },
  { title: 'HUB Điều Hành (OP)', description: 'Quy trình điều hành tour, vận hành dịch vụ', category: 'Điều hành', path: '/tai-lieu/dieu-hanh', icon: '🔧' },
  { title: 'HUB Kế Toán', description: 'Nghiệp vụ kế toán, quy trình tài chính nội bộ', category: 'Kế toán', path: '/tai-lieu/ke-toan', icon: '📊' },
  { title: 'Biểu Mẫu Hành Chính', description: 'Giấy phép, biểu mẫu, tài liệu hành chính công ty', category: 'Biểu mẫu', path: '/tai-lieu/bieu-mau', icon: '📋' },
  { title: 'Bộ Nguyên Tắc Hành Xử Nhân Viên Văn Phòng', description: 'Quy tắc ứng xử, giao tiếp, ra quyết định, xử lý sự cố', category: 'Quy tắc', path: '/tai-lieu/bo-nguyen-tac-hanh-xu-nhan-vien', icon: '📓' },
  { title: 'Quy Chế Lương Hướng Dẫn Viên', description: 'Chính sách lương, thưởng, phụ cấp cho HDV', category: 'HDV', path: '/tai-lieu/quy-che-luong-hdv', icon: '💰' },
  { title: 'Quy Trình Sale & Điều Hành', description: 'Nhắc nhở quy trình làm việc giữa Sale & Điều Hành và các lỗi sai thường gặp', category: 'Điều hành', path: '/tai-lieu/quy-trinh-sale-dieu-hanh', icon: '⚠️' },
  { title: 'SOP Chuẩn Hóa Tên Tour', description: 'Quy chuẩn đặt tên tour trên ERP, Website và Social', category: 'Điều hành', path: '/tai-lieu/dat-ten-tour', icon: '📝' },
  { title: 'Hướng Dẫn Kết Nối Zoho Mail', description: 'Hướng dẫn cài đặt Zoho Mail với Outlook, Apple Mail, Spark (IMAP)', category: 'Hành chính', path: '/tai-lieu/zoho-email', icon: '📧' },
  { title: 'SOP Chính Sách Đánh Giá (Review)', description: 'Điều chỉnh và hướng dẫn chính sách đánh giá trên Google Review', category: 'Marketing', path: '/tai-lieu/chinh-sach-danh-gia', icon: '⭐' },
  { title: 'Cơ Chế KPI', description: 'Quyết định ban hành cơ chế lương – KPI – thưởng và phúc lợi nhân sự', category: 'Hành chính', path: '/tai-lieu/co-che-kpi', icon: '💼' },
  { title: 'Văn Bản Cơ Chế KPI', description: 'Văn bản chi tiết về cơ chế lương thưởng KPI', category: 'Hành chính', path: '/tai-lieu/van-ban-co-che-kpi', icon: '📄' }
];

exports.getDocs = async (req, res) => {
  try {
    let allDocs = [...STATIC_DOCS];

    // Lấy Biểu Mẫu từ DB
    try {
      const result = await db.query('SELECT * FROM licenses ORDER BY id DESC');
      const licenses = result.rows.map(l => ({
        id: `license_${l.id}`,
        title: l.name,
        description: l.description || 'Biểu mẫu văn phòng',
        category: 'Biểu mẫu',
        path: l.link || '/tai-lieu/bieu-mau',
        external: l.link ? !l.link.startsWith('/') : false,
      }));
      allDocs = [...allDocs, ...licenses];
    } catch (dbErr) {
      console.error('Error fetching licenses for RAG:', dbErr);
    }

    // Lấy Sổ Tay Vận Hành từ file tĩnh
    const soTayPath = path.join(__dirname, '../../So_Tay_Van_Hanh');
    if (fs.existsSync(soTayPath)) {
      const files = fs.readdirSync(soTayPath).filter(f => f.endsWith('.md'));
      files.forEach(f => {
        allDocs.push({
          id: `sotay_${f}`,
          title: f.replace('.md', '').replace(/_/g, ' '),
          description: 'Sổ tay vận hành nội bộ',
          category: 'Sổ tay',
          path: '/tai-lieu', // General fallback path for UI since it's not mapped
          external: false,
        });
      });
    }

    // [MỚI] Lấy dữ liệu từ bảng rag_documents
    try {
        const ragResult = await db.query(`SELECT * FROM rag_documents WHERE status = 'active'`);
        const ragDocs = ragResult.rows.map(k => ({
            id: `rag_${k.id}`,
            title: k.title,
            description: '',
            category: k.category || 'Khác',
            visibility: k.visibility || 'private',
            display_priority: k.display_priority || 'text',
            // Nếu có link ngoài thì path trỏ ra ngoài, nếu không thì dẫn vào xem chi tiết
            path: (k.drive_url) ? k.drive_url : `/tai-lieu/${k.id}`,
            external: !!k.drive_url
        }));
        allDocs = [...allDocs, ...ragDocs];
    } catch (ragErr) {
        console.error('Error fetching rag_documents for RAG:', ragErr);
    }

    const formattedDocs = allDocs.map(doc => ({
      id: doc.id || doc.path,
      title: doc.title,
      description: doc.description,
      category: doc.category,
      visibility: doc.visibility || 'public', // STATIC_DOCS mặc định coi như public (hoặc chỉnh lại theo logic UI)
      display_priority: doc.display_priority || 'text',
      url: doc.external ? doc.path : `https://erp.fittour.vn${doc.path === '#' ? '/tai-lieu/bieu-mau' : doc.path}`,
    }));

    res.json(formattedDocs);
  } catch (err) {
    console.error('Error fetching docs for RAG:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getDocContent = async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id parameter' });

  try {
        // [MỚI] Trường hợp là rag_documents (CMS mới)
    if (id.startsWith('rag_')) {
        const dbId = id.replace('rag_', '');
        const itemResult = await db.query('SELECT * FROM rag_documents WHERE id = $1', [dbId]);
        if (itemResult.rows.length === 0) return res.status(404).json({ error: 'Document not found' });
        
        const item = itemResult.rows[0];
        
        // Trả về Link A1 cho AI tự đi lấy data (đúng với kiến trúc "Bản đồ")
        let content = '';
        if (item.text_url) {
            content = `[HỆ THỐNG RAG]: Nội dung chi tiết của tài liệu này là một file Text/Markdown thô. AI vui lòng truy cập vào đường link sau để đọc nội dung: ${item.text_url}`;
        } else if (item.website_url || item.attachment_url || item.drive_url) {
            content = `[HỆ THỐNG RAG]: Tài liệu này chỉ có Link Giao Diện / File đính kèm. Vui lòng cung cấp link này cho người dùng để họ xem: ${item.website_url || item.drive_url || item.attachment_url}`;
        } else {
            content = `[HỆ THỐNG RAG]: Tài liệu này hiện trống, chưa có nội dung.`;
        }

        return res.json({
            title: item.title,
            content: content,
            url: item.website_url || item.drive_url || item.attachment_url || `https://erp.fittour.vn/tai-lieu/${item.id}`
        });
    }

    // Trường hợp là Biểu mẫu trong DB
    if (id.startsWith('license_')) {
      const dbId = id.replace('license_', '');
      const result = await db.query('SELECT * FROM licenses WHERE id = $1', [dbId]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      const l = result.rows[0];
      return res.json({
        title: l.name,
        content: `Tên tài liệu: ${l.name}\nMô tả: ${l.description || 'Không có mô tả'}\nLink tải/truy cập: ${l.link || 'https://erp.fittour.vn/tai-lieu/bieu-mau'}\nLưu ý: Nhân viên hãy click vào link trên để tải hoặc xem biểu mẫu này.`,
        url: l.link || 'https://erp.fittour.vn/tai-lieu/bieu-mau'
      });
    }

    // Trường hợp là Sổ tay vận hành
    if (id.startsWith('sotay_')) {
      const filename = id.replace('sotay_', '');
      const filePath = path.join(__dirname, '../../So_Tay_Van_Hanh', filename);
      if (fs.existsSync(filePath)) {
         return res.json({
            title: filename.replace('.md', ''),
            content: fs.readFileSync(filePath, 'utf8'),
            url: 'https://erp.fittour.vn/tai-lieu'
         });
      }
      return res.status(404).json({ error: 'Not found' });
    }

    // Trường hợp là file Markdown tĩnh trong public/docs
    const mdMap = {
      '/tai-lieu/bo-nguyen-tac-hanh-xu-nhan-vien': 'bo-nguyen-tac.md',
      '/tai-lieu/dat-ten-tour': 'dat-ten-tour.md',
      '/tai-lieu/zoho-email': 'zoho-email.md',
      '/tai-lieu/van-ban-co-che-kpi': 'van-ban-co-che-kpi.md',
      '/tai-lieu/co-che-kpi': 'co-che-kpi.md',
      '/tai-lieu/chinh-sach-danh-gia': 'chinh-sach-danh-gia.md'
    };

    if (mdMap[id]) {
      const filePath = path.join(__dirname, '../../client/public/docs', mdMap[id]);
      if (fs.existsSync(filePath)) {
        const title = STATIC_DOCS.find(d => d.path === id)?.title || id;
        return res.json({
          title: title,
          content: fs.readFileSync(filePath, 'utf8'),
          url: `https://erp.fittour.vn${id}`
        });
      }
    }

    // Trường hợp là giao diện Hub được code bằng React (JSX)
    const jsxMap = {
      '/tai-lieu/brand-guideline': 'BrandGuidelinePage.jsx',
      '/hdv': 'HDVHub.jsx',
      '/tai-lieu/marketing': 'MarketingHub.jsx',
      '/tai-lieu/quy-trinh-sale-dieu-hanh': 'QuyTrinhSaleDieuHanhPage.jsx'
    };

    if (jsxMap[id]) {
      const filePath = path.join(__dirname, '../../client/src/pages', jsxMap[id]);
      if (fs.existsSync(filePath)) {
        const title = STATIC_DOCS.find(d => d.path === id)?.title || id;
        const jsxContent = fs.readFileSync(filePath, 'utf8');
        const cleanText = extractTextFromJSX(jsxContent);
        return res.json({
          title: title,
          content: cleanText,
          url: `https://erp.fittour.vn${id}`
        });
      }
    }

    // Xử lý các tài liệu nằm trong STATIC_DOCS nhưng không phải file Markdown (VD: Hub, Drive)
    const staticDoc = STATIC_DOCS.find(d => d.path === id);
    if (staticDoc) {
      if (staticDoc.external) {
         return res.json({
           title: staticDoc.title,
           content: `Tài liệu này được lưu trữ trên nền tảng bên ngoài (Google Drive, Google Docs...). Hệ thống không thể đọc trực tiếp nội dung văn bản. Vui lòng cung cấp link dưới đây và yêu cầu nhân viên tự truy cập để xem chi tiết.\n\nMô tả sơ lược: ${staticDoc.description}`,
           url: staticDoc.path
         });
      }
      return res.json({
        title: staticDoc.title,
        content: `Đây là một trang giao diện phần mềm / bảng điều khiển (Hub/Dashboard) trên hệ thống CRM. Hệ thống hiện chưa được cấu hình để trích xuất chữ từ trang này. Vui lòng cung cấp link để nhân viên trực tiếp truy cập vào hệ thống xem.\n\nMô tả chức năng: ${staticDoc.description}`,
        url: `https://erp.fittour.vn${staticDoc.path}`
      });
    }

    return res.status(404).json({ error: 'Document content not found or is an external link.' });

  } catch (err) {
    console.error('Error fetching doc content for RAG:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
