var APP = window.top.APP;
var GUEST_KEY_SERVICE = window.top.GUEST_KEY_SERVICE;

launchActivity({
  onCreate: function () {
    var guestInfoList = $Q('[data-control-name="guestInfoList"]');

    var guestPhoneNumberInput = $Q('[data-control-name="guestPhoneNumberInput"]');
    guestPhoneNumberInput.oninput = function () {
      addGuestTrigger.disabled = !(/^[0-9]{11}$/.test(guestPhoneNumberInput.value));
    };

    var addGuestTrigger = $Q('[data-control-name="addGuestTrigger"]');
    
    var addedNumbers = {};
    addGuestTrigger.onclick = function () {
      var items = $TA(guestInfoList, '.Item');
      if (items.length >= 10) return;
      for (var i = 0; i < items.length; i++) {
        if (items[i].dataset.guestPhoneNumber === guestPhoneNumberInput.value) {
          APP.showHint('号码已在访客列表当中');
          return;
        }
      }
      GUEST_KEY_SERVICE.getGuestInfo(guestPhoneNumberInput.value).then(
        function (info) {
          var items = $TA(guestInfoList, '.Item');
          for (var i = 0; i < items.length; i++) {
            if (items[i].dataset.guestPhoneNumber === guestPhoneNumberInput.value) {
              return;
            }
          }
          guestInfoList.appendChild(
            mkE('div', {'class':'Item', 'data-guest-id':info.id, 'data-guest-phone-number':info.phoneNumber}, [
              mkE('img', {'class':'Avatar', src:'app/@chinagancheng.com/controllers/app/logo.svg'}),
              mkE('div', {'class':'flexible UserInfo'}, [
                mkE('div', {'class':'Name'}, [info.name]),
                mkE('div', [info.phoneNumber])
              ]),
              mkE('div', ['删除'], function click() {
                this.parentNode.parentNode.removeChild(this.parentNode);
              })
            ])
          );
        },
        function (status) {
          switch (status) {
            case 403:
              APP.showHint('不能向此人发送访客钥匙');
              break;
            case 404:
              APP.showHint('该机主目前不是本系统的用户');
              break;
            default:
              APP.showHint('连接服务器异常，请稍后再试');
          }
        }
      )
    };

    var nextStepTrigger = $Q('[data-control-name="nextStepTrigger"]');
    nextStepTrigger.onclick = function () {
      var guestIdList = [];
      var guestInfoItems = $TA(guestInfoList, '.Item')
      for (var i = 0; i < guestInfoItems.length; i++) {
        guestIdList.push(guestInfoItems[i].dataset.guestId);
      }
      if (guestIdList.length > 0) {
        APP.openPopup('guest-key-request-form-1.html', {guestIdList:guestIdList}, 'guest-key-request');
      }
    };
  }
});
