const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
  // 1. Tạo cửa sổ trình duyệt
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    icon: path.join(__dirname, 'public/icon.png'), // Bạn cần để file icon.png vào thư mục public
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true, // Ẩn thanh menu mặc định của Windows
    frame: true, // Giữ khung viền Window chuẩn
  });

  // 2. Load ứng dụng
  // Trong môi trường Dev: Load localhost
  // Trong môi trường Prod (khi build ra exe): Load file index.html
  const isDev = !app.isPackaged;
  
  if (isDev) {
    win.loadURL('http://localhost:3000'); // Port mặc định của Vite/React
    win.webContents.openDevTools(); // Mở bảng debug khi đang code
  } else {
    // Khi build xong, nó sẽ load file từ thư mục dist
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