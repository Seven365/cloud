function KeyService(__visaService) {
  var DOWNLOAD_URL_SUFFIX = '/keys/';
  var __downloadUrl;
  var __this = this;
  var __emitter = new ImpulseEmitter();
  __this.feed = __emitter.getFeed();
  var __visaId;
  var __keyListsByLockId = {};
  var __keyByKeyId = {};
//  var __durations = {};
  var __keyStoreData = [];

  __this.list = function () {
    __emitter.publish('keys-selected', '', __keyStoreData);
  };

  function extractKeyId(keyData) {
    return keyData.substring(212, 244);
  }

  __this.extractKeyId = extractKeyId;

  function buildKeyStoreInMemory(result) {
    if (result == undefined) return;
    __keyListsByLockId = {};
    __keyByKeyId = {};
//    __durations = {};
    __keyStoreData = [];
    for (l of result) {
      for (i of l.keys) {
        var keyId = extractKeyId(i.hexKey);
        var keyItem = {
          groupId:l.id,
          groupName:l.name,
          key: i.hexKey,
          uuid: keyId
        };

        Object.assign(keyItem, i);
        var durationIndex = 'DURATION-OF-' + keyId;
        var savedDuration = localStorage[durationIndex] - 0;
        keyItem.duration = !isNaN(savedDuration) ? savedDuration : keyItem.limit;

        __keyByKeyId[keyId] = keyItem;

        var lockId = (i.lockId).substring(i.lockId.length - 10);
        if (__keyListsByLockId[lockId] == undefined) {
          __keyListsByLockId[lockId] = [];
        }
        __keyListsByLockId[lockId].push(keyItem);
      }
    }
    __keyStoreData = result;
  }

  function parseDate(dateString) {
    var mr = /^0*([0-9]+)-0*([0-9]+)-0*([0-9]+) 0*([0-9]+):0*([0-9]+):0*([0-9]+)$/.exec(dateString);
    if (mr) {
      return new Date(mr[1], mr[2] - 1, mr[3], mr[4], mr[5], mr[6]);
    }
  }

  __this.getMostSuitableKey = function (lockId) {
    var shortLockId  = lockId.substring(lockId.length - 10);
    var keys = __keyListsByLockId[shortLockId]
    if (keys == null) return;
    keys.sort(function (x, y) {
      return (x.duration - y.duration)
    });
    var now = new Date() - 0;
    for (k of keys) {
      if (k.duration != 0 && parseDate(k.effectiveTime) <= now && now < parseDate(k.expireTime)) {
        return k;
      }
    }
  }

  __this.getDurationByKeyId = function (keyId) {
    return __keyByKeyId[keyId].duration;
  }

  __this.download = function () {
    return new Promise(function (resolve, reject) {
      var xhr = BACKEND.makeRequest('GET', __downloadUrl, 'json');
      if (__visa.mode == 0) {
        xhr.cacheable = true;
      }
      BACKEND.sendRequest(xhr).then(
        function (result) {
          console.log(JSON.stringify(result));
          localStorage['CACHED_KEYS'] = JSON.stringify(result);
          buildKeyStoreInMemory(result);
          resolve(result);
          __emitter.publish('keys-downloaded', '', result);
        },
        function () {
          console.log(xhr);
          if (xhr.status == 410 || xhr.status == 404 ) {
            __visaService.signOff();
          } else {
            reject(xhr);
            __emitter.publish('keys-download-failed');
          }
        }
      );
    });
  };

//  __this.decreaseDuration = function (keyId) {
//    var id = keyId;
//    var keyInfo = __keyByKeyId[id]
//    if (keyInfo && keyInfo.limit > 0) {
//      var index = 'DURATION-OF-' + id;
//      var duration = localStorage[index];
//      if (duration == null) {
//        localStorage[index] = keyInfo.limit - 1;
//      } else {
//        if (duration - 0 > 0) {
//          localStorage[index] = duration - 1;
//        }
//      }
//    }
//  };

  __this.decreaseDuration = function (keyId) {
    var id = keyId;
    var keyInfo = __keyByKeyId[id]

    var keys = __keyListsByLockId[keyInfo.lockId];

    for (key of keys) {
      if (key.duration > 0) {
        var now = new Date() - 0;
        if (parseDate(key.effectiveTime) <= now && now < parseDate(key.expireTime)) {
          key.duration--;
          localStorage['DURATION-OF-' + key.uuid] = key.duration;
        }
      }
    }
  };

  __this.getKeyInfoByKeyId = function (keyId) {
    var id = keyId;
    var result = __keyByKeyId[id];
    if (result != null) {
      var durationIndex = 'DURATION-OF-' + id;
      var duration = localStorage[durationIndex];
      result.duration = duration == null ? result.limit : duration - 0;
    }
    return result;
  };
//  __this.syncGetKeyInfo = function (lockId, log) {
//    var id = lockId.substring(lockId.length - 10);
//    var result = __keyByLockId[id];
//    if (result != null) {
//      var durationIndex = 'DURATION-OF-' + extractKeyId(result.hexKey);
//      var duration = localStorage[durationIndex];
//      result.duration = duration == null ? result.limit : duration - 0;
//    }
//    return result;
//  };
  __this.reportKeyLost = function (password) {
    return new Promise(function (resolve, reject) {
      var xhr = BACKEND.makeRequest('POST', '/_api/' + __visaId + '/key-lost-reports/', 'json');
      BACKEND.sendRequest(xhr, JSON.stringify({password:password})).then(
        function () {
          resolve();
        },
        function () {
          reject(xhr.status);
        }
      );
    });
  };

  __visaService.feed.subscribe('visa-selected', undefined, function (visa) {
    __visaId = visa.visaId;
    __visa = visa;
    __downloadUrl = '/_api/' + __visaId + DOWNLOAD_URL_SUFFIX;
    __this.download();
  });

  __visaService.feed.subscribe('visa-deleted', undefined, function (visa) {
    delete localStorage['CACHED_KEYS'];

    __visaId = null;
//    __durations = {};
    __keyStoreData = [];

    __keyListsByLockId = {};
    __keyByKeyId = {};
  });

  try {
    buildKeyStoreInMemory(JSON.parse(localStorage['CACHED_KEYS']));
  } catch (ex) {
  }
}

var KEY_SERVICE;
