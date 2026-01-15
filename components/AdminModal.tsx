import React, { useState, useRef, useEffect } from 'react';
import { Terminal, X, Send } from 'lucide-react';
import { VipTier } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateKey: (tier: VipTier, targetUser?: string) => string;
  onBanUser: (username: string) => boolean;
  onDebug: (code: string) => string;
  onToggleAutoResize: (enable: boolean) => void; // New prop
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onGenerateKey, onBanUser, onDebug, onToggleAutoResize }) => {
  const [history, setHistory] = useState<string[]>(['> Hệ thống Bot MagicArt đã khởi động...', '> Chào mừng Administrator: Quang Hổ', '> Nhập "help" để xem danh sách lệnh.']);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isOpen]);

  if (!isOpen) return null;

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const rawInput = input.trim();
    if (!rawInput) return;

    const parts = rawInput.split(' ');
    const cmd = parts[0].toLowerCase();
    
    const newHistory = [...history, `> ${rawInput}`];

    // Command Logic
    if (cmd === 'help') {
      newHistory.push(
        'DANH SÁCH LỆNH:',
        '  genkey <tier> [user]  - Tạo key (Có thể gán cho user)',
        '  ban <user>            - CẤM VĨNH VIỄN (Ban IP + Máy 1 năm)',
        '  autoresize            - Bật chế độ co giãn Mobile ngang',
        '  pc                    - Về giao diện gốc (Tắt autoresize)',
        '  debug <code>          - Chạy mã JS sửa lỗi Real-time',
        '  clear                 - Xóa màn hình',
        '  exit                  - Đóng bảng điều khiển'
      );
    } else if (cmd === 'clear') {
      setHistory(['> Đã xóa màn hình.']);
      setInput('');
      return;
    } else if (cmd === 'exit') {
      onClose();
      return;
    } else if (cmd === 'autoresize') {
      onToggleAutoResize(true);
      newHistory.push('[SYSTEM] Đã BẬT chế độ Auto Resize (Mobile Landscape -> PC View).');
    } else if (cmd === 'pc') {
      onToggleAutoResize(false);
      newHistory.push('[SYSTEM] Đã chuyển về chế độ PC Native (Tắt Auto Resize).');
    } else if (cmd === 'genkey') {
      const type = parts[1]?.toLowerCase();
      const targetUser = parts[2]; 

      let tier: VipTier | null = null;
      
      if (type === 'vip') tier = VipTier.VIP;
      else if (type === 'ssvip') tier = VipTier.SSVIP;
      else if (type === 'infinity') tier = VipTier.INFINITY;

      if (tier) {
        const key = onGenerateKey(tier, targetUser);
        newHistory.push(
          `[SUCCESS] Đã tạo Key thành công!`,
          `  Gói: ${tier}`,
          targetUser ? `  Dành riêng cho: ${targetUser}` : `  Loại: Tự do`,
          `  KEY: ${key}`
        );
      } else {
        newHistory.push(`[ERROR] Gói "${type}" không hợp lệ.`);
      }
    } else if (cmd === 'ban') {
       const targetUser = parts[1];
       if (targetUser) {
         const success = onBanUser(targetUser);
         if (success) {
           newHistory.push(`[SYSTEM] Đã thực thi lệnh BAN IP + MACHINE ID cho user: ${targetUser}.`);
         } else {
           newHistory.push(`[ERROR] Không tìm thấy user: ${targetUser} hoặc user được bảo vệ.`);
         }
       } else {
         newHistory.push(`[ERROR] Thiếu tên user. Cú pháp: ban <username>`);
       }
    } else if (cmd === 'debug') {
      const codeIndex = rawInput.indexOf(' ');
      if (codeIndex !== -1) {
        const code = rawInput.substring(codeIndex + 1);
        const result = onDebug(code);
        newHistory.push(result);
      } else {
        newHistory.push(`[ERROR] Vui lòng nhập mã để debug.`);
      }
    } else {
      newHistory.push(`[ERROR] Lệnh không xác định: "${cmd}".`);
    }

    setHistory(newHistory);
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-black border-2 border-green-500 rounded-lg w-full max-w-2xl h-[500px] flex flex-col shadow-[0_0_20px_rgba(0,255,0,0.3)] font-mono text-sm">
        <div className="bg-green-900/20 border-b border-green-500 p-2 flex justify-between items-center text-green-400">
          <div className="flex items-center gap-2">
            <Terminal size={16} />
            <span className="font-bold tracking-wider">ADMIN CONTROL PANEL - ROOT ACCESS</span>
          </div>
          <button onClick={onClose} className="hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-black text-green-500 font-bold">
          {history.map((line, index) => (
            <div key={index} className={`${line.includes('[ERROR]') ? 'text-red-500' : line.includes('KEY:') ? 'text-yellow-400 text-lg border-l-4 border-yellow-400 pl-2 my-2' : line.includes('[DEBUG]') ? 'text-blue-400' : ''}`}>
              {line}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={handleCommand} className="p-2 border-t border-green-500 bg-black flex gap-2">
          <span className="text-green-500 font-bold animate-pulse">{'>'}</span>
          <input 
            autoFocus
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-green-400 placeholder-green-800"
            placeholder="Nhập lệnh..."
          />
          <button type="submit" className="text-green-600 hover:text-green-400">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};