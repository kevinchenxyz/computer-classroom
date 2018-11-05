(function () {'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var path = _interopDefault(require('path'));
var url = _interopDefault(require('url'));
require('electron');

const getConfig = () => {
    const confData = {
        'path': {
            // computerClassroom: "http://192.168.1.59/zf2/kurogo_wzu_push/public/api/computer"
            computerClassroom: "http://192.168.1.207/push/api/computer"
            // computerClassroom: "http://140.127.170.153/push/api/computer"
            // computerClassroom: "http://140.127.170.14/push/api/computer"
        }
    };
    return confData;
};

const formatMacaddress = function (ipobj) {
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
};

const secretConf = () => {
    const adminData = {
        'account':  'wzuadmin',
        'pwd': 'wzu073426031'
    };
    return adminData;
};


// export const Language_en_us = {
//     'title': 'Information About Your Computer',
//     'ip_address': 'IP Address',
//     'mac_address': 'MAC Address',
//     'computer_name': 'Computer Name',
//     'memory': 'Memory',
//     'screen_resolution': 'Screen Resolution',
//     'windows_version': 'Windows Version',
//     'cpu': 'CPU',
//     'hotfix': 'HotFix Imformations',
// };

const os = require('os');

const {exec} = require('child_process');

const Config = require('electron-config');// 設定參數
var config = new Config();
const account = config.get('account');//使用者資訊
var defParamet = config.get('defParamet');//電腦教室參數
console.log(defParamet);

var adminconf = secretConf();
console.log(adminconf);

var seterrormsg = function (type) {
  var filename = [
    'errormsg.html',
    'timendmsg.html',
    'stopError.html',//停借用的錯誤
    'stopeRecheck.html',//停借用的二次確認
  ];
  const BrowserWindow$$1 = require('electron').remote.BrowserWindow;
    var winindex = new BrowserWindow$$1({
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
    setTimeout( () => {
      winindex.close();
    } , 12000);
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

    if (account === adminconf.account) { // testcode-hide
      data.etime = 999,
      data.period = '管理模式',
      data.update_status = true; 
    }
    console.log('done');
    console.log(data);
    data.etime = Number(data.etime); 
    endMinCount = 0;
    if(data.update_status){
      config.set('loan_id',data.loan_id);
      const advanceWarningTime = Number(defParamet.advanceWarningTime);
      const advanceWarningFreq = Number(defParamet.advanceWarningFreq);
      if (data.etime === advanceWarningTime && alertcheck ) {
        console.log('run error');
        alertcheck = false;
        alertcount = advanceWarningFreq * 60000;
        setMsg = setInterval( () => {
          // console.log('testcodes');//test
          seterrormsg(1);
          // window.alert('借用即將結束，如需續借請點選續借按鈕！');
        }, alertcount);// 定時詢問
      }
      if(data.etime < advanceWarningTime ) {
        // remindEndMsg5
        seterrormsg(1);//借用結束
        // window.alert('借用時間即將結束，請儘速保存您的資料！');
        document.querySelector('#remindEndMsg').innerHTML =  '借用即將結束，請在剩餘三分鐘前進行續借！';
      } else if (data.etime < 1 || data.etime === 0 ) {
        clearInterval(raiseHands);
        setTimeout(function () {
          // var winLockCommand = 'shutdown -L';//登出
          var winLockCommand = 'shutdown -r -t 5';// 重開機
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
      console.log(data.etime);
      console.log(defParamet.renewStopTime);
      
      if ( data.etime < defParamet.renewStopTime ) {
        $('#renewBtn').hide();
        $('#logout').hide();
        
        document.querySelector('#remindEndMsg').innerHTML =  '借用即將結束，請儘速儲存您的作業！';
      }
      // console.log(defParamet.renewTime);
      // console.log(defParamet.renewStopTime);
      if( data.etime <= defParamet.renewTime && data.etime > defParamet.renewStopTime ){// 續借按鈕
        console.log('續借、停止按鈕');
        $('#renewBtn').css({'display': 'inline'});
      }
      if (account === adminconf.account) { // testcode-hide
        $('#renewBtn').hide();
        $('#logout').hide(); 
        // $('#temDep').hide();
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
        console.log('借用狀態錯誤重開 ');

        seterrormsg(0);
        setTimeout( function () {
          // var winLockCommand = 'shutdown -L';//登出
          var winLockCommand = 'shutdown -r -t 5';// 重開機
          exec(winLockCommand);
        }, Number(defParamet.noBorrow));
        endMinCount += 1;
      }
      
    }
  })
  .fail(function( msg ) {
    console.log('fail');
    // console.log(defParamet.faultTolerantErrMsg);
    // console.log(msg);
    if (endMinCount >= Number(defParamet.faultTolerantErrMsg)) {
      seterrormsg(0);//系統錯誤
    }
    if (endMinCount === Number(defParamet.faultTolerant)) {
      //超過三次詢問皆斷線 
      console.log('超過三次詢問皆斷線');
      var winLockCommand = 'shutdown -r -t 5';// 重開機
      // var winLockCommand = 'shutdown -L';//登出
      exec(winLockCommand);
    }
    endMinCount += 1;
  });
};

var logoutCount = false; // 停止借用確認
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
    // console.log(data);
    if(data.renew_status){
      // console.log('續借完成!');
      questBorrowingTime(account);
      $('#renewBtn').hide();
      $('#remindEndMsg').after( '<div id="renewmsg">續借完成!</div>' );
      setTimeout( () => {
        $('div').remove('#renewmsg');
      } , 7000);
      // window.alert('續借完成','續借成功');
    }else{
      seterrormsg(0);
      // window.alert(data.message,'續借失敗！');
    }
  })
  .fail(function( msg ) {
    seterrormsg(0);
    // window.alert('系統錯誤，請聯絡管理人員','續借失敗！');
  });
};

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
      console.log('已停止借用');
      var winLockCommand = 'shutdown -r -t 5';//重開機
      exec(winLockCommand);
    } else {
      seterrormsg(2);
      // window.alert('請再次點選停止借用或聯繫管理員','停用失敗！');
    }
  })
  .fail(function( msg ) {
    seterrormsg(0);
    // window.alert('系統錯誤，請聯絡管理人員','停用失敗！');
  });
};


