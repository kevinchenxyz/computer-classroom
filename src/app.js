// Here is the starting point for your application code.

// Small helpers you might want to keep
import './helpers/context_menu.js';
import './helpers/external_links.js';

// All stuff below is just to show you how it works. You can delete all of it.
import path from 'path';
import url from 'url';
import { BrowserWindow, remote, screen} from 'electron';
import jetpack from 'fs-jetpack';
import { greet } from './hello_world/hello_world';
import { Language_zh_tw } from './language/zh_tw';
import { Language_en_us } from './language/en_us';
import env from './env';
import { getConfig } from './conf.js';

const app = remote.app;
const appDir = jetpack.cwd(app.getAppPath());
const os = require('os');
const fs = require('fs');
const process = require('process');
const { exec } = require('child_process');
const electron = require('electron');

var screenElectron = electron.screen;
var mainScreen = screenElectron.getPrimaryDisplay();
var dimensions = mainScreen.size;

// var versionString = exec.execSync('ver').toString().trim();


const powerShell = require('node-powershell');

// Holy crap! This is browser window with HTML and stuff, but I can read
// here files form disk like it's node.js! Welcome to Electron world :)
const manifest = appDir.read('package.json', 'json');

const osMap = {
  win32: 'Windows',
  darwin: 'macOS',
  linux: 'Linux',
};

const pressenv = process.env;
var language = pressenv.LANG || pressenv.LANGUAGE || pressenv.LC_ALL || pressenv.LC_MESSAGES;
var language_code = null;
if(language){
  language = language.toLowerCase();
  language = language.split('.');
  language_code = language[0];
}

var itemName;
switch (language_code) {
  case 'zh_tw':
  itemName = Language_zh_tw;
    break;
  case 'en_us':
  itemName = Language_en_us;
    break;

  default:
  itemName = Language_en_us;
    break;
}
// console.log(os.networkInterfaces().eth0.address);

var formatIpaddress = function (ipobj) {
  var rtdata='';
  Object.keys(ipobj).forEach(function (ifname) {
    var alias = 0;
  
    ipobj[ifname].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }
  
      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        rtdata += iface.address;
        // console.log(ifname + ':' + alias, iface.address);
      } else {
        // this interface has only one ipv4 adress
        // console.log(ifname, iface.address);
        rtdata += iface.address;
      }
      ++alias;
    });
  });
  return rtdata;
}
var formatMacaddress = function (ipobj) {
  var rtdata='';
  Object.keys(ipobj).forEach(function (ifname) {
    var alias = 0;
  
    ipobj[ifname].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }
  
      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        rtdata += iface.mac;
        // console.log(ifname + ':' + alias, iface.address);
      } else {
        // this interface has only one ipv4 adress
        // console.log(ifname, iface.address);
        rtdata += iface.mac;
      }
      ++alias;
    });
  });
  return rtdata;
}

var registered = function () {
  // const fs = require('fs');
  var numberFilePath = path.join(os.homedir(), 'Desktop');
  fs.readFile(numberFilePath + '\\number.txt',function(err, data){
    if (err) throw err;
    var numberAndHash = data.toString();
    var numberval = numberAndHash.split('-')[0];
    var hashval = numberAndHash.split('-')[1].toLowerCase();
    if (hashval === '746c4a669516595d9b03b8517f7fede9' ) {
      //註冊
        var registeredPath = getConfig().path.computerClassroom;
        var sendData = {
              action: 'register',
              // "action": "loan",
              computer_id: numberval,
              // "user_uid": "admin",
              computer_mac: formatMacaddress(os.networkInterfaces()),
            };
        sendData = JSON.stringify(sendData);
        $.ajax({
          method: "POST",
          url: registeredPath,
          data: sendData,
          contentType: 'application/json; charset=utf-8',
        })
        .done(function( data ) {
          if(data.update_status){
            window.alert('註冊完成!');
            fs.unlinkSync(numberFilePath + '\\number.txt', (err) => {
              if (err) throw err;
              console.log('number.txt was deleted');
            });
          }else{
            window.alert('註冊失敗，請與管理人員聯繫!!');
          }
        })
        .fail(function( msg ) {
          window.alert('註冊失敗，請與管理人員聯繫!!');
        });
      } else {
        window.alert('註冊失敗，驗證錯誤!!');
      }
  });
};
// const fs = require('fs');
const numberFilePath = path.join(os.homedir(), 'Desktop');
fs.stat(numberFilePath + '\\number.txt', function(err, stat) {
  if(err == null) {
    registered();
  } else if(err.code == 'ENOENT') {
    console.log('ENOENT: ', err.code);
      // file does not exist
      // fs.writeFile('log.txt', 'Some log\n');
  } else {
    console.log('Some other error: ', err.code);
  }
});



