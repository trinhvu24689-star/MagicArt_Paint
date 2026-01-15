import { 
  Pencil, Brush, Eraser, PaintBucket, Pipette, 
  Minus, Square, Wand2, Droplets, Crown, Sparkles, Infinity, Image as ImageIcon 
} from 'lucide-react';
import { Tool, ToolType, VipTier } from './types';

export const TOOLS: Tool[] = [
  { id: 'pencil', name: 'Bút Chì', icon: Pencil, requiredTier: VipTier.FREE, description: 'Vẽ nét mảnh, phác thảo cơ bản' },
  { id: 'brush', name: 'Cọ Vẽ', icon: Brush, requiredTier: VipTier.FREE, description: 'Cọ vẽ tiêu chuẩn, mềm mại' },
  { id: 'eraser', name: 'Tẩy', icon: Eraser, requiredTier: VipTier.FREE, description: 'Xóa nét vẽ hoặc vùng màu' },
  { id: 'fill', name: 'Đổ màu', icon: PaintBucket, requiredTier: VipTier.FREE, description: 'Đổ màu vùng khép kín' },
  { id: 'picker', name: 'Hút màu', icon: Pipette, requiredTier: VipTier.FREE, description: 'Lấy mẫu màu từ tranh' },
  
  // Paid Tools
  { id: 'line', name: 'Đường thẳng', icon: Minus, requiredTier: VipTier.VIP, description: 'Vẽ đường thẳng hoàn hảo' },
  { id: 'rect', name: 'Hình khối', icon: Square, requiredTier: VipTier.VIP, description: 'Vẽ hình chữ nhật/vuông' },
  { id: 'airbrush', name: 'Phun sơn', icon: Droplets, requiredTier: VipTier.SSVIP, description: 'Hiệu ứng phun hạt mịn' },
  { id: 'magic_wand', name: 'Đũa thần AI', icon: Sparkles, requiredTier: VipTier.INFINITY, description: 'Tự động sửa nét vẽ bằng AI' },
  { id: 'ai_real', name: 'AI Vẽ Siêu Thực', icon: ImageIcon, requiredTier: VipTier.INFINITY, description: 'Biến nét vẽ thành ảnh thật (Stable Diffusion)' },
];

export const TIER_CONFIG = {
  [VipTier.FREE]: { color: 'text-gray-400', label: 'Miễn phí', icon: null },
  [VipTier.VIP]: { color: 'text-yellow-400', label: 'VIP', icon: Crown },
  [VipTier.SSVIP]: { color: 'text-purple-400', label: 'SSVIP', icon: Sparkles },
  [VipTier.INFINITY]: { color: 'text-red-500', label: 'Infinity', icon: Infinity },
};

export const INITIAL_PALETTE = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 
  '#FFFF00', '#00FFFF', '#FF00FF', '#C0C0C0', '#808080',
  '#800000', '#808000', '#008000', '#800080', '#008080', '#000080'
];