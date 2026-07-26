require('dotenv').config();
const { Pool } = require('pg');
const axios = require('axios');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    const res = await pool.query("SELECT id, name FROM tour_templates WHERE keywords IS NULL OR keywords = ''");
    const tours = res.rows;
    console.log(`Found ${tours.length} tours without keywords. Processing with AI...`);
    
    if (tours.length === 0) return process.exit(0);
    
    const prompt = `Bạn là chuyên gia du lịch. Trích xuất các từ khoá (địa danh chính, đặc trưng) của mỗi tour. Bỏ qua các từ vô nghĩa. Trả về ĐÚNG MỘT MẢNG JSON. Định dạng: [{"id": 85, "keywords": "Nepal"}] \n Danh sách tour:\n${JSON.stringify(tours)}`;

    try {
        const aiRes = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1 }
        });
        
        let text = aiRes.data.candidates[0].content.parts[0].text;
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const keywordsData = JSON.parse(text);
        
        console.log(`AI generated keywords for ${keywordsData.length} tours. Updating database...`);
        
        for (const item of keywordsData) {
            await pool.query("UPDATE tour_templates SET keywords = $1 WHERE id = $2", [item.keywords, item.id]);
        }
        
        console.log("Database update complete! Running sync_tours.js now...");
        process.exit(0);
    } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
        process.exit(1);
    }
}
run();
