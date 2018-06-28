import path from 'path';
import url from 'url';
import { app, Menu , Tray, BrowserWindow, ipcMain, dialog} from 'electron';
import { devMenuTemplate } from './menu/dev_menu_template';
import { editMenuTemplate } from './menu/edit_menu_template';
import { aboutMenuTemplate } from './menu/about_menu_template.js';
import createWindow from './helpers/window';
// import zmq from 'zmq';

import env from './env';
import { getConfig, formatMacaddress } from './conf.js';

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
  // var AutoLaunch = require('auto-launch');
 
  // var minecraftAutoLauncher = new AutoLaunch({
  //     name: 'computer_classroom',
  //     // path: process.execPath,
  // });

  // minecraftAutoLauncher.enable();
  // //minecraftAutoLauncher.disable();
  
  // minecraftAutoLauncher.isEnabled()
  // .then(function(isEnabled){
  //     if(isEnabled){
  //         return;
  //     }
  //     minecraftAutoLauncher.enable();
  // })
  // .catch(function(err){
  //     // handle error
  // });


  //未更改路徑
  const fs = require('fs');
  if(!fs.existsSync('C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\StartUp\\computer_classroom.lnk')){
    //將捷徑放入工作排程
    exec('cd %UserProfile% && cd ../Public && copy /Y Desktop\\computer_classroom.lnk "C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\StartUp"', function(error, stdout, stderr){
    });
  }
  if(fs.existsSync('C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\computer_classroom.lnk')){
    //將捷徑放入工作排程
    fs.unlink('C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\computer_classroom.lnk');
  }

  

  // autoUpdater.checkForUpdates();
  // setApplicationMenu();
  // runSetStartUp();
  //set taskbar
  const nativeImage = require('electron').nativeImage;
  var imageIcon = nativeImage.createFromPath(__dirname + "/images/icon.ico");
  appIcon = new Tray(imageIcon)
  appIcon.setToolTip('電腦教室管理, V1.0.153');//右下方icon顯示版號

  let win = new BrowserWindow({
    width: 850, 
    height: 600, 
    frame: true, //上方選單tool
    fullscreen: true,
    title: '文藻電腦教室-登入',
    autoHideMenuBar: true,
    type: 'desktop',
    // closable: false, //視窗不可手動關閉(按X沒c動作)
  });
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'app.html'),
    protocol: 'file:',
    slashes: true,
  }));
  // win.openDevTools();
  win.show();
});

app.on('window-all-closed', () => {
  // app.quit();
  // var winLockCommand = 'shutdown -L';//登出
  // var winLockCommand = 'shutdown -r -t 12';//reboot
  // exec(winLockCommand);
  app.quit();
});
app.on('will-quit', () => {
  // app.quit();
  // var winLockCommand = 'shutdown -L';//登出
  // var winLockCommand =  'rundll32.exe user32.dll, LockWorkStation';//鎖 螢幕
  // // var winLockCommand = 'shutdown -r -t 12';//reboot
  // exec(winLockCommand);
  var resurrection = '"C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\StartUp\\computer_classroom.lnk"';//bat
  exec(resurrection);//復活自己
});
