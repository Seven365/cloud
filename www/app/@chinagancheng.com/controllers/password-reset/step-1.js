var APP = top.APP;
var BACKEND = top.BACKEND;
launchActivity({
  onCreate: function (params) {
    var controls = $TX(document, 'data-control-name');
    var hints = $TX(document, 'data-hint-path');
    controls.resetTrigger.onclick = function () {
      if (!(controls.password0Input.validity.valid && controls.password1Input.validity.valid)) {
        hints['/password'].textContent = '密码过短';
        return;
      }
      if (controls.password0Input.value != controls.password1Input.value) {
        hints['/password'].textContent = '两次输入的密码不一致';
        return;
      }
      if (true) {
        var xhr = BACKEND.makeRequest('POST', '/_api/passwords/tel-' + params.telephone, 'json');
        BACKEND.sendRequest(
          xhr,
          JSON.stringify({
            ticketId: params.ticketId,
            password: controls.password0Input.value
          })
        ).then(
          function (params) {
            APP.closePopup('password-reset');
            APP.showHint('密码重置成功');
          },
          function (xhr) {
            if (xhr.response.errors['/ticketId']) {
              APP.closePopup();
              APP.showHint('身份信息过期，请重新验证');
            } else {
              APP.showHint('服务状态异常，请稍后再试');
            }
          }
        );
      }
    }
  }
});

