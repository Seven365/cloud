var APP = window.top.APP;

if (!HTMLCanvasElement.prototype.toBlob) {
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    value: function (callback, type, quality) {

      var binStr = atob( this.toDataURL(type, quality).split(',')[1] ),
          len = binStr.length,
          arr = new Uint8Array(len);

          for (var i=0; i<len; i++ ) {
            arr[i] = binStr.charCodeAt(i);
          }

          callback( new Blob( [arr], {type: type || 'image/png'} ) );
      }
  });
}

launchActivity({
  onCreate: function (params) {
    var controls = $TX(document, 'data-control-name');
    controls.preview.src = params.url;
    controls.preview.onload = function () {
      var cropper = new Cropper(controls.cropper, controls.preview);
      $Q('[data-input-name="saveTrigger"]').onclick = function () {
        cropper.toBlob().then(function (blob) {
          top.PASSPORT_SERVICE.uploadAvatar(blob).then(
            function () {
              APP.showHint('头像上传成功');
              top.APP.closePopup();
            },
            function () {
              APP.showHint('头像上传失败');
            }
          );
        });
      };
    };
  }
});
