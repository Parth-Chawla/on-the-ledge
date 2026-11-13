const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

function groupIndian(whole: string) {
  if (whole.length <= 3) return whole;
  const tail = whole.slice(-3);
  const head = whole.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${head},${tail}`;
}

export function formatInr(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  const safe = Number.isFinite(value) ? value : 0;
  const negative = safe < 0;
  const [whole, frac] = Math.abs(safe).toFixed(2).split(".");
  return `${negative ? "-" : ""}₹${groupIndian(whole)}.${frac}`;
}

export function formatMonth(dateValue: Date | string): string {
  const full = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const date = toDate(dateValue);
  return `${full[date.getMonth()]} ${date.getFullYear()}`;
}

export function toDateInputValue(dateValue: Date | string): string {
  if (typeof dateValue === "string") return dateValue.slice(0, 10);
  const year = dateValue.getFullYear();
  const month = String(dateValue.getMonth() + 1).padStart(2, "0");
  const day = String(dateValue.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toDate(value: Date | string): Date {
  if (value instanceof Date) return value;
  return new Date(`${String(value).slice(0, 10)}T00:00:00`);
}

export function monthBounds(budgetMonth: Date | string) {
  const start = toDate(budgetMonth);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  return {
    start: toDateInputValue(start),
    end: toDateInputValue(end),
  };
}

export function formatShortDate(value: Date | string): string {
  const date = toDate(value);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function envelopeStatus(allocated: number, spent: number) {
  if (allocated <= 0) return { label: "No allocation", tone: "neutral" as const };
  const remaining = allocated - spent;
  const ratio = remaining / allocated;
  if (remaining < 0) return { label: "Over allocation", tone: "bad" as const };
  if (spent === 0) return { label: "Full allocation", tone: "good" as const };
  if (ratio <= 0.15) return { label: "Near limit", tone: "warn" as const };
  return { label: "On track", tone: "good" as const };
}

const ICONS: Record<string, string> = {
  Rent: "apartment",
  Food: "restaurant",
  Travel: "directions_subway",
  Shopping: "shopping_bag",
  Entertainment: "theater_comedy",
  Savings: "savings",
};

export function categoryIcon(name: string) {
  return ICONS[name] ?? "category";
}
