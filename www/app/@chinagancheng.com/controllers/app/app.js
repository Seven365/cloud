'use strict';

var DEBUG = false;
var APP = function (){
  var activityDeck = document.querySelector('.ActivityDeck');
  var hintLayer = document.querySelector('.HintLayer');
  var menuLayer = document.querySelector('.MenuLayer');

  function prepareFrame(url, params) {
    var activityFrame = document.createElement('iframe');
    activityFrame._inputParams = params;
    activityFrame._activityState = {};
    activityFrame.src = url;
    return activityFrame;
  }

  menuLayer.onclick = function () {
    menuLayer.innerHTML = '';
  }

  return {
    initialize: function (url, params) {
      activityDeck.innerHTML = '';
      activityDeck.appendChild(prepareFrame(url, params));
    },
    showHint: function (text) {
      var hintItem = mkE('div', [text]);
      hintLayer.innerHTML = ''; // FIXME:
      hintLayer.appendChild(hintItem);
      setTimeout(function () {
        try {
          hintLayer.removeChild(hintItem);
        } catch (ex) {
        }
      }, 4000);
    },
    showMenu: function (menuItem) {
      menuLayer.appendChild(menuItem);
    },
    goTo: function (url, params) {
      activityDeck.replaceChild(
        prepareFrame(url, params),
        activityDeck.lastElementChild
      );
    },
    openPopup: function (url, params, groupId) {
      activityDeck.classList.add('insensitive');
      var activityFrame = prepareFrame(url, params);
      activityFrame._groupId = groupId;
      activityFrame.className = 'loading';
      activityFrame.onload = function () {
        activityFrame.addEventListener('transitionend', function doEnable() {
          activityDeck.classList.remove('insensitive');
          activityFrame.removeEventListener('transitionend', doEnable);
        });
        activityFrame.addEventListener('webkitTransitionEnd', function doEnable() {
          activityDeck.classList.remove('insensitive');
          activityFrame.removeEventListener('webkitTransitionEnd', doEnable);
        });
        activityFrame.classList.remove('loading');
        activityFrame.onload = null;
        for(var i = 0; i < activityDeck.childNodes.length; i++) {
          console.log("Activity Classes: " + activityDeck.childNodes[i].className);
        }
      };
      activityDeck.appendChild(activityFrame);
    },
    closePopup: function (groupId) {
      var popups = [];
      if (groupId == null) {
        popups.push(activityDeck.lastElementChild);
      } else {
        for (var i = activityDeck.childNodes.length - 1; i >= 0; i--) {
          var frame = activityDeck.childNodes[i];
          if (frame._groupId != groupId) break;
          popups.push(frame);
        }
      }
      var count = popups.length;
      if (popups.length > 0) {
        activityDeck.classList.add('insensitive');
        for (var i = 0; i < popups.length; i++) {
          var frame = popups[i];
          frame.addEventListener('transitionend', function () {
            activityDeck.removeChild(this);
            count--;
            if (count == 0) {
              activityDeck.classList.remove('insensitive');
            }
          });
          frame.addEventListener('webkitTransitionEnd', function () {
            activityDeck.removeChild(this);
            count--;
            if (count == 0) {
              activityDeck.classList.remove('insensitive');
            }
          });          
          frame.className = 'loading';
        }
      }
    }
  };
}();
