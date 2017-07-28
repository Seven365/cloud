function UKNSlider(peer, minValue, maxValue, currentValue, doRefresh) {
  var __this = this;
  peer.className = 'UKNSlider';
  peer.innerHTML = '<ukn-slider-outer-bar><ukn-slider-inner-bar></ukn-slider-inner-bar></ukn-slider-outer-bar><ukn-slider-thumb></ukn-slider-thumb>';
  var handle = peer.lastElementChild;
  var upperBar = peer.firstElementChild.firstElementChild;

  var offset;
  var value = currentValue;

  this.update = function (newValue) {
    var v;
    if (newValue < minValue) {
      v = minValue;
    } else if (newValue > maxValue) {
      v = maxValue;
    } else {
      v = newValue;
    }
    var handleW = handle.getBoundingClientRect().width;
    offset = 100 * (v - minValue) / (maxValue - minValue);
    handle.style.transform = 'translate(' + offset + '%, 0)';
    handle.style.webkitTransform = 'translate(' + offset + '%, 0)';
    upperBar.style.transform = 'translate(' + offset + '%, 0)';
    upperBar.style.webkitTransform = 'translate(' + offset + '%, 0)';
    if (doRefresh) doRefresh(value);
  };

  this.update(value);

  function handleMovement(clientX, event) {
    var layerX = clientX - peer.getBoundingClientRect().left;
    var offset;
    if (layerX < 0) {
      offset = 0;
    } else if (layerX > peer.clientWidth) {
      offset = 100;
    } else {
      offset = 100 * layerX / peer.clientWidth
    }
    value = Math.round(minValue + offset * (maxValue - minValue) / 100);
    __this.update(value);
  }

  var sliding = false;
  peer.onmousedown = function (event) {
    sliding = true;
    if (peer.setCapture) peer.setCapture();
    handleMovement(event.clientX);
  };
  peer.onmousemove = function (event) {
    if (sliding) {
      handleMovement(event.clientX);
    }
  };
  peer.onmouseup = function (event) {
    if (sliding) {
      sliding = false;
      if (document.releaseCapture) document.releaseCapture();
    }
  };
  if (1) {
    peer.addEventListener('touchstart', function (event) {
      console.log("Touched");
      sliding = true;
      handleMovement(event.touches[0].clientX);
    });
    peer.addEventListener('touchmove', function (event) {
      if (sliding) {
        handleMovement(event.touches[0].clientX);
      }
    });
    peer.addEventListener('touchup', function (event) {
      if (sliding) {
        sliding = false;
      }
    });
  }
}