$(document).ready(function(){
  questBorrowingTime(account);
  var reqFreq = Number(defParamet.reqFreq);
  // console.log(reqFreq);
  // reqFreq = 10000;//test
  var raiseHands = setInterval( () => {
    console.log('raiseHands');
    questBorrowingTime(account);
  }, reqFreq);// 定時詢問
  var reciprocal;
  $('#logout').click( () => {
    // if(!logoutCount) {
      seterrormsg(3);
      // window.alert('點選確認定，請再次點選『停止借用』按鈕，確定停止本機所有(含續借)借用！');
      logoutCount = true;
      $('#logout').hide();
      $('#keep').css({'display': 'inline'});
      // $('#logout').removeClass('btn-primary');
      // $('#logout').addClass('btn-danger');
      // resetLogoutCount();
      reciprocal = setTimeout( () => {
          // $('#logout').removeClass('btn-danger');
          // $('#logout').addClass('btn-primary');
          $('#logout').css({'display': 'inline'});
           $('#keep').hide();
          logoutCount = false; 
          stopUse();          
        }, 11000);
    // } else if (logoutCount) {
      // stopUse();
    // }
  });
//   var id = setTimeout(function(){alert('hi');}, 3000);
// clearTimeout(id);
  $('#keep').click( () => {
    logoutCount = false;
    $('#logout').css({'display': 'inline'});
    $('#keep').hide();
    clearTimeout(reciprocal);
  });

  $('#temDep').click(function () {
    // const BrowserWindow = require('electron').remote.BrowserWindow;
    // let win = new BrowserWindow({
    //   width: 850, 
    //   height: 600, 
    //   frame: true, //上方選單tool
    //   fullscreen: true,
    //   title: '文藻電腦教室-登入',
    //   autoHideMenuBar: true,
    //   type: 'desktop',
    //   // closable: false, //視窗不可手動關閉(按X沒c動作)
    // });
    // win.loadURL(url.format({
    //   pathname: path.join(__dirname, 'app.html'),
    //   protocol: 'file:',
    //   slashes: true,
    // }));
    var winLockCommand = 'rundll32.exe user32.dll, LockWorkStation';//鎖 螢幕
    exec(winLockCommand);
    // var InformationPage = remote.getCurrentWindow(); // 取得bkg的登入頁面設定
    // InformationPage.close(); // 關閉頁面
  });

  $('#renewBtn').click('on', () => {
    console.log(account);
    renew(account);
  });

  document.querySelector('#screen').innerHTML =  '借用時間(time): 確認中...';
  document.querySelector('#endtime').innerHTML =  '剩餘時間(timing): 確認中...';
  document.querySelector('#remind').innerHTML =  '請將本視窗縮小';
  document.querySelector('#username').innerHTML =  '使用者(Account)：' + account;
});

}());
//# sourceMappingURL=information.js.map