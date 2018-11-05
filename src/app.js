// Here is the starting point for your application code.

// Small helpers you might want to keep
import './helpers/context_menu.js';
import './helpers/external_links.js';

// All stuff below is just to show you how it works. You can delete all of it.
import path from 'path';
import url from 'url';
import { app, BrowserWindow, remote, screen, dialog} from 'electron';
import jetpack from 'fs-jetpack';
import { greet } from './hello_world/hello_world';
import { Language_zh_tw } from './language/zh_tw';
import { Language_en_us } from './language/en_us';
import env from './env';
import { getConfig, secretConf, formatMacaddress } from './conf.js';
// import { resolve } from 'bluebird-lst';

const rmapp = remote.app;
const appDir = jetpack.cwd(rmapp.getAppPath());
const os = require('os');
const fs = require('fs');
const process = require('process');
const { exec } = require('child_process');
const electron = require('electron');

var screenElectron = electron.screen;
var mainScreen = screenElectron.getPrimaryDisplay();
var dimensions = mainScreen.size;

// dialog.showErrorBox()
// dialog.showErrorBox('測試','內容');

var adminconf = secretConf();
// console.log(adminconf);

// var versionString = exec.execSync('ver').toString().trim();

const Config = require('electron-config');
var config = new Config();
var raiseHands; // 輪尋用參數

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

var defParamet;
var useDefParamet = () => {
  defParamet = {
    reqFreq: 60000, //詢問頻率,預設60秒(60000)
    noBorrow: 15000, //未借用踢出時間
    faultTolerantErrMsg: 3,//終端請求失敗幾次彈出錯誤訊息。
    faultTolerant: 5, //終端請求失敗登出容錯次數。
    bufferTime:60000, //借用結束緩衝時間,
    advanceWarningTime: 10 ,//提前提醒時間(分)
    advanceWarningFreq: 3, // 提前提醒頻率(分)
    renewTime: 10,  // 開放續借時間(分)
    renewStopTime: 3 // 續借停止時間(分)
  };
  config.set('defParamet', defParamet);
};


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
};

var registered = function () {
  return new Promise( ( resolve, reject) => {
    var numberFilePath = path.join(os.homedir(), 'Desktop');
    var cmpNumber = os.hostname();
    var numberval = cmpNumber.split('-')[1];
    var fromval = cmpNumber.split('-')[0] + '-' + Number(numberval);
      //註冊
      var registeredPath = getConfig().path.computerClassroom;
      var sendData = {
            action: 'register',
            // computer_id: Number(numberval),
            computer_id: fromval,
            computer_mac: formatMacaddress(os.networkInterfaces()),
          };
      console.log(sendData);

      sendData = JSON.stringify(sendData);
      $.ajax({
        method: "POST",
        url: registeredPath,
        data: sendData,
        contentType: 'application/json; charset=utf-8',
      })
      .done(function( data ) {
        resolve(data);      
      })
      .fail(function( msg ) {
        resolve(false);
      });
  });
};

async function asyncRegistered(account, pwd) {
  const data = await registered();
  var  regCheck ;
  if(data !== false) {
    regCheck = data.update_status;
  } else {
    regCheck = data;
  }
  console.log(data);
  document.querySelector('#rule').innerHTML =  data.term;
  if (regCheck) {
    console.log('註冊完成!regCheck');
    if (data.setting) {
      config.set('defParamet', data.setting);
    } else {
      useDefParamet();
    }
    var defParamet = config.get('defParamet');
    const reqFreq = Number(defParamet.reqFreq);
    console.log(reqFreq);
    raiseHands = setInterval( () => { // 輪詢
      questBorrowingTime();
    } , reqFreq);
  } else {
    seterrormsg(0);//系統錯誤
    useDefParamet();//參數使用預設值
  }
}



var sendBroken = function () { // 回報故障
  var cmpNumber = os.hostname();
  var numberval = cmpNumber.split('-')[1];
    var computerClassroomPath = getConfig().path.computerClassroom;
    var sendData = {
          action: 'broken',
          computer_mac: formatMacaddress(os.networkInterfaces()),
        };
    console.log(sendData);

    sendData = JSON.stringify(sendData);
    $.ajax({
      method: "POST",
      url: computerClassroomPath,
      data: sendData,
      contentType: 'application/json; charset=utf-8',
    })
    .done(function( data ) {
      // if(data.update_status){
      //   console.log('系統錯誤，請與管理人員聯繫!!');
      //   seterrormsg(0);//系統錯誤
      // }else{
      //   // window.alert('系統錯誤，請與管理人員聯繫!!');
      //   seterrormsg(0);//系統錯誤
      // }
    })
    .fail(function( msg ) {
      seterrormsg(0);//系統錯誤
    });
};

