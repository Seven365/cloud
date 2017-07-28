var APP = window.top.APP;
var PASSPORT_SERVICE = window.top.PASSPORT_SERVICE;
launchActivity({
  onCreate: function (params) {
    var peers = $TX($Q('.Activity'), 'data-name');
    peers.trigger.onclick = function () {
      if (peers.password0.value != peers.password1.value) {
        peers.passwordHint.textContent = '两次输入的密码不一致';
        return;
      }

      PASSPORT_SERVICE.signUp(
        params.ticketId,
        params.telephone,
        peers.realName.value,
        peers.password0.value
      ).then(
        function () {
          APP.showHint('新账号注册成功');
          location.href = 'sign-on.html';
        },
        function (error) {
          if (error) {
            peers.usernameHint.textContent = (error.username) ? error.username.message : '';
            peers.passwordHint.textContent = (error.password) ? error.password.message : '';
          } else {
            peers.hint.textContent = '无法连接到服务器，请稍后再试';
          }
        }
      );
    };
  }
});
