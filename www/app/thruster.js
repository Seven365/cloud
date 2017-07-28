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

/* vim: tabstop=2 expandtab */

/*
 * Return the element that has an id propery that equals the 'id' string.
 */
function $E(id) {
  return document.getElementById(id);
}

/*
 * Return the first child that matches the 'query' string of the 'target' node.
 */
function $TQ(target, query) {
  return target.querySelector(query);
}

/*
 * Return all children that matches the 'query' string of the 'target' node.
 */
function $TA(target, query) {
  var nodeList = target.querySelectorAll(query);
  nodeList.forEach = Array.prototype.forEach;
  return nodeList;
}

/*
 * Extract all named children of the 'target' node. A named child is an element
 * that has an attribute indicated by the 'nameArribute' string. Each named
 * child is stored as a property in the result object. The value of the node's
 * indicated attribute becomes the property name.
 */
function $TX(target, nameArribute) {
  var holder = {};
  var peers = target.querySelectorAll('[' + nameArribute + ']');
  for (var i = 0; i < peers.length; i++) {
    var peer = peers[i];
    holder[peer.getAttribute(nameArribute)] = peer;
  }
  return holder;
}

/*
 * Return the first child that matches the 'query' string of the document.
 */
function $Q(query) {
  return $TQ(document, query);
}

/*
 * Return all children that matches the 'query' string of the document.
 */
function $A(query) {
  return $TA(document, query);
}

//===========================================================================

function mkE(tagName/*, ...argv */) {
  var result = document.createElement(tagName);
  for (var i = 1; i < arguments.length; ++i) {
    var arg = arguments[i];
    if (typeof arg == 'object') {
      if (Array.isArray(arg)) { // A child list
        for (var j = 0; j < arg.length; j++) {
          var child = arg[j];
          try {
            result.appendChild(child);
          } catch (e) {
            result.appendChild(document.createTextNode(child));
          }
        }
      } else { // An attribute dictionary
        for (var key in arg) {
          result.setAttribute(key, arg[key]);
        }
      }
    } else if (typeof arg == 'function') { // A event handler
      result.addEventListener(arg.name, arg);
    } else {
      throw new RangeError(arg);
    }
  }
  return result;
}

function mkDF(childList) {
  var result = document.createDocumentFragment();
  for (var i = 0; i < childList.length; ++i) {
    result.appendChild(childList[i]);
  }
  return result;
}

function mkTN(content) {
  return document.createTextNode(content);
}

//===========================================================================

function makeUrl(type, href) {
  var fullUrl = new URL(href, document.baseURI);
  if (type == 'ws?') {
    switch (fullUrl.protocol) {
      case 'https:':
        fullUrl.protocol = 'wss:';
        break;
      case 'http:':
        fullUrl.protocol = 'ws:';
        break;
      default:
        throw new RangeError();
    }
  } else if (type != undefined) {
    fullUrl.protocol = type + ':';
  }
  return fullUrl.href;
};

//===========================================================================

function makeRequest(method, url, responseType, username, password) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true, username, password);
  if (responseType) {
    try {
      xhr.responseType = responseType;
    } catch (e) {
      if (responseType == 'json') {
        xhr._responseType = responseType;
      }
    }
  }
  return xhr;
}

function sendRequest(xhr, data) {
  return new Promise(function (resolve, reject) {
    xhr.onload = function () {
      if (xhr.status == 200) {
        if (xhr._responseType == 'json') {
          if (xhr.response == '') {
            resolve();
          } else {
            resolve(JSON.parse(xhr.response));
          }
        } else {
          resolve(xhr.response);
        }
      } else {
        reject(xhr);
      }
    };
    xhr.onerror = xhr.onabort = function () {
      reject(xhr);
    };
    xhr.send(data);
  });
}

//===========================================================================

function fulfill(makePromiseGenerator) {
  return new Promise(function (resolve, reject) {
    var generator = makePromiseGenerator();
    function handle(product) {
      if (!product.done) {
        var promise = product.value;
        promise.then(feedValue, feedError);
      } else {
        resolve();
      }
    }
    function feedValue(v) {
      handle(generator.next(v));
    }
    function feedError(v) {
      handle(generator.throw(v));
    }
    feedValue(void 0);
  });
}
