import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Lock } from 'lucide-react';

interface BanScreenProps {
  bannedUntil: number;
  reason: string;
  ip: string;
  machineId: string;
}

export const BanScreen: React.FC<BanScreenProps> = ({ bannedUntil, reason, ip, machineId }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = bannedUntil - now;

      if (diff <= 0) {
        setTimeLeft('00:00:00 - Vui lòng tải lại trang');
        clearInterval(interval);
        return;
      }

      // Calculate days, hours, minutes, seconds
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const str = `${days > 0 ? days + ' ngày ' : ''}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      setTimeLeft(str);
    }, 1000);

    return () => clearInterval(interval);
  }, [bannedUntil]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-red-600 font-mono select-none overflow-hidden">
      {/* Background Flashing Animation */}
      <style>
        {`
          @keyframes redFlash {
            0% { background-color: #000; }
            50% { background-color: #1a0000; }
            100% { background-color: #000; }
          }
          .ban-bg {
            animation: redFlash 0.5s infinite;
          }
        `}
      </style>
      <div className="absolute inset-0 ban-bg pointer-events-none" />

      <div className="relative z-10 bg-black/90 border-4 border-red-600 p-8 rounded-xl max-w-2xl w-full text-center shadow-[0_0_50px_rgba(255,0,0,0.5)]">
        <div className="flex justify-center mb-6">
          <ShieldAlert size={80} className="animate-pulse" />
        </div>
        
        <h1 className="text-4xl font-black mb-2 tracking-widest uppercase">TRUY CẬP BỊ TỪ CHỐI</h1>
        <h2 className="text-xl font-bold mb-6 text-red-400">HỆ THỐNG AN NINH MAGICART DETECTED</h2>

        <div className="bg-red-950/50 border border-red-800 p-4 rounded-lg mb-6 text-left space-y-2 font-bold text-sm">
          <div className="flex justify-between">
            <span>ĐỐI TƯỢNG:</span>
            <span className="text-white">{ip}</span>
          </div>
          <div className="flex justify-between">
            <span>MÃ MÁY (HWID):</span>
            <span className="text-white">{machineId}</span>
          </div>
          <div className="flex justify-between border-t border-red-800 pt-2 mt-2">
            <span>LÝ DO:</span>
            <span className="text-yellow-400 uppercase">{reason}</span>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-xs text-red-500 mb-2">THỜI GIAN THI HÀNH ÁN CÒN LẠI:</p>
          <div className="text-5xl font-black text-white bg-red-900/20 py-4 rounded border border-red-600 tracking-widest font-mono">
            {timeLeft}
          </div>
        </div>

        <div className="text-xs text-red-700 animate-pulse">
          CẢNH BÁO: MỌI HÀNH VI CỐ TÌNH VƯỢT TƯỜNG LỬA SẼ BỊ TRUY TỐ TRƯỚC PHÁP LUẬT QUỐC TẾ.
          <br/>
          HỆ THỐNG ĐANG GHI LẠI DỮ LIỆU CỦA BẠN.
        </div>
      </div>
    </div>
  );
};