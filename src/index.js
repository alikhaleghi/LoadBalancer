const { app, BrowserWindow } = require('electron');
const path = require('node:path');

const {  Menu, Tray } = require('electron')


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    titleBarStyle: 'hidden', 

    titleBarOverlay: true,
    maximizable: false,
    backgroundMaterial: "acrylic",
    minWidth: 385,
    minHeight:435,
    maxWidth: 385,
    maxHeight:435,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
			nodeIntegrationInWorker: true,
    },
  }); 

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

let tray = null
app.whenReady().then(() => { 

  // Create additional windows for other pages
  // const aboutWindow = new BrowserWindow({
  //   width: 600,
  //   height: 400,
  //   webPreferences: {
  //     nodeIntegration: true,
  //   },
  // });
  // aboutWindow.loadFile('about.html');

  const isMac = process.platform === 'darwin'
  tray = new Tray(__dirname + '/assets/images.png')
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio' },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' }
  ])
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)

  const template = [
    // { role: 'appMenu' }
    ...(isMac
      ? [{
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
          ]
        }]
      : []),
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
  ]
    
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
})
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
