const db = require('../server/db');

async function fixBUs() {
  const bu2RemoveKeywords = [
    "nam my", "mong co", "tay a", "maroc", "ai cap", "chau my", "pakistan", 
    "long haul", "trung dong", "tour my", "alaska", "hawaii", "new zealand", 
    "chau my", "châu mỹ", "ai cap", "ai cập", "israel", "jordan", "georgia", 
    "maroc", "iran", "turkey", "tho nhi ky", "thổ nhĩ kỳ", "uzbekistan", 
    "kazakhstan", "azerbaijan", "mong co", "mông cổ", "nước mỹ", "mỹ"
  ];

  const bu5AddCountries = [
    "Pakistan", "Tây Á", "Trung Đông"
  ];

  const bu5AddKeywords = bu2RemoveKeywords; // Add what we remove from BU2 to BU5

  // 1. Fetch current BUs
  const bu2 = await db.query("SELECT countries, keywords FROM business_units WHERE id = 'BU2'");
  const bu5 = await db.query("SELECT countries, keywords FROM business_units WHERE id = 'BU5'");

  let bu2Kw = bu2.rows[0].keywords || [];
  let bu5Kw = bu5.rows[0].keywords || [];
  let bu5Countries = bu5.rows[0].countries || [];

  // 2. Remove from BU2
  bu2Kw = bu2Kw.filter(k => !bu2RemoveKeywords.includes(k));

  // 3. Add to BU5
  bu5Kw = [...new Set([...bu5Kw, ...bu5AddKeywords])];
  bu5Countries = [...new Set([...bu5Countries, ...bu5AddCountries])];

  // 4. Save
  await db.query("UPDATE business_units SET keywords = $1 WHERE id = 'BU2'", [bu2Kw]);
  await db.query("UPDATE business_units SET keywords = $1, countries = $2 WHERE id = 'BU5'", [bu5Kw, bu5Countries]);

  console.log('Fixed BUs keywords routing.');
  process.exit(0);
}

fixBUs();
