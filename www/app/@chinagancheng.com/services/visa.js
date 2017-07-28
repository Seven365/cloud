function VisaService(__storage, __gotoSignOnPage) {
  var SIGN_ON_ACTION = '_api/visas/';
  var CHECK_VISA_ACTION_PREFIX = '/_api/visas';
  var DROP_VISA_ACTION_PREFIX = '/_api/visas';
  var __this = this;
  var __emitter = new ImpulseEmitter();
  __this.feed = __emitter.getFeed();
  var __visaId;
  var __passportId;
  var __avatarUrl;
  var __visa;

  __this.getAvatarUrl = function () {
    if (__avatarUrl == null) {
      throw new Error('未登录状态下不能使用');
    }
    return __avatarUrl;
  };

  __this.fetchAdList = function () {
    if (__visaId == null) {
      throw new Error('未登录状态下不能使用');
    }
    var xhr = BACKEND.makeRequest('GET', '_api/' + __visaId + '/ads?' + Math.random() , 'json');
    return BACKEND.sendRequest(xhr);
  };

  __this.signOn = function (username, password, mode) {
    return new Promise(function (resolve, reject) {
      if (SIGN_ON_ACTION) {
        var xhr = BACKEND.makeRequest('POST', SIGN_ON_ACTION, 'json');
        xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
                       BACKEND.sendRequest(xhr, JSON.stringify({username:username, telephone:username, password:password, mode:mode})).then(
          function (result) {
            //console.log(result);
            __storage['VISA_INFO'] = JSON.stringify(result);
            __this.reload().then(resolve, reject);
          },
          function (request) {
            if (request.status < 400 || request.status >= 500) {
              reject({message: '连接不到服务器'});
            } else {
              var message;
              if (request.response.loginError) {
                message = request.response.loginError;
              } else {
                message = '用户名或密码错误';
              }
              reject({message: message});
            }
          }
        );
      } else {
        reject();
      }
    });
  };
  __this.signOff = function () {
    return new Promise(function (resolve) {
      delete __storage['VISA_INFO'];
      delete __storage['RETURN_URL'];
      BACKEND.clearCachedResponses().then(function () {
      });
      var xhr = BACKEND.makeRequest('DELETE', CHECK_VISA_ACTION_PREFIX + '/' + __visaId + '/', 'json');
      try {
        BACKEND.sendRequest(xhr);
      } catch (ex) {}

      __emitter.publish('visa-deleted');
      resolve();
      __gotoSignOnPage();
    });
  };

  __this.revalidate = function (randomId) {
    if (__visa.randomId !== randomId) {
      __this.signOff().then(function () {
        console.log('Signed Off');
      });
    }
  };

  __this.isOn = function () {
    return !!__visaId;
  };

  __this.reload = function () {
    return new Promise(function (resolve, reject) {
      var visaInfo = __storage['VISA_INFO'];
      if (!visaInfo) {
        __gotoSignOnPage();
      } else {
        var visa = JSON.parse(visaInfo);
        // var xhr = BACKEND.makeRequest('GET', CHECK_VISA_ACTION_PREFIX + '/' + visa.visaId + '/', 'json');
        // xhr.cacheable = true;
        // BACKEND.sendRequest(xhr).then(
        //   function () {
            __visaId = visa.visaId;
            __passportId = visa.passportId;
            __avatarUrl = visa.avatarUrl;
            __visa = visa;
            __emitter.publish('visa-selected', '', visa);
            resolve(visa);
        //   },
        //   function () {
        //     reject();
        //     __this.signOff();
        //   }
        // );
      }
    });
  };
}
var VISA_SERVICE;
