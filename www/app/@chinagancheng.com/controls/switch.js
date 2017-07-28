function UKNSwitch(peer, value, doRefresh) {
  function renderValue() {
    peer.dataset.state = __value ? 'on' : 'off';
  }
  peer.className = 'UKNSwitch';
  var __value = !!value;
  renderValue();
  peer.ontouchstart = function (event) {
    __value = !__value;
    renderValue();
    if (doRefresh) doRefresh(__value);
  };
}
