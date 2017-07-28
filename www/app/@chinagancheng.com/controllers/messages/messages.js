'use strict';

var MESSAGE_SERVICE = window.top.MESSAGE_SERVICE;
var VISA_SERVICE = window.top.VISA_SERVICE;

var mainArea = $Q('.Activity > main > .client-area');

function padNumber(n, size) {
  var result = '';
  var length = (n + '').length
  for (var i = 0; i < size - length; i++) {
    result += '0';
  }
  result += n;
  return result;
}

function formatDate(datetime) {
  var date = new Date(datetime);
  if (new Date() - date < 24 * 3600 * 1000) {
    return padNumber(date.getHours(), 2) + ':' + padNumber(date.getMinutes(), 2);
  } else {
    return date.getFullYear() + '-' + padNumber(date.getMonth() + 1, 2) + '-' + padNumber(date.getDate(), 2);
  }
}

function makeMessageNode(message) {
  return mkE(
    'div',
    {'class':'Item'},
    [
      mkE('img', {'class':'Icon', src:'app/@chinagancheng.com/controllers/app/logo.svg'}),
      mkE('div', {'class':'flexible vbox'}, [
        mkE('div', {'class':'hbox'},[
          mkE('div', {'class':'flexible'}, [mkE('div', {'class':'Sender'}, [message.sender])]),
          mkE('div', {'class':'Datetime'}, [formatDate(message.datetime)])
        ]),
        mkE('div', [mkE('div', {'class':'Content'}, [message.content])])
      ]),
    ],
    function click() {
      top.APP.openPopup('message.html', message);
    }
  );
}

function repaint() {
  mainArea.innerHTML = '';
  var data = MESSAGE_SERVICE.list();
  for (var j = 0; j < data.length; j++) {
    var message = data[j];
    mainArea.appendChild(makeMessageNode(message));
  }
}

repaint();

MESSAGE_SERVICE.feed.subscribe('messages-reloaded', '', function () {
  repaint();
});

MESSAGE_SERVICE.feed.subscribe('message-pushed', '', function (message) {
  mainArea.insertBefore(
    makeMessageNode(message),
    mainArea.firstChild
  );
});

