const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const usbDetect = require('usb-detection');
const fs = require('fs');
const drivelist = require('drivelist');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  usbDetect.startMonitoring();

  usbDetect.on('add', async (device) => {
    const drives = await drivelist.list();
    const usbDrives = drives.filter(drive => drive.isUSB && drive.mountpoints.length > 0);

    if (usbDrives.length > 0) {
      usbDrives.forEach(usbDrive => {
        const deviceWithMountPoints = {
          ...device,
          mountpoints: usbDrive.mountpoints,
        };
        mainWindow.webContents.send('usb-storage-added', deviceWithMountPoints);
        openDevicePopup('Device Added', `Port: ${device.deviceAddress}`, device);
      });
    } else {
      mainWindow.webContents.send('usb-input-added', device);
      openDevicePopup('Device Added', `Port: ${device.deviceAddress}`, device);
    }
  });

  usbDetect.on('remove', async (device) => {
    const drives = await drivelist.list();
    const usbDrives = drives.filter(drive => drive.isUSB && drive.mountpoints.length > 0);
    mainWindow.webContents.send('usb-removed', device);
    openDevicePopup('Device Removed', `Port: ${device.deviceAddress}`, device);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
  usbDetect.stopMonitoring();
});

ipcMain.on('fetch-files', (event, drivePath) => {
  fs.readdir(drivePath, (err, files) => {
    if (err) {
      event.reply('files-list', { success: false, error: err.message });
    } else {
      const fileDetails = files.map(file => ({
        name: file,
        path: path.join(drivePath, file)
      }));
      event.reply('files-list', { success: true, files: fileDetails });
    }
  });
});

ipcMain.on('fetch-file-content', (event, filePath) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      event.reply('file-content', { success: false, error: err.message });
    } else {
      event.reply('file-content', { success: true, content: data });
    }
  });
});

ipcMain.on('open-file', (event, filePath) => {
  shell.openPath(filePath).catch(err => console.error('Error opening file:', err));
});

ipcMain.on('check-storage-devices', async (event) => {
  const drives = await drivelist.list();
  const usbDrives = drives.filter(drive => drive.isUSB && drive.mountpoints.length > 0);
  usbDrives.forEach(usbDrive => {
    mainWindow.webContents.send('usb-storage-added', { mountpoints: usbDrive.mountpoints });
  });
});

function openDevicePopup(title, message, device) {
  let popupFile = 'popup.html'; 
  if (title.includes('Added')) {
    popupFile = 'popup_added.html';
  } else if (title.includes('Removed')) {
    popupFile = 'popup_removed.html';
  }

  const popupWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  popupWindow.loadFile(popupFile);

  popupWindow.webContents.on('did-finish-load', () => {
    popupWindow.webContents.send('device-info', { title, message, device });
  });
}
