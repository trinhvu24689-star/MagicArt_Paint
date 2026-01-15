import React, { useState, useEffect } from 'react';
import { X, Check, Crown, Sparkles, Infinity as InfinityIcon, ArrowLeft, ShieldAlert, KeyRound, Loader2 } from 'lucide-react';
import { VipTier } from '../types';

interface VipModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: VipTier;
  onUpgrade: (key: string) => Promise<'SUCCESS' | 'INVALID'>; // Changed return type
}

export const VipModal: React.FC<VipModalProps> = ({ isOpen, onClose, currentTier, onUpgrade }) => {
  const [selectedTier, setSelectedTier] = useState<VipTier | null>(null);
  const [licenseKey, setLicenseKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedTier(null);
      setLicenseKey('');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const tiers = [
    {
      id: VipTier.VIP,
      name: 'Gói VIP',
      icon: Crown,
      price: '69.000đ/tháng',
      rawPrice: 69000,
      color: 'from-yellow-400 to-orange-500',
      features: ['Mở khóa công cụ Hình khối', 'Mở khóa công cụ Đường thẳng', 'Tăng giới hạn lên 20 lớp', 'Tắt quảng cáo'],
    },
    {
      id: VipTier.SSVIP,
      name: 'Gói SSVIP',
      icon: Sparkles,
      price: '120.000đ/tháng',
      rawPrice: 120000,
      color: 'from-purple-400 to-pink-500',
      features: ['Tất cả quyền lợi VIP', 'Mở khóa Phun sơn (Airbrush)', 'Bộ lọc hiệu ứng đặc biệt', 'Tăng giới hạn lên 50 lớp'],
    },
    {
      id: VipTier.INFINITY,
      name: 'Gói Infinity',
      icon: InfinityIcon,
      price: '296.000đ/tháng',
      rawPrice: 296000,
      color: 'from-red-500 to-rose-600',
      features: ['Tất cả quyền lợi SSVIP', 'Công cụ AI Magic', 'Không giới hạn số lớp', 'Hỗ trợ ưu tiên 24/7'],
    }
  ];

  const handleSelectTier = (tierId: VipTier) => {
    setSelectedTier(tierId);
    setLicenseKey('');
    setErrorMsg('');
  };

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      setErrorMsg('Vui lòng nhập mã kích hoạt.');
      return;
    }
    
    setIsVerifying(true);
    setErrorMsg('');

    // Simulate network delay for realism
    setTimeout(async () => {
      const result = await onUpgrade(licenseKey.trim());
      setIsVerifying(false);
      
      if (result === 'SUCCESS') {
        setSuccessMsg('Kích hoạt thành công! Đang tải lại...');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        // Just show generic error here, App.tsx handles the ban logic
        setErrorMsg('Mã kích hoạt không hợp lệ, hết hạn hoặc sai định dạng.');
        setLicenseKey(''); // Clear input to force re-type
      }
    }, 800); // Faster check
  };

  const selectedTierData = tiers.find(t => t.id === selectedTier);

  // VietQR Image Generation
  const qrUrl = selectedTierData 
    ? `https://img.vietqr.io/image/MB-86869999269999-compact2.png?amount=${selectedTierData.rawPrice}&addInfo=${encodeURIComponent('MUA ' + selectedTierData.name)}&accountName=SAM BA VUONG`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-850 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col border border-gray-700 shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {selectedTier && (
              <button onClick={() => setSelectedTier(null)} className="p-1 hover:bg-gray-700 rounded-full transition">
                <ArrowLeft size={20} className="text-gray-400" />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                {selectedTier ? 'Thanh toán & Kích hoạt' : 'Nâng cấp tài khoản'}
              </h2>
              <p className="text-gray-400 text-sm">
                {selectedTier ? 'Quét mã QR để lấy mã kích hoạt' : 'Mở khóa sức mạnh sáng tạo vô hạn'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {!selectedTier ? (
            /* --- TIER SELECTION VIEW --- */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiers.map((tier) => {
                const Icon = tier.icon;
                const isCurrent = currentTier === tier.id;
                
                return (
                  <div 
                    key={tier.id} 
                    className={`relative group bg-gray-800 rounded-xl border ${isCurrent ? 'border-green-500' : 'border-gray-700 hover:border-gray-500'} p-6 flex flex-col transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl`}
                  >
                    <div className={`absolute top-0 inset-x-0 h-2 rounded-t-xl bg-gradient-to-r ${tier.color}`} />
                    
                    <div className="mt-4 flex items-center justify-between">
                       <div className={`p-3 rounded-lg bg-gradient-to-br ${tier.color} bg-opacity-20`}>
                          <Icon className="text-white" size={28} />
                       </div>
                       <span className="text-xl font-bold text-white">{tier.price}</span>
                    </div>
                    
                    <h3 className={`mt-4 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${tier.color}`}>
                      {tier.name}
                    </h3>

                    <ul className="mt-6 space-y-3 flex-1">
                      {tier.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <Check size={16} className="text-green-400 mt-0.5 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      disabled={isCurrent}
                      onClick={() => handleSelectTier(tier.id)}
                      className={`mt-8 w-full py-3 rounded-lg font-bold text-white transition-all
                        ${isCurrent 
                          ? 'bg-green-600/20 text-green-400 cursor-default border border-green-600' 
                          : `bg-gradient-to-r ${tier.color} hover:shadow-lg hover:brightness-110 active:scale-95`
                        }
                      `}
                    >
                      {isCurrent ? 'Đang sử dụng' : 'Nâng cấp ngay'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* --- PAYMENT & ACTIVATION VIEW --- */
            <div className="flex flex-col md:flex-row gap-8 text-gray-300">
              {/* QR Code Column */}
              <div className="flex-1 flex flex-col items-center justify-center bg-white p-4 rounded-xl">
                 <img 
                   src={qrUrl} 
                   alt="VietQR MB Bank" 
                   className="w-full max-w-[300px] h-auto object-contain"
                 />
                 <div className="mt-2 text-center text-gray-900 font-mono text-xs opacity-70">
                   Quét bằng ứng dụng ngân hàng hoặc MoMo
                 </div>
              </div>

              {/* Bank Info & Key Input Column */}
              <div className="flex-1 flex flex-col space-y-6">
                
                <div className="space-y-4 bg-gray-800 p-5 rounded-xl border border-gray-700">
                   {/* ... Bank Info ... */}
                   <div className="flex justify-between border-b border-gray-700 pb-2">
                     <span className="text-gray-400">Ngân hàng:</span>
                     <span className="font-bold text-white">MB Bank</span>
                   </div>
                   <div className="flex justify-between border-b border-gray-700 pb-2">
                     <span className="text-gray-400">Số tài khoản:</span>
                     <span className="font-bold text-yellow-400 text-lg tracking-wider">86869999269999</span>
                   </div>
                   <div className="flex justify-between border-b border-gray-700 pb-2">
                     <span className="text-gray-400">Tên chủ TK:</span>
                     <span className="font-bold text-white">SAM BA VUONG</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-400">Số tiền:</span>
                     <span className="font-bold text-green-400 text-xl">{selectedTierData?.price}</span>
                   </div>
                </div>

                {/* Warning */}
                <div className="bg-red-900/30 border border-red-500/50 p-3 rounded-xl flex gap-3 items-start">
                   <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={20} />
                   <div className="text-xs text-red-200 leading-relaxed font-medium">
                      <strong className="block text-red-400 mb-1 uppercase tracking-wider">Lưu ý quan trọng:</strong>
                      "Đây là tài khoản ngân hàng của nhân viên đổi tiền NDT của tôi, không phải của tôi vì tôi không chi tiền VNĐ, chuyển khoản đúng, mất tiền tôi không chịu trách nhiệm!"
                   </div>
                </div>

                {/* KEY INPUT SECTION */}
                <div className="mt-auto pt-4 border-t border-gray-700">
                  <label className="block text-sm font-bold text-gray-300 mb-2">Nhập Mã Kích Hoạt (License Key)</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="text" 
                      value={licenseKey}
                      onChange={(e) => setLicenseKey(e.target.value)}
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono uppercase tracking-widest"
                    />
                  </div>
                  
                  {errorMsg && <p className="text-red-500 text-xs mt-2 font-bold animate-pulse">{errorMsg}</p>}
                  {successMsg && <p className="text-green-500 text-xs mt-2 font-bold">{successMsg}</p>}

                  <button
                    onClick={handleActivate}
                    disabled={isVerifying || !!successMsg}
                    className={`mt-3 w-full py-3 rounded-xl font-bold text-white text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2
                      ${successMsg ? 'bg-green-600' : `bg-gradient-to-r ${selectedTierData?.color} hover:brightness-110`}
                    `}
                  >
                    {isVerifying ? <Loader2 className="animate-spin" /> : (successMsg ? 'ĐÃ KÍCH HOẠT' : 'KÍCH HOẠT NGAY')}
                  </button>
                  <p className="text-[10px] text-gray-500 mt-2 text-center">
                    Sau khi chuyển khoản, Admin sẽ gửi mã Key cho bạn. Nhập vào ô trên để kích hoạt.
                  </p>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};