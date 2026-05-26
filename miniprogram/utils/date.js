/** 格式化为 YYYY-MM-DD */
function formatDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 今日日期 */
function getTodayDateString() {
  return formatDateString(new Date());
}

/** 日期加减天数 */
function addDays(dateStr, delta) {
  const parts = dateStr.split("-").map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + delta);
  return formatDateString(d);
}

/** 简短展示：M月D日 */
function formatDisplayDate(dateStr) {
  const parts = dateStr.split("-").map(Number);
  return `${parts[1]}月${parts[2]}日`;
}

module.exports = {
  formatDateString,
  getTodayDateString,
  addDays,
  formatDisplayDate,
};
