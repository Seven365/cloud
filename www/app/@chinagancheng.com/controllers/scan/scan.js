var APP = window.top.APP;
var VISA_SERVICE = top.VISA_SERVICE;
var LOCK_SERVICE = top.LOCK_SERVICE;
var KEY_SERVICE = top.KEY_SERVICE;
var MESSAGE_SERVICE = top.MESSAGE_SERVICE;
var SETTING_SERVICE = top.SETTING_SERVICE;
var STAND_SERVICE = top.STAND_SERVICE;

var ads = [];

var adPlayer = (function (){
  var index = 0;
  var container = $Q('[data-control-name=layer0]');
  return function () {
    if (ads.length === 0) return;
    index = (index + 1) % ads.length;
    var href = ads[index].href;
    var ad = mkE('div', {class:'Queued Ad', style:'background: url(' + ads[index].src + ') 50% 50% no-repeat'}, function click() {
      open(href);
    });
    container.appendChild(ad);
    setTimeout(function () {
      ad.classList.remove('Queued');
      if (container.children.length >= ads.length) {
        container.removeChild(container.firstElementChild);
      }
    }, 100);
  };
})();

(function () {
  VISA_SERVICE.fetchAdList().then(function (result) {
    console.log(result);
    ads = result;
  });
})();

var clip = new Audio('sound/click-on.mp3');

launchActivity({
  onCreate: function () {
    var __this = this;

    var __emitter = new ImpulseEmitter();
    var __publisher = { feed: __emitter.getFeed() };

    var __y0;
    var mainArea = $Q('.Activity > main');
    mainArea.ontouchstart = function (event) {
      __y0 = event.changedTouches[0].clientY;
      mainArea.style.webkitTransition = '';
      mainArea.style.transition = '';
    };
    mainArea.ontouchmove = function (event) {
      var nY = event.changedTouches[0].clientY;
      var dY = nY - __y0;
      mainArea.style.webkitTransform = 'translateY(' + Math.max(0, dY) + 'px)';
      mainArea.style.transform = 'translateY(' + Math.max(0, dY) + 'px)';
    };
    mainArea.ontouchend = function (event) {
      var nY = event.changedTouches[0].clientY;
      var dY = nY - __y0;
      if (dY > 0) {
        doScan();
      }
      __y0 = 0;
      mainArea.style.webkitTransition = '-webkit-transform 0.15s';
      mainArea.style.webkitTransform = '';
      mainArea.style.transition = 'transform 0.15s';
      mainArea.style.transform = '';
    };

    var scanActivityTrigger = $Q('[data-control-name="scanActivityTrigger"]');
    scanActivityTrigger.onclick = function () {
      LOCK_SERVICE.doRecognize();
    };

    var guestKeyRequestWizardTrigger = $Q('[data-control-name="guestKeyRequestWizardTrigger"]');
    guestKeyRequestWizardTrigger.onclick = function () {
      APP.openPopup("guest-key-request-form.html", {}, 'guest-key-request');
    };

    var readyIndicator = $Q('.Activity .ReadyIndicator');

    var __selecting = false;

    readyIndicator.onclick = function () {
//      readyIndicator.classList.add('insensitive');
      if (LOCK_SERVICE.isUnlocking() || __selecting) {
        return;
      }

      if (!LOCK_SERVICE.isBluetoothAdapterEnabled()) return;
//      if (LOCK_SERVICE.isUnlocking()) {
//        return;
//      }

        function doUnlock(device) {
          __selecting = false;
          readyIndicator.classList.add('insensitive');
          if (LOCK_SERVICE.isUnlocking()) {
            return;
          }
          if (SETTING_SERVICE.getSetting('vibration')) {
            // 振动
            try {
              navigator.vibrate(200);
            } catch(e) {}
            STAND_SERVICE.send(JSON.stringify({'type':'vibrate'}));
          }
          if (SETTING_SERVICE.getSetting('audioHint')) {
            if (navigator.userAgent.indexOf('/5.0 (iP') != -1) {
              clip.play();
              clip = new Audio('sound/click-on.mp3');
            } else {
              STAND_SERVICE.send(JSON.stringify({type:'play-hint-audio', url:new URL('sound/click-on.mp3', document.baseURI).href}));
            }
          }
          console.log(device);
          APP.showHint('正在开启' + device.name);

          //

          LOCK_SERVICE.unlock(device.deviceSn, device.address, KEY_SERVICE.getMostSuitableKey(device.deviceSn).hexKey);
        }

        if (__totalCount === 1) {
          var device = LOCK_SERVICE.getDevices()[0];
          doUnlock(device);
        } else if (__totalCount > 1) {
////               for (device of LOCK_SERVICE.getDevices()) {
////                if (device.deviceSn === "GCKJSN0916090168") {
////                    doUnlock(device);
////                }
////               }
          __selecting = true;
          APP.openPopup('scan-results.html',  {locks:LOCK_SERVICE.getDevices(), doUnlock:doUnlock, doClose:function () { __selecting = false}});
        }
    };

    var __totalCount;
    function updateIndicator() {
      var devices = LOCK_SERVICE.getDevices();
      __totalCount = devices.length;
      if (__totalCount > 0) {
        readyIndicator.classList.add('is-ready');
//        if (__totalCount == 1) {
//          readyIndicator.textContent = devices[0].name;
//        } else {
          readyIndicator.textContent = '一键开门';
//        }
      } else {
        readyIndicator.classList.remove('is-ready');
        readyIndicator.textContent = '未见可开房门，下拉重新搜索';
      }
    }

    subscribe(LOCK_SERVICE, 'device-added', undefined, updateIndicator);
    subscribe(LOCK_SERVICE, 'devices-removed', undefined, updateIndicator);
    updateIndicator();

    subscribe(LOCK_SERVICE, 'unlocking-started', undefined, function () {
      readyIndicator.textContent = '开门进行中……';
      readyIndicator.classList.add('insensitive');
    });

    subscribe(LOCK_SERVICE, 'unlocking-finished', undefined, function () {
      updateIndicator();
      readyIndicator.classList.remove('insensitive');
    });

    var __requestId = 0;
    function goNextRound() {
      if (++__requestId < 1) {
        readyIndicator.onclick();
      } else {
        __requestId = 0;
      }
    }

    LOCK_SERVICE.fetchBluetoothAdapaterState();

    var t = 0;
    var c = 0;
    var isShaking = false;
    window.ondevicemotion = function (event) {
      var sensitivity = SETTING_SERVICE.getSetting('shakingSensitivity') || 5;

      var a = event.acceleration;
      var aa = (a.x*a.x + a.y*a.y + a.z*a.z);
      if (aa > 500 / sensitivity) {
        var n = new Date();
        if (n - t > 1000) {
          isShaking = false;
          c = 0;
          //console.log("SHAKING TEST ===============: " + (t - 0));
        }
        if (!isShaking) {
          //console.log("SHAKING TEST: " + c);
          c++;
          if (c > 25) {
            console.log("SHAKING... ");
            isShaking = true;
            if (__totalCount > 0) {
              readyIndicator.click();
            }
          }
        }
        t = n;
      }
    };

    function doScan() {
      if (!LOCK_SERVICE.isUnlocking()) {
        LOCK_SERVICE.startScan();
        console.log("STARTING SCAN....");
      }
    }
    if (true) {
      // setInterval(doScan, 5000);
    }
//    doScan();


  },
  onPause: function () {
    clearInterval(adPlayer);
  },
  onResume: function () {
    setInterval(adPlayer, 5000);
  }
});
