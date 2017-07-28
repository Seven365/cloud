var APP = window.top.APP;
var KEY_SERVICE = window.top.KEY_SERVICE;

launchActivity({
  onCreate: function (params) {
    var resultList = $Q('[data-control-name="resultList"]');
    KEY_SERVICE.feed.subscribe('keys-selected', null, function (data) {
      for (var i = 0; i < data.length; i++) {
        var keyGroup = data[i];
        resultList.appendChild(makeKeyGroupPeer(keyGroup, true));
      }
    });
    KEY_SERVICE.list();
    
    var filterInput = $Q('[data-control-name="filterInput"]');
    filterInput.oninput = function () {
      $TA(resultList, '.Item').forEach(function (item) {
        item.hidden = item.dataset.metadata.indexOf(filterInput.value) < 0;
      });
    };

    var nextStepTrigger = $Q('[data-control-name="nextStepTrigger"]');
    nextStepTrigger.onclick = function () {
      var keyIdList = [];
      var checkboxes = $A('input[type=checkbox]');
      for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
          keyIdList.push(checkboxes[i].dataset.keyId);
        }
      }
      if (0 < keyIdList.length && keyIdList.length <= 16) {
        APP.openPopup(
          'guest-key-request-form-2.html',
          {
            guestIdList:params.guestIdList,
            keyIdList:keyIdList
          },
          'guest-key-request'
        );
      }
    };
  }
});

