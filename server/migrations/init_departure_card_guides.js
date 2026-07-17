const db = require('../db');

const guides = [
  {
    name: 'Max Vũ',
    phone: '',
    profile_link: 'https://fittour.vn/max-vu',
    avatar_url: 'https://media.fittour.vn/uploads/max-vu-founder-fit-tour.webp',
    description: 'Người sáng lập thương hiệu FIT Tour. Khởi xướng những chuyến đi vượt ra ngoài khuôn khổ truyền thống để chạm đến bản nguyên của điểm đến.'
  },
  {
    name: 'Tiêu Vân Sang',
    phone: '',
    profile_link: 'https://fittour.vn/hdv-tieu-sang',
    avatar_url: 'https://media.fittour.vn/uploads/2025/04/hdv-tieu-van-sang-fittour.webp',
    description: 'HDV chuyên các Tour Bắc Kinh – Thượng Hải, Cửu Trại Câu, Lệ Giang…'
  },
  {
    name: 'Võ Thị Hồng Trang',
    phone: '',
    profile_link: 'https://fittour.vn/hong-trang',
    avatar_url: 'https://media.fittour.vn/uploads/huong-dan-vien-hong-trang-ao-dai-ben-bien.webp',
    description: 'HDV chuyên các Tour Ấn Độ, Indonesia, Trung Quốc, Nepal, Thái Lan, Campuchia,…'
  },
  {
    name: 'Dương Trung Thành',
    phone: '',
    profile_link: '',
    avatar_url: 'https://media.fittour.vn/uploads/2025/04/hdv-duong-trung-thanh-fittour.webp',
    description: 'HDV đã đi qua khoảng 60 nước của 5 Châu lục như: Mỹ, Brazil, Argentina, Peru, Ai Cập, Maroc, Nam Phi, Nhật, Ấn Độ, Israel, Jordan, khối Schengen, Đông Âu, Nga…'
  },
  {
    name: 'Đặng Trần Bích Quyên',
    phone: '',
    profile_link: '',
    avatar_url: 'https://media.fittour.vn/uploads/2025/04/HDV-dang-tran-bich-quyen-fittour.webp',
    description: 'HDV chuyên các Tour khu vực Đông Á: Trung Quốc, Đài Loan, Hàn Quốc, Singapore, Mã Lai, Thái Lan, Campuchia,…'
  },
  {
    name: 'Nguyễn Tuấn Anh',
    phone: '',
    profile_link: '',
    avatar_url: 'https://media.fittour.vn/uploads/2025/04/hdv-nguyen-tuan-anh-fit-tour.webp',
    description: 'HDV chuyên các Tour Đông Nam Á, Trung Á, Nam Á, Tây Á, Trung Quốc, Châu Âu, Úc, Maldives, Bắc Phi.'
  },
  {
    name: 'Trần Quốc Thịnh',
    phone: '',
    profile_link: 'https://dulichcoguu.com/tran-quoc-thinh/',
    avatar_url: 'https://media.fittour.vn/uploads/2024/05/trip-planner-tran-thinh.webp',
    description: 'HDV chuyên các tuyến Trung Quốc, Đông Nam Á, Hàn Quốc, Nhật Bản, Đài Loan, Himalaya, Con đường tơ lụa, Ai Cập, Ấn Độ,….'
  },
  {
    name: 'Bùi Ngọc Hiếu',
    phone: '',
    profile_link: 'https://fittour.vn/bui-hieu',
    avatar_url: 'https://media.fittour.vn/uploads/bui-hieu-bromo-indonesia.webp',
    description: 'HDV chuyên các tuyến Nepal, Bhutan, Hàn Quốc, Trung Quốc, Indonesia, Thái Lan,…'
  },
  {
    name: 'Phan Anh Lý',
    phone: '',
    profile_link: '',
    avatar_url: 'https://media.fittour.vn/uploads/2025/05/hdv-phan-anh-ly-fittour.webp',
    description: 'HDV đi hơn 40 quốc gia của 5 châu lục: Châu Phi, Châu Á, Châu Đại Dương, Châu Mỹ, Châu Âu.'
  },
  {
    name: 'Lê Thái Bình',
    phone: '',
    profile_link: 'https://fittour.vn/le-thai-binh',
    avatar_url: 'https://media.fittour.vn/uploads/2025/05/hdv-le-thai-binh-fittour.webp',
    description: 'HDV chuyên các Tour Trung Quốc, Tây Tạng, Ấn Độ, Nhật Bản, UAE, Trung Á, Pháp, Ý, Hà Lan, Thuỵ Sĩ, Tây Ban Nha, Bồ Đào Nha, UK, Ai Cập, Maroc, Úc, New Zealand,…'
  },
  {
    name: 'Nguyễn Hồ Đông Hải',
    phone: '',
    profile_link: 'https://fittour.vn/dong-hai',
    avatar_url: 'https://media.fittour.vn/uploads/2025/05/hdv-nguyen-ho-dong-hai-fittour.webp',
    description: 'HDV chuyên các tuyến Trung Quốc: Giang Nam, Đạo Thành Á Đinh, Cửu Trại Câu, Tây An, Cáp Nhĩ Tân, Giang Tây.'
  },
  {
    name: 'Ngô Ngọc Đăng Huy',
    phone: '',
    profile_link: 'https://fittour.vn/hdv-huy-ngo',
    avatar_url: 'https://media.fittour.vn/uploads/hdv-huy-ngo-fittour.webp',
    description: 'HDV chuyên cung đường Himalayas, Nội địa Việt Nam, Đài Loan, Trung Quốc, Ấn Độ, Thái Lan,…'
  },
  {
    name: 'Trần Hữu Duy',
    phone: '',
    profile_link: 'https://fittour.vn/hdv-tran-huu-duy',
    avatar_url: 'https://media.fittour.vn/uploads/tran-huu-duy-passu-glacier-pakistan.webp',
    description: 'Người dẫn đường tận tâm, mang đến trải nghiệm trọn vẹn tại các vùng đất trên thế giới.'
  },
  {
    name: 'Rohan Lee',
    phone: '',
    profile_link: 'https://fittour.vn/rohan-lee',
    avatar_url: 'https://media.fittour.vn/uploads/rohan-lee-vatican-city.webp',
    description: 'HDV chuyên thị trường Đông Bắc Á: Trung Quốc, Đài Loan và các quốc gia Đông Bắc Á.'
  },
  {
    name: 'Dương Gia Tường',
    phone: '',
    profile_link: 'https://fittour.vn/hdv-duong-gia-tuong',
    avatar_url: 'https://media.fittour.vn/uploads/huong-dan-vien-duong-gia-tuong-ho-bang-dong-bac-a.webp',
    description: 'HDV chuyên thị trường Đông Bắc Á: Trung Quốc, Đài Loan và các quốc gia Đông Bắc Á.'
  },
  {
    name: 'Nguyễn Thị Thùy Trang',
    phone: '',
    profile_link: 'https://fittour.vn/hdv-nguyen-thi-thuy-trang',
    avatar_url: 'https://media.fittour.vn/uploads/nguyen-thi-thuy-trang-khao-sat-diem-den-chau-a.webp',
    description: 'HDV chuyên các tuyến điểm Châu Á (Trung Quốc, Đài Loan...) và nội địa Việt Nam.'
  },
  {
    name: 'Nguyễn Hưng Thịnh',
    phone: '',
    profile_link: 'https://fittour.vn/hdv-nguyen-hung-thinh',
    avatar_url: 'https://media.fittour.vn/uploads/ho-hung-thinh-kham-pha-co-tran-trung-quoc.webp',
    description: 'HDV chuyên tuyến điểm Trung Quốc, trải nghiệm sâu sắc các khu phố cổ và văn hóa bản địa.'
  }
];

async function run() {
  try {
    // 1. Create table
    await db.query(`
      CREATE TABLE IF NOT EXISTS departure_card_guides (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        profile_link TEXT,
        avatar_url TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tạo bảng thành công.');

    // 2. Insert records
    for (const g of guides) {
      const { rows } = await db.query('SELECT id FROM departure_card_guides WHERE name = $1', [g.name]);
      if (rows.length === 0) {
        await db.query(
          'INSERT INTO departure_card_guides (name, phone, profile_link, avatar_url, description) VALUES ($1, $2, $3, $4, $5)',
          [g.name, g.phone, g.profile_link, g.avatar_url, g.description]
        );
        console.log(`Inserted: ${g.name}`);
      } else {
        console.log(`Skipped (already exists): ${g.name}`);
      }
    }
    console.log('Xong!');
  } catch (err) {
    console.error('Lỗi:', err.message);
  }
  process.exit(0);
}

run();
