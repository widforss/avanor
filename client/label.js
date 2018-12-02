import {Utils} from "./utils/utils_.js";

/**
 * @constructor
 */
function Label(map, labelOnInit, getUrl) {
  var utils = new Utils();
  var currentLabel;
  var labelPosition;

  var request = new utils.Request((text) => {
    var content = document.createElement('div');
    
    var answer = JSON.parse(text);
    content.innerHTML = '';
    for (var proj in answer) {
      content.innerHTML +=
          '<strong>' + proj + '</strong> ' + answer[proj] + '<br>';
    }
    map.setPos(labelPosition.x, labelPosition.y, map.getZoom());
    currentLabel = map.addLabel(labelPosition.x, labelPosition.y, content);
    content.innerHTML +=
        '<a href="' + getUrl() + '">Shareable link</a>';
  });

  if (labelOnInit) map.onLoad(() => {
    setLabel(map.getX(), map.getY());
  });

  function setLabel(x, y) {
    if (currentLabel) {
      map.rmLabel(currentLabel);
      currentLabel = null;
    }
    labelPosition = {x: x, y: y};
    request.run('api/coordinates/' + y + '/' + x);
  }
  this.setLabel = setLabel;

  function getLabel() {
    return currentLabel;
  }
  this.getLabel = getLabel;

  function clearLabel() {
    if (currentLabel) {
      map.rmLabel(currentLabel);
      currentLabel = null;
    }
  }
  this.clearLabel = clearLabel;
}

export {Label};
