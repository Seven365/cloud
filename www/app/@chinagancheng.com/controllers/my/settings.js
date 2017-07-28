var SETTING_SERVICE = window.top.SETTING_SERVICE;

launchActivity({
  onCreate: function () {
    var controls = $TX(document, 'data-input-name');

    new UKNSlider(controls.signalValueSensitivitySlider, 0, 40, SETTING_SERVICE.getSetting('/signalValueSensitivity'), function (newValue) {
      SETTING_SERVICE.setSetting('/signalValueSensitivity', newValue);
    });
    new UKNSlider(controls.signalDeltaSensitivitySlider, 0, 10, SETTING_SERVICE.getSetting('/signalDeltaSensitivity'), function (newValue) {
      SETTING_SERVICE.setSetting('/signalDeltaSensitivity', newValue);
    });
    new UKNSlider(controls.shakingSensitivitySlider, 1, 10, SETTING_SERVICE.getSetting('/shakingSensitivity'), function (newValue) {
      SETTING_SERVICE.setSetting('/shakingSensitivity', newValue);
    });
    new UKNSwitch(controls.audioHintSwitch, SETTING_SERVICE.getSetting('/audioHint'), function (newValue) {
      SETTING_SERVICE.setSetting('/audioHint', newValue);
    });
    new UKNSwitch(controls.vibrationSwitch, SETTING_SERVICE.getSetting('/vibration'), function (newValue) {
      SETTING_SERVICE.setSetting('/vibration', newValue);
    });
  },
  onPause: function () {
    SETTING_SERVICE.save();
  }
});
