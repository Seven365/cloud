var APP = top.APP;
var BACKEND = top.BACKEND;

var xd_container = document.querySelector('.xd-container');

var xd_back = document.getElementById('xd_back');

// 返回
xd_back.addEventListener('touchend', function (e) {
    if (document.activeElement) {
        document.activeElement.blur();
    }
    APP.closePopup();
});

var xhr = BACKEND.makeRequest('get', '/v2/mobile/oragn_accounts', 'josn');
BACKEND.sendRequest(xhr).then(function (results) {
    alert(results);
    if(!results.result){
        results = JSON.parse(results)
    }
    alert(results);
    var organsAccounts = results['organsAccounts'];
    var html = '';
    for(var i=0, len=organsAccounts.length; i<len; i++){
        html += '<div class="organ" data-account-id="'+organsAccounts[i]['organAccountId']+'">';
        html += '<p class="organ-name">'+organsAccounts[i]['organName']+'</p>';
        html += '<p class="real-name">'+organsAccounts[i]['realName']+'</p>';
        html += '<span><svg class="icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1780"><path d="M418.55488 883.887104c-5.241856 0-10.481664-1.998848-14.481408-5.998592-7.998464-7.99744-7.998464-20.965376 0-28.962816L740.652032 512.347136 404.073472 175.767552c-7.998464-7.998464-7.998464-20.965376 0-28.962816s20.965376-7.998464 28.962816 0l351.060992 351.060992c3.84 3.84 5.997568 9.050112 5.997568 14.481408s-2.157568 10.641408-5.998592 14.481408L433.036288 877.889536C429.037568 881.887232 423.794688 883.887104 418.55488 883.887104z" p-id="1781"></path></svg></span>';
        html += '</div> ';
    }
    alert(html);
    xd_container.innerHTML = html;
    bind_openup_event();

}).catch(function (error) {

});

bind_openup_event();
function bind_openup_event() {
    var organs = document.querySelectorAll('.organ');
    for (var i=0, len=organs.length; i< len; i++){
        organs[i].addEventListener('touchend', function (event) {
            var __this = this;
            var accountId = __this.dataset['accountId'];
            window.top['accountId'] = accountId;

            //打开新页面
            APP.openPopup('card-manage.html');

        }, false)
    }
}



