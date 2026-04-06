export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const drawHealthBar = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  currentHp: number,
  maxHp: number,
  width: number = 30,
  height: number = 4,
  offsetY: number = -18
): void => {
  const hpPercent = Math.max(0, currentHp / maxHp);
  
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(x - width / 2, y + offsetY, width, height);
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(x - width / 2, y + offsetY, width * hpPercent, height);
};

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  fillColor: string,
  strokeColor: string = 'white',
  strokeWidth: number = 1
): void => {
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.stroke();
};

export const drawIcon = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  icon: string,
  fontSize: string = '14px',
  font: string = 'Arial'
): void => {
  ctx.fillStyle = 'white';
  ctx.font = `bold ${fontSize} ${font}`;
  ctx.fillText(icon, x - 8, y + 5);
};

export const drawText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string = 'white',
  fontSize: string = '12px',
  font: string = 'Arial'
): void => {
  ctx.fillStyle = color;
  ctx.font = `${fontSize} ${font}`;
  ctx.fillText(text, x, y);
};