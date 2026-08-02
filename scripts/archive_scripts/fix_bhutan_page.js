const fs = require('fs');
const bhutanCode = fs.readFileSync('client/src/pages/BhutanConsultingPage.jsx', 'utf8');
const ladakhCode = fs.readFileSync('client/src/pages/LadakhConsultingPage.jsx', 'utf8');

// Extract the data from Bhutan
const groupedFaqsMatch = bhutanCode.match(/const groupedFaqs = \[[\s\S]*?\];\n/);
const referenceLinksMatch = bhutanCode.match(/const referenceLinks = \[[\s\S]*?\];\n/);

const bhutanData = groupedFaqsMatch[0] + '\n' + referenceLinksMatch[0];

// Extract the layout from Ladakh
const layoutMatch = ladakhCode.match(/const LadakhConsultingPage = \(\) => {[\s\S]*?export default LadakhConsultingPage;/);
let newLayout = layoutMatch[0];

// Replace Ladakh specific strings with Bhutan
newLayout = newLayout.replace(/LadakhConsultingPage/g, 'BhutanConsultingPage');
newLayout = newLayout.replace(/Cẩm nang chốt sale Ladakh/g, 'Cẩm nang chốt sale Bhutan');
newLayout = newLayout.replace(/Cẩm Nang Chốt Sale BU4/g, 'Kịch bản chốt Sale');
newLayout = newLayout.replace(/Thư Viện Kịch Bản Ladakh/g, 'Tư vấn Tour Bhutan (5N4Đ)');
newLayout = newLayout.replace(/Tổng hợp các câu hỏi thường gặp, kịch bản trả lời nhanh và bộ link bài viết\/hình ảnh chuẩn để gửi cho khách hàng quan tâm đến tuyến du lịch Vương Quốc Hạnh Phúc Bhutan./g, 'Tổng hợp các câu hỏi thường gặp, kịch bản trả lời nhanh và bộ link bài viết/hình ảnh chuẩn để gửi cho khách hàng quan tâm đến tuyến du lịch Vương Quốc Hạnh Phúc Bhutan.');

// Assemble the final code
const finalCode = `import React, { useState, useEffect } from 'react';
import { Briefcase, HeartPulse, CloudSun, BookKey as Passport, Search, Copy, CheckCircle2, ChevronDown, Hash, PhoneCall, Sparkles, MessageSquare, Info, Zap, ChevronRight, ExternalLink, Star, Music, Heart, BookOpen, Navigation, Library, Award, Users, List, Map, Mountain, Image as ImageIcon, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

${bhutanData}

${newLayout}
`;

fs.writeFileSync('client/src/pages/BhutanConsultingPage.jsx', finalCode);
console.log('Fixed BhutanConsultingPage.jsx layout to match Ladakh');