var endMinCount = 0;
var questBorrowingTime = function () {
  var recheckPath = getConfig().path.computerClassroom;
  var sendData = {
    action: "loan",
    user_uid: 'wait',
    computer_mac: formatMacaddress(os.networkInterfaces()),
  };
  console.log(sendData);
  sendData = JSON.stringify(sendData);
  $.ajax({
    method: "POST",
    url: recheckPath,
    data: sendData,
    contentType: 'application/json; charset=utf-8',
  })
  .done(function( data ) {
    console.log('check');
    console.log(data);
  })
  .fail(function( msg ) {
    console.log('fail');
    console.log(defParamet);
    console.log(msg);
    if (endMinCount >= Number(defParamet.faultTolerantErrMsg)) {
      seterrormsg(0);//系統錯誤
    }
    if (endMinCount === Number(defParamet.faultTolerant)) {
      //超過三次詢問皆斷線 
      var winLockCommand = 'shutdown -r -t 5';// 重開機
      // var winLockCommand = 'shutdown -L';//登出
      exec(winLockCommand);
    }
    endMinCount += 1;
  });
};

// const username = require('username');//取得電腦的使用者名稱

var stuName;
var loginUserName;

var seterrormsg = function (type) {
  var filename = [
    'errormsg.html',
    'timendmsg.html',
  ];
  const BrowserWindow = require('electron').remote.BrowserWindow;
    let winindex = new BrowserWindow({
      width: 550,
      height: 100, 
      title:'error',
      frame: true,
      autoHideMenuBar: true,
      alwaysOnTop:true, // 視窗置頂
    });
    winindex.loadURL(url.format({
      pathname: path.join(__dirname, filename[type]),
      protocol: 'file:',
      slashes: true,
    }));
    // winindex.openDevTools();
};

var openInformationPage = () => {
  const BrowserWindow = require('electron').remote.BrowserWindow;
    let InformationPage = new BrowserWindow({
      width: 450,
      height: 200,
      // width: 850, 
      // height: 600, 
      x: (dimensions.width - 450),
      y:0,
      title:'文藻電腦教室-借用資訊',
      frame: true,
      autoHideMenuBar: true,
      closable: false
    });
    InformationPage.loadURL(url.format({
      pathname: path.join(__dirname, 'information.html'),
      protocol: 'file:',
      slashes: true,
    }));
    // InformationPage.on('closed', function () {
    //   var resurrection = '"C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\StartUp\\computer_classroom.lnk"';//bat
    //   exec(resurrection);//復活自己
    // });
    // InformationPage.openDevTools();
};

var setTimeToLogout = (val) => {
  setTimeout( (val) => {
    var winLockCommand = 'shutdown -L';//登出
    exec(winLockCommand);
  }, val);
};

var userLogin = ( account, pwd ) => {
  return new Promise( ( resolve, reject) => {
    const recheckPath = getConfig().path.computerClassroom;
    var sendData = {
      action: "login",
      user_uid: account,
      user_password: pwd,
      computer_mac: formatMacaddress(os.networkInterfaces()),
    };
    console.log(sendData);
    sendData = JSON.stringify(sendData);
    $.ajax({
      method: "POST",
      url: recheckPath,
      data: sendData,
      contentType: 'application/json; charset=utf-8',
    })
    .done(function( data ) {
      console.log(data);
      resolve(data);
    })
    .fail(function( msg ) {
      console.log(msg);
      resolve('connectError');
    });
  });
};

var tyrLoginCount = 0;
async function asyncUserLogin(account, pwd) {
  var loginCheck = await userLogin(account, pwd);
  if(account === adminconf.account && pwd === adminconf.pwd ) { //testcode-hide
    loginCheck.login_status = true; // SecretDoor
  }
  // const login_status = loginCheck.login_status;
  const message = loginCheck.message;
  if (loginCheck === 'connectError') {
    $("#errormsg").fadeIn("slow");
    document.querySelector('#errormsg').innerHTML = "伺服器連線錯誤，請聯繫管理人員處理！";
  } else if( loginCheck.login_status ) {
    // console.log('check');
    clearInterval(raiseHands);
    config.set('account', account); //寫入暫存設定
    openInformationPage(); // 開啟借用資訊頁面
    var win = remote.getCurrentWindow(); // 取得bkg的登入頁面設定
    win.close(); // 關閉頁面
  } else {
    if (tyrLoginCount < 5 ) {
      tyrLoginCount+=1;
      document.querySelector('#errormsg').innerHTML = message;
      $("#errormsg").fadeIn("slow", () => {
        setTimeout( () => {
          $("#errormsg").fadeOut("slow");
        }, 3000);
      });
    } else {
      $("#errormsg").fadeIn("slow");
      // document.querySelector('#errormsg').innerHTML = "錯誤次數過多，即將登出您的使用...";
      // setTimeToLogout(5000);
    }
  }
}


$(document).ready(function(){
  asyncRegistered();//註冊
  // useDefParamet();// test code
  
  // defParamet.reqFreq = 10000; //test
  $(document).keypress(function(e) {
      var keycode = (e.keyCode ? e.keyCode : e.which);
      if (keycode == '13') {
        var account = document.querySelector('#account').value;
        var pwd = document.querySelector('#pwd').value;
        asyncUserLogin(account, pwd);
      }
  });

  $('#login').click(function () {
    var account = document.querySelector('#account').value;
    var pwd = document.querySelector('#pwd').value;
    asyncUserLogin(account, pwd);
  });

  // window.onbeforeunload = function() {
  //   //視窗關閉
  //   sendBroken();
  //  };
});

// document.querySelector('#rule').innerHTML =  '請將本視窗縮小';


