import Overlay from 'ol/Overlay.js';

function Popup(updateMap) {
  var container = document.getElementById('popup');
  var content = document.getElementById('popup-content');
  var closer = document.getElementById('popup-closer');
  
  var overlay = new Overlay({
    element: container,
    autoPan: false,
    autoPanAnimation: {
      duration: 250
    }
  });
  
  closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    updateMap();
    return false;
  };

  function setPosition(coordinate) {
    overlay.setPosition(coordinate)
  }
  this.setPosition = setPosition;

  function getPosition() {
    return overlay.getPosition();
  }
  this.getPosition = getPosition;

  function setContent(text) {
    while (content.firstChild) {
      content.removeChild(content.firstChild);
    }
    content.appendChild(text);
  }
  this.setContent = setContent;

  function isVisible() {
    return overlay === undefined;
  }
  this.isVisible = isVisible;

  function getOverlay() {
    return overlay;
  }
  this.getOverlay = getOverlay;
}

export {Popup};
