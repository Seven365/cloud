var APP = window.top.APP;
var VISA_SERVICE = window.top.VISA_SERVICE;
var PASSPORT_SERVICE = window.top.PASSPORT_SERVICE;
var NFC_SERVICE = window.top.NFC_SERVICE;
var BACKEND = top.BACKEND; //ajax



var add_nfc_card_btn = document.getElementById('add_nfc_card_btn');
var xd_back = document.getElementById('xd_back');

// 返回
xd_back.addEventListener('touchend', function (e) {
	 if (document.activeElement) {
          document.activeElement.blur();
        }
        APP.closePopup();
});

add_nfc_card_btn.addEventListener('touchend' , function () {
	APP.openPopup('bind-NFC-card.html');
});

// window.top['accountId']

var xhr = BACKEND.makeRequest('GET', '/v2/accounts/cards/{organsAccountIds}', 'json');
BACKEND.sendRequest(xhr).then(function (result) {
   
   
}).catch(function (error) {
   
   
});





NFC_SERVICE.feed.subscribe('redownload-cards', null, function () {
	console.log('重新下载卡片');
	var xhr = BACKEND.makeRequest('GET', '/v2/accounts/cards/{organsAccountIds}', 'json');
	BACKEND.sendRequest(
        xhr
    ).then(function(params) {
       

    }).catch(function(err) {

    })
});