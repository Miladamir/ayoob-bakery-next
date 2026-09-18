/** Opening hours in minutes-since-midnight (Melbourne time). */
export const OPENING_HOURS: Record<string, [number, number]> = {
  Mon: [480, 1080], // 8:00 – 18:00
  Tue: [480, 1080],
  Wed: [480, 1080],
  Thu: [480, 1080],
  Fri: [480, 1080],
  Sat: [480, 1080],
  // Sunday — closed (no entry; getStatus reports "Closed · opens Mon 8:00 am")
};

const DAY_ORDER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function melbourneNow(): { day: string; h: number; m: number } {
  try {
    const parts = new Intl.DateTimeFormat("en-AU", {
      timeZone: "Australia/Melbourne",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23",
    }).formatToParts(new Date());
    const o: Record<string, string> = {};
    parts.forEach((p) => { o[p.type] = p.value; });
    return { day: o.weekday, h: +o.hour, m: +o.minute };
  } catch {
    const d = new Date();
    return { day: DAY_ORDER[d.getDay()], h: d.getHours(), m: d.getMinutes() };
  }
}

function fmtT(m: number): string {
  const h = Math.floor(m / 60), mm = m % 60, h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(mm).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}

export interface DetailedStatus {
  open: boolean;
  closesAt?: string;
  backAt?: string;
}

export function getDetailedStatus(): DetailedStatus {
  const n = melbourneNow();
  const range = OPENING_HOURS[n.day];
  const cur = n.h * 60 + n.m;

  if (range && cur >= range[0] && cur < range[1]) {
    return { open: true, closesAt: fmtT(range[1]) };
  }

  let found: { d: string; t: number } | null = null;
  if (range && cur < range[0]) {
    found = { d: n.day, t: range[0] };
  } else {
    const idx = DAY_ORDER.indexOf(n.day);
    for (let i = 1; i <= 7; i++) {
      const d = DAY_ORDER[(idx + i) % 7];
      if (OPENING_HOURS[d]) { found = { d, t: OPENING_HOURS[d][0] }; break; }
    }
  }
  if (!found) return { open: false };
  return {
    open: false,
    backAt: `${found.d !== n.day ? found.d + " " : ""}${fmtT(found.t)}`,
  };
}

export function getStatus(): { open: boolean; text: string } {
  const s = getDetailedStatus();
  if (s.open) return { open: true, text: `Open now · closes ${s.closesAt}` };
  return { open: false, text: s.backAt ? `Closed · opens ${s.backAt}` : "Closed" };
}