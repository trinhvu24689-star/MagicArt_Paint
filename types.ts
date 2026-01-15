
export enum VipTier {
  FREE = 'FREE',
  VIP = 'VIP',
  SSVIP = 'SSVIP',
  INFINITY = 'INFINITY'
}

export type ToolType = 
  | 'pencil' 
  | 'brush' 
  | 'airbrush' 
  | 'eraser' 
  | 'fill' 
  | 'picker' 
  | 'line' 
  | 'rect' 
  | 'magic_wand' 
  | 'ai_real'
  | 'blur';

export interface Tool {
  id: ToolType;
  icon: any; // Lucide Icon component
  name: string;
  requiredTier: VipTier;
  description: string;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSV {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
}

export interface Palette {
  id: string;
  name: string;
  colors: string[];
}

export interface User {
  username: string;
  password: string;
  tier: VipTier;
  isAdmin: boolean;
  
  // Security Fields
  ip: string;
  machineId: string;
  failedKeyAttempts: number;
  bannedUntil?: number; // Timestamp
  banReason?: string;
}
