function SesameController(__standService, __keyService, __lockService, __hintClip) {
  function parseAndGo(result) {
    // https://devices.iot-key.com/p00/GCKJSN2016102004
    var mr = /^https:\/\/devices\.iot-key\.com\/p00\/GCKJ[A-Z]*([0-9]+)/.exec(result);
    if (mr) {
      var deviceSn = 'GCKJSN' + mr[1];
      var keyInfo = __keyService.getMostSuitableKey(deviceSn);
      if (keyInfo && keyInfo.duration != 0) {
        var address;
        for (var d of __lockService.getDevices()) {
          if (d.deviceSn === deviceSn) {
            address = d.address;
            break;
          }
        }
        if (!address) {
          address = localStorage['CACHED_MAC-' + deviceSn];
        }
        if (address) {
          APP.showHint('正在开启' + keyInfo.name);
          __lockService.unlock(deviceSn, address, keyInfo.hexKey);
        } else {
          APP.showHint('此二维码对应的门禁控制器不在通讯范围中');
        }
      } else {
        APP.showHint('当前用户无权开启序列号为' + deviceSn + '的门禁控制器');
      }
    } else {
      APP.showHint('此二维码没有对应的门禁控制器');
    }
  }
  __lockService.feed.subscribe('qr-code-recognizing-finished', '', function (result) {
    setTimeout(function () { parseAndGo(result) }, 500);
  });

  var clip3 = __hintClip;
  __lockService.feed.subscribe('unlocking-result-returned', null, function (result) {
    var logData;
    if (result.resultCode === 0) {
      if (SETTING_SERVICE.getSetting('audioHint')) {
          if (navigator.userAgent.indexOf('/5.0 (iP') != -1) {
            clip3.play();
            clip3 = new Audio('sound/ok.mp3');
          } else {
            STAND_SERVICE.send(JSON.stringify({type:'play-hint-audio', url:new URL('sound/ok.mp3', document.baseURI).href}));
          }
      }
      if (SETTING_SERVICE.getSetting('vibration')) {
        // 振动
        try {
          navigator.vibrate([80, 100, 80]);
        } catch(e) {}
        __standService.send(JSON.stringify({'type':'vibrate'}));
      }
      logData = KEY_SERVICE.getKeyInfoByKeyId(result.keyData).name + '开启成功' + '\n' + result.logs.join('\n');
      APP.showHint('开门成功');
    } else {
      switch (result.resultCode) {
        case -3005:
          APP.showHint('钥匙已被撤销');
          break;
        case -3004:
          APP.showHint('当前时段这把钥匙无权开门');
          break;
        case -3003:
          APP.showHint('钥匙不在有效期');
          break;
        case -3002:
        case -3001:
          APP.showHint('钥匙无效');
          break;
        case -2001:
          APP.showHint('连接无响应');
          break;
        case -2000:
          APP.showHint('连接失败');
          break;
        case -1001:
          APP.showHint('手机蓝牙模块尚未完全启动，请稍后再试');
          break;
        case -1000:
          APP.showHint('手机蓝牙模块状态异常，尝试重启中');
          LOCK_SERVICE.restartBluetoothAdapter();
          break;
      }
      var messageBody = result.logs ? result.logs.join('\n') : '';
      try {
        logData = KEY_SERVICE.getKeyInfoByKeyId(result.keyData).name + '开启失败' + '\n' + messageBody;
      } catch (ex) {
        logData = '连接无响应';
      }
    }
    MESSAGE_SERVICE.push({
      sender:'开门记录',
      datetime: new Date(),
      content: logData
    });
  });

  __standService.feed.subscribe('message-received', undefined, function (message) {
    if (message.type === 'url-received') {
      var url = message.result;
      if (!/cniotkeyentry\:\/\//i.test(url)) return;
      switch (url.substring(16)) {
        case '?command=DO_UNLOCK': {
          message.type = 'unlocking-most-significant-device-command';
          break;
        }
        case '?command=DO_QR_SCAN': {
          message.type = 'open-qr-scanner-command';
          break;
        }
      }
    }
    switch (message.type) {
      case  'unlocking-most-significant-device-command': {
        if (!VISA_SERVICE.isOn()) {
          APP.showHint('未登录状态不能使用此功能');
          return;
        }
        console.log("Shell: unlocking-most-significant-device-command");
        //__lockService.startScan();
        APP.showHint('设备搜索中');
        var t = 0;
        setTimeout(function tryAgain() {
          var devices = __lockService.getDevices();
          function average(array) {
            var s = 0;
            for (var i = 0; i < array.length; i++) {
              s += array[i]
            }
            return s / array.length;
          }
          devices.sort(function (a, b) {
            return average(b.recentRssis) - average(a.recentRssis);
          });
          if (devices.length > 0) {
            function doUnlock(lock) {
              APP.showHint('正在开启' + lock.name);
              __lockService.unlock(lock.deviceSn, lock.address, lock.key);
            }
            var d0 = devices[0];
            var d1 = devices[1] || {rssi:-32768};

            if (d0.rssi - d1.rssi > 10 - SETTING_SERVICE.getSetting('/signalDeltaSensitivity')) {
              doUnlock(d0);
            } else {
              APP.openPopup('scan-results.html',  {locks:LOCK_SERVICE.getDevices(), doUnlock:doUnlock});
            }
          } else {
            if (t < 10) {
              setTimeout(tryAgain, 500);
              t++;
            } else {
              APP.showHint("未发现设备");
            }
          }
        }, 500);
        break;
      }
      case 'open-qr-scanner-command': {
        if (!VISA_SERVICE.isOn()) {
          APP.showHint('未登录状态不能使用此功能');
          return;
        }
        setTimeout(function () {
          __lockService.doRecognize();
        }, 200);
        break;
      }
    }
  });

  var failedDownloadCount = 0;
  __keyService.feed.subscribe('keys-downloaded', undefined, function (result) {
    failedDownloadCount = 0;
    if (!result.__cached) {
      APP.showHint('更新钥匙库成功');
    } else {
      APP.showHint('离线状态，使用本地缓存钥匙库');
    }
    __lockService.startScan(); // FIXME
  });
  __keyService.feed.subscribe('keys-download-failed', undefined, function () {
    if (failedDownloadCount++ < 3) {
      setTimeout(function () {
        __keyService.download()
      }, (4 + 2 * Math.random()) * 6000);
    } else {
      failedDownloadCount = 0;
      alert('更新钥匙库失败，请尝试重新登录');
    }
  });
}
