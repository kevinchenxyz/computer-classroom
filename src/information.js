
import { getConfig, secretConf, formatMacaddress } from './conf.js';
import path from 'path';
import url from 'url';
import { app, BrowserWindow, remote, screen} from 'electron';

const os = require('os');

const {exec} = require('child_process');

var registeredPath = getConfig().path.computerClassroom;

const Config = require('electron-config');// 設定參數
var config = new Config();
const account = config.get('account');//使用者資訊
var defParamet = config.get('defParamet');//電腦教室參數
var adminconf = secretConf();

var seterrormsg = function (type) {
  var filename = [
    'errormsg.html',
    'timendmsg.html',
  ];
  const BrowserWindow = require('electron').remote.BrowserWindow;
    // let w = remote.getCurrentWindow()
    // w.close();
    let winindex = new BrowserWindow({
      width: 550,
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
    });
    winindex.loadURL(url.format({
      pathname: path.join(__dirname, filename[type]),
      protocol: 'file:',
      slashes: true,
    }));
    // winindex.openDevTools();
};


var alertcount = 0;
var endMinCount = 0;
var alertcheck = true;
var setMsg;
var questBorrowingTime = function (account) {
  var recheckPath = getConfig().path.computerClassroom;
  var sendData = {
    action: "loan",
    user_uid: account,
    computer_mac: formatMacaddress(os.networkInterfaces()),
  };
  console.log(recheckPath);
  console.log(sendData);
  sendData = JSON.stringify(sendData);
  $.ajax({
    method: "POST",
    url: recheckPath,
    data: sendData,
    contentType: 'application/json; charset=utf-8',
  })
  .done(function( data ) {
    console.log('done');
    console.log(data);
    data.etime = '10'; //test
    data.update_status = true; //test
    data.etime = Number(data.etime); 
    endMinCount = 0;
    if(data.update_status){
      config.set('loan_id',data.loan_id);
      const advanceWarningTime = Number(defParamet.advanceWarningTime);
      const advanceWarningFreq = Number(defParamet.advanceWarningFreq);
      if(data.etime === advanceWarningTime && alertcheck ) {
        console.log('run error');
        alertcheck = false;
        alertcount = advanceWarningFreq * 60000;
        setMsg = setInterval( () => {
          console.log('testcodes');//test
          seterrormsg(1);
          // window.alert('借用即將結束，如需續借請點選續借按鈕！');
        }, alertcount);// 定時詢問
      }
      if(data.etime < advanceWarningTime ) {
        // remindEndMsg5
        seterrormsg(1);//借用結束
        // window.alert('借用時間即將結束，請儘速保存您的資料！');
        document.querySelector('#remindEndMsg').innerHTML =  '借用即將結束，請在結束前三分鐘進行續借！';
      } else if (data.etime < 1 || data.etime === 0 ) {
        clearInterval(raiseHands);
        setTimeout(function () {
          var winLockCommand = 'shutdown -L';//登出
          exec(winLockCommand);
        }, Number(defParamet.bufferTime));
      } else {
        if(data.etime > advanceWarningTime) {
          console.log('no setmsg');

        if(setMsg){
          clearInterval(setMsg);
          setMsg = null;
        }
        alertcheck = true;
        }
      }
      if ( data.etime < 3 ) {
        $('#renewBtn').hide();
        document.querySelector('#remindEndMsg').innerHTML =  '借用即將結束，請儘速儲存您的作業！';
      }
      document.querySelector('#screen').innerHTML =  '借用時間:' + data.period;
      document.querySelector('#endtime').innerHTML =  '剩餘時間:' + data.etime + '分鐘';
    } else {
      //系統錯誤
      // if (endMinCount ===  3)) {
      // //回傳狀態失敗即為非借用狀態
      //   var winLockCommand = 'shutdown -L';//登出
      //   exec(winLockCommand);
      // }
      if( account !== adminconf.account) {
        seterrormsg(0);
        setTimeout( function () {
          var winLockCommand = 'shutdown -L';//登出
          exec(winLockCommand);
        }, Number(defParamet.noBorrow));
        endMinCount += 1;
      }
      
    }
  })
  .fail(function( msg ) {
    console.log('fail');
    console.log(msg);
    if (endMinCount >= Number(defParamet.faultTolerantErrMsg)) {
      seterrormsg(0);//系統錯誤
    }
    if (endMinCount === Number(defParamet.faultTolerant)) {
      //超過三次詢問皆斷線 
      var winLockCommand = 'shutdown -L';//登出
      exec(winLockCommand);
    }
    endMinCount += 1;
  });
};

