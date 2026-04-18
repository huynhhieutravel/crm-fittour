const regex = /[A-Z0-9][A-Z0-9<]{7,11}[0-9OIZSBGCLE]?[A-Z<]{2,4}[0-9OIZSBGCLE]{5,7}[0-9OIZSBGCLE]?[MF<][0-9OIZSBGCLE]{5,7}/;
const text = 'P<VNMNGUYEN<<NHAT<VU<<<<<<<<<<<<<<<<<<<<<<<<E006224388VNM9008257M3308154001090000001<<04';
const match = text.match(regex);
console.log(match ? match[0] : "NULL");
