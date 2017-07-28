var xd_back = document.getElementById('xd_back');
var APP = top.APP;
var BACKEND = top.BACKEND;
// var NFC_SERVICE = top.NFC_SERVICE;
var NFC_card_id = document.getElementById('NFC_card_id');
var xd_bind_NFC_btn = document.getElementById('xd_bind_NFC_btn');
var support_message = document.getElementById('support_message');
var state_message = document.getElementById('state_message');
var comments = document.getElementById('comments');


//返回
xd_back.addEventListener('touchend', function(e) {
    if (document.activeElement) {
        document.activeElement.blur();
    }
    APP.closePopup();
});

//绑定NFC
xd_bind_NFC_btn.addEventListener('touchend', function(e) {

    // visaid是需要修改的部门 ， 尤其是获取， 还有请求体的部分==================注意=============
    var VISA_INFO = JSON.parse(window.localStorage['VISA_INFO']);
    var VISA_ID = VISA_INFO('visaId');
    var post_data = {
        data: [{
            visaId: VISA_ID,
            cardIds: [{
                cardId: NFC_card_id.value,
                cardStatus: 0,
                des: comments.value
            }]
        }]
    };


    var xhr = BACKEND.makeRequest('POST', '/v2/mobile/cards', 'json');
    BACKEND.sendRequest(
        xhr,
        JSON.stringify(post_data)
    ).then(function(params) {
        //绑定成功， 提示一下
        APP.showHint('绑定NFC成功!');
        if (document.activeElement) {
            document.activeElement.blur();
        }
        APP.closePopup();
        //重新下载卡片
        NFC_SERVICE.emitter.publish('redownload-cards')

    }).catch(function(err) {
        APP.showHint('绑定NFC失败，请重试！')
    })
});

var NFC_SERVICE = window.top.NFC_SERVICE;

NFC_SERVICE.feed.subscribe('device-nfc-support', null, function(data) {

    support_message.style.display = 'block';

});
NFC_SERVICE.feed.subscribe('device-nfc-state', null, function(data) {
    state_message.style.display = 'block';

});
NFC_SERVICE.feed.subscribe('nfc-card-id', null, function(data) {
    alert(data);
    NFC_card_id.value = data['cardid'];
});