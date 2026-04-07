const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../../client/src/tabs');

const baseCond = "(currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.role === 'operations')";
const groupMiceCond = "(currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.role === 'operations' || currentUser?.role === 'group_manager' || currentUser?.role === 'group_staff')";
const groupSupplierCond = "(currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.role === 'operations' || currentUser?.role === 'group_manager')";

const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));
let modified = [];

files.forEach(f => {
    let p = path.join(dir, f);
    let c = fs.readFileSync(p, 'utf8');
    let og = c;
    
    if (f === 'GroupProjectsTab.jsx') {
        c = c.split(baseCond).join(groupMiceCond);
    } else if (f.startsWith('Group')) {
        c = c.split(baseCond).join(groupSupplierCond);
    }
    
    if (c !== og) {
        fs.writeFileSync(p, c);
        modified.push(f);
    }
});

console.log('Fixed files:', modified.join(', '));
