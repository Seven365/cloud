function SettingService(__visaService) {
  var __this = this;
  var __emitter = new ImpulseEmitter();
  __this.feed = __emitter.getFeed();

  var __settings = {
    signalValueSensitivity: 20,
    signalDeltaSensitivity: 5,
    shakingSensitivity: 5,
    audioHint: true,
    vibration: true
  };

  try {
    Object.assign(__settings, JSON.parse(localStorage['SETTINGS']));
  } catch (e){
  }

  var __validators = {
    '/signalValueSensitivity':function (value) {
      return (0 <= value) && (value <= 40);
    },
    '/signalDeltaSensitivity':function (value) {
      return (0 <= value) && (value <= 10);
    },
    '/shakingSensitivity':function (value) {
      return (1 <= value) && (value <= 10);
    },
    '/audioHint':function (value) {
      return (typeof value == 'boolean');
    },
    '/vibration':function (value) {
      return (typeof value == 'boolean');
    }
  };

  var __visaId;
  __visaService.feed.subscribe('visa-selected', '', function (visa) {
    __visaId = visa.visaId;
  });

  __visaService.feed.subscribe('visa-deleted', '', function (visa) {
    __visaId = null;
  });

  function isValid(pointer, value) {
    var doValidate = __validators[pointer];
    if (!doValidate) return false;
    return doValidate(value);
  }

  __this.setSetting = function (pointer, value) {
    if (isValid(pointer, value)) {
      setByPointer(__settings, pointer, value);
    } else {
      throw RangeError();
    }
  };

  __this.getSetting = function (pointer) {
    return getByPointer(__settings, pointer);
  };

  __this.save = function() {
    localStorage['SETTINGS'] = JSON.stringify(__settings);
  };
}

var SETTING_SERVICE;
