var APP = window.top.APP;
var KEY_SERVICE = window.top.KEY_SERVICE;

launchActivity({
  onCreate: function () {
    var controls = $TX(document, 'data-control-name');
    var finished = true;
    controls.submitTrigger.onclick = function () {
      if (finished) {
        finished = false;
        KEY_SERVICE.reportKeyLost(controls.passwordInput.value).then(
          function () {
            finished = true;
          },
          function (reasonCode) {
            finished = true;
            if (reasonCode == 400) {
              controls.hintOutput.textContent = '当前密码输入错误';
            } else {
              APP.showHint('服务器无响应，请稍后再试');
            }
          }
        );
      }
    }
  }
});

