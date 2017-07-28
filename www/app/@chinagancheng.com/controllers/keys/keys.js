'use strict';

var KEY_SERVICE = window.top.KEY_SERVICE;

var mainArea = $Q('.Activity > main');

function renderKeys(data) {
  mainArea.innerHTML = '';
  for (var i = 0; i < data.length; i++) {
    var keyGroup = data[i];
    mainArea.appendChild(
      makeKeyGroupPeer(
        keyGroup,
        false,
        function (keyInfo) {
          top.APP.openPopup('key.html', keyInfo);
        }
      )
    );
  }
}

KEY_SERVICE.feed.subscribe('keys-downloaded', null, renderKeys);
KEY_SERVICE.feed.subscribe('keys-selected', null, renderKeys);
KEY_SERVICE.list();

