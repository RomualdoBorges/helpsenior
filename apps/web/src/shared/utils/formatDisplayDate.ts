const abbreviatedMonths = [
  "jan.",
  "fev.",
  "mar.",
  "abr.",
  "mai.",
  "jun.",
  "jul.",
  "ago.",
  "set.",
  "out.",
  "nov.",
  "dez.",
];

export function formatDisplayDate(date: string) {
  const [year, month, day] = date.split("-");
  const monthIndex = Number(month) - 1;

  if (
    !year ||
    !month ||
    !day ||
    monthIndex < 0 ||
    monthIndex >= abbreviatedMonths.length
  ) {
    return date;
  }

  return `${day.padStart(2, "0")} ${abbreviatedMonths[monthIndex]} ${year}`;
}
