const axios = require('axios');
const cheerio = require('cheerio');

async function checkPrice() {
    const res = await axios.get('https://dulichcoguu.com/tour/tour-nhat-ban-mua-xuan-6n5d/');
    const $ = cheerio.load(res.data);
    
    // Tìm các thẻ chứa số lớn (giá)
    console.log("Tìm các mảng chữ có dấu hiệu của GIÁ (triệu, VNĐ, đ)...");
    let found = [];
    $('*').each((i, el) => {
        const text = $(el).text().trim().replace(/\s+/g, ' ');
        if ((text.includes('VNĐ') || text.includes('VND') || text.includes('triệu') || text.match(/\d{2}[\.,]\d{3}[\.,]\d{3}/)) && text.length < 50) {
            if(!found.includes(text)) {
                found.push(text);
            }
        }
    });
    console.log(found.join('\n'));
}

checkPrice();
