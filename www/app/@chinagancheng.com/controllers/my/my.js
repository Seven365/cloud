var APP = window.top.APP;
var VISA_SERVICE = window.top.VISA_SERVICE;
var PASSPORT_SERVICE = window.top.PASSPORT_SERVICE;
launchActivity({
  onCreate: function () {
    subscribe(PASSPORT_SERVICE, 'profile-selected', '', function (profile) {
      $Q('.UserInfo .Name').textContent = profile.nickname;
    });
    subscribe(PASSPORT_SERVICE, 'profile-updated', '', function (profile) {
      $Q('.UserInfo .Name').textContent = profile.nickname;
    });

    var avatarHolder = $Q('.Avatar');
    function updateAvatar(url) {
      avatarHolder.src = url;
    }
    try {
      updateAvatar(VISA_SERVICE.getAvatarUrl());
    } catch (ex) {}
    subscribe(PASSPORT_SERVICE, 'visa-selected', undefined, updateAvatar);
    subscribe(PASSPORT_SERVICE, 'avatar-updating-succeed', undefined, updateAvatar);

    PASSPORT_SERVICE.loadProfile();
    var triggers = $TX(document, 'data-trigger-target');
    triggers['key-lost-report'].onclick = function () {
      APP.openPopup("key-lost-report.html");
    };
    triggers['guest-key-request'].onclick = function () {
      APP.openPopup("guest-key-request-form.html", {}, 'guest-key-request');
    };
    triggers.profile.onclick = function () {
      APP.openPopup("profile.html");
    };
    triggers.settings.onclick = function () {
      APP.openPopup("settings.html");
    };
    triggers['make-shortcuts'].onclick = function () {
      APP.openPopup("shortcut-maker.html");
    };
    triggers['NFC-card-manage'].onclick = function () {
      APP.openPopup("organ-accounts.html");
    };
    triggers['support-contacts'].onclick = function () {
      APP.openPopup("support-contacts.html");
    };
    triggers.about.onclick = function () {
      APP.openPopup("about.html");
    };
    triggers.signOff.onclick = function () {
      VISA_SERVICE.signOff();
    };
  }
});
