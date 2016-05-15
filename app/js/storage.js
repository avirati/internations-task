(function (_window, $storage) {
  'use strict';

  window.Storage = {
    set: function (key, json) {
      return $storage.setItem(key, JSON.stringify(json));
    },
    get: function (key, json) {
      return JSON.parse($storage.getItem(key));
    }
  }

})(window, localStorage)
