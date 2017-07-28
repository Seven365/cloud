'use strict';

var APP = window.top.APP;
var KEY_SERVICE = window.top.KEY_SERVICE;
var LOCK_SERVICE = window.top.LOCK_SERVICE;

launchActivity({
  onCreate: function (inputParams) {
    window.onunload = function () {
      inputParams.doClose();
    };

    var mainArea = $Q('.Activity > main');
    function addItem(device) {
      mainArea.appendChild(
        mkE(
          'div',
          {'class':'Item', 'data-sn':device.deviceSn},
          [device.name],
//          [device.name, JSON.stringify(device.recentRssis)],
          function touchend() {
            inputParams.doUnlock(device)
            APP.closePopup();
          }
        )
      );
    }
    
    if (inputParams) {
      for (var i = 0; i < inputParams.locks.length; i++) {
        (function (device){
          addItem(device);
        })(inputParams.locks[i]);
      }
//      subscribe(LOCK_SERVICE, 'device-added', '', function (change) {
//        var item = $TQ(mainArea, '[data-sn="' + change.device.deviceSn + '"]');
//        if (item == null) {
//          addItem(change.device);
//        }
//      });
//      subscribe(LOCK_SERVICE, 'devices-removed', '', function (changeset) {
//        for (var device of changeset.devices) {
//          var item = $TQ(mainArea, '[data-sn="' + device.deviceSn + '"]');
//          if (item != null) {
//            mainArea.removeChild(item);
//          }
//        }
//      });
    }
  }
});
