function StandService(__apiServerAddress) {
  var __emitter = new ImpulseEmitter();
  this.feed = __emitter.getFeed();

  var apiSocket;
  var ready = false;
  (function initApiSocket() {
    apiSocket = new WebSocket(__apiServerAddress);
    apiSocket.onopen = function () {
      console.log("OPENED");
      apiSocket.send(JSON.stringify({type:"CONNECTED"}));
      if (!ready) {
        __emitter.publish('stand-prepared', '');
        ready = true;
      }
    };
    apiSocket.onmessage = function (event) {
        var result = JSON.parse(event.data);
        __emitter.publish('message-received', '', result);
    };
    apiSocket.onclose = function (event) {
      console.log("CLOSED: " + JSON.stringify(event));
      initApiSocket();
    };
  })();
  this.send = function (data) {
    console.log("SHELL: Sending : " + data);
    apiSocket.send(data);
  };
}

var STAND_SERVICE;
