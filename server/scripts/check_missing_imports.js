// Scan all JSX files for missing Lucide icon imports
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '../../client/src');

function findJsxFiles(dir) {
  let results = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(findJsxFiles(full));
    } else if (full.endsWith('.jsx')) {
      results.push(full);
    }
  }
  return results;
}

const KNOWN = new Set([
  'React','App','Swal','Provider','BrowserRouter','HashRouter','Routes','Route','Link',
  'Navigate','Outlet','Suspense','Fragment','Tooltip','Bar','Line','Pie','Area','Cell',
  'XAxis','YAxis','CartesianGrid','Legend','ResponsiveContainer','Treemap','Tab','Modal',
  'Drawer','ComposedBar','ReferenceLine','LabelList','BarChart','LineChart','PieChart',
  'AreaChart','RadialBarChart','RadialBar','Funnel','FunnelChart','Radar','RadarChart',
  'PolarGrid','PolarAngleAxis','PolarRadiusAxis','ErrorBoundary','DragDropContext',
  'Droppable','Draggable','DatePicker','Select','Option','Switch','Checkbox',
]);

const jsxFiles = findJsxFiles(SRC_DIR);
let totalIssues = 0;

for (const file of jsxFiles) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Find lucide-react import
  const lucideMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/);
  if (!lucideMatch) continue;
  
  const importedIcons = new Set(lucideMatch[1].split(',').map(s => s.trim()));
  
  // Find all PascalCase JSX tags
  const tagRegex = /<([A-Z][a-zA-Z0-9]+)[\s/\>]/g;
  const usedTags = new Set();
  let m;
  while ((m = tagRegex.exec(content)) !== null) {
    usedTags.add(m[1]);
  }
  
  for (const tag of usedTags) {
    if (KNOWN.has(tag)) continue;
    if (importedIcons.has(tag)) continue;
    
    // Check if imported from any source
    const importCheck = new RegExp(`import[^;]*\\b${tag}\\b[^;]*from`, 'm');
    if (importCheck.test(content)) continue;
    
    // Check if defined locally
    const defCheck = new RegExp(`(function|const|let|var|class)\\s+${tag}\\b`);
    if (defCheck.test(content)) continue;
    
    // Check if received as destructured prop
    const propCheck = new RegExp(`[({,]\\s*${tag}\\s*[,})]`);
    if (propCheck.test(content)) continue;
    
    const shortFile = file.replace(SRC_DIR + '/', '');
    console.log(`❌ ${shortFile} : <${tag}> USED but NOT IMPORTED`);
    totalIssues++;
  }
}

if (totalIssues === 0) {
  console.log(`\n✅ All clear! Scanned ${jsxFiles.length} JSX files — no missing imports found.`);
} else {
  console.log(`\n⚠️  Found ${totalIssues} potential missing imports across ${jsxFiles.length} files.`);
}
