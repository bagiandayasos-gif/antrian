const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Sentra Pelayanan Kito - Dinsos Kota Tanjungbalai',
    icon: path.join(__dirname, 'public/logo-tanjungbalai.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load compiled Vite app
  win.loadFile(path.join(__dirname, 'dist/index.html'));
  win.setMenu(null); // Hide default menu bar for clean app look
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
