// Seeds use dates relative to "now" so Aujourd'hui / Hier groupings always work after a reset.
export const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
export const daysAgo = (d: number, hour = 12) => {
  const t = new Date();
  t.setDate(t.getDate() - d);
  t.setHours(hour, 15, 0, 0);
  return t.toISOString();
};
