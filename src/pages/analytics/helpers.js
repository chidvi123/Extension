// ─── Shared utility functions used across components ─────────────────────────

// Convert seconds → "2h 30m" or "45m"
export function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// Return heat intensity level 0–4 from seconds
export function getHeatLevel(seconds) {
  const m = seconds / 60;
  if (m === 0) return 0;
  if (m < 20) return 1;
  if (m < 60) return 2;
  if (m < 120) return 3;
  return 4;
}

// Build array of { date, time } for the past `days` days
export function buildDayArray(data, days) {
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    const key = d.toISOString().split("T")[0];
    const sessions = data[key] || [];
    const time = sessions
      .filter((r) => r.type === "platform")
      .reduce((sum, r) => sum + r.duration, 0);
    return { date: key, time };
  });
}

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const FULL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];