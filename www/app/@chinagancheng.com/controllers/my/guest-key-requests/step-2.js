var APP = window.top.APP;
var GUEST_KEY_SERVICE = window.top.GUEST_KEY_SERVICE;
launchActivity({
  onCreate: function (params) {
    console.log(params);
    var controls = $TX(document, 'data-control-name');

    new UKNSwitch(controls.limitSwitch, true, function (newValue) {
      if (newValue) {
        controls.limitInput.value = 1;
        controls.limitEditorTrigger.hidden = false;
      } else {
        controls.limitInput.value = -1;
        controls.limitEditorTrigger.hidden = true;
      }
    });

    controls.effectiveTimeInput.oninput = function () {
      controls.expireTimeInput.min = controls.effectiveTimeInput.value;
      if (controls.effectiveTimeInput.value < controls.effectiveTimeInput.value) {
        controls.expireTimeInput.value = controls.effectiveTimeInput.value;
      }
    };
    controls.expireTimeInput.oninput = function () {
    };
    controls.limitEditorTrigger.onclick = function () {
      APP.openPopup('editors/number.html', {
        fieldLabel: '使用次数上限',
        currentValue: controls.limitInput.value,
        validate: function (value, hintOutput) {
          if (!(1 <= value && value <= 100)) {
            hintOutput.textContent = '访客钥匙的使用次数至在1～100之间';
            return false;
          } else {
            return true;
          }
        },
        doSave: function (value) {
          controls.limitInput.value = value;
          controls.limitOutput.textContent = value;
        }
      });
    };
    var submitting = false;
    controls.submitTrigger.onclick = function () {
      if (submitting) {
        return;
      }
      if (!controls.effectiveTimeInput.validity.valid) {
        APP.showHint('生效时间无效');
        return;
      }
      if (!controls.effectiveTimeInput.validity.valid) {
        APP.showHint('失效时间无效');
        return;
      }
      submitting = true;
      if (controls.limitInput.value != 0) {
        GUEST_KEY_SERVICE.requestGuestKeys({
          guestIdList: params.guestIdList,
          keyIdList: params.keyIdList,
          effectiveTime: controls.effectiveTimeInput.value.replace('T', ' ') + ':00',
          expireTime: controls.expireTimeInput.value.replace('T', ' ') + ':00',
          limit: controls.limitInput.value
        }).then(
          function () {
            submitting = false;
            APP.closePopup('guest-key-request');
          },
          function (error) {
            submitting = false;
            APP.showHint(error.message);
            console.log(error);
          }
        );
      }
    };
  }
});

