var APP = window.top.APP;
var VISA_SERVICE = window.top.VISA_SERVICE;
var PASSPORT_SERVICE = window.top.PASSPORT_SERVICE;
launchActivity({
  onCreate: function () {
    var triggers = $TX(document.body, 'data-trigger-target');

    var avatarImage;
    var avatarHolder = $Q('.Avatar');
    function updateAvatar(url) {
      avatarHolder.src = url;
    }
    try {
      updateAvatar(VISA_SERVICE.getAvatarUrl());
    } catch (ex) {}
    subscribe(PASSPORT_SERVICE, 'visa-selected', undefined, updateAvatar);
    subscribe(PASSPORT_SERVICE, 'avatar-updating-succeed', undefined, updateAvatar);

    var fileInput;
    triggers.avatar.onclick = function () {
      fileInput = mkE('input', {type:'file', accept:'image/*'});
      fileInput.addEventListener('change', function () {
        var sourceImage = new Image();
        sourceImage.src = URL.createObjectURL(fileInput.files[0]);
        sourceImage.onload = function () {
          var fileReader = new FileReader();
          fileReader.onload = function(e) {
            var buffer = e.target.result;
            var exif = (EXIF.readFromBinaryFile(buffer));

            var blobUrl;
            if (exif) {
              var canvas = document.createElement('canvas');
              var config = {
                1: {w:exif.PixelXDimension, h:exif.PixelYDimension, x:0,                     y:0,                     r: 0},
                6: {w:exif.PixelYDimension, h:exif.PixelXDimension, x:0,                     y:-exif.PixelYDimension, r: +Math.PI/2},
                8: {w:exif.PixelYDimension, h:exif.PixelXDimension, x:-exif.PixelXDimension, y:0,                     r: -Math.PI/2},
                3: {w:exif.PixelXDimension, h:exif.PixelYDimension, x:-exif.PixelXDimension, y:-exif.PixelYDimension, r: Math.PI},
              }[exif.Orientation];
              var factor = 2;
              canvas.width = config.w / factor;
              canvas.height = config.h / factor;
              var ctx = canvas.getContext('2d');
              ctx.rotate(config.r);
              ctx.drawImage(sourceImage, config.x / factor, config.y / factor, sourceImage.width / factor, sourceImage.height / factor);
              blobUrl = canvas.toDataURL("image/jpeg", 0.8);
            } else {
              blobUrl = sourceImage.src;
            }
            APP.openPopup('editors/avatar.html', {
              url:blobUrl
            });
          };
          fileReader.readAsArrayBuffer(fileInput.files[0]);
        };
      });
      fileInput.click();
    };

    triggers.nickname.onclick = function () {
      APP.openPopup('editors/text.html', {
        fieldLabel: '昵称',
        fieldPointer: '/nickname',
        feed: PASSPORT_SERVICE.feed,
        doLoad: function () {
          PASSPORT_SERVICE.loadProfile();
        },
        doSave: function (profile) {
          PASSPORT_SERVICE.saveProfile(profile);
        }
      });
    };

    triggers.telephone.onclick = function () {
      APP.openPopup('editors/tel.html', {
        fieldLabel: '手机号码',
        fieldPointer: '/telephone',
        feed: PASSPORT_SERVICE.feed,
        doLoad: function () {
          PASSPORT_SERVICE.loadProfile();
        },
        doSave: function (profile) {
          PASSPORT_SERVICE.saveProfile(profile);
        },
        validate: function (value, hint) {
          if (/^[0-9]{11}$/.test(value)) {
            return true;
          } else {
            hint.textContent = '手机号码应为11位数字';
            return false;
          }
        }
      });
    };

    triggers.password.onclick = function () {
      APP.openPopup('editors/password.html', {
        feed: PASSPORT_SERVICE.feed,
        doSave: function (oldPassword, newPassword) {
          PASSPORT_SERVICE.updatePassword(oldPassword, newPassword);
        }
      });
    };
  }
});
