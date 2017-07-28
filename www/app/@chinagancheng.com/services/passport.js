function PassportService(__visaService) {
  var __this = this;
  var __emitter = new ImpulseEmitter();
  __this.feed = __emitter.getFeed();

  __this.signUp = function (ticketId, telephone, realName, password) {
    return new Promise(function (resolve, reject) {
        var SIGN_UP_URL = '/_api/passports/';
        var xhr = BACKEND.makeRequest('POST', SIGN_UP_URL, 'json');
        xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
        BACKEND.sendRequest(xhr, JSON.stringify({
          ticketId:ticketId,
          telephone:telephone,
          realName:realName,
          password:password
        })).then(
          function (result) {
            resolve();
          },
          function (request) {
            if (request.status >= 500) {
              reject();
            } else {
              reject(request.response);
            }
          }
        );
    });
  };
  var __visaId;
  __visaService.feed.subscribe('visa-selected', '', function (visa) {
    __visaId = visa.visaId;
    __this.loadProfile();
  });

  __visaService.feed.subscribe('visa-deleted', '', function (visa) {
    __visaId = null;
  });

  __this.updatePassword = function (oldPassword, newPassword) {
    if (!__visaId) throw new Error('非登录状态下不能使用');
    var UPDATE_PASSWORD_ACTION_URL = '/_api/' + __visaId + '/password';
    var xhr = BACKEND.makeRequest('POST', UPDATE_PASSWORD_ACTION_URL, 'json');
    BACKEND.sendRequest(xhr, JSON.stringify({
      oldPassword:oldPassword, newPassword:newPassword
    })).then(
      function () {
        __emitter.publish('password-updated', '');
      },
      function (xhr) {
        if (xhr.status == 400) {
          __emitter.publish('update-password-failed', '', xhr.response);
        }
      }
    );
  };

  __this.loadProfile = function () {
    if (!__visaId) throw new Error('非登录状态下不能使用');
    var LOAD_PROFILE_ACTION_URL = '/_api/' + __visaId + '/profile';
    var xhr = BACKEND.makeRequest('GET', LOAD_PROFILE_ACTION_URL, 'json');
    xhr.cacheable = true;
    BACKEND.sendRequest(xhr).then(
      function (data) {
        __emitter.publish('profile-selected', '', data);
      }
    );
  };

  __this.saveProfile = function (newProfile) {
    if (!__visaId) throw new Error('非登录状态下不能使用');
    var SAVE_PROFILE_ACTION_URL = '/_api/' + __visaId + '/profile';
    var xhr = BACKEND.makeRequest('POST',SAVE_PROFILE_ACTION_URL, 'json');
    BACKEND.sendRequest(xhr, JSON.stringify(newProfile)).then(
      function (data) {
        __emitter.publish('profile-updated', '', data);
      }
    );
  };

  __this.uploadAvatar = function (blob) {
    if (!__visaId) throw new Error('非登录状态下不能使用');
    var url = '/_api/' + __visaId + '/profile/avatar';
    var xhr = BACKEND.makeRequest('POST', url, 'json');
    var formData = new FormData();
    formData.append('file', blob);
    return BACKEND.sendRequest(xhr, formData).then(
      function (result) {
        __emitter.publish('avatar-updating-succeed', '', result.avatarUrl);
        return Promise.resolve();
      },
      function () {
        __emitter.publish('avatar-updating-failed', '');
      }
    );
  };
  
  __this.loadContacts = function (newProfile) {
    if (!__visaId) throw new Error('非登录状态下不能使用');
    var url = '/_api/' + __visaId + '/supports/contacts';
    var xhr = BACKEND.makeRequest('GET', url, 'json');
    xhr.cacheable = true;
    BACKEND.sendRequest(xhr).then(
      function (data) {
        __emitter.publish('contacts-selected', '', data);
      }
    );
  };
}

var PASSPORT_SERVICE;
