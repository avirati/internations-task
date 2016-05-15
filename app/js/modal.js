/**
 * Little utility to manage modals
 *
 * @example <button data-modal-target="some-modal-id"></button>
 * Clicking on this button will add a class "open" to the element with id some-modal-id
 */

(function (_window, _document) {
  'use strict';

  //Get all elements with data-modal-target attribute
  var modalTargets = _document.querySelectorAll("*[data-modal-target]");

  for (var  i = 0,
            iL = modalTargets.length,
            modalTarget = modalTargets[i],
            targetElement = _document.getElementById(modalTarget.getAttribute('data-modal-target')); i < iL; i++) {
      modalTarget.addEventListener('click', function (event) {
          if(!targetElement.classList.contains('open')) {
            targetElement.classList.add('open');
          }

          targetElement.addEventListener('click', function (event) {
            if(event.target === targetElement) {
              targetElement.classList.remove('open');
            }
          })
      })
  }
})(window, document)
