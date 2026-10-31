const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../db');

const STATE_FILE = path.resolve(__dirname, '../data/outing_teams_state.json');
const MEMBERS_FILE = path.resolve(__dirname, '../../outing-dalat-2026/assets/members.json');

const DEFAULT_EXCLUDED_STTS = ['9', '27', '11', '2'];
const DEFAULT_TEAM_NAMES = [
  'Phượng Hoàng Lửa',
  'Đại Ngàn Xanh',
  'Vượt Sóng Tuyền Lâm'
];

function getMembers() {
  if (fs.existsSync(MEMBERS_FILE)) {
    return JSON.parse(fs.readFileSync(MEMBERS_FILE, 'utf8'));
  }
  const alt = path.resolve(__dirname, '../public/members.json');
  if (fs.existsSync(alt)) {
    return JSON.parse(fs.readFileSync(alt, 'utf8'));
  }
  return [];
}

async function getStateFromDB() {
  try {
    const res = await db.query("SELECT value FROM settings WHERE key = 'outing_dalat_2026_teams_state'");
    if (res.rows.length > 0 && res.rows[0].value) {
      return JSON.parse(res.rows[0].value);
    }
  } catch (err) {
    console.warn('[outingTeams] Lỗi đọc state từ settings DB:', err.message);
  }
  return null;
}

async function saveStateToDB(state) {
  try {
    const val = JSON.stringify(state);
    await db.query(`
      INSERT INTO settings (key, value, updated_at)
      VALUES ('outing_dalat_2026_teams_state', $1, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `, [val]);
  } catch (err) {
    console.warn('[outingTeams] Lỗi ghi state vào settings DB:', err.message);
  }
}

function getStateFromFile() {
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    } catch (e) {}
  }
  return null;
}

function saveStateToFile(state) {
  try {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (e) {}
}

async function loadCurrentState() {
  // Ưu tiên DB, fallback file, fallback default empty state
  let state = await getStateFromDB();
  if (!state) {
    state = getStateFromFile();
  }
  if (!state || !Array.isArray(state.teams) || state.teams.length !== 3) {
    state = {
      teams: [[], [], []],
      excludedStts: DEFAULT_EXCLUDED_STTS,
      customTeamNames: [...DEFAULT_TEAM_NAMES],
      isApproved: false,
      approvedTimestamp: null,
      lastSpin: null,
      updatedAt: new Date().toISOString()
    };
  }
  return state;
}

async function persistState(state) {
  state.updatedAt = new Date().toISOString();
  saveStateToFile(state);
  await saveStateToDB(state);
  return state;
}

function getFirstName(fullName) {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1].toLowerCase();
}

/**
 * Thuật toán bốc thăm cân bằng động (Dynamic Constrained Lottery)
 */
