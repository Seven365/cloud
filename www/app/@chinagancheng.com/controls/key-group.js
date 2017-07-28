function makeKeyGroupPeer(keyGroup, checkable, handleKeyInfo) {
  var keysNode = mkE('section');
  var groupNode = mkE('div', {'class':'expanded UKNKeyGroup'}, [
    mkE(
      'header', 
      [
        mkE('img', {src:'app/@chinagancheng.com/controllers/app/logo.svg', 'class':'Icon'}),
        mkE('div', {'class':'Name'}, [keyGroup.name]),
        mkE('img', {src:'app/@chinagancheng.com/controls/key-group-indicator.svg','class':'Indicator'}),
      ],
      function click() {
        groupNode.classList.toggle('expanded');
      }
    ),
    keysNode
  ]);
  for (var j = 0; j < keyGroup.keys.length; j++) {
    (function () {
      var keyInfo = keyGroup.keys[j];
      // FIXME: 判断方法过于狭隘
      if (checkable && keyInfo.limit >= 0) return;

      var checkbox = mkE('input', {type:'checkbox', 'data-key-id':keyInfo.id});
      keysNode.appendChild(
        mkE(
          'div',
          {'class':'Item hbox', 'data-metadata':keyInfo.name},
          [
            checkable ? checkbox : '',
            mkE('img', {src:'app/@chinagancheng.com/controllers/app/logo.svg', 'class':'Icon'}),
            mkE('div', {'class':'Name'}, [keyInfo.name]),
            mkE('div', {'class':'vbox'}, [
              mkE('div', {'class':'ExtraInfo0'}, ['最高访问次数：', keyInfo.limit >= 0 ? keyInfo.limit : '无限']),
              mkE('div', {'class':'ExtraInfo1'}, [keyInfo.effectiveTime.substring(0, 10),'~',keyInfo.expireTime.substring(0, 10)])
            ])
          ],
          function click(event) {
            if (checkable) {
              if (event.target != checkbox) {
                checkbox.click();
              }
            } else {
              handleKeyInfo(keyInfo);
            }
          }
        )
      );
    })();
  }
  return groupNode;
}

