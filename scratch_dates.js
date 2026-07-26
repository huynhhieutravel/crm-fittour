const fs = require('fs');
const files = [
    'client/src/tabs/RoomBookingTab.jsx',
    'client/src/tabs/TravelSupportTab.jsx',
    'client/src/tabs/workspace/SalesDashboard.jsx',
    'client/src/tabs/CEODepartureDashboardTab.jsx',
    'client/src/tabs/CustomerReviewsTab.jsx',
    'client/src/tabs/InboxTab.jsx',
    'client/src/components/tools/PassportBulkScanner.jsx',
    'client/src/components/BookingProfileSlider.jsx',
    'client/src/components/modals/AddLeadModal.jsx',
    'client/src/components/modals/EditLeadModal.jsx',
    'client/src/components/modals/MiceLeadDetailDrawer.jsx',
    'client/src/components/modals/ProjectExecutionDrawer.jsx'
];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // RoomBookingTab
    content = content.replace(/return \(new Date\(date - tzOffset\)\)\.toISOString\(\)\.split\('T'\)\[0\];/g, "return getLocalDateString(new Date(date));");
    content = content.replace(/startStr: \(new Date\(start - tzOffset\)\)\.toISOString\(\)\.slice\(0, -1\)/g, "startStr: getLocalDateTimeLocal(new Date(start))");
    content = content.replace(/endStr: \(new Date\(end - tzOffset\)\)\.toISOString\(\)\.slice\(0, -1\)/g, "endStr: getLocalDateTimeLocal(new Date(end))");
    
    // TravelSupportTab, PassportBulkScanner
    content = content.replace(/new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]/g, "getLocalDateString()");
    content = content.replace(/new Date\(\)\.toISOString\(\)\.slice\(0,\s*10\)/g, "getLocalDateString()");

    // SalesDashboard
    content = content.replace(/new Date\(inlineReminderDate\)\.toISOString\(\)/g, "getLocalIsoString(new Date(inlineReminderDate))");
    content = content.replace(/new Date\(d\.getTime\(\) - d\.getTimezoneOffset\(\) \* 60000\)\.toISOString\(\)\.slice\(0,\s*16\)/g, "getLocalDateTimeLocal(d)");

    // CEODepartureDashboardTab & CustomerReviewsTab
    content = content.replace(/new Date\(date\.getTime\(\) - \(date\.getTimezoneOffset\(\) \* 60000\)\)\.toISOString\(\)\.split\('T'\)\[0\]/g, "getLocalDateString(date)");
    
    // InboxTab & ProjectExecutionDrawer
    content = content.replace(/new Date\(\)\.toISOString\(\)/g, "getLocalIsoString()");

    // AddLeadModal & App.jsx references
    content = content.replace(/new Date\(new Date\(([^)]+)\)\.getTime\(\) - \(new Date\(\)\.getTimezoneOffset\(\) \* 60000\)\)\.toISOString\(\)\.slice\(0, 16\)/g, "getLocalDateTimeLocal(new Date($1))");

    // EditLeadModal
    content = content.replace(/new Date\(d\.getTime\(\) - d\.getTimezoneOffset\(\) \* 60000\)\.toISOString\(\)\.slice\(0,16\)/g, "getLocalDateTimeLocal(d)");

    // MiceLeadDetailDrawer
    content = content.replace(/new Date\(lead\.deadline\)\.toISOString\(\)\.substring\(0, 16\)/g, "getLocalDateTimeLocal(new Date(lead.deadline))");

    if (content !== original) {
        // Add imports
        const importStr = file.includes('components/modals') || file.includes('components/tools') || file.includes('tabs/workspace') ? 
            "import { getLocalIsoString, getLocalDateTimeLocal, getLocalDateString } from '../../utils/dateUtils';" :
            file.includes('components') ? 
            "import { getLocalIsoString, getLocalDateTimeLocal, getLocalDateString } from '../utils/dateUtils';" :
            "import { getLocalIsoString, getLocalDateTimeLocal, getLocalDateString } from '../utils/dateUtils';";

        if (!content.includes('from \'../../utils/dateUtils\'') && !content.includes('from \'../utils/dateUtils\'')) {
            content = content.replace(/(import React[^;]+;)/, `$1\n${importStr}`);
        }

        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
}
