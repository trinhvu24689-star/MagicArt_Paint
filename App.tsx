import React, { useState, useRef, useEffect } from 'react';
import { 
  Palette as PaletteIcon, Layers, Settings, Grid, 
  ZoomIn, ZoomOut, Download, Lock, CheckCircle2, Upload, Trash2, Save,
  Move, Hand, MousePointer2, Copy, Undo2, Redo2, Plus, Eye, EyeOff, MoreHorizontal,
  Terminal, LogOut, User as UserIcon
} from 'lucide-react';
import { TOOLS, TIER_CONFIG, INITIAL_PALETTE } from './constants';
import { ToolType, VipTier, Layer, Palette, User } from './types';
import { ColorWheel } from './components/ColorWheel';
import { CanvasBoard } from './components/CanvasBoard';
import { VipModal } from './components/VipModal';
import { AdminModal } from './components/AdminModal';
import { AuthModal } from './components/AuthModal';
import { BanScreen } from './components/BanScreen';
import { extractColorsFromImage, hexToHsv, hsvToHex } from './utils';

const App: React.FC = () => {
  const NPH_USERNAME = 'Quang Hổ';

  // --- SCALE / RESIZE LOGIC ---
  const [uiScale, setUiScale] = useState(1);
  const [isAutoResize, setIsAutoResize] = useState(false); // Default false, enable via Admin
  const appContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Auto Revert Logic: If width > 1024 (PC/Laptop), force scale 1
      if (width >= 1024) {
        setUiScale(1);
        return;
      }

      if (isAutoResize) {
        // Mobile Landscape Logic: Simulate PC layout
        // Assume base PC width is around 1200px for comfortable UI
        const targetBaseWidth = 1200; 
        const newScale = width / targetBaseWidth;
        setUiScale(newScale);
      } else {
        setUiScale(1);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, [isAutoResize]);

  // --- HARDWARE / IP SIMULATION ---
  const [myIP, setMyIP] = useState('');
  const [myMachineId, setMyMachineId] = useState('');

  useEffect(() => {
    let storedIP = localStorage.getItem('mock_ip');
    if (!storedIP) {
      storedIP = `192.168.1.${Math.floor(Math.random() * 255)}`;
      localStorage.setItem('mock_ip', storedIP);
    }
    setMyIP(storedIP);

    let storedMachine = localStorage.getItem('mock_machine_id');
    if (!storedMachine) {
      const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      storedMachine = `HWID-${randomId.toUpperCase()}`;
      localStorage.setItem('mock_machine_id', storedMachine);
    }
    setMyMachineId(storedMachine);
  }, []);

  // --- USER & AUTH STATE ---
  const defaultAdmin: User = {
    username: NPH_USERNAME,
    password: 'Volkath666#a',
    tier: VipTier.INFINITY,
    isAdmin: true,
    ip: '127.0.0.1',
    machineId: 'MASTER-SERVER',
    failedKeyAttempts: 0
  };

  const [users, setUsers] = useState<User[]>([defaultAdmin]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [bannedIPs, setBannedIPs] = useState<{ip: string, expiresAt: number}[]>([]);
  const [bannedMachines, setBannedMachines] = useState<{id: string, expiresAt: number}[]>([]);
  
  // --- APP STATE ---
  const [activeTool, setActiveTool] = useState<ToolType>('brush');
  const [activeColor, setActiveColor] = useState('#704040');
  const [brushSize, setBrushSize] = useState(12);
  const [opacity, setOpacity] = useState(1);
  const [showGrid, setShowGrid] = useState(true); 
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false); 
  
  const [activeKeys, setActiveKeys] = useState<{key: string, tier: VipTier, boundUser: string | null}[]>([]);

  const [activeLayerId, setActiveLayerId] = useState<string>('2');
  const [layers, setLayers] = useState<Layer[]>([
    { id: '3', name: 'Cao quang', visible: true, locked: false },
    { id: '2', name: 'Màu nền', visible: true, locked: false },
    { id: '1', name: 'Phác thảo', visible: true, locked: true },
    { id: '0', name: 'Giấy trắng', visible: true, locked: true },
  ]);

  const currentTier = currentUser ? currentUser.tier : VipTier.FREE;
  const currentTierConfig = TIER_CONFIG[currentTier];
  const currentHSV = hexToHsv(activeColor);
  const activeLayer = layers.find(l => l.id === activeLayerId);

  const isImmune = currentUser?.username === NPH_USERNAME;
  const hardwareBan = bannedIPs.find(b => b.ip === myIP) || bannedMachines.find(m => m.id === myMachineId);
  const userBan = currentUser?.bannedUntil && currentUser.bannedUntil > Date.now();
  const isBanned = !isImmune && (!!hardwareBan || !!userBan);
  
  const banExpiresAt = hardwareBan ? hardwareBan.expiresAt : (currentUser?.bannedUntil || 0);
  const banReason = hardwareBan 
    ? "PHÁT HIỆN TẠO CLONE ĐỂ SPAM KEY - BAN THIẾT BỊ 1 NĂM" 
    : "SPAM KEY QUÁ 3 LẦN - TÀI KHOẢN BỊ KHÓA";

  const handleDebug = (code: string): string => {
    try {
      // eslint-disable-next-line no-eval
      const result = eval(code); 
      return `[DEBUG] Executed. Result: ${result !== undefined ? JSON.stringify(result) : 'Void'}`;
    } catch (e: any) {
      return `[ERROR] Runtime Error: ${e.message}`;
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleRegister = (newUser: User) => {
    const userWithHardware = {
      ...newUser,
      ip: myIP,
      machineId: myMachineId,
      failedKeyAttempts: 0
    };
    setUsers([...users, userWithHardware]);
    setCurrentUser(userWithHardware);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTool('brush');
  };

  const handleBanUser = (username: string) => {
     if (username === NPH_USERNAME) return false;

     const u = users.find(user => user.username === username);
     if (u) {
       const oneYear = 365 * 24 * 60 * 60 * 1000;
       const expiresAt = Date.now() + oneYear;
       
       setBannedIPs([...bannedIPs, { ip: u.ip, expiresAt }]);
       setBannedMachines([...bannedMachines, { id: u.machineId, expiresAt }]);
       
       setUsers(users.map(usr => usr.username === username ? {
         ...usr,
         bannedUntil: expiresAt,
         banReason: 'ADMIN BAN: VIOLATION'
       } : usr));

       if (currentUser?.username === username) {
         setCurrentUser({ ...currentUser, bannedUntil: expiresAt });
       }
       return true;
     }
     return false;
  };

  const generateKey = (tier: VipTier, targetUser?: string): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segment = () => Array(4).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    const newKey = `${tier}-${segment()}-${segment()}-${segment()}`;
    setActiveKeys(prev => [...prev, { key: newKey, tier, boundUser: targetUser || null }]);
    return newKey;
  };

  const handleVerifyKey = async (inputKey: string): Promise<'SUCCESS' | 'INVALID'> => {
    if (!currentUser) return 'INVALID';
    if (isBanned) return 'INVALID';

    const found = activeKeys.find(k => k.key === inputKey);
    
    if (found) {
      if (found.boundUser && found.boundUser !== currentUser.username) {
        await handleFailedAttempt();
        return 'INVALID';
      }

      const updatedUser = { 
        ...currentUser, 
        tier: found.tier, 
        failedKeyAttempts: 0 
      };
      
      setCurrentUser(updatedUser);
      setUsers(users.map(u => u.username === currentUser.username ? updatedUser : u));
      setActiveKeys(prev => prev.filter(k => k.key !== inputKey));
      return 'SUCCESS';
    } else {
      await handleFailedAttempt();
      return 'INVALID';
    }
  };

  const handleFailedAttempt = async () => {
    if (!currentUser) return;
    if (currentUser.username === NPH_USERNAME) return;

    const newAttempts = (currentUser.failedKeyAttempts || 0) + 1;
    let updatedUser = { ...currentUser, failedKeyAttempts: newAttempts };

    if (newAttempts >= 3) {
      const tenMinutes = 10 * 60 * 1000;
      updatedUser.bannedUntil = Date.now() + tenMinutes;
      updatedUser.banReason = "SPAM KEY";
      
      const otherBannedUsers = users.filter(u => 
        (u.ip === myIP || u.machineId === myMachineId) && 
        u.username !== currentUser.username &&
        u.bannedUntil && u.bannedUntil > Date.now()
      );

      if (otherBannedUsers.length > 0) {
        const oneYear = 365 * 24 * 60 * 60 * 1000;
        const expiresAt = Date.now() + oneYear;
        setBannedIPs(prev => [...prev, { ip: myIP, expiresAt }]);
        setBannedMachines(prev => [...prev, { id: myMachineId, expiresAt }]);
        updatedUser.bannedUntil = expiresAt; 
      }
    }

    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.username === updatedUser.username ? updatedUser : u));
  };

  const handleToolSelect = (toolId: ToolType) => {
    const tool = TOOLS.find(t => t.id === toolId);
    if (!tool) return;
    const tierLevels = [VipTier.FREE, VipTier.VIP, VipTier.SSVIP, VipTier.INFINITY];
    if (tierLevels.indexOf(currentTier) < tierLevels.indexOf(tool.requiredTier)) {
      setIsVipModalOpen(true);
    } else {
      setActiveTool(toolId);
    }
  };

  const toggleLayerVis = (id: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const toggleLayerLock = (id: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, locked: !l.locked } : l));
  };

  const handleLayerSelect = (id: string) => {
    setActiveLayerId(id);
  };

  const renderBrushPreview = () => {
    return (
      <div className="h-16 bg-white w-full rounded-sm border border-gray-600 flex items-center justify-center overflow-hidden relative checkerboard">
        <div 
           className="rounded-full bg-current absolute"
           style={{ 
             width: brushSize, 
             height: brushSize, 
             backgroundColor: activeColor, 
             opacity: opacity,
             filter: activeTool === 'airbrush' ? 'blur(4px)' : 'none'
           }} 
        />
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 64">
           <path 
             d="M 20 32 Q 50 10 90 32 T 180 32" 
             fill="none" 
             stroke={activeColor} 
             strokeWidth={brushSize} 
             strokeOpacity={opacity}
             strokeLinecap="round"
           />
        </svg>
      </div>
    );
  };

  // WRAPPER FOR SCALING
  return (
    <div className="bg-[#111] h-screen w-screen overflow-hidden flex items-center justify-center">
      <div 
        ref={appContainerRef}
        style={{
          width: uiScale < 1 ? '1200px' : '100%',
          height: uiScale < 1 ? '100%' : '100%', // Height usually fits or scrolls, but for an app we want full
          transform: uiScale < 1 ? `scale(${uiScale})` : 'none',
          transformOrigin: 'top left',
          position: uiScale < 1 ? 'absolute' : 'relative',
        }}
        className="flex flex-col h-full bg-[#383838] text-gray-300 font-sans select-none relative shadow-2xl"
      >
        
        {/* SECURITY BAN OVERLAY */}
        {isBanned && (
          <BanScreen 
            bannedUntil={banExpiresAt} 
            reason={banReason}
            ip={myIP}
            machineId={myMachineId}
          />
        )}

        {/* AUTH MODAL */}
        {!isBanned && (
          <AuthModal 
            isOpen={!currentUser} 
            users={users}
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        )}

        {/* --- MENU BAR --- */}
        <header className="h-7 bg-[#2d2d2d] border-b border-black flex items-center px-2 text-xs gap-4 shrink-0">
          <span className="text-lg magic-text mr-2">MagicArt Paint</span>
          <div className="flex gap-3 text-gray-400 items-center">
             <span className="hover:text-white cursor-pointer">Tệp (File)</span>
             <span className="hover:text-white cursor-pointer">Chỉnh sửa</span>
             <span className="hover:text-white cursor-pointer">Vùng vẽ</span>
             <span className="hover:text-white cursor-pointer">Lớp (Layer)</span>
             <div className="hover:text-white cursor-pointer relative group">
                <span>Hiển thị</span>
                <div className="absolute top-full left-0 bg-[#2d2d2d] border border-black p-2 hidden group-hover:block z-50 w-32 shadow-xl">
                   <button 
                    onClick={() => setShowGrid(!showGrid)}
                    className="flex items-center gap-2 w-full text-left hover:bg-gray-700 p-1 rounded"
                   >
                     <Grid size={12} className={showGrid ? "text-blue-400" : "text-gray-500"}/>
                     <span>Lưới (Ô li)</span>
                   </button>
                </div>
             </div>
             
             {/* ADMIN PANEL BUTTON - SECURED */}
             {currentUser?.isAdmin && (
               <button 
                 onClick={() => setIsAdminModalOpen(true)}
                 className="flex items-center gap-1 text-red-500 font-bold hover:text-red-400 animate-pulse border border-red-900 bg-red-900/10 px-2 rounded"
               >
                 <Terminal size={10} />
                 <span>ADMIN PANEL</span>
               </button>
             )}
          </div>
          <div className="ml-auto flex items-center gap-3">
             {currentUser && (
               <div className="flex items-center gap-2 mr-2 border-r border-gray-600 pr-3">
                  <span className="text-gray-400">Hi, <span className="text-white font-bold">{currentUser.username}</span></span>
                  <button onClick={handleLogout} title="Đăng xuất">
                    <LogOut size={14} className="text-gray-500 hover:text-red-400" />
                  </button>
               </div>
             )}

             <button 
               onClick={() => setShowGrid(!showGrid)}
               className={`p-1 rounded hover:bg-gray-700 ${showGrid ? 'text-blue-400 bg-gray-800' : 'text-gray-500'}`}
               title="Bật/Tắt Lưới (Ô li)"
             >
                <Grid size={14}/>
             </button>
             <div 
               onClick={() => setIsVipModalOpen(true)}
               className="cursor-pointer px-2 py-0.5 rounded border border-gray-600 flex flex-col items-center justify-center leading-none bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors min-w-[60px]"
             >
               <span className="text-[7px] text-gray-500 font-bold mb-[1px]">Gói Vip</span>
               <span className={`text-[10px] font-bold ${currentTierConfig.color}`}>
                 {currentTierConfig.label}
               </span>
             </div>
             <Settings size={14} className="cursor-pointer hover:text-white"/>
          </div>
        </header>

        {/* --- MAIN AREA --- */}
        <div className="flex flex-1 overflow-hidden">
          {/* --- 1. FAR LEFT STRIP (System Tools) --- */}
          <div className="w-10 bg-[#333] border-r border-black flex flex-col items-center py-2 gap-1 shrink-0 z-20">
             <div className="w-8 h-8 flex items-center justify-center hover:bg-gray-600 rounded cursor-pointer" title="Di chuyển (Move)"><Move size={16}/></div>
             <div className="w-8 h-8 flex items-center justify-center hover:bg-gray-600 rounded cursor-pointer" title="Chọn (Select)"><MousePointer2 size={16}/></div>
             <div className="w-8 h-8 flex items-center justify-center hover:bg-gray-600 rounded cursor-pointer" title="Bàn tay (Hand)"><Hand size={16}/></div>
             <div className="w-px h-4 bg-gray-600 my-1"/>
             <div className="w-8 h-8 flex items-center justify-center hover:bg-gray-600 rounded cursor-pointer text-blue-400" title="Hoàn tác"><Undo2 size={16}/></div>
             <div className="w-8 h-8 flex items-center justify-center hover:bg-gray-600 rounded cursor-pointer text-blue-400" title="Làm lại"><Redo2 size={16}/></div>
          </div>

          {/* --- 2. LEFT PANEL (Color & Brushes) --- */}
          <div className="w-[260px] flex flex-col bg-gray-app border-r border-black shrink-0 overflow-hidden">
             {/* Color Wheel Section */}
             <div className="p-2 flex flex-col items-center bg-gray-app border-b border-black">
                <ColorWheel color={activeColor} onChange={setActiveColor} size={140} />
                <div className="w-full mt-3 space-y-1 px-2">
                   <div className="flex items-center gap-2">
                      <span className="text-xxs font-mono w-3">H</span>
                      <input 
                        type="range" min="0" max="360" value={currentHSV.h} 
                        onChange={(e) => setActiveColor(hsvToHex(parseInt(e.target.value), currentHSV.s, currentHSV.v))}
                        className="flex-1 h-1.5"
                        style={{ backgroundImage: 'linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)' }}
                      />
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-xxs font-mono w-3">S</span>
                      <input 
                        type="range" min="0" max="100" value={currentHSV.s} 
                        onChange={(e) => setActiveColor(hsvToHex(currentHSV.h, parseInt(e.target.value), currentHSV.v))}
                        className="flex-1 h-1.5 bg-gray-700"
                      />
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-xxs font-mono w-3">V</span>
                      <input 
                        type="range" min="0" max="100" value={currentHSV.v} 
                        onChange={(e) => setActiveColor(hsvToHex(currentHSV.h, currentHSV.s, parseInt(e.target.value)))}
                        className="flex-1 h-1.5 bg-gray-700"
                      />
                   </div>
                </div>
             </div>

             {/* Tool List */}
             <div className="flex-1 flex flex-col min-h-0">
                <div className="panel-header flex justify-between">
                  <span>Công cụ (Tools)</span>
                  <MoreHorizontal size={12}/>
                </div>
                <div className="flex-1 overflow-y-auto p-1 bg-gray-850">
                  <div className="grid grid-cols-2 gap-1">
                    {TOOLS.map((tool) => {
                       const isLocked = [VipTier.FREE, VipTier.VIP, VipTier.SSVIP, VipTier.INFINITY].indexOf(currentTier) < [VipTier.FREE, VipTier.VIP, VipTier.SSVIP, VipTier.INFINITY].indexOf(tool.requiredTier);
                       return (
                        <button
                          key={tool.id}
                          onClick={() => handleToolSelect(tool.id)}
                          className={`
                            flex items-center gap-2 px-2 py-2 rounded-sm border border-transparent text-left group relative
                            ${activeTool === tool.id ? 'tool-active' : 'bg-[#2d2d2d] hover:bg-gray-700 text-gray-400 border-gray-800'}
                          `}
                        >
                          <div className="w-5 h-5 flex items-center justify-center bg-[#1f1f1f] rounded-full shadow-sm border border-gray-600 shrink-0">
                            <tool.icon size={12} />
                          </div>
                          <span className="text-[10px] font-medium truncate flex-1">{tool.name.split('(')[0].trim()}</span>
                          {isLocked && (
                            <div className="absolute top-0 right-0 p-0.5 bg-black/50 rounded-bl">
                               <Lock size={8} className="text-yellow-500" fill="currentColor" />
                            </div>
                          )}
                        </button>
                       )
                    })}
                  </div>
                </div>
             </div>

             {/* Brush Settings */}
             <div className="h-1/3 border-t border-black bg-gray-app flex flex-col">
                <div className="panel-header">Thuộc tính công cụ</div>
                <div className="p-2 space-y-3 overflow-y-auto">
                   {renderBrushPreview()}
                   <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                         <span>Kích thước cọ</span>
                         <span>{brushSize}</span>
                      </div>
                      <input 
                        type="range" min="1" max="100" value={brushSize} 
                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        className="w-full"
                      />
                   </div>
                   <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                         <span>Độ đậm nhạt</span>
                         <span>{Math.round(opacity * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.01" value={opacity} 
                        onChange={(e) => setOpacity(parseFloat(e.target.value))}
                        className="w-full"
                      />
                   </div>
                </div>
             </div>
          </div>

          {/* --- 3. CENTER CANVAS (FULL SCREEN) --- */}
          <main className="flex-1 bg-[#222] relative flex flex-col overflow-hidden">
             <div className="h-6 bg-[#222] flex items-end px-2 gap-1 border-b border-black shrink-0">
                <div className="bg-[#383838] text-gray-200 text-xs px-3 py-1 rounded-t-md border-t border-x border-black flex items-center gap-2">
                   <span>Untitled-1 *</span>
                   <span className="hover:text-white cursor-pointer">×</span>
                </div>
             </div>
             
             <div className="flex-1 relative overflow-hidden bg-gray-500">
                <CanvasBoard 
                    tool={activeTool} 
                    color={activeColor}
                    brushSize={brushSize}
                    opacity={opacity}
                    showGrid={showGrid}
                    locked={activeLayer?.locked || false}
                />
             </div>

             <div className="h-5 bg-[#2d2d2d] border-t border-black flex items-center px-2 text-xxs text-gray-500 justify-between shrink-0">
                <span>Chế độ Toàn màn hình (Lưới Bật)</span>
                <div className="flex gap-4">
                   <span>Zoom: {Math.round(uiScale * 100)}%</span>
                   {activeLayer?.locked && <span className="text-yellow-500 font-bold">LỚP ĐANG KHÓA</span>}
                </div>
             </div>
          </main>

          {/* --- 4. RIGHT PANEL (Nav & Layers) --- */}
          <div className="w-[240px] flex flex-col bg-gray-app border-l border-black shrink-0">
             {/* Navigator */}
             <div className="h-48 border-b border-black flex flex-col">
                <div className="panel-header">Điều hướng (Navigator)</div>
                <div className="flex-1 p-2 bg-gray-850 flex items-center justify-center relative">
                   <div className="w-3/4 h-3/4 bg-white checkerboard relative border border-gray-600">
                      <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs opacity-50">Xem trước</div>
                      <div className="absolute inset-0 border-2 border-red-500 opacity-50"/> 
                   </div>
                </div>
                <div className="h-8 bg-gray-app flex items-center justify-center gap-4 border-t border-gray-700">
                   <ZoomOut size={14} className="cursor-pointer hover:text-white"/>
                   <input type="range" className="w-20 h-1" />
                   <ZoomIn size={14} className="cursor-pointer hover:text-white"/>
                </div>
             </div>

             {/* Layers */}
             <div className="flex-1 flex flex-col min-h-0">
                <div className="panel-header flex justify-between items-center">
                   <span>Lớp (Layers)</span>
                   <div className="flex gap-1">
                      <Plus size={14} className="cursor-pointer hover:text-white"/>
                      <Trash2 size={14} className="cursor-pointer hover:text-white"/>
                   </div>
                </div>
                
                <div className="p-1 bg-gray-app border-b border-gray-700 flex flex-col gap-1">
                   <div className="flex items-center justify-between px-1">
                      <select className="bg-gray-850 border border-gray-700 text-xs rounded px-1 w-24 h-5 outline-none">
                         <option>Bình thường</option>
                         <option>Nhân lớp (Multiply)</option>
                         <option>Làm sáng</option>
                      </select>
                      <div className="flex items-center gap-1 text-xs">
                         <span>Mờ</span>
                         <input type="number" value={100} className="w-10 bg-gray-850 border border-gray-700 h-5 text-center"/>
                      </div>
                   </div>
                   <div className="flex gap-2 px-1 py-1 text-gray-500">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-gray-300"><Lock size={12}/> Khóa</div>
                      <div className="flex items-center gap-1 cursor-pointer hover:text-gray-300"><Grid size={12}/> Mặt nạ</div>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-850 p-0.5 space-y-0.5">
                   {layers.map((layer) => (
                      <div 
                        key={layer.id} 
                        onClick={() => handleLayerSelect(layer.id)}
                        className={`
                          flex items-center h-10 px-1 border border-transparent cursor-pointer group relative
                          ${activeLayerId === layer.id ? 'bg-[#5a86d6] text-white' : 'bg-[#2d2d2d] hover:bg-[#3d3d3d] border-b-black mb-[1px]'}
                        `}
                      >
                         <button onClick={(e) => { e.stopPropagation(); toggleLayerVis(layer.id); }} className="w-6 flex justify-center z-10">
                            {layer.visible ? <Eye size={14}/> : <EyeOff size={14} className="text-gray-600"/>}
                         </button>
                         <div className="w-8 h-8 bg-white mx-1 border border-gray-600 checkerboard shrink-0"/>
                         <span className="text-xs truncate flex-1 px-1 cursor-default select-none">{layer.name}</span>
                         
                         <button 
                           onClick={(e) => { e.stopPropagation(); toggleLayerLock(layer.id); }}
                           className="w-6 h-full flex items-center justify-center hover:bg-white/10 rounded ml-1 z-10"
                           title={layer.locked ? "Mở khóa lớp" : "Khóa lớp"}
                         >
                           {layer.locked ? (
                             <Lock size={12} className="text-yellow-500" fill="currentColor"/>
                           ) : (
                             <Lock size={12} className="text-gray-500 opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity"/>
                           )}
                         </button>
                      </div>
                   ))}
                </div>
             </div>

             {/* Color History */}
             <div className="h-1/4 border-t border-black flex flex-col">
                <div className="panel-header">Lịch sử màu</div>
                <div className="flex-1 bg-gray-850 p-1 overflow-y-auto">
                   <div className="grid grid-cols-6 gap-0.5">
                      {INITIAL_PALETTE.map((c) => (
                        <div 
                          key={c}
                          onClick={() => setActiveColor(c)}
                          className="aspect-square cursor-pointer hover:border border-white"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>

        <VipModal 
          isOpen={isVipModalOpen} 
          onClose={() => setIsVipModalOpen(false)}
          currentTier={currentTier}
          onUpgrade={handleVerifyKey}
        />
        
        <AdminModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          onGenerateKey={generateKey}
          onBanUser={handleBanUser}
          onDebug={handleDebug}
          onToggleAutoResize={setIsAutoResize}
        />

      </div>
    </div>
  );
};

export default App;