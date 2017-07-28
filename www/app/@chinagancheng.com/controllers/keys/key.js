var KEY_SERVICE = top.KEY_SERVICE;
launchActivity({
  onCreate: function (params) {
    var mainArea = $Q('main > .client-area');
    mainArea.appendChild(mkE('h1', {}, [
      mkE('img', {src:'app/@chinagancheng.com/controllers/keys/pic.jpg'}),
      params.orgName, params.name
    ]));
    var duration = KEY_SERVICE.getDurationByKeyId(KEY_SERVICE.extractKeyId(params.hexKey));
    console.log(params);
    mainArea.appendChild(mkE('div', {}, [
      (mkE('nobr', {}, ['生效时间：', params.effectiveTime])),
      (mkE('nobr', {}, ['失效时间：', params.expireTime])),
      (mkE('nobr', {}, ['最多使用次数：', params.limit >= 0 ? params.limit + '次' : '无限'])),
      (mkE('nobr', {}, ['剩余使用次数：', duration >= 0 ? duration + '次' : '无限']))
    ]));
  }
});
