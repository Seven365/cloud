var VISA_SERVICE = window.top.VISA_SERVICE;
launchActivity({
  onCreate: function () {
    var peers = $TX($Q('.Activity'), 'data-control-name');
    var guestMode = 0;
    peers.username.value = localStorage['LAST_LOGIN_NAME'] || '';

    var requesting = false;
    peers.trigger.onclick = function () {
      peers.hint.textContent = '';
      VISA_SERVICE.signOn(
        peers.username.value,
        peers.password.value,
        guestMode
      ).then(
        function (visa) {
          requesting = false;
          if (guestMode == 0) {
            localStorage['LAST_LOGIN_NAME'] = peers.username.value;
          }
          var returnUrl = localStorage['RETURN_URL'];
          if (returnUrl) {
            delete localStorage['RETURN_URL'];
          }
          location.replace(returnUrl || 'main.html');
        },
        function (error) {
          if (error) {
            peers.hint.textContent = error.message;
            peers.password.value = '';
          } else {
            peers.hint.textContent = '无法连接到服务器，请稍等再试';
          }
        }
      ).catch(function () {
        peers.hint.textContent = '无法连接到服务器，请稍后再试';
      });
    };
    peers.resetPasswordTrigger.onclick = function () {
      top.APP.openPopup('password-reset-form-0.html', null, 'password-reset');
    };
    peers.guestModeToggler.onclick = function () {
      guestMode = 1 ^ guestMode;
      if (guestMode == 0) {
        peers.trigger.textContent = '临时登录';
      } else {
        peers.trigger.textContent = '登录';
      }
    };
  }
});
