const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════
// GENERATOR: Clone 7 NCC modules for Tour Đoàn
// Reads existing FIT controllers/tabs/drawers and generates group_ variants
// ═══════════════════════════════════════════

const modules = [
    {
        source: 'transport',
        table: 'group_transports',
        prefix: 'group_transport',
        entityName: 'Nhà xe Đoàn',
        controllerFile: 'groupTransportController.js',
        routeFile: 'groupTransports.js', 
        tabFile: 'GroupTransportsTab.jsx',
        drawerFile: 'GroupTransportDetailDrawer.jsx',
        apiPath: 'group/transports',
        icon: 'Truck',
        permModule: 'group_transports',
        classField: 'transport_class',
        typeField: 'vehicle_type',
    },
    {
        source: 'ticket',
        table: 'group_tickets',
        prefix: 'group_ticket',
        entityName: 'Vé TQ Đoàn',
        controllerFile: 'groupTicketController.js',
        routeFile: 'groupTickets.js',
        tabFile: 'GroupTicketsTab.jsx',
        drawerFile: 'GroupTicketDetailDrawer.jsx',
        apiPath: 'group/tickets',
        icon: 'Ticket',
        permModule: 'group_tickets',
        classField: 'ticket_class',
        typeField: 'ticket_type',
    },
    {
        source: 'airline',
        table: 'group_airlines',
        prefix: 'group_airline',
        entityName: 'Hãng bay Đoàn',
        controllerFile: 'groupAirlineController.js',
        routeFile: 'groupAirlines.js',
        tabFile: 'GroupAirlinesTab.jsx',
        drawerFile: 'GroupAirlineDetailDrawer.jsx',
        apiPath: 'group/airlines',
        icon: 'Plane',
        permModule: 'group_airlines',
        classField: 'airline_class',
        typeField: null,
    },
    {
        source: 'landtour',
        table: 'group_landtours',
        prefix: 'group_landtour',
        entityName: 'Land Tour Đoàn',
        controllerFile: 'groupLandtourController.js',
        routeFile: 'groupLandtours.js',
        tabFile: 'GroupLandtoursTab.jsx',
        drawerFile: 'GroupLandtourDetailDrawer.jsx',
        apiPath: 'group/landtours',
        icon: 'Map',
        permModule: 'group_landtours',
        classField: 'landtour_class',
        typeField: null,
    },
    {
        source: 'insurance',
        table: 'group_insurances',
        prefix: 'group_insurance',
        entityName: 'Bảo Hiểm Đoàn',
        controllerFile: 'groupInsuranceController.js',
        routeFile: 'groupInsurances.js',
        tabFile: 'GroupInsurancesTab.jsx',
        drawerFile: 'GroupInsuranceDetailDrawer.jsx',
        apiPath: 'group/insurances',
        icon: 'Shield',
        permModule: 'group_insurances',
        classField: 'insurance_class',
        typeField: null,
    },
    {
        source: 'restaurant',
        table: 'group_restaurants',
        prefix: 'group_restaurant',
        entityName: 'Nhà hàng Đoàn',
        controllerFile: 'groupRestaurantController.js',
        routeFile: 'groupRestaurants.js',
        tabFile: 'GroupRestaurantsTab.jsx',
        drawerFile: 'GroupRestaurantDetailDrawer.jsx',
        apiPath: 'group/restaurants',
        icon: 'UtensilsCrossed',
        permModule: 'group_restaurants',
        classField: 'restaurant_class',
        typeField: 'cuisine_type',
    },
    {
        source: 'hotel',
        table: 'group_hotels',
        prefix: 'group_hotel',
        entityName: 'Khách sạn Đoàn',
        controllerFile: 'groupHotelController.js',
        routeFile: 'groupHotels.js',
        tabFile: 'GroupHotelsTab.jsx',
        drawerFile: 'GroupHotelDetailDrawer.jsx',
        apiPath: 'group/hotels',
        icon: 'Building',
        permModule: 'group_hotels',
        classField: 'hotel_class',
        typeField: null,
    },
];

// ═══ Clone Controllers ═══
function cloneController(mod) {
    const srcFile = path.join(__dirname, 'server/controllers', `${mod.source}Controller.js`);
    const dstFile = path.join(__dirname, 'server/controllers', mod.controllerFile);
    
    if (!fs.existsSync(srcFile)) {
        console.log(`⚠️ Source not found: ${srcFile}`);
        return;
    }
    
    let content = fs.readFileSync(srcFile, 'utf8');
    
    // Replace table names: hotels → group_hotels, hotel_contacts → group_hotel_contacts
    content = content.replace(new RegExp(`${mod.source}s(?=[^_a-zA-Z])`, 'g'), `group_${mod.source}s`);
    content = content.replace(new RegExp(`${mod.source}_contacts`, 'g'), `group_${mod.source}_contacts`);
    content = content.replace(new RegExp(`${mod.source}_services`, 'g'), `group_${mod.source}_services`);
    content = content.replace(new RegExp(`${mod.source}_contracts`, 'g'), `group_${mod.source}_contracts`);
    content = content.replace(new RegExp(`${mod.source}_contract_rates`, 'g'), `group_${mod.source}_contract_rates`);
    content = content.replace(new RegExp(`${mod.source}_notes`, 'g'), `group_${mod.source}_notes`);
    content = content.replace(new RegExp(`${mod.source}_room_types`, 'g'), `group_${mod.source}_room_types`);
    content = content.replace(new RegExp(`${mod.source}_allotments`, 'g'), `group_${mod.source}_allotments`);
    
    // Fix entity type for logging
    content = content.replace(new RegExp(`entity_type: '${mod.source.toUpperCase()}'`, 'g'), `entity_type: 'GROUP_${mod.source.toUpperCase()}'`);
    
    fs.writeFileSync(dstFile, content);
    console.log(`✅ Controller: ${mod.controllerFile}`);
}

