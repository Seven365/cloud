function GuestKeyService(__visaService) {
  var __this = this;
  var __emitter = new ImpulseEmitter();
  __this.feed = __emitter.getFeed();

  var __visaId;
  var __actionUrlPrefix;

  __visaService.feed.subscribe('visa-selected', '', function (visa) {
    __visaId = visa.visaId;
    __actionUrlPrefix = '/_api/' + __visaId;
  });

  __this.getGuestInfo = function (phoneNumber) {
    return new Promise(function (resolve, reject) {
      if (__actionUrlPrefix == null) reject();
      var xhr = BACKEND.makeRequest('GET', __actionUrlPrefix + '/guests/' + phoneNumber, 'json');
      BACKEND.sendRequest(xhr).then(
        function (result) {
          resolve(result);
        },
        function () {
          reject(xhr.status)
        }
      );
    });
  };

  __this.requestGuestKeys = function (request) {
    return new Promise(function (resolve, reject) {
      if (__actionUrlPrefix == null) reject();
      var xhr = BACKEND.makeRequest('POST', __actionUrlPrefix + '/guest-key-requests/', 'json');
      xhr.setRequestHeader('Content-Type', 'application/json');
      BACKEND.sendRequest(xhr, JSON.stringify(request)).then(
        function (result) {
          resolve(result);
        },
        function () {
          reject(xhr.response);
        }
      );
    });
  };
}

var GUEST_KEY_SERVICE;
