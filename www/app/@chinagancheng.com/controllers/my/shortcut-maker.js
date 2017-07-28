var APP = window.top.APP;
var SHORTCUT_SERVICE = window.top.SHORTCUT_SERVICE;

launchActivity({
  onCreate: function () {
    var controls = $TX(document, 'data-control-name');
    controls.makeScanShortcutTrigger.onclick = function () {
      SHORTCUT_SERVICE.send(JSON.stringify({
        type:'Shortcut:make',
        command:'DO_QR_SCAN',
        title:'SCAN',
        iconUrl:new URL('./entries/scan.png', document.baseURI).href, 
        coverPage:new URL('./entries/scan.html', document.baseURI).href
      }));
      APP.showHint('正在创建...');
    };
    controls.makeOpenShortcutTrigger.onclick = function () {
      SHORTCUT_SERVICE.send(JSON.stringify({
        type:'Shortcut:make',
        command:'DO_UNLOCK',
        title:'OPEN',
        iconUrl:new URL('./entries/open.png', document.baseURI).href,
        coverPage:new URL('./entries/open.html', document.baseURI).href
      }));
      APP.showHint('正在创建...');
    };
  }
});
