/**
 * ═══════════════════════════════════════════════════════════════
 *  FIT Tour AI Copilot — Skill Registry (Auto-Loader)
 *  
 *  Tự động scan folder skills/ và load tất cả kỹ năng.
 *  Để thêm skill mới: tạo file .js mới trong skills/ → restart server.
 * ═══════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, 'skills');

const functionDeclarations = [];
const skillHandlers = {};
const skillValidators = {};

// Auto-scan tất cả file .js trong skills/
const skillFiles = fs.readdirSync(SKILLS_DIR).filter(f => f.endsWith('.js') && !f.startsWith('._')).sort();

for (const file of skillFiles) {
  try {
    const skill = require(path.join(SKILLS_DIR, file));
    
    if (skill.declaration && skill.handler) {
      functionDeclarations.push(skill.declaration);
      skillHandlers[skill.declaration.name] = skill.handler;
      if (skill.validate) skillValidators[skill.declaration.name] = skill.validate;
    } else {
      console.warn(`[Skills] ⚠️ File ${file} thiếu declaration hoặc handler, bỏ qua.`);
    }
  } catch (err) {
    console.error(`[Skills] ❌ Lỗi load ${file}:`, err.message);
  }
}

console.log(`[Skills] ✅ Loaded ${functionDeclarations.length} skills: ${functionDeclarations.map(d => d.name).join(', ')}`);

module.exports = { functionDeclarations, skillHandlers, skillValidators };
