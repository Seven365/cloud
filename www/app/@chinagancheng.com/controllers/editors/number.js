function setByPointer(obj, pointer, value) {
  var segments = pointer.split('/');
  var target = obj;
  for (var i = 0; i < segments.length - 1; i++) {
    var segment = segments[i].replace('~1', '/').replace('~0', '~');
    if (segment == '') {
    } else {
      target = target[segment];
    }
    if (typeof target != 'object') throw new RangeError();
  }

  var lastSegment = segments[segments.length - 1].replace('~1', '/').replace('~0', '~');;
  if (Array.isArray(target) && (lastSegment == '-')) {
    target.push(value);
  } else {
    target[lastSegment] = value;
  }
  return obj;
}

function getByPointer(obj, pointer) {
  var segments = pointer.split('/');
  var result = obj;
  for (var i = 0; i < segments.length; i++) {
    var segment = segments[i].replace('~1', '/').replace('~0', '~');

    if (segment == '') {
      result = result;
    } else {
      result = result[segment];
    }
  }
  return result;
}

var APP = window.top.APP;
launchActivity({
  onCreate: function (params) {
    var outputs = $TX(document.body, 'data-output-name');
    var hints = $TX(document.body, 'data-hint-path');
    var inputs = $TX(document.body, 'data-input-name');
    outputs.fieldLabel.textContent = params.fieldLabel;
    inputs.content.value = params.currentValue;
    inputs.content.select();

    inputs.saveTrigger.onclick = function () {
      if (params.validate) {
        if (!params.validate(inputs.content.value, hints['/'])) {
          return;
        };
      }
      params.doSave(inputs.content.value);
      APP.showHint('修改成功');
      APP.closePopup();
    };
  }
});
