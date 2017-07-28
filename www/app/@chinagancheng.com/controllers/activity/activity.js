// 实现简单的生命周期管理（类似Android）
function launchActivity(activity) {
  var backTrigger = document.querySelector('[data-trigger-target=back]');
  if (backTrigger) {
      backTrigger.ontouchend = function () {
        if (document.activeElement) {
          document.activeElement.blur();
        }
        top.APP.closePopup();
      };
  }

  var activityState = frameElement._activityState;
  window.addEventListener('visibilitychange', function (event) {
    if (document.visibilityState == 'hidden') { // 应用被切换到后台
      if (activity.onPause) {
        // 如果必要，保存当前活动的状态
        activity.onPause(activityState);
      }
    } else { // 应用被切换回前台
      // 如果必要，把活动恢复到上次保存的状态
      if (activity.onResume) {
        activity.onResume(JSON.parse(JSON.stringify(activityState)));
      }
    }
  });
  window.addEventListener('unload', function (event) {
    if (activity.onPause) {
      // 如果必要，保存当前活动的状态
      activity.onPause(activityState);
    }
  });
  if (frameElement._activityStage == 'creating' || frameElement._activityStage === undefined) {
    if (activity.onCreate) activity.onCreate(frameElement._inputParams);
    if (activity.onResume) activity.onResume();
  } else if (frameElement._activityStage == 'restoring') {
    if (activity.onCreate) activity.onCreate();
    if (activity.onResume) activity.onResume(activityState);
  } else {
    throw new Error('Invalid stage: ' + frameElement._activityStage);
  }
}

function subscribe(publisher, a, b, c) {
  var subscription = publisher.feed.subscribe(a, b, c);
  window.addEventListener('unload', function () {
    publisher.feed.unsubscribe(subscription);
  });
  return subscription;
}
