'use strict';

var REAL_BACKEND = (function () {
  var store = localforage.createInstance({
    name: "cachedResponses"
  });

  return {
    getUrlPrefix: function () {
      return 'https://iot-key.cn/_api'; // 阿里云服务器，生产环境
//      return 'https://gc-key.com/_api'; // 阿里云服务器，测试环境
    },
    makeRequest: function (method, url, responseType) {
      var uo = (new URL(url, 'https://localhost'))
      var path = uo.pathname.substring(5);
      var request = makeRequest(method, this.getUrlPrefix() + path + uo.search, responseType);
      request.path = path;
//                    request.timeout = 4000;
      //request.setRequestHeader('Content-Type', 'application/json;charset=utf-8');


      return request;
    },
    sendRequest: function (request, data) {
      var path = request.path;
      return sendRequest(request, data).then(
        function (result) {
          if (request.cacheable) {
            return store.setItem(request.path, result);
          } else {
            return Promise.resolve(result);
          }
        },
        function (error) {
          if (request.cacheable && (request.status < 400 || request.status >= 500)) {
            return store.getItem(request.path).then(function (data) {
              data.__cached = true;
              return Promise.resolve(data);
            });
          } else {
            return Promise.reject(error);
          }
        }
      ).catch(
        function (error) {
          if (request.cacheable && (request.status < 400 || request.status >= 500)) {
            return store.getItem(request.path).then(function (data) {
              data.__cached = true;
              return Promise.resolve(data);
            });
          } else {
            return Promise.reject(error);
          }
        }
      );
    },
    clearCachedResponses: function () {
      return store.clear();
    }
  };
})();

var BACKEND = REAL_BACKEND;
