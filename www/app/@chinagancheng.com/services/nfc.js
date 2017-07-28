function NFCService(__standService) {

    var __this = this;
    var __emitter = new ImpulseEmitter();
    __this.emitter = __emitter;
    __this.feed = __emitter.getFeed();


    __standService.send(JSON.stringify({ "type": "nfc-device" }));
    __standService.send(JSON.stringify({ "type": "nfc-state" }));

    __standService.feed.subscribe('message-received', "", function(message) {

        test.innerHTML = JSON.stringify(message);

        switch (message.type) {
            case 'device-nfc-support':
                {
                    if (!message.state) {
                        //显示消息 publish
                        // support_message.style.display = 'block';
                        __emitter.publish('device-nfc-support', '', message)

                    }
                    break;
                }
            case 'device-nfc-state':
                {
                    if (!message.state) {
                        //显示消息
                        // state_message.style.display = 'block';
                        __emitter.publish('device-nfc-state', '', message)
                    }
                    break;
                }
            case 'nfc-cardid':
                {
                    var cardId = message['cardid'];
                    // NFC_card_id.value = cardId;
                    //显示卡号
                    alert(message);
                    __emitter.publish('nfc-card-id', '', message)
                    __standService.send(JSON.stringify({ "type": "nfc-off" }));
                    break;
                }
        }
    })
}

var NFC_SERVICE;