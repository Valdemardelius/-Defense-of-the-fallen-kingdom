export class HexGrid {
  private centerX: number;
  private centerY: number;
  private hexSize: number;
  private occupiedHexes: Set<string> = new Set();
  private blockedHexes: Set<string> = new Set(); 
  
  constructor(centerX: number, centerY: number, hexSize: number = 35) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.hexSize = hexSize;
    
    this.blockedHexes.add(this.getHexKey(0, 0));
  }
  
  private getHexKey(q: number, r: number): string {
    return `${q},${r}`;
  }
  
  public isBlocked(q: number, r: number): boolean {
    return this.blockedHexes.has(this.getHexKey(q, r));
  }
  
  public getFreeHexInOrder(): { x: number; y: number; q: number; r: number } | null {
    for (let radius = 1; radius <= 5; radius++) {
      for (let dq = -radius; dq <= radius; dq++) {
        for (let dr = -radius; dr <= radius; dr++) {
          if (Math.abs(dq + dr) <= radius) {
            const testQ = dq;
            const testR = dr;
            const key = this.getHexKey(testQ, testR);
            
            if (this.blockedHexes.has(key)) continue;
            
            if (!this.occupiedHexes.has(key)) {
              const pixel = this.hexToPixel(testQ, testR);
              return { x: pixel.x, y: pixel.y, q: testQ, r: testR };
            }
          }
        }
      }
    }
    return null;
  }
  
  public getHexAtPixel(x: number, y: number): { x: number; y: number; q: number; r: number } | null {
  const { q, r } = this.pixelToHex(x, y);
  const key = this.getHexKey(q, r);
  
  if (!this.blockedHexes.has(key) && !this.occupiedHexes.has(key)) {
    const pixel = this.hexToPixel(q, r);
    return { x: pixel.x, y: pixel.y, q, r };
  }
  return null;
}
  
  private hexToPixel(q: number, r: number): { x: number; y: number } {
    const x = this.centerX + this.hexSize * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
    const y = this.centerY + this.hexSize * (3 / 2 * r);
    return { x, y };
  }
  
  private pixelToHex(x: number, y: number): { q: number; r: number } {
    const q = (Math.sqrt(3) / 3 * (x - this.centerX) - 1 / 3 * (y - this.centerY)) / this.hexSize;
    const r = (2 / 3 * (y - this.centerY)) / this.hexSize;
    return { q: Math.round(q), r: Math.round(r) };
  }
  
  public occupyHex(q: number, r: number): void {
    this.occupiedHexes.add(this.getHexKey(q, r));
  }
  
  public freeHex(q: number, r: number): void {
    this.occupiedHexes.delete(this.getHexKey(q, r));
  }
  
  public isOccupied(q: number, r: number): boolean {
    return this.occupiedHexes.has(this.getHexKey(q, r));
  }
  
  public getAllHexPositions(radius: number = 4): Array<{ x: number; y: number; q: number; r: number }> {
    const positions: Array<{ x: number; y: number; q: number; r: number }> = [];
    
    for (let q = -radius; q <= radius; q++) {
      for (let r = -radius; r <= radius; r++) {
        if (Math.abs(q + r) <= radius) {
          const pixel = this.hexToPixel(q, r);
          positions.push({ x: pixel.x, y: pixel.y, q, r });
        }
      }
    }
    
    return positions;
  }
  
  public draw(ctx: CanvasRenderingContext2D): void {
    const positions = this.getAllHexPositions(4);
    
    for (const pos of positions) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 3 * i;
        const x = pos.x + this.hexSize * Math.cos(angle);
        const y = pos.y + this.hexSize * Math.sin(angle);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      
      const isBlocked = this.isBlocked(pos.q, pos.r);
      const isOccupied = this.isOccupied(pos.q, pos.r);
      
      if (isBlocked) {
        ctx.fillStyle = 'rgba(139, 69, 19, 0.5)';
      } else if (isOccupied) {
        ctx.fillStyle = 'rgba(100, 100, 100, 0.4)';
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      }
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.stroke();
    }
  }
  
  public drawHighlight(ctx: CanvasRenderingContext2D, q: number, r: number): void {
  console.log('✨ HexGrid.drawHighlight called', q, r);
  
  const pixel = this.hexToPixel(q, r);
  console.log('📍 Позиция гекса для подсветки:', pixel);
  
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 3 * i;
    const x = pixel.x + this.hexSize * Math.cos(angle);
    const y = pixel.y + this.hexSize * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  
  ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
  ctx.fill();
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 4;
  ctx.stroke();
  
  console.log('✅ Подсветка нарисована');
}
}