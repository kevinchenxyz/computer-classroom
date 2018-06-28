export const getConfig = () => {
    const confData = {
        'path': {
            // computerClassroom: "http://192.168.1.59/zf2/kurogo_wzu_push/public/api/computer"
            // computerClassroom: "http://192.168.1.207/push/api/computer"
            computerClassroom: "http://140.127.170.153/push/api/computer"
        }
    }
    return confData;
};

export const formatMacaddress = function (ipobj) {
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

export const secretConf = () => {
    const adminData = {
        'account':  'wzuAdmin',
        'pwd': 'wzu76000424'
    }
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