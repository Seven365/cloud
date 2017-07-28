function LockService(__standService, __visaService, __keyService, __settingService) {
  var __this = this;
  var __emitter = new ImpulseEmitter();
  __this.feed = __emitter.getFeed();
  var __unlocking;
  var __queuedMessages;
  var __visaId;
  var __token;

  function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
  }

  var __nearbyLocks = [];

  __visaService.feed.subscribe('visa-selected', undefined, function (data) {
    __visaId = data.visaId;
    __token = data.token;
    __nearbyLocks = [];
  });

  __visaService.feed.subscribe('visa-deleted', undefined, function (data) {
    __this.stopScan();
    __nearbyLocks = [];
  });

  var __isBluetoothAdapterEnabled = false;
  var __basTimer;

  __standService.feed.subscribe('keys-downloaded', undefined, function () {
    __this.startScan();
  });

//  function parseDate(dateString) {
//    var mr = /^0*([0-9]+)-0*([0-9]+)-0*([0-9]+) 0*([0-9]+):0*([0-9]+):0*([0-9]+)$/.exec(dateString);
//    if (mr) {
//      return new Date(mr[1], mr[2] - 1, mr[3], mr[4], mr[5], mr[6]);
//    }
//  }

  __standService.feed.subscribe('message-received', '', function (result) {
    switch (result.type) {
      case 'scan-result': {
        if (__unlocking) return;
        //console.log(result.deviceSn);

        // 移除未活动、无钥匙（含已用光）的控制器
        var now = new Date() - 0;
        var newNearbyLocks = [];
        var removedDevices = [];

        for (var i = 0; i < __nearbyLocks.length; i++) {
          var l = __nearbyLocks[i];
          if (now - l.dtime < 1000 * 10) {
            var kI = __keyService.getMostSuitableKey(l.deviceSn, 1);
            if (kI) {
              newNearbyLocks.push(l);
            } else {
              removedDevices.push(l);
            }
          } else {
            removedDevices.push(l);
          }
        }
        __nearbyLocks = newNearbyLocks;
        if (removedDevices.length > 0) {
          console.log('devices-removed', '', {devices: removedDevices});
          __emitter.publish('devices-removed', '', {devices: removedDevices});
        }

        //
        if (result.rssi + __settingService.getSetting('/signalValueSensitivity') > -60) {
          //console.log('信号强度足够');
          var keyInfo = __keyService.getMostSuitableKey(result.deviceSn);
          if (keyInfo) {
            //console.log('持有有效对应钥匙');
            var lock;
            for (var i = 0; i < __nearbyLocks.length; i++) {
              var l = __nearbyLocks[i];
              if (l.deviceSn === result.deviceSn) {
                isNewlyFound = false;
                lock = l;
                break;
              }
            }
            var isNewlyFound = false;

            if (lock != null) {
              lock.recentRssis.push(result.rssi);
              if (lock.recentRssis.length > 10) {
                lock.recentRssis.shift();
              }
            } else {
              isNewlyFound = true;
              lock = {
                deviceSn: result.deviceSn,
                address: result.address,
                recentRssis: [result.rssi],
                name: keyInfo.name,
                key: keyInfo.hexKey,
                duration: keyInfo.duration
              };
              __nearbyLocks.push(lock);
            }

            lock.dtime = new Date() - 0;
            var sumOfRecentRssis = -0;
            for (var j = 0; j < lock.recentRssis.length; j++) {
              sumOfRecentRssis += lock.recentRssis[j];
            }
            lock.rssi = sumOfRecentRssis / lock.recentRssis.length;

            __nearbyLocks.sort(function (a, b) {
              return b.rssi - a.rssi;
            });

            if (isNewlyFound) {
              if (lock.address.length != 36) { // 使用长度区分是否为静态MAC地址
                localStorage['CACHED_MAC-' + lock.deviceSn] = lock.address;
              }
              console.log('device-added', '', {device: lock, count: __nearbyLocks.length});
              __emitter.publish('device-added', '', {device: lock, count: __nearbyLocks.length});
            }
          }
        }
        break;
      }
      case 'unlocking-result': {
        console.log("UNLOCKING RESULT: " + JSON.stringify(result));
        if (result.resultCode === 0) {
            __keyService.decreaseDuration(result.keyData);
        }
        __emitter.publish('unlocking-result-returned', '', result);
        setTimeout(function () {
          __unlocking = false;
          __emitter.publish('unlocking-finished', '', result);
        }, 4000);
        break;
      }
      case 'recognizing-result': {
        __emitter.publish('qr-code-recognizing-finished', '', result.result);
        break;
      }
      case 'bluetooth-adapter-state': {
        clearTimeout(__basTimer);
        var state = result.state;
        __isBluetoothAdapterEnabled = state;
//            if (__isBluetoothAdapterEnabled || __isBluetoothAdapterEnabled === undefined) {
//              __isBluetoothAdapterEnabled = state;
//            } else {
//              if (state) {
//                __basTimer = setTimeout(function () {
//                  __isBluetoothAdapterEnabled = true;
//                }, 2000);
//              } else {
//                __isBluetoothAdapterEnabled = false;
//              }
//            }
        __emitter.publish('bluetooth-adapter-state-changed', '', result);
        break;
      }
    }
  });

  this.startScan = function () {
    __standService.send(JSON.stringify({type:'scan'}));
  };
  this.stopScan = function () {
    __standService.send(JSON.stringify({type:'stop-scan'}));
  };

  var __currentRequestId = 0;
  this.unlock = function (sn, address, data) {
    if (__unlocking) return;
    __unlocking = true;
    __emitter.publish('unlocking-started', '');
      if (navigator.userAgent.indexOf('Mozilla/5.0 (iP') === 0) {
        for (lock of __nearbyLocks) {
            if (lock.deviceSn === sn) {
                lock.taint = true;
            }
        }
      }
      __currentRequestId++;
      (function () {
        var pendingRequestId = __currentRequestId;
//        setTimeout(function () {
//          if ((__currentRequestId === pendingRequestId) && __unlocking) {
//            __unlocking = false;
//                   console.log('FAKE UNLOCKING RESULT: -2001');
//            __emitter.publish('unlocking-finished', '', {resultCode:-2001});
//          }
//        }, 12000);
      })();
    console.log("TOKEN: " + __token);
    console.log("DATA: " + data);
    __standService.send(JSON.stringify({
      type:'send',
      address: address,
      token: __token,
      keyData: data
    }));
  };
  this.isUnlocking = function () {
    return __unlocking;
  };
  this.getDeviceCount = function () {
    return __nearbyLocks.length;
  };
  this.getDevices = function () {
    return JSON.parse(JSON.stringify(__nearbyLocks));
  };

  this.doRecognize = function () {
    __standService.send(JSON.stringify({type:'recognize-qr-code'}));
  };
  this.unlockRemotely = function (deviceId, keyId) {
    var xhr = BACKEND.makeRequest('POST', '/_api/' + __visaId + '/locks/' + deviceId, 'json');
    return BACKEND.sendRequest(xhr, JSON.stringify({keyId: keyId}));
  };
  this.restartBluetoothAdapter = function () {
    __standService.send(JSON.stringify({type:'restart'}));
  };
  this.fetchBluetoothAdapaterState = function () {
    __standService.send(JSON.stringify({type:'fetch-state'}));
  };
  this.isBluetoothAdapterEnabled = function () {
    return __isBluetoothAdapterEnabled;
  };
}

var LOCK_SERVICE;
