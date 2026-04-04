require('dotenv').config();
const { Pool } = require('pg');
const db = new Pool({ connectionString: process.env.DATABASE_URL });

const customers = [
  {
    "name": "BÙI KIM THƯ",
    "birth_date": "1968-04-21",
    "gender": "Nữ",
    "phone": "0912398010",
    "past_trip_count": 10,
    "internal_notes": "Các tuyến đã đi: Á Đinh, Iceland, Cửu Trại, Tây Tạng, Kailash, Nepal, Bhutan, Nhật, Giang Tây, Phúc Kiến",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "LÊ THỊ BÍCH THƯỜNG",
    "birth_date": "1973-12-10",
    "gender": "Nữ",
    "phone": null,
    "past_trip_count": 8,
    "internal_notes": "Các tuyến đã đi: Á Đinh, Sơn tây, Cam Túc, Thanh Hải, Thiểm Tây, Ladakh, Giang Tây, Phúc Kiến",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "ĐOÀN HỒNG MINH",
    "birth_date": "1990-04-12",
    "gender": "Nữ",
    "phone": "0932343654",
    "past_trip_count": 4,
    "internal_notes": "Các tuyến đã đi: Ladakh, Ai Cập, Cáp Nhĩ Tân, Cửu Trại",
    "notes": "khách đoàn",
    "tags": "BU1, VIP"
  },
  {
    "name": "NGUYỄN THI THUÝ",
    "birth_date": "1964-06-04",
    "gender": "Nữ",
    "phone": null,
    "past_trip_count": 6,
    "internal_notes": "Các tuyến đã đi: Á Đinh, Iceland, Tây Tạng, Kailash, Cáp Nhĩ Tân, ,...",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "TRẦN THỤC HIỀN",
    "birth_date": "1978-12-20",
    "gender": "Nữ",
    "phone": "0918226658",
    "past_trip_count": 4,
    "internal_notes": "Các tuyến đã đi: Tân Cương, tây Tạng, Giang Tây, Phúc Kiến",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "NGUYỄN HỒNG HUỆ (ANDY)",
    "birth_date": "1980-09-27",
    "gender": "Nữ",
    "phone": "0908161366",
    "past_trip_count": 4,
    "internal_notes": "Các tuyến đã đi: Iceland, Giang Tây, Phúc Kiến, Bắc Kinh",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "NGUYỄN PHƯỚC ÁI VY",
    "birth_date": "1978-04-18",
    "gender": "Nữ",
    "phone": null,
    "past_trip_count": 3,
    "internal_notes": "Các tuyến đã đi: Cáp Nhĩ Tân, Ladakh, Bromo",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "NGUYỄN THỊ XUÂN LỘC",
    "birth_date": "1971-12-27",
    "gender": "Nữ",
    "phone": null,
    "past_trip_count": 4,
    "internal_notes": "Các tuyến đã đi: Cáp Nhĩ Tân, Ladakh, Á Đinh, Bromo",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "TỪ THỊ THẢO",
    "birth_date": "1972-04-06",
    "gender": "Nữ",
    "phone": "0909962445",
    "past_trip_count": 4,
    "internal_notes": "Các tuyến đã đi: Cáp Nhĩ Tân, Ladakh, Ai Cập, Bromo",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "NGUYỄN THỊ HẰNG",
    "birth_date": "1971-07-20",
    "gender": "Nữ",
    "phone": "0903125282",
    "past_trip_count": 5,
    "internal_notes": "Các tuyến đã đi: ladakh, Ai Cập, Kailash, Cửu Trại, Nhật",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "CHÂU THANH PHƯƠNG",
    "birth_date": "1989-01-21",
    "gender": "Nữ",
    "phone": "0906981299",
    "past_trip_count": 5,
    "internal_notes": "Các tuyến đã đi: ladakh, Bắc Kinh, Thượng Hải, Kailash, Tây Trạng",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "LÊ THỊ VÂN ANH",
    "birth_date": "1963-06-02",
    "gender": "Nữ",
    "phone": "0903720704",
    "past_trip_count": 6,
    "internal_notes": "Các tuyến đã đi: Nam Mỹ, Á Đinh, Kailash, Cáp Nhĩ Tân, Nhật, Tân Cương",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "NGÂN TRẦN",
    "birth_date": "1969-08-13",
    "gender": "Nữ",
    "phone": "0907737332",
    "past_trip_count": 2,
    "internal_notes": "Các tuyến đã đi: GIANG NAM 22/11, 15Pax series",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "NGUYỄN THỊ TUYẾT NGÂN",
    "birth_date": "1990-04-28",
    "gender": "nữ",
    "phone": "0913799427",
    "past_trip_count": 1,
    "internal_notes": "Các tuyến đã đi: Đi 2 tour bên FIT và làm visa TQ nhiều lần",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "VÕ MINH ANH",
    "birth_date": "1998-05-18",
    "gender": "nữ",
    "phone": "0938679678",
    "past_trip_count": 2,
    "internal_notes": "Các tuyến đã đi: Tân Cương 10/1, chuẩn bị đi tour tiếp theo",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "ĐINH NGUYỄN THẢO VY",
    "birth_date": "1994-11-02",
    "gender": "Nữ",
    "phone": "0906908311",
    "past_trip_count": 1,
    "internal_notes": "Các tuyến đã đi: Đi 3 tour bên FIT",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "TRẦN TUẤN ANH",
    "birth_date": "1993-05-14",
    "gender": "Nam",
    "phone": "0839997777",
    "past_trip_count": 4,
    "internal_notes": "Các tuyến đã đi: Đi 2 tour bên FIT, làm visa Dubai, TQ, chuẩn bị đi các tour tiếp theo",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "DIỆU LINH",
    "birth_date": null,
    "gender": "Nữ",
    "phone": "0917416468",
    "past_trip_count": 2,
    "internal_notes": "Các tuyến đã đi: Trưởng nhóm cho tour Giang Nam 6pax, đi NB...",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "NGUYỄN THU TRANG",
    "birth_date": "1998-02-07",
    "gender": "Nữ",
    "phone": "0981917679",
    "past_trip_count": 2,
    "internal_notes": "Các tuyến đã đi: Trưởng nhóm cho tour Giang Nam, đang xem các tour 2026",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "PHAN THỊ KIỀU OANH",
    "birth_date": "1970-08-06",
    "gender": "Nữ",
    "phone": "0936913619",
    "past_trip_count": 2,
    "internal_notes": "Các tuyến đã đi: Trưởng nhóm cho tour Giang Nam 22/11, nhóm GĐ",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "ĐẶNG KHÁNH MAI",
    "birth_date": "2002-01-31",
    "gender": "Nữ",
    "phone": "0918034294",
    "past_trip_count": 3,
    "internal_notes": "Các tuyến đã đi: Đi tour Private, nhóm GĐ, muốn đi Châu Âu",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "ĐẶNG THỊ MAI HOA",
    "birth_date": "1994-04-27",
    "gender": "Nữ",
    "phone": "0937798766",
    "past_trip_count": 3,
    "internal_notes": "Các tuyến đã đi: Đi tour Private, nhóm GĐ, muốn đi Châu Âu",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "DƯƠNG THỊ DIỄM SƯƠNG",
    "birth_date": "1999-10-05",
    "gender": "Nữ",
    "phone": "0899489948",
    "past_trip_count": 2,
    "internal_notes": "Các tuyến đã đi: Đi tour nhiều lần, làm visa TQ nhiều lần",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "ĐINH THỊ TUYẾT MAI",
    "birth_date": "1977-07-22",
    "gender": "Nữ",
    "phone": "0979368666",
    "past_trip_count": 2,
    "internal_notes": "Các tuyến đã đi: Trưởng nhóm GĐ, đi bên FIT 2lần",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "NGUYỄN DUY HOÀNG",
    "birth_date": "1988-07-08",
    "gender": "Nam",
    "phone": "0903 220078",
    "past_trip_count": 2,
    "internal_notes": "Các tuyến đã đi: NHẬT BẢN 2023, GIANG NAM PRIAVTE T3",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "HỒ NGUYỄN QUỲNH PHƯƠNG",
    "birth_date": "1989-11-05",
    "gender": "Nữ",
    "phone": "0908 01 8889",
    "past_trip_count": 1,
    "internal_notes": "Các tuyến đã đi: CỬU TRẠI CÂU (20/3/2025). NHẬT (03/04/2026)",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "LÂM TRẦN TUYẾT VI",
    "birth_date": "1989-06-19",
    "gender": "Nữ",
    "phone": "0909005058",
    "past_trip_count": 1,
    "internal_notes": "Các tuyến đã đi: LE GIANG 21/2/2026",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "NGUYỄN THỊ BÍCH PHƯƠNG",
    "birth_date": "1992-12-21",
    "gender": "Nữ",
    "phone": "0978988216",
    "past_trip_count": 1,
    "internal_notes": "Các tuyến đã đi: GIANG NAM 21/3/2026",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "CAO CÔNG DANH",
    "birth_date": "1992-10-21",
    "gender": "Nam",
    "phone": "0987336355",
    "past_trip_count": 2,
    "internal_notes": "Các tuyến đã đi: GIANG NAM 21/3, LADAKH 13/9",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "NGUYỄN THUÝ ANH",
    "birth_date": "1990-04-05",
    "gender": "Nữ",
    "phone": "0919904088",
    "past_trip_count": 1,
    "internal_notes": "Các tuyến đã đi: TÂY AN 9 KHÁCH 13/4",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "ĐẶNG TỐ TRINH",
    "birth_date": "1964-01-18",
    "gender": "Nữ",
    "phone": "0912388436",
    "past_trip_count": 2,
    "internal_notes": "Các tuyến đã đi: Á DINH 14/6, BHUTAN 26/9,",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "NGUYỄN PHẠM NGỌC THẠCH",
    "birth_date": "1980-10-15",
    "gender": "Nam",
    "phone": "0908295383",
    "past_trip_count": 2,
    "internal_notes": "Các tuyến đã đi: GIANG TÂY 6/11, VÕ ĐANG 26/3",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "CAO MINH THUÝ VY",
    "birth_date": "1995-10-08",
    "gender": "Nữ",
    "phone": "0773557958",
    "past_trip_count": 2,
    "internal_notes": "Các tuyến đã đi: GIANG NAM, NHẬT BẢN",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "NGUYỄN THỊ NHƯƠNG",
    "birth_date": "1995-09-08",
    "gender": "Nữ",
    "phone": "0396979811",
    "past_trip_count": 1,
    "internal_notes": "Các tuyến đã đi: CNT 27/12",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "NGUYỄN PHƯỚC NGỌC",
    "birth_date": "1983-11-16",
    "gender": "Nữ",
    "phone": "0936291977",
    "past_trip_count": 1,
    "internal_notes": "Các tuyến đã đi: CNT 27/13",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "ĐẶNG THỊ THU HƯƠNG",
    "birth_date": "1979-09-23",
    "gender": "Nữ",
    "phone": "0904134564",
    "past_trip_count": 1,
    "internal_notes": "Các tuyến đã đi: CNT 27/14",
    "notes": null,
    "tags": "BU1, VIP"
  },
  {
    "name": "TRẦN THẾ MINH",
    "birth_date": "1983-05-30",
    "gender": "Nữ",
    "phone": "0918705252",
    "past_trip_count": 1,
    "internal_notes": "Các tuyến đã đi: LADAKH13/9",
    "notes": null,
    "tags": "BU1, VIP"
  }
];

async function run() {
    let inserted = 0;
    for (const c of customers) {
        try {
            await db.query(
                `INSERT INTO customers (name, birth_date, gender, phone, past_trip_count, internal_notes, notes, tags) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 ON CONFLICT DO NOTHING`,
                [c.name, c.birth_date, c.gender, c.phone, c.past_trip_count, c.internal_notes, c.notes, c.tags]
            );
            inserted++;
        } catch (err) {
            console.error('Lỗi khi chèn khách hàng:', c.name, err.message);
        }
    }
    console.log(`Đã import thành công ${inserted} khách hàng VIP BU1!`);
    process.exit(0);
}
run();
