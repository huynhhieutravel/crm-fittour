/**
 * ═══════════════════════════════════════════════════════════════
 *  AI Copilot — Brain Loader
 *  
 *  Tự động đọc tất cả file .md trong folder brain/ 
 *  và ghép thành System Instruction cho Gemini.
 *  
 *  Sếp chỉ cần sửa/thêm file .md → restart server → AI học ngay!
 * ═══════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');

const BRAIN_DIR = path.join(__dirname, 'brain');

/**
 * Đọc toàn bộ file .md trong brain/ và brain/knowledge/
 * Ghép thành 1 chuỗi System Instruction
 */
function loadBrain() {
  const sections = [];
  let fileCount = 0;

  // 1. Đọc file root: personality.md, rules.md
  const rootFiles = ['personality.md', 'rules.md'];
  for (const file of rootFiles) {
    const filePath = path.join(BRAIN_DIR, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8').trim();
      sections.push(content);
      fileCount++;
    }
  }

  // 2. Đọc tất cả file .md trong knowledge/
  const knowledgeDir = path.join(BRAIN_DIR, 'knowledge');
  if (fs.existsSync(knowledgeDir)) {
    const knowledgeFiles = fs.readdirSync(knowledgeDir)
      .filter(f => f.endsWith('.md') && !f.startsWith('._'))
      .sort();

    for (const file of knowledgeFiles) {
      const filePath = path.join(knowledgeDir, file);
      const content = fs.readFileSync(filePath, 'utf-8').trim();
      sections.push(`--- KIẾN THỨC: ${file.replace('.md', '').toUpperCase()} ---\n${content}`);
      fileCount++;
    }
  }

  // 3. Đọc tất cả file .md trong examples/ (Few-Shot Training)
  const examplesDir = path.join(BRAIN_DIR, 'examples');
  if (fs.existsSync(examplesDir)) {
    const exampleFiles = fs.readdirSync(examplesDir)
      .filter(f => f.endsWith('.md') && !f.startsWith('._'))
      .sort();

    for (const file of exampleFiles) {
      const filePath = path.join(examplesDir, file);
      const content = fs.readFileSync(filePath, 'utf-8').trim();
      sections.push(`--- VÍ DỤ MẪU: ${file.replace('.md', '').toUpperCase()} ---\nHãy bắt chước chính xác phong cách trả lời trong các ví dụ sau:\n${content}`);
      fileCount++;
    }
  }

  // 3. Thêm header và ghép lại
  const systemInstruction = [
    'Bạn là Trợ lý AI nội bộ của FIT Tour — công ty du lịch nước ngoài.',
    'Bạn giúp nhân viên thao tác nhanh trên hệ thống CRM bằng ngôn ngữ tự nhiên.',
    '',
    sections.join('\n\n'),
  ].join('\n');

  console.log(`[Brain] ✅ Loaded ${fileCount} brain files from ${BRAIN_DIR}`);
  
  return systemInstruction;
}

// Load 1 lần khi server khởi động
const SYSTEM_INSTRUCTION = loadBrain();

module.exports = { SYSTEM_INSTRUCTION, loadBrain };
