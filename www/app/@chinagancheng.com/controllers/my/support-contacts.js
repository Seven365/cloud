var PASSPORT_SERVICE = window.top.PASSPORT_SERVICE;
launchActivity({
  onCreate: function () {
    var mainArea = $Q('main > .client-area');
    
    subscribe(PASSPORT_SERVICE, 'contacts-selected', undefined, function (data) {
      for (var d of data) {
        mainArea.appendChild(
          mkE('a', {href:'tel:' + d.tel}, [
            mkE('span', [d.name]),
            mkE('span', [d.tel]),
          ])
        );
      }
    });
    PASSPORT_SERVICE.loadContacts();
  }
});

