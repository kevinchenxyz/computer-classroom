
import path from 'path';
import url from 'url';
import { app, Menu , Tray, BrowserWindow, ipcMain, dialog} from 'electron';
import { devMenuTemplate } from './menu/dev_menu_template';
import { editMenuTemplate } from './menu/edit_menu_template';
import { aboutMenuTemplate } from './menu/about_menu_template.js';
import createWindow from './helpers/window';
// import zmq from 'zmq';

import env from './env';

const {exec} = require('child_process');

const setApplicationMenu = () => {
  const menus = [aboutMenuTemplate];
  if (env.name !== 'production') {
    menus.push(devMenuTemplate);
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== 'production') {
  const userDataPath = app.getPath('userData');
  app.setPath('userData', `${userDataPath} (${env.name})`);
}


let appIcon = null;
// import my_image from '../build/icon.ico'; //relative path to image
// const image = require('./build/icon.ico')
// const image = clipboard.readImage();
// let win = new BrowserWindow({icon: 'icon.ico'})

// autoUpdater.on('update-downloaded', (ev, info) => {
//   // sendStatusToWindow('Update downloaded; will install in 5 seconds');
//   setTimeout(function() {
//     autoUpdater.quitAndInstall();
//   }, 5000)
// });

app.on('ready', () => {

  //開機執行工作排程
  var AutoLaunch = require('auto-launch');
 
  var minecraftAutoLauncher = new AutoLaunch({
      name: 'computer_classroom',
      // path: process.execPath,
  });
  
  minecraftAutoLauncher.enable();
  //minecraftAutoLauncher.disable();
  
  minecraftAutoLauncher.isEnabled()
  .then(function(isEnabled){
      if(isEnabled){
          return;
      }
      minecraftAutoLauncher.enable();
  })
  .catch(function(err){
      // handle error
  });
  // const fs = require('fs');
  // if(!fs.existsSync('C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\StartUp\\computer_classroom.lnk')){
  //   //將捷徑放入工作排程
  //   exec('cd %UserProfile% && cd ../Public && copy /Y Desktop\\computer_classroom.lnk "C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\StartUp"', function(error, stdout, stderr){
  //   });
  // }
  // }
  //快捷見註冊
  // const dialog = require('electron').dialog;
  // const globalShortcut = require('electron').globalShortcut;
  // globalShortcut.register('CommandOrControl+Shift+Esc', function () {
  //   dialog.showMessageBox({
  //     type: 'info',
  //     message: '成功!',
  //     detail: '你按下了一个全局注册的快捷键绑定.',
  //     buttons: ['好的']
  //   });
  // });

  // autoUpdater.checkForUpdates();
  // setApplicationMenu();
  // runSetStartUp();
  //set taskbar
  const nativeImage = require('electron').nativeImage;
  var imageIcon = nativeImage.createFromPath(__dirname + "/images/icon.ico");
  appIcon = new Tray(imageIcon)
  appIcon.setToolTip('電腦教室管理, V0.0.2');//右下方icon顯示版號

  let win = new BrowserWindow({
    width: 350, 
    height: 200, 
    frame: true,
    x:0,
    y:0,
    title: '電腦教室借用管理',
    autoHideMenuBar: true,
    closable: false, //視窗不可手動關閉(按X沒動作)
  });

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'app.html'),
    protocol: 'file:',
    slashes: true,
  }));
  // win.openDevTools();
  win.show();
  // mainWindow.loadURL(url.format({
  //   pathname: path.join(__dirname, 'app.html'),
  //   protocol: 'file:',
  //   slashes: true,
  // }));
    // mainWindow.openDevTools();
});

app.on('window-all-closed', () => {
  // app.quit();
  var winLockCommand = 'shutdown -L';//登出
  // var winLockCommand = 'shutdown -r -t 12';//reboot
  exec(winLockCommand);
});
