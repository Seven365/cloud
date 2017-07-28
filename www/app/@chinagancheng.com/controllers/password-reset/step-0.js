function UKNTokenGenerateButton(trigger, doValidate, doGenerate, timeout) {
  trigger.textContent = '获取验证码';
  var counter = 0; 
  trigger.onclick = function () {
    if (counter == 0 && doValidate()) {
      trigger.disabled = true;
      doGenerate();
      counter = timeout;
      setTimeout(function countDown() {
        trigger.textContent = '在' + counter + '秒内输入';
        if (counter > 0) {
          counter--;
          setTimeout(countDown, 1000);
        } else {
          trigger.disabled = false;
          trigger.textContent = '重新获取';
        }
      }, 1000);
    }
  }
}

var APP = top.APP;
var BACKEND = top.BACKEND;
launchActivity({
  onCreate: function () {
    var controls = $TX(document, 'data-control-name');
    new UKNTokenGenerateButton(
      controls.generateTrigger,
      function () {
        return controls.telephoneInput.validity.valid;
      },
      function () {
        var xhr = BACKEND.makeRequest('POST', '/_api/token-codes/tel-' + controls.telephoneInput.value, 'json');
        BACKEND.sendRequest(xhr);
      },
      60
    );
    controls.nextTrigger.onclick = function () {
      if (controls.telephoneInput.validity.valid && controls.tokenCodeInput.validity.valid) {
        var xhr = BACKEND.makeRequest('POST', '/_api/tickets/', 'json');
        BACKEND.sendRequest(
          xhr,
          JSON.stringify({
            telephone: controls.telephoneInput.value,
            tokenCode: controls.tokenCodeInput.value
          })
        ).then(
          function (params) {
            top.APP.openPopup(
              'password-reset-form-1.html', 
              {
                telephone: controls.telephoneInput.value,
                ticketId: params.ticketId
              },
             'password-reset'
            );
          },
          function () {
            APP.showHint('验证码错误，请核对手机号后重新获取');
          }
        );
      }
    }
  }
});

