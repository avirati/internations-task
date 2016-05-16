(function (_window, _document) {
  'use strict';

  // General Query Selector, returns all matches
  _window.$ = function (query) {
    return _document.querySelectorAll(query);
  }

  // Unique Query Selector, returns single matche
  _window.$U = function (query) {
    return _document.querySelector(query);
  }

  // Toaster for showing messages
  _window.toast = function (text) {
    console.log(text);
  }

})(window, document)
