'use strict';

(function () {
  var map = document.querySelector('.map');
  var mapPinMain = map.querySelector('.map__pin--main');
  var adForm = document.querySelector('.ad-form');
  var formFieldsets = adForm.querySelectorAll('fieldset');
  var formInputAddress = adForm.querySelector('#address');

  var MAIN_PIN_WIDTH = 65;
  var MAIN_PIN_HEIGHT = 65;
  var MAIN_PIN_SHARP_END = 20;

  var MIN_LOCATION_Y = 130;
  var MAX_LOCATION_Y = 630;
  var PINS_BLOCK_MAX_RIGHT = 1200;
  var PINS_BLOCK_MIN_LEFT = 0;

  var mapPinsBlock = document.querySelector('.map__pins');
  var mapFiltersContainer = document.querySelector('.map__filters-container');

  var mapPinMainStart = {
    x: parseInt(mapPinMain.style.left, 10) - MAIN_PIN_WIDTH / 2,
    y: parseInt(mapPinMain.style.top, 10) - MAIN_PIN_HEIGHT / 2
  };

  var adFormInputList = adForm.querySelectorAll('input');
  var valuesDefault = saveDefaultValues();

  function saveDefaultValues() {
    for (var i = 0; i < adFormInputList.length; i++) {
      var valuesArray = [];
      valuesArray[i] = adFormInputList[i];
    }
    return valuesArray;
  }

  function resetInputValues() {
  }

  window.deactivatePage = function () {
    map.classList.add('map--faded');
    adForm.classList.add('ad-form--disabled');
    for (var i = 0; i < formFieldsets.length; i++) {
      formFieldsets[i].disabled = true;
    }
    reset();
  };
  window.deactivatePage();

  function activatePage() {
    map.classList.remove('map--faded');
    adForm.classList.remove('ad-form--disabled');
    for (var i = 0; i < formFieldsets.length; i++) {
      formFieldsets[i].disabled = false;
    }
    window.backend.load(renderMapPins, window.error);
  }

  function setMainPinAddress(evt) {
    var x = parseInt(mapPinMain.style.left, 10) - MAIN_PIN_WIDTH / 2;

    var y = parseInt(mapPinMain.style.top, 10) - MAIN_PIN_HEIGHT / 2;
    if (evt && evt.type === 'mousemove') {
      y = parseInt(mapPinMain.style.top, 10) - (MAIN_PIN_HEIGHT + MAIN_PIN_SHARP_END);
    }
    formInputAddress.value = x + ', ' + y;
  }

  function reset() {
    removePins();
    removeCard();
    mapPinMain.style.left = mapPinMainStart.x + 'px';
    mapPinMain.style.top = mapPinMainStart.y + 'px';
    setMainPinAddress();
  }

  function removePins() {
    var mapPinsList = mapPinsBlock.querySelectorAll('.map__pin');
    for (var i = mapPinsList.length - 1; i >= 0; i--) {
      var child = mapPinsList[i];
      if (!child.classList.contains('map__pin--main')) {
        child.parentElement.removeChild(child);
      }
    }
  }

  function removeCard() {
    var card = map.querySelector('.map__card');
    if (card) {
      card.parentNode.removeChild(card);
    }
  }

  function addCardListeners() {
    var mapCard = map.querySelector('.map__card');
    var popupClose = mapCard.querySelector('.popup__close');

    function closePopup(newCard) {
      newCard.classList.add('hidden');
    }

    popupClose.addEventListener('click', function () {
      closePopup(mapCard);
    });
    document.addEventListener('keydown', function (evt) {
      if (window.utils.isEscPressed(evt)) {
        closePopup(mapCard);
      }
    });
  }

  function renderMapPins(usersDataArray) {
    var pinsFragment = document.createDocumentFragment();

    for (var i = 0; i < usersDataArray.length; i++) {
      var offerPin = window.createPin(usersDataArray[i]);
      offerPin.offerData = usersDataArray[i];
      offerPin.addEventListener('click', onOfferPinClick);
      pinsFragment.appendChild(offerPin);
    }
    mapPinsBlock.appendChild(pinsFragment);
  }

  function onOfferPinClick(evt) {
    removeCard();

    var newCard = window.createCard(evt.currentTarget.offerData);
    var cardFragment = document.createDocumentFragment().appendChild(newCard);
    map.insertBefore(cardFragment, mapFiltersContainer);

    addCardListeners();
  }

  // Перемещение пина по карте
  mapPinMain.addEventListener('mousedown', function (evt) {

    var startCoords = {
      x: evt.clientX,
      y: evt.clientY
    };

    function onMouseMove(moveEvt) {
      moveEvt.preventDefault();

      var shift = {
        x: startCoords.x - moveEvt.clientX,
        y: startCoords.y - moveEvt.clientY
      };

      startCoords = {
        x: moveEvt.clientX,
        y: moveEvt.clientY
      };

      var newPositionY = mapPinMain.offsetTop - shift.y;
      var newPositionX = mapPinMain.offsetLeft - shift.x;

      if (newPositionY >= MAX_LOCATION_Y - (MAIN_PIN_HEIGHT + MAIN_PIN_SHARP_END)) {
        newPositionY = MAX_LOCATION_Y - (MAIN_PIN_HEIGHT + MAIN_PIN_SHARP_END);
      }
      if (newPositionY <= MIN_LOCATION_Y - (MAIN_PIN_HEIGHT + MAIN_PIN_SHARP_END)) {
        newPositionY = MIN_LOCATION_Y - (MAIN_PIN_HEIGHT + MAIN_PIN_SHARP_END);
      }

      if (newPositionX >= PINS_BLOCK_MAX_RIGHT - MAIN_PIN_WIDTH) {
        newPositionX = PINS_BLOCK_MAX_RIGHT - MAIN_PIN_WIDTH;
      }
      if (newPositionX <= PINS_BLOCK_MIN_LEFT) {
        newPositionX = PINS_BLOCK_MIN_LEFT;
      }

      mapPinMain.style.top = newPositionY + 'px';
      mapPinMain.style.left = newPositionX + 'px';
      setMainPinAddress();
    }

    function onMouseUp(upEvt) {
      upEvt.preventDefault();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      if (mapPinsBlock.children.length < 3) {
        activatePage(upEvt);
      }
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
})();
