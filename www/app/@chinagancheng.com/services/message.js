function MessageService(__visaService, __storage) {
  var __this = this;
  var __emitter = new ImpulseEmitter();
  var __visa;;
  __this.feed = __emitter.getFeed();

  var __messageStore = [];
  var __messagesById = {};

  __this.push = function (message) {
    __messageStore.unshift(message);
    __messagesById[message.id] = message;
    if (__messageStore.length > 100) {
      __messageStore.pop();
    }
    if (__visa.mode == 0) {
      __storage['MESSAGE-STORE-' + __visa.passportId] = JSON.stringify(__messageStore);
    }
    __emitter.publish('message-pushed', '', message);
  };

  __this.list = function () {
    return JSON.parse(JSON.stringify(__messageStore));
  };

  __this.getById = function (id) {
    return __messagesById[id];
  };

  __visaService.feed.subscribe('visa-selected', '', function (visa) {
    __visa = visa;
    __messageStore = [];
    __messagesById = {};
    try {
      __messageStore = JSON.parse(__storage['MESSAGE-STORE-' + __visa.passportId]);
      for (var i = 0; i < __messageStore.length; i++) {
        var message = __messageStore[i];
        __messagesById[message.id] = message;
      }
    } catch (e) {
    }
    if (visa.firstRun) {
      var content = "欢迎使用云门禁系统。\n" +
                    "请向管理员申请分配钥匙。";
      __this.push({
        sender:'系统通知',
        datetime:new Date(),
        content:content
      });
    }
    __emitter.publish('messages-reloaded', '', null);
  });
}
var MESSAGE_SERVICE;
