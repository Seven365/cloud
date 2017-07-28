/* vim: tabstop=2 expandtab */
// Copyright 2015 SUN Haitao <sunhaitao@devtaste.com>. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

function ImpulseEmitter() {
  var reflector = document.createElement('div');

  var makeCustomEvent = function (type, detail) {
    return new CustomEvent(type, { detail:detail });
  };
  try {
    makeCustomEvent('x-message', null);
  } catch (e) {
    makeCustomEvent = function (type, detail) {
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent(type, false, false, detail);
      return event;
    };
  }

  var feed = {
    subscribe: function (topic, path, callback) {
      var subscription = function(event) {
        if (event.detail.topic === topic) {
          if (undefined == path || event.detail.path === path) {
            callback.call(null, event.detail.data);
          }
        }
      };
      reflector.addEventListener('x-message', subscription);
      return subscription;
    },
    unsubscribe: function (subscription) {
      reflector.removeEventListener('x-message', subscription);
    }
  };

  this.publish = function (topic, path, data) {
    var event = makeCustomEvent('x-message', {
        topic:topic, path:path, data:data
    });
    reflector.dispatchEvent(event);
  };

  this.getFeed = function () {
    return feed;
  };
}

