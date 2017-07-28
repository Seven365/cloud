function PushService(__standService, __visaService, __keyService, __messageService) {
    function handleNotification(notification) {
      __standService.send(JSON.stringify({type:'NOTIFICATION_RECEIVED'}));

      var data = JSON.parse(notification.details.data);
      switch(data.type) {
        case "KEYS_UPDATED": {
          __keyService.download();
          break;
        }
        case "KEYS_RESETED":
        case 'ACCOUNT_STATUS_LOCK':
        case 'ACCOUNT_LOCKED':
        {
          __visaService.signOff();
          break;
        }
        case 'VISA_RESETED':
        {
          __visaService.revalidate(data.randomId);
          break;
        }
        default: {
          console.log("NOTIFICATION", notification);
        }
      }
      __messageService.push({
        sender:'[系统通知]' + notification.title,
        datetime:new Date(),
        content:notification.alert
      });
    }

    var __alias = '';
    function updateAlias() {
      __standService.send(JSON.stringify({type:'JPush:setAlias', alias: __alias}));
    }
    __visaService.feed.subscribe('visa-selected', '', function (visa) {
      __alias = '' + visa.passportId;
      updateAlias();
    });
    __visaService.feed.subscribe('visa-deleted', null, function (visa) {
      __alias = '';
      updateAlias();
    });

    __standService.feed.subscribe("message-received", "", function (message) {
        switch (message.type) {
            case 'push': {
              handleNotification(message);
              break;
            }
            case 'alias-setting-result': {
              if (message.result != true) {
                updateAlias();
              }
              break;
            }
        }
    });
}

var PUSH_SERVICE;
