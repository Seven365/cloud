function Cropper(peer, rawImage) {
  peer.style.pointerEvents = 'auto';
  var cropBox = peer.querySelector('.Frame');

  var x = 0, y = 0, z = 1;

  var minZoom = Math.max(cropBox.clientWidth / rawImage.width, cropBox.clientHeight / rawImage.height);

  z = minZoom;
  maxZoom = minZoom * 8;

  function transformElement(e, transform) {
    e.style.webkitTransform = transform;
    e.style.transform = transform;
  }

  transformElement(rawImage, 'scale('+ z +') translate(' + x + 'px,' + y + 'px)');

  var m, n, d, pinching = false;

  function calculateDistance(p0, p1) {
      return Math.pow(Math.pow(p1.clientX - p0.clientX, 2) + Math.pow(p1.clientY - p0.clientY, 2), 0.5);
  }

  function updatePinchingState(ev) {
    if (!pinching) {
        if (ev.touches.length == 2) {
            pinching = true;
            d = calculateDistance(ev.touches[0], ev.touches[1]);
            console.log("Pinch Start", ev, d);
        }
    } else {
        pinching = false;
        d = null;
        transformElement(rawImage, 'scale('+ nz +') translate(' + x + 'px,' + y + 'px)');
        z = nz;
        console.log("Pinch end");
    }
    if (ev.touches.length === 1) {
      m = ev.touches[0].clientX;
      n = ev.touches[0].clientY;
    }
  }

  peer.ontouchstart = updatePinchingState;
  peer.ontouchend = updatePinchingState;

  var nz = z;
  peer.ontouchmove = function (ev) {
    if (ev.touches.length === 1) {
      var p = ev.touches[0].clientX;
      var q = ev.touches[0].clientY;
      x += (p - m) / z;
      y += (q - n) / z;

      m = p;
      n = q;
      nz = z;
    } else if (pinching) {
      var nd = calculateDistance(ev.touches[0], ev.touches[1]);
      nz = Math.min(maxZoom, Math.max(minZoom, z * nd / d));
      console.log('NZ', nz, z, nd, d);
    }
    transformElement(rawImage, 'scale('+ nz +') translate(' + x + 'px,' + y + 'px)');
  }

  this.toBlob = function () {
    var canvas = document.createElement('canvas');
    canvas.width = cropBox.clientWidth;
    canvas.height = cropBox.clientHeight;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    console.log(cropBox.clientWidth, cropBox.clientHeight, rawImage.width, rawImage.height, x, y, nz);
    ctx.drawImage(rawImage, (cropBox.clientWidth - rawImage.width * nz) /2 + x * nz, (cropBox.clientHeight - rawImage.height * nz) /2 + y * nz, rawImage.width * nz, rawImage.height * nz);

    var c2 = document.createElement('canvas');
    c2.width = 200;
    c2.height = 200;
    var ctx2 = c2.getContext('2d');
    ctx2.drawImage(canvas, 0, 0, 200, 200);

    return new Promise(function (resolve) {
      c2.toBlob(function(blob){
        console.log(URL.createObjectURL(blob));
        resolve(blob);
      }, "image/jpeg", 0.95);
    });
  }
}