var logoutCount = false; // 停止借用確認
var resetLogoutCount = () => { // 重設確認變數
  setTimeout( () => {
    logoutCount = false;    
  }, 10000);
};

var sendLogout = () => {
    // 停止借用+登出
    var registeredPath = getConfig().path.computerClassroom;
    var sendData = {
          action: 'register',
          // computer_id: Number(numberval),
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
      if(data.update_status){
        console.log('註冊完成!');
      }else{
        seterrormsg(0);//系統錯誤
      }
    })
    .fail(function( msg ) {
      seterrormsg(0);//系統錯誤
    });
}

var renew = (account) => {
  // 續借
  var loan_id = config.get('loan_id');
  var registeredPath = getConfig().path.computerClassroom;
  var sendData = {
        action: 'renew',
        user_uid: account,
        computer_mac: formatMacaddress(os.networkInterfaces()),
        loan_id: loan_id
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
    console.log(data);
    if(data.renew_status){
      console.log('續借完成!');
      questBorrowingTime(account);
      window.alert('續借完成','續借成功');

    }else{
      window.alert(data.message,'續借失敗！');
    }
  })
  .fail(function( msg ) {
    window.alert('系統錯誤，請聯絡管理人員','續借失敗！');
  });
}

var stopUse = () => {
  var loan_id = config.get('loan_id');
  var registeredPath = getConfig().path.computerClassroom;
  var sendData = {
        action: 'stop',
        user_uid: account,
        computer_mac: formatMacaddress(os.networkInterfaces()),
        loan_id: loan_id
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
    console.log(data);
    if(data.update_status){
      console.log('停止借用');
      var winLockCommand = 'shutdown -L';//登出
      exec(winLockCommand);
    } else {
      window.alert('請再次點選停止借用或聯繫管理員','停用失敗！');
    }
  })
  .fail(function( msg ) {
    window.alert('系統錯誤，請聯絡管理人員','停用失敗！');
  });
};


$(document).ready(function(){
  questBorrowingTime(account);
  const reqFreq = Number(defParamet.reqFreq)
  var raiseHands = setInterval( () => {
    questBorrowingTime(account);
  }, reqFreq);// 定時詢問
  $('#logout').click( () => {
    if(!logoutCount) {
      window.alert('點選確認定，請再次點選『停止借用』按鈕確定停止本次借用！');
      logoutCount = true;
      resetLogoutCount();
    } else if (logoutCount) {
      stopUse();
    }
  });
  $('#temDep').click(function () {
    var winLockCommand = 'rundll32.exe user32.dll, LockWorkStation';//鎖 螢幕
    // var winLockCommand = 'shutdown -r -t 12';//reboot
    exec(winLockCommand);
  });

  $('#renewBtn').click('on', () => {
    console.log(account);
    renew(account);
  });

  if(account === adminconf.account) {
    $('#renewBtn').hide();
    $('#logout').hide();
    $('#temDep').hide();
  }

  document.querySelector('#screen').innerHTML =  '借用時間(time): 確認中...';
  document.querySelector('#endtime').innerHTML =  '剩餘時間(timing): 確認中...';
  document.querySelector('#remind').innerHTML =  '請將本視窗縮小';
  document.querySelector('#username').innerHTML =  '使用者(Account)：' + account;
});
