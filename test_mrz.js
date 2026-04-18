function forceDigits(s) {
  return s
    .replace(/O/g, '0').replace(/o/g, '0')
    .replace(/I/g, '1').replace(/l/g, '1')
    .replace(/Z/g, '2').replace(/S/g, '5')
    .replace(/G/g, '6').replace(/T/g, '7')
    .replace(/B/g, '8').replace(/P/g, '0')
    .replace(/[^0-9]/g, '0');
}

function tryFixedPosition(rawLine2) {
  const line2 = rawLine2.padEnd(44, '<').substring(0, 44);
  const docId = line2.substring(0, 9).replace(/<+$/, '');
  const nationality = line2.substring(10, 13).replace(/<+$/, '');
  const dobRawOriginal = line2.substring(13, 19);
  const expiryRawOriginal = line2.substring(21, 27);
  
  if (!/^[0-9OIZSBGCLE]{6}$/.test(dobRawOriginal)) return {error: "dob fail", val: dobRawOriginal};
  if (!/^[0-9OIZSBGCLE]{6}$/.test(expiryRawOriginal)) return {error: "expiry fail", val: expiryRawOriginal};

  const dobDigits = forceDigits(dobRawOriginal);
  const expiryDigits = forceDigits(expiryRawOriginal);
  const gender = line2.substring(20, 21);

  if (!'MF<'.includes(gender)) return {error: "gender fail", val: gender};

  return { docId, nationality, gender, dobRaw: dobDigits, expiryRaw: expiryDigits };
}

console.log(tryFixedPosition("E006224388VNM9008257M3308154001090000001<<04"));

const line2Regex = /[A-Z0-9][A-Z0-9<]{7,11}[0-9OIZSBGCLE]?[A-Z<]{2,4}[0-9OIZSBGCLE]{5,7}[0-9OIZSBGCLE]?[MF<][0-9OIZSBGCLE]{5,7}/;
const mega = "P<VNMNGUYEN<<NHAT<VU<<<<<<<<<<<<<<<<<<<<<<<<E006224388VNM9008257M3308154001090000001<<04";
const match = mega.match(line2Regex);
console.log("MATCH:", match[0], "INDEX:", match.index);
