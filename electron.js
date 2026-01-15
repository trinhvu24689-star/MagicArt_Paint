import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Tái tạo __dirname trong môi trường ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  // 1. Tạo cửa sổ trình duyệt
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    icon: path.join(__dirname, 'public/icon.png'), // Đảm bảo bạn có file icon trong public
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Cho phép load local resource nếu cần
    },
    autoHideMenuBar: true, // Ẩn thanh menu
    frame: true, // Hiện khung viền window
    backgroundColor: '#1e1e1e'
  });

  // 2. Load ứng dụng
  const isDev = !app.isPackaged;
  
  if (isDev) {
    // Vite mặc định chạy ở port 5173 (không phải 3000)
    win.loadURL('http://localhost:5173'); 
    win.webContents.openDevTools(); // Mở DevTools khi code
  } else {
    // Khi build xong, load file từ thư mục dist
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});