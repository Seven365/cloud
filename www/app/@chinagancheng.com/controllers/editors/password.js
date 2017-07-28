var APP = top.APP;
launchActivity({
  onCreate: function (params) {
    var hints = $TX(document.body, 'data-hint-path');
    var inputs = $TX(document.body, 'data-input-name');

    var errorCallback = params.feed.subscribe('update-password-failed', null, function (error) {
      for (var key in error) {
        hints[key].textContent = error[key];
      }
    });
    var okCallback = params.feed.subscribe('password-updated', null, function () {
      APP.showHint('修改成功');
      APP.closePopup();
      params.feed.unsubscribe(errorCallback);
      params.feed.unsubscribe(okCallback);
    });

    inputs.saveTrigger.onclick = function () {
      var errorCount = 0;
      hints['/oldPassword'].textContent = '';
      hints['/newPassword'].textContent = '';
      if (inputs.newPassword0.value != inputs.newPassword1.value) {
        hints['/newPassword'].textContent = '两次输入的新密码不一致';
        errorCount++;
      }
      if (errorCount == 0) {
        params.doSave(
          inputs.oldPassword.value,
          inputs.newPassword0.value
        );
      }
    };
  }
});
