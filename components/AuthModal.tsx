import React, { useState } from 'react';
import { User, VipTier } from '../types';
import { UserCircle2, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, users, onLogin, onRegister }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (isLoginView) {
      // LOGIN LOGIC
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Tên tài khoản hoặc mật khẩu không chính xác.');
      }
    } else {
      // REGISTER LOGIC
      if (users.some(u => u.username === username)) {
        setError('Tên tài khoản đã tồn tại. Vui lòng chọn tên khác.');
        return;
      }
      
      const newUser: User = {
        username,
        password,
        tier: VipTier.FREE,
        isAdmin: false,
        ip: '', // Will be populated by App.tsx
        machineId: '', // Will be populated by App.tsx
        failedKeyAttempts: 0
      };
      onRegister(newUser);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1e1e1e] bg-opacity-95 backdrop-blur-sm">
      <div className="bg-gray-850 w-full max-w-md p-8 rounded-2xl shadow-2xl border border-gray-700 relative overflow-hidden">
        
        {/* Background Decoration */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>

        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl font-bold magic-text mb-2">MagicArt Paint</h1>
          <p className="text-gray-400 text-sm">Đăng nhập để lưu tác phẩm và đồng bộ gói VIP</p>
        </div>

        <div className="flex gap-4 mb-6 bg-gray-900 p-1 rounded-lg">
          <button 
            onClick={() => { setIsLoginView(true); setError(''); }}
            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${isLoginView ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Đăng nhập
          </button>
          <button 
            onClick={() => { setIsLoginView(false); setError(''); }}
            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${!isLoginView ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Đăng ký
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-500 ml-1">Tên tài khoản</label>
            <div className="relative">
              <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-600"
                placeholder="Nhập tên tài khoản"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-500 ml-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-600"
                placeholder="Nhập mật khẩu"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/20 p-2 rounded border border-red-900/50">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-3 mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isLoginView ? 'Vào ứng dụng' : 'Tạo tài khoản mới'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
               <ShieldCheck size={12} />
               <span>Hệ thống bảo mật bởi MagicArt Secure</span>
            </div>
        </div>
      </div>
    </div>
  );
};