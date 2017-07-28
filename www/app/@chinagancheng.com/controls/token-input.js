function UKNTokenInput(peer, doGenerate, timeout) {
  peer.className = 'UKNTokenInput';
  var input = document.createElement('input');
  input.type = 'text';
  var trigger = document.createElement('button');
  trigger.textContent = '获取';
  var counter = 0; 
  trigger.onclick = function () {
    if (counter == 0) {
      trigger.disabled = true;
      doGenerate();
      counter = timeout;
      setTimeout(function countDown() {
        trigger.textContent = '在' + counter + '秒内输入';
        if (counter > 0) {
          counter--;
          setTimeout(countDown, 1000);
        } else {
          trigger.disabled = false;
          trigger.textContent = '获取';
        }
      }, 1000);
    }
  }
  peer.appendChild(input);
  peer.appendChild(trigger);
}