function pickTargetTeam(member, teams, excludedStts, allMembers) {
  const activeMembers = allMembers.filter(m => !excludedStts.includes(String(m.stt)));
  const N = activeMembers.length;
  const baseCap = Math.floor(N / 3);
  const rem = N % 3;
  const capacities = [
    baseCap + (rem > 0 ? 1 : 0),
    baseCap + (rem > 1 ? 1 : 0),
    baseCap
  ];

  const isMale = (member.gioi_tinh || '').toLowerCase().includes('nam');
  const maxGenderCap = 5; // Tối đa 5 Nam / 5 Nữ mỗi đội

  // 1. Tìm các đội hợp lệ (chưa full dung lượng tổng và chưa full quota giới tính)
  let eligibleIndices = [];
  for (let i = 0; i < 3; i++) {
    const team = teams[i] || [];
    const teamGenderCount = team.filter(p => {
      const pMale = (p.gioi_tinh || '').toLowerCase().includes('nam');
      return isMale ? pMale : !pMale;
    }).length;

    const hasCapacity = team.length < capacities[i];
    const hasGenderSlot = teamGenderCount < maxGenderCap;

    if (hasCapacity && hasGenderSlot) {
      eligibleIndices.push(i);
    }
  }

  // Fallback nếu không có đội nào thỏa cả 2 (ví dụ dung lượng chặt chẽ):
  if (eligibleIndices.length === 0) {
    eligibleIndices = [0, 1, 2].filter(i => (teams[i] || []).length < capacities[i]);
  }
  if (eligibleIndices.length === 0) {
    // Nếu cả 3 đội đã đầy, chọn đội có ít người nhất
    eligibleIndices = [0, 1, 2].sort((a, b) => (teams[a] || []).length - (teams[b] || []).length).slice(0, 1);
  }

  // 2. Tính trọng số xác suất cho từng đội hợp lệ
  const targetFirstName = getFirstName(member.ho_ten);
  const targetBU = String(member.phong_ban || '').trim();

  const weights = eligibleIndices.map(idx => {
    let score = 100.0;
    const team = teams[idx] || [];

    // Ràng buộc mềm 1: Tránh trùng tên riêng trong đội
    const hasSameName = team.some(p => getFirstName(p.ho_ten) === targetFirstName);
    if (hasSameName) {
      score *= 0.05; // Giảm 95% xác suất nếu đã có người cùng tên
    }

    // Ràng buộc mềm 2: Cân bằng BU
    const sameBUCount = team.filter(p => String(p.phong_ban || '').trim() === targetBU).length;
    if (sameBUCount >= 2) {
      score *= 0.2;
    } else if (sameBUCount === 1) {
      score *= 0.6;
    } else {
      score *= 1.5; // Ưu tiên đội chưa có BU này
    }

    // Cân bằng tổng quân số
    const deficit = capacities[idx] - team.length;
    score += deficit * 20;

    return Math.max(score, 1.0);
  });

  // 3. Bốc ngẫu nhiên theo trọng số
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let randomVal = Math.random() * totalWeight;

  for (let k = 0; k < eligibleIndices.length; k++) {
    if (randomVal < weights[k]) {
      return eligibleIndices[k];
    }
    randomVal -= weights[k];
  }

  return eligibleIndices[eligibleIndices.length - 1];
}

// ═══ API ENDPOINTS ═══

