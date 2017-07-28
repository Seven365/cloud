function padNumber(n, size) {
  var result = '';
  var length = (n + '').length
  for (var i = 0; i < size - length; i++) {
    result += '0';
  }
  result += n;
  return result;
}

launchActivity({
  onCreate: function (params) {
    var mainArea = $Q('main > .client-area');
    var date = new Date(params.datetime);
    console.log(date);
    mainArea.appendChild(mkE('div', {'class':'Datetime'}, [
      date.getFullYear() + '/' + (date.getMonth() + 1)+ '/' + date.getDate() +
      ' ' + date.getHours() + ':' + padNumber(date.getMinutes(), 2)
    ]));
    mainArea.appendChild(mkE('div', {'class':'Content'}, [params.content]));
  }
});

