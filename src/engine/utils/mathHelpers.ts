export const getDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.hypot(x1 - x2, y1 - y2);
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

export const isInRange = (x1: number, y1: number, x2: number, y2: number, range: number): boolean => {
  return getDistance(x1, y1, x2, y2) <= range;
};