// 1. GET /api/outing/teams/state: Lấy toàn bộ trạng thái hiện tại
router.get('/state', async (req, res) => {
  try {
    const allMembers = getMembers();
    const state = await loadCurrentState();

    // Tính danh sách chưa vào đội
    const assignedStts = new Set(state.teams.flat().map(p => String(p.stt)));
    const excludedSet = new Set(state.excludedStts.map(s => String(s)));

    const unassignedMembers = allMembers.filter(m => {
      const s = String(m.stt);
      return !excludedSet.has(s) && !assignedStts.has(s);
    });

    const excludedMembers = allMembers.filter(m => excludedSet.has(String(m.stt)));

    res.json({
      success: true,
      data: {
        ...state,
        totalMembersCount: allMembers.length,
        unassignedMembers,
        unassignedCount: unassignedMembers.length,
        excludedMembers,
        excludedCount: excludedMembers.length,
        allMembers
      }
    });
  } catch (err) {
    console.error('[outingTeams] Error getting state:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. POST /api/outing/teams/spin: Bốc thăm cho 1 thành viên
router.post('/spin', async (req, res) => {
  try {
    const { memberStt } = req.body;
    if (!memberStt) {
      return res.status(400).json({ success: false, error: 'Thiếu memberStt' });
    }

    const allMembers = getMembers();
    const member = allMembers.find(m => String(m.stt) === String(memberStt));
    if (!member) {
      return res.status(404).json({ success: false, error: `Không tìm thấy thành viên STT ${memberStt}` });
    }

    const state = await loadCurrentState();

    if (state.isApproved) {
      return res.status(400).json({ success: false, error: 'Đội hình đã được Admin duyệt chính thức. Cần mở khóa trước khi bốc thăm lại.' });
    }

    const excludedSet = new Set(state.excludedStts.map(s => String(s)));
    if (excludedSet.has(String(memberStt))) {
      return res.status(400).json({ success: false, error: 'Thành viên này thuộc Ban Tổ Chức (Loại trừ), không tham gia bốc thăm thi đấu.' });
    }

    // Kiểm tra đã vào đội chưa
    for (let tIdx = 0; tIdx < 3; tIdx++) {
      const exists = state.teams[tIdx].some(p => String(p.stt) === String(memberStt));
      if (exists) {
        return res.status(400).json({
          success: false,
          error: `Thành viên ${member.ho_ten} đã được phân vào ${state.customTeamNames[tIdx]}!`
        });
      }
    }

    // Bốc thăm bằng thuật toán cân bằng động
    const targetTeamIdx = pickTargetTeam(member, state.teams, state.excludedStts, allMembers);

    const assignedRecord = {
      ...member,
      assignedAt: new Date().toISOString(),
      assignedTeamIdx: targetTeamIdx
    };

    state.teams[targetTeamIdx].push(assignedRecord);
    state.lastSpin = {
      memberStt: member.stt,
      ho_ten: member.ho_ten,
      nickname: member.nickname,
      targetTeamIdx: targetTeamIdx,
      teamName: state.customTeamNames[targetTeamIdx],
      timestamp: new Date().toISOString()
    };

    await persistState(state);

    res.json({
      success: true,
      data: {
        targetTeamIdx,
        teamName: state.customTeamNames[targetTeamIdx],
        member: assignedRecord,
        lastSpin: state.lastSpin,
        teams: state.teams
      }
    });
  } catch (err) {
    console.error('[outingTeams] Error during spin:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. POST /api/outing/teams/reset: Khởi động lại toàn bộ bảng bốc thăm về 0 (Empty State)
router.post('/reset', async (req, res) => {
  try {
    const state = await loadCurrentState();
    state.teams = [[], [], []];
    state.isApproved = false;
    state.approvedTimestamp = null;
    state.lastSpin = null;

    await persistState(state);

    res.json({
      success: true,
      message: 'Đã thiết lập lại 3 đội về trạng thái trống (0/10, 0/9, 0/9)!',
      data: state
    });
  } catch (err) {
    console.error('[outingTeams] Error reset:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. POST /api/outing/teams/rename: Đổi tên đội
router.post('/rename', async (req, res) => {
  try {
    const { teamIdx, newName } = req.body;
    if (teamIdx === undefined || !newName || !newName.trim()) {
      return res.status(400).json({ success: false, error: 'Thiếu teamIdx hoặc newName' });
    }
    const idx = parseInt(teamIdx, 10);
    if (idx < 0 || idx > 2) {
      return res.status(400).json({ success: false, error: 'teamIdx không hợp lệ (0-2)' });
    }

    const state = await loadCurrentState();
    state.customTeamNames[idx] = newName.trim();
    await persistState(state);

    res.json({ success: true, customTeamNames: state.customTeamNames });
  } catch (err) {
    console.error('[outingTeams] Error rename team:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. POST /api/outing/teams/move: Điều chuyển thành viên giữa các đội
router.post('/move', async (req, res) => {
  try {
    const { memberStt, targetTeamIdx } = req.body;
    const destIdx = parseInt(targetTeamIdx, 10);
    if (destIdx < 0 || destIdx > 2) {
      return res.status(400).json({ success: false, error: 'targetTeamIdx không hợp lệ' });
    }

    const state = await loadCurrentState();
    if (state.isApproved) {
      return res.status(400).json({ success: false, error: 'Đội hình đã được duyệt, không thể chuyển đội.' });
    }

    let foundMember = null;
    for (let i = 0; i < 3; i++) {
      const idx = state.teams[i].findIndex(p => String(p.stt) === String(memberStt));
      if (idx !== -1) {
        foundMember = state.teams[i].splice(idx, 1)[0];
        break;
      }
    }

    if (!foundMember) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy thành viên trong các đội' });
    }

    foundMember.assignedTeamIdx = destIdx;
    state.teams[destIdx].push(foundMember);

    await persistState(state);

    res.json({ success: true, teams: state.teams });
  } catch (err) {
    console.error('[outingTeams] Error move member:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. POST /api/outing/teams/approve: Duyệt chính thức hoặc mở khóa
router.post('/approve', async (req, res) => {
  try {
    const { approved } = req.body;
    const state = await loadCurrentState();

    state.isApproved = !!approved;
    if (state.isApproved) {
      const now = new Date();
      state.approvedTimestamp = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + now.toLocaleDateString('vi-VN');
    } else {
      state.approvedTimestamp = null;
    }

    await persistState(state);

    res.json({
      success: true,
      isApproved: state.isApproved,
      approvedTimestamp: state.approvedTimestamp
    });
  } catch (err) {
    console.error('[outingTeams] Error approve:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
