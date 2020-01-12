import {Utils} from "./utils/utils_.js";

/**
 * @constructor
 */
function Label(map, readState, getUrl, njunis) {
  var utils = new Utils();
  var currentLabel;
  var labelPosition;

  function infoPointLabel(point, popup) {
    if (currentLabel) {
      currentLabel = null;
    }
    labelPosition = {x: point.coordinates[0], y: point.coordinates[1]};

    var content = document.createElement('div');
    content.innerHTML = '';
    for (var prop in point.info) {
      content.innerHTML +=
          '<strong>' + prop + ':</strong> ' + point.info[prop] + '<br>';
    }

    let callback = () => {
      njunis.updateMap(() => {
        let mapPoint = map.points[point.id];
        if (mapPoint) {
          infoPointLabel(mapPoint.values_, false);
        } else {
          map.rmLabel();
        }
      });
    };
    let visible = njunis.visibleButton(point, callback);
    map.EeTrigger = callback;

    content.appendChild(visible);

    map.addLabel(labelPosition.x, labelPosition.y, content, popup);
    getUrl();
  }
  this.infoPointLabel = infoPointLabel;

  function setLabel(x, y, popup) {
    var request = new utils.Request((text) => {
      var wrapper = document.createElement('div');
      var content = document.createElement('div');
      
      var answer = JSON.parse(text);
      content.innerHTML = '';
      for (var proj in answer) {
        content.innerHTML +=
            '<strong>' + proj + '</strong> ' + answer[proj] + '<br>';
      }
      content.innerHTML +=
          '<a href="' + getUrl() + '">Shareable link</a>';

      let callback = (point) => {
        njunis.updateMap(() => {
          if (point) {
            infoPointLabel(point, false);
          } else {
            setLabel(getX(), getY(), false);
          }
        });
      };
      let visible = njunis.visibleButton(null, callback, [x, y]);
      map.EeTrigger = callback;

      wrapper.appendChild(content);
      wrapper.appendChild(visible);

      //map.setPos(labelPosition.x, labelPosition.y, map.getZoom());
      currentLabel = map.addLabel(labelPosition.x, labelPosition.y, wrapper, popup);

    });

    if (currentLabel) {
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

  function getX() {
    if (!currentLabel) return null;
    return labelPosition.x;
  }
  this.getX = getX;

  function getY() {
    if (!currentLabel) return null;
    return labelPosition.y;
  }
  this.getY = getY;
}

export {Label};