//config
const Config = require('electron-config');
var config = new Config();
config.set('unicorn', '🦄');
console.log(config.get('unicorn'));
//=> '🦄'

// Use dot-notation to access nested properties
// config.set('install', false);
console.log('install');
if(!config.get('install')){
  config.set('install', true);
}else{
  config.set('checkinstall', false);
}
console.log(config.get('install'));
//=> {bar: true}

config.delete('install');
console.log(config.get('install'));

const username = require('username');


var stuName;
username().then(username => {
  console.log(username);
  stuName = username;
  document.querySelector('#username').innerHTML = '使用者名稱：' + username;
	//=> 'sindresorhus'
});

var seterrormsg = function (type) {
  var filename = [
    'errormsg.html',
    'timendmsg.html',
  ]
  const BrowserWindow = require('electron').remote.BrowserWindow;
    // let w = remote.getCurrentWindow()
    // w.close();
    let winindex = new BrowserWindow({
      width: 400, 
      height: 100, 
      title:'error',
      frame: true,
      autoHideMenuBar: true,
    });
    winindex.loadURL(url.format({
      pathname: path.join(__dirname, filename[type]),
      protocol: 'file:',
      slashes: true,
    }));
    // winindex.openDevTools();
};

// var cpus = os.cpus();
$(document).ready(function(){
  var endMinCount = 0;
  var questBorrowingTime = function () {
    var recheckPath = getConfig().path.computerClassroom;
    var sendData = {
      action: "loan",
      user_uid: os.hostname(),
      computer_mac: formatMacaddress(os.networkInterfaces()),
    };
    sendData = JSON.stringify(sendData);
    $.ajax({
      method: "POST",
      url: recheckPath,
      data: sendData,
      contentType: 'application/json; charset=utf-8',
    })
    .done(function( data ) {
      if(data.update_status){
        if(data.etime < 5 && data.etime > 0 ) {
          // remindEndMsg
          seterrormsg(1);//借用結束
          // window.alert('借用時間即將結束，請儘速保存您的資料！');
          document.querySelector('#remindEndMsg').innerHTML =  '借用時間即將結束，需要續借請至服務台申請！';
        } else if (data.etime < 1 || data.etime === 1 ) {
          clearInterval(raiseHands);
          setTimeout(function () {
            var winLockCommand = 'shutdown -L';//登出
            exec(winLockCommand);
          }, 60000);
        }
        document.querySelector('#screen').innerHTML =  '借用時間:' + data.period;
        document.querySelector('#endtime').innerHTML =  '剩餘時間:' + data.etime + '分鐘';
      } else {
        endMinCount += 1;
        seterrormsg(0);//系統錯誤
        if (endMinCount === 5) {
          //超過三次詢問皆斷線 
          var winLockCommand = 'shutdown -L';//登出
          exec(winLockCommand);
        }
      }
    })
    .fail(function( msg ) {
      endMinCount += 1;
      if (endMinCount >= 3) {
        seterrormsg(0);//系統錯誤
      }
      if (endMinCount === 5) {
        //超過三次詢問皆斷線 
        var winLockCommand = 'shutdown -L';//登出
        exec(winLockCommand);
      }
    });
  };
  questBorrowingTime();
  var raiseHands = setInterval(questBorrowingTime,15000);
  // var raiseHands = setInterval(questBorrowingTime,60000);

  $('#logout').click(function () {
    var winLockCommand = 'shutdown -L';//登出
    exec(winLockCommand);
  });
  $('#temDep').click(function () {
    var winLockCommand = 'rundll32.exe user32.dll, LockWorkStation';//鎖 螢幕
    // var winLockCommand = 'shutdown -r -t 12';//reboot
    exec(winLockCommand);
  });
});

// const dialog = require('electron').dialog;
// console.log(dialog.showOpenDialog({ properties: [ 'openFile', 'openDirectory', 'multiSelections' ]}));
// const {dialog} = require('electron').remote
// console.log(dialog)
//item title

document.querySelector('#remind').innerHTML =  '請將本視窗縮小';
document.querySelector('#screen').innerHTML =  '借用時間: 確認中...';
document.querySelector('#endtime').innerHTML =  '剩餘時間: 確認中...';
// document.querySelector('#setErrorMsg').innerHTML =  versionString;

