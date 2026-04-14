function getWeekRanges(year, month) {
  if (!year || !month) return {};
  const y = parseInt(year);
  const m = parseInt(month);
  
  const firstDay = new Date(y, m - 1, 1);
  const lastDay = new Date(y, m, 0); 
  
  let firstSunday = new Date(firstDay);
  while (firstSunday.getDay() !== 0) {
    firstSunday.setDate(firstSunday.getDate() + 1);
  }
  
  let w1End = new Date(firstSunday);
  const daysInFirstSegment = firstSunday.getDate() - firstDay.getDate() + 1;
  // If month is too short (edge cases), prevent adding 7 days
  if (daysInFirstSegment <= 2 && w1End.getDate() + 7 <= lastDay.getDate()) {
    w1End.setDate(w1End.getDate() + 7);
  }
  
  const ranges = {};
  ranges[1] = `${firstDay.getDate()}/${m} - ${w1End.getDate()}/${m}`;
  
  let currentStart = new Date(w1End);
  currentStart.setDate(currentStart.getDate() + 1);
  
  for (let w = 2; w <= 4; w++) {
    if (currentStart > lastDay) {
      ranges[w] = '-';
      continue;
    }
    let currentEnd = new Date(currentStart);
    currentEnd.setDate(currentEnd.getDate() + 6);
    if (currentEnd > lastDay) currentEnd = new Date(lastDay);
    
    ranges[w] = `${currentStart.getDate()}/${m} - ${currentEnd.getDate()}/${m}`;
    
    currentStart = new Date(currentEnd);
    currentStart.setDate(currentStart.getDate() + 1);
  }
  
  if (currentStart <= lastDay) {
    ranges[5] = `${currentStart.getDate()}/${m} - ${lastDay.getDate()}/${m}`;
  } else {
    ranges[5] = '-';
  }
  return ranges;
}
console.log("Mar 2026", getWeekRanges(2026, 3));
console.log("Apr 2026", getWeekRanges(2026, 4));
console.log("Feb 2026", getWeekRanges(2026, 2));
console.log("Aug 2026", getWeekRanges(2026, 8));
