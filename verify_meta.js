const db = require('./server/db');
const metaCatalogService = require('./server/services/metaCatalogService');

async function test() {
    try {
        const result = await db.query('SELECT * FROM tour_templates LIMIT 50');
        if (result.rows.length === 0) {
            console.log("No tours found in DB.");
            return;
        }
        
        let tour = result.rows.find(t => t.image_url && t.website_link) || result.rows[0];

        console.log("=== ORIGINAL TOUR DB DATA (SAMPLE) ===");
        console.log("ID:", tour.id);
        console.log("Name:", tour.name);
        console.log("Base Price:", tour.base_price, `(Type: ${typeof tour.base_price})`);
        console.log("image_url:", tour.image_url);
        console.log("website_link:", tour.website_link);
        console.log("Highlights HTML?:", typeof tour.highlights === 'string' ? tour.highlights.substring(0, 100).replace(/\n/g, '') + "..." : tour.highlights);

        console.log("\n=== MAPPED FACEBOOK META COMMERCE PAYLOAD ===");
        const payload = metaCatalogService.formatTourForMeta(tour);
        console.log(JSON.stringify(payload, null, 2));

        console.log("\n=== FB REQUIRED E-COMMERCE VALIDATION CHECK ===");
        let errors = [];
        if (!payload.id) errors.push("Missing 'id'");
        // Facebook standard e-commerce needs title
        if (!payload.title && !payload.name) errors.push("Missing 'title'");
        else if (!payload.title && payload.name) errors.push("E-Commerce Catalog Requires 'title' instead of 'name'");
        
        if (!payload.description) errors.push("Missing 'description'");
        if (!payload.availability) errors.push("Missing 'availability'");
        if (!payload.condition) errors.push("Missing 'condition'");
        if (!payload.price) errors.push("Missing 'price'");
        
        // Price format validation: Facebook API requires `[amount: max 2 decimals] [Currency_Code]`
        // e.g. '9.99 USD' or '100000 VND'
        // Commas are NOT allowed in the amount.
        if (payload.price && !/^\d+(\.\d{1,2})? [A-Z]{3}$/.test(payload.price)) {
            errors.push(`Invalid 'price' format: '${payload.price}'. FB API expects something like "190000 VND" or "10.00 USD" without commas.`);
        }

        if (!payload.link) errors.push("Missing 'link'");
        if (!payload.image_link) errors.push("Missing 'image_link'");
        if (!payload.brand) errors.push("Missing 'brand'");

        if (payload.description && payload.description.includes('<') && payload.description.includes('>')) {
            errors.push("Invalid 'description': Contains HTML tags. FB Catalog requires plain text.");
        }

        if (errors.length > 0) {
            console.log("❌ FAILED FB VALIDATION:");
            errors.forEach(e => console.log("   - " + e));
        } else {
            console.log("✅ FB VALIDATION PASSED!");
        }
        
    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit(0);
    }
}
test();