// ═══ Clone Routes ═══
function cloneRoute(mod) {
    const srcBase = mod.source === 'hotel' ? 'hotels' : `${mod.source}s`;
    const srcFile = path.join(__dirname, 'server/routes', `${srcBase}.js`);
    const dstFile = path.join(__dirname, 'server/routes', mod.routeFile);
    
    if (!fs.existsSync(srcFile)) {
        console.log(`⚠️ Route source not found: ${srcFile}`);
        return;
    }
    
    let content = fs.readFileSync(srcFile, 'utf8');
    
    // Replace controller require path
    const srcControllerName = `${mod.source}Controller`;
    const dstControllerName = `group${mod.source.charAt(0).toUpperCase() + mod.source.slice(1)}Controller`;
    content = content.replace(
        new RegExp(`require\\('[^']*${srcControllerName}'\\)`, 'g'),
        `require('../controllers/${mod.controllerFile.replace('.js', '')}')`
    );
    
    // Replace route param names if needed (hotel_id → hotel_id stays same in route params)
    
    fs.writeFileSync(dstFile, content);
    console.log(`✅ Route: ${mod.routeFile}`);
}

// ═══ Clone Tabs ═══
function cloneTab(mod) {
    const srcBase = mod.source === 'hotel' ? 'Hotels' : `${mod.source.charAt(0).toUpperCase() + mod.source.slice(1)}s`;
    const srcFile = path.join(__dirname, 'client/src/tabs', `${srcBase}Tab.jsx`);
    const dstFile = path.join(__dirname, 'client/src/tabs', mod.tabFile);
    
    if (!fs.existsSync(srcFile)) {
        console.log(`⚠️ Tab source not found: ${srcFile}`);
        return;
    }
    
    let content = fs.readFileSync(srcFile, 'utf8');
    
    // Replace component name
    const srcComponentName = `${srcBase}Tab`;
    const dstComponentName = mod.tabFile.replace('.jsx', '');
    content = content.replace(new RegExp(`export default function ${srcComponentName}`, 'g'), `export default function ${dstComponentName}`);
    
    // Replace API paths
    content = content.replace(new RegExp(`/api/${mod.source}s`, 'g'), `/api/${mod.apiPath}`);
    if (mod.source === 'hotel') {
        content = content.replace(/\/api\/hotels/g, `/api/${mod.apiPath}`);
    }
    
    // Replace drawer imports
    const srcDrawerName = `${mod.source.charAt(0).toUpperCase() + mod.source.slice(1)}DetailDrawer`;
    const dstDrawerName = mod.drawerFile.replace('.jsx', '');
    content = content.replace(new RegExp(srcDrawerName, 'g'), dstDrawerName);
    content = content.replace(
        new RegExp(`from '../components/modals/${srcDrawerName}'`, 'g'),
        `from '../components/modals/${dstDrawerName}'`
    );
    
    // Replace event names
    content = content.replace(new RegExp(`reload${srcBase}`, 'g'), `reloadGroup${srcBase}`);
    
    // Replace delete handler prop names
    content = content.replace(new RegExp(`handleDelete${mod.source.charAt(0).toUpperCase() + mod.source.slice(1)}`, 'g'), `handleDeleteGroup${mod.source.charAt(0).toUpperCase() + mod.source.slice(1)}`);
    
    fs.writeFileSync(dstFile, content);
    console.log(`✅ Tab: ${mod.tabFile}`);
}

// ═══ Clone Drawers ═══
function cloneDrawer(mod) {
    const srcName = `${mod.source.charAt(0).toUpperCase() + mod.source.slice(1)}DetailDrawer`;
    const srcFile = path.join(__dirname, 'client/src/components/modals', `${srcName}.jsx`);
    const dstFile = path.join(__dirname, 'client/src/components/modals', mod.drawerFile);
    
    if (!fs.existsSync(srcFile)) {
        console.log(`⚠️ Drawer source not found: ${srcFile}`);
        return;
    }
    
    let content = fs.readFileSync(srcFile, 'utf8');
    
    // Replace component name
    const dstName = mod.drawerFile.replace('.jsx', '');
    content = content.replace(new RegExp(`export default ${srcName}`, 'g'), `export default ${dstName}`);
    content = content.replace(new RegExp(`function ${srcName}`, 'g'), `function ${dstName}`);
    content = content.replace(new RegExp(`const ${srcName}`, 'g'), `const ${dstName}`);
    
    // Replace API paths  
    content = content.replace(new RegExp(`/api/${mod.source}s`, 'g'), `/api/${mod.apiPath}`);
    if (mod.source === 'hotel') {
        content = content.replace(/\/api\/hotels/g, `/api/${mod.apiPath}`);
    }
    
    fs.writeFileSync(dstFile, content);
    console.log(`✅ Drawer: ${mod.drawerFile}`);
}

// ═══ RUN ═══
console.log('🚀 Generating Group Tour NCC Modules...\n');

for (const mod of modules) {
    console.log(`\n── ${mod.entityName} ──`);
    cloneController(mod);
    cloneRoute(mod);
    cloneTab(mod);
    cloneDrawer(mod);
}

console.log('\n✅ All 7 modules generated!');
