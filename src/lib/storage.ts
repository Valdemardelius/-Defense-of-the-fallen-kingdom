export const storage = {
  get<T>(key: string): T | null {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  
  set<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
  },
  
  remove(key: string): void {
    localStorage.removeItem(key);
  },
  
  has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  },
  
  clear(): void {
    localStorage.clear();
  }
};