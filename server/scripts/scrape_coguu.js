const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../db');

// URLs gốc
const BASE_URL = 'https://dulichcoguu.com/du-lich-nuoc-ngoai/';

async function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
}

function extractPrice(text) {
    if (!text) return 0;
    // Tìm cụm số đầu tiên ngay trước VNĐ hoặc có độ dài từ 6-9 số
    const match = text.match(/(\d[\d,.]*)\s*(VNĐ|VND|đ)/i);
    if (match) {
        const num = match[1].replace(/[^0-9]/g, '');
        return num ? parseInt(num, 10) : 0;
    }
    return 0;
}

async function startScraping() {
    console.log("🚀 Bắt đầu quét chuyên mục:", BASE_URL);

    // 1. Quét trang chuyên mục nhưng phải BÁM SÁT các cục Heading "Lịch khởi hành tháng X"
    let tourLinks = []; // Mảng { link, month, year }
    try {
        console.log("👉 Vận dụng DOM Traversal để bắt Từng Tháng Khởi Hành...");
        const res = await axios.get(BASE_URL);
        const $ = cheerio.load(res.data);
        
        let currentMonth = null;
        let currentYear = null;

        // Bóc tách DOM theo thứ tự Document để bám sát Lịch Khởi Hành Từng Tháng
        $('*').each((i, el) => {
            const tagName = el.tagName.toLowerCase();
            const text = $(el).text().trim();

            // Nếu gặp Heading "Lịch khởi hành tháng..."
            if (tagName === 'h3' && text.toLowerCase().includes('lịch khởi hành tháng')) {
                const match = text.match(/tháng\s+(\d+)\s+năm\s+(\d+)/i);
                if (match) {
                    currentMonth = parseInt(match[1]);
                    currentYear = parseInt(match[2]);
                    console.log(`\n📅 Đã nhận diện vùng dữ liệu: THÁNG ${currentMonth} / NĂM ${currentYear}`);
                }
            } 
            // Nếu gặp Hàng Table (`<tr>`) nằm dưới Heading Tháng đó
            else if (tagName === 'tr' && currentMonth && currentYear) {
                const tds = $(el).find('td');
                if (tds.length >= 3) {
                    // Cột 1: "Thứ 4, 3/6 -> CN, 7/6"
                    const lichText = $(tds[0]).text().trim();
                    // Cột 3: Tên Tour (chứa thẻ <a href=...>)
                    const aTag = $(tds[2]).find('a');
                    const href = aTag.attr('href');

                    if (href && href.includes('/tour/') && !lichText.toLowerCase().includes('lịch')) {
                        // Extract Start / End Dates từ chuỗi "Thứ 4, 3/6 -> CN, 7/6"
                        const parts = lichText.split('->');
                        const rawStart = parts[0].trim();
                        const rawEnd = parts.length > 1 ? parts[1].trim() : '';

                        // Parse Start Date
                        const startMatch = rawStart.match(/(\d{1,2})\/(\d{1,2})/);
                        if (startMatch) {
                            const sDay = parseInt(startMatch[1]);
                            const sMonth = parseInt(startMatch[2]);
                            const startStr = `${currentYear}-${String(sMonth).padStart(2, '0')}-${String(sDay).padStart(2, '0')}`;
                            
                            // Parse End Date
                            let endStr = startStr;
                            const endMatch = rawEnd.match(/(\d{1,2})\/(\d{1,2})/);
                            if (endMatch) {
                                const eDay = parseInt(endMatch[1]);
                                const eMonth = parseInt(endMatch[2]);
                                // Xử lý viền: Nếu qua năm mới (vd đi cuối tháng 12 đến tháng 1)
                                const endYear = eMonth < sMonth ? currentYear + 1 : currentYear;
                                endStr = `${endYear}-${String(eMonth).padStart(2, '0')}-${String(eDay).padStart(2, '0')}`;
                            }

                            // Chèn vào giỏ nếu chưa có cặp {link, startDate} trùng
                            const isAdded = tourLinks.find(t => t.link === href && t.startStr === startStr);
                            if (!isAdded) {
                                tourLinks.push({ link: href, month: currentMonth, year: currentYear, startStr, endStr, lichText });
                                console.log(`   + Tour [${startStr}]: ${$(tds[2]).text().trim().substring(0,40)}...`);
                            }
                        }
                    }
                }
            }
        });

    } catch(err) {
        console.error("Lỗi quét DOM Header:", err.message);
        process.exit(1);
    }

    console.log(`📌 Tìm thấy ${tourLinks.length} Lịch khởi hành (Unique). Bắt đầu lấy toàn bộ dữ liệu thật...`);

    for (let tour of tourLinks) {
        const link = tour.link;
        console.log(`👉 Đang quét: ${link} (Khởi hành: Tháng ${tour.month}/${tour.year})`);
        try {
            const res = await axios.get(link);
            const $ = cheerio.load(res.data);

            // Bóc tách cơ bản
            const name = $('h1.elementor-heading-title').first().text().trim() || $('title').text().replace('- FIT Tour', '').trim();
            const code = link.replace('https://dulichcoguu.com/tour/', '').replace(/\//g, '').toUpperCase().substring(0, 15);
            let description = $('meta[property="og:description"]').attr('content') || '';
            let imageUrl = $('meta[property="og:image"]').attr('content') || '';
            if(!imageUrl) imageUrl = 'https://dulichcoguu.com/wp-content/uploads/2023/10/logo-fit.png';

            // Phân tích Destination và BU Group thông minh từ tên Tour
            let destination = "Nước Ngoài";
            let buGroup = "BU1"; // Default
            const nLower = name.toLowerCase();

            if (nLower.includes('trung quốc') || nLower.includes('đài loan') || nLower.includes('bắc kinh') || nLower.includes('giang nam') || nLower.includes('đạo thành') || nLower.includes('tân cương')) {
                buGroup = "BU1";
                if (nLower.includes('đài loan')) destination = "Đài Loan";
                else destination = "Trung Quốc";
            }
            else if (nLower.includes('bhutan') || nLower.includes('tây tạng') || nLower.includes('thanh tạng') || nLower.includes('ladakh') || nLower.includes('bromo') || nLower.includes('bali') || nLower.includes('indonesia')) {
                buGroup = "BU4";
                if (nLower.includes('bhutan')) destination = "Bhutan";
                else if (nLower.includes('ladakh')) destination = "Ladakh";
                else if (nLower.includes('bromo') || nLower.includes('bali') || nLower.includes('indonesia')) destination = "Indonesia";
                else if (nLower.includes('tây tạng') || nLower.includes('thanh tạng')) destination = "Tây Tạng";
                else destination = "Bhutan";
            }
            else {
                // Khối Châu Á (Hàn/Nhật...), Châu Âu, Phi, Mỹ, Long Haul... (Thuộc BU2)
                buGroup = "BU2"; 
                if (nLower.includes('nhật bản')) destination = "Nhật Bản";
                else if (nLower.includes('hàn quốc')) destination = "Hàn Quốc";
                else if (nLower.includes('mông cổ')) destination = "Mông Cổ";
                else if (nLower.includes('ai cập')) destination = "Ai Cập";
                else if (nLower.includes('maroc')) destination = "Maroc";
                else if (nLower.includes('nam mỹ')) destination = "Nam Mỹ";
                else if (nLower.includes('alaska') || nLower.includes('mỹ')) destination = "Châu Mỹ";
                else if (nLower.includes('tây á') || nLower.includes('thổ nhĩ kỳ') || nLower.includes('pakistan')) destination = "Tây Á / Trung Đông";
                else if (nLower.includes('châu âu') || nLower.includes('pháp') || nLower.includes('ý')) destination = "Châu Âu";
                else destination = "Châu Á"; // Fallback Châu Á / Long haul v.v
            }

            // Tìm một mức giá tham khảo rải rác trên trang một cách thông minh (bỏ qua mô tả dài dòng hoặc tiền lẻ)
            let basePrice = 25000000; // Giá fallback an toàn
            const possiblePrices = [];
            $('*').each((i, el) => {
                const txt = $(el).text().trim().replace(/\s+/g, ' ');
                // Bắt một dòng chữ mảnh ví dụ "35.800.000 VNĐ" và text.length < 50
                if (txt.match(/(\d[\d,.]*)\s*(VNĐ|VND|\u20ab)/i) && txt.length < 50) {
                    const val = extractPrice(txt);
                    if (val >= 5000000 && val <= 300000000) { // Lọc bỏ tiền cọc, visa hoặc phụ thu phòng đơn
                        possiblePrices.push(val);
                    }
                }
            });

            // Chọn giá hợp lý lớn đầu tiên bắt được trong các blocks UI (thường là Giá Niêm Yết to nhất)
            if (possiblePrices.length > 0) {
                basePrice = possiblePrices[0];
            }

            // Fake Itinerary
            const itinerary = [
                { day: "Day 1", title: "Khởi hành", detail: "Khởi hành" },
                { day: "Day 2", title: "Khám phá", detail: "Khám phá" }
            ];

            // 2. Chèn vào databases
            // Kiểm tra xem Tour Template đã tồn tại chưa
            let templateId;
            const checkRes = await db.query('SELECT id FROM tour_templates WHERE code = $1', [code]);
            if (checkRes.rows.length > 0) {
                templateId = checkRes.rows[0].id;
                console.log(`⏩ Đã có Tour [${code}] - Bỏ qua bước tạo Template, lấy ID ${templateId}`);
            } else {
                const insertTplQuery = `
                    INSERT INTO tour_templates (code, name, tour_type, destination, bu_group, duration, highlights, base_price, image_url, website_link, itinerary)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    RETURNING id
                `;
                // Parse duration từ endDate - startDate hoặc Regex từ tên Tour
                let duration = "Theo Lịch Trình";
                const match1 = name.match(/(\d+)\s*(n|ngày)\s*(\d+)\s*(đ|đêm)/i);
                const match2 = name.match(/(\d+)\s*(n|ngày)/i);
                if (match1) {
                    duration = `${match1[1]} Ngày ${match1[3]} Đêm`;
                } else if (match2) {
                    duration = `${match2[1]} Ngày`;
                } else {
                    const diffDays = Math.ceil(Math.abs(new Date(tour.endStr) - new Date(tour.startStr)) / 86400000) + 1;
                    if (diffDays > 1) duration = `${diffDays} Ngày ${diffDays - 1} Đêm`;
                }
                const templateRes = await db.query(insertTplQuery, [
                    code, name, "Tour Tự Động", destination, buGroup, duration, description, basePrice, imageUrl, link, JSON.stringify(itinerary)
                ]);
                templateId = templateRes.rows[0].id;
            }
            // Insert 1 Departure thực tế cho mỗi "Lịch Khởi Hành Tháng X" dựa trên Dữ Liệu TABLE
            const startDateISO = `${tour.startStr}T00:00:00Z`;
            const endDateISO = `${tour.endStr}T23:59:59Z`;
            
            const depCode = `${code}-DEP-${tour.startStr.replace(/-/g, '')}`;
            
            // Upsert vào tour_departures
            await db.query(`
                INSERT INTO tour_departures (tour_template_id, code, start_date, end_date, status, actual_price, price_rules)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (code) DO UPDATE 
                SET start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date, actual_price = EXCLUDED.actual_price
            `, [
                templateId, depCode, startDateISO, endDateISO, 'Published', basePrice,
                JSON.stringify([{name: "Người lớn", price: basePrice, is_default: true}])
            ]);
            
            console.log(`✅ Lưu thành công Lịch Khởi Hành cho: ${name} (${tour.lichText})`);

            await delay(300); // Tăng tốc độ delay cho ngầu

        } catch (err) {
            console.error("❌ Lỗi quét chi tiết: ", link, err.message);
        }
    }

    console.log("🎉 Hoàn tất quá trình quét Demo 5 Tours và Lịch Khởi Hành!");
    process.exit(0);
}

startScraping();
