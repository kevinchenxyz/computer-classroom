(function () {'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var path = _interopDefault(require('path'));
var url = _interopDefault(require('url'));
var electron = require('electron');
var jetpack = _interopDefault(require('fs-jetpack'));

// This helper remembers the size and position of your windows (and restores
// them in that place after app relaunch).
// Can be used for more than one window, just construct many
// instances of it and give each different name.

// Simple wrapper exposing environment variables to rest of the code.

// The variables have been written to `env.json` by the build process.
const env = jetpack.cwd(__dirname).read('env.json', 'json');

// import zmq from 'zmq';

const {exec} = require('child_process');

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== 'production') {
  const userDataPath = electron.app.getPath('userData');
  electron.app.setPath('userData', `${userDataPath} (${env.name})`);
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

electron.app.on('ready', () => {

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
  appIcon = new electron.Tray(imageIcon);
  appIcon.setToolTip('電腦教室管理, V0.0.2');//右下方icon顯示版號

  let win = new electron.BrowserWindow({
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

electron.app.on('window-all-closed', () => {
  // app.quit();
  var winLockCommand = 'shutdown -L';//登出
  // var winLockCommand = 'shutdown -r -t 12';//reboot
  exec(winLockCommand);
});

}());
//# sourceMappingURL=background.js.map