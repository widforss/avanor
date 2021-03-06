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
      let text = point.info[prop];
      let date;
      if (typeof text == "string" && text.match(/^[0-9]{4}(\-[0-9]{2}){2} [0-9]{2}:[0-9]{2}$/)) {
        date = new Date(text);
      }
      if (!isNaN(date)) {
        let href = [
          "/?x=" + labelPosition.x,
          "y=" + labelPosition.y,
          "z=" + map.getZ(),
          "date=" + [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-'),
          "basemap=" + map.getBaseMap(),
        ].join("&");
        text = `<a href="${href}">${text}</a>`;
      }
      content.innerHTML +=
          '<strong>' + prop + ':</strong> ' + text + '<br>';
    }

    if (!point.type.match(/radar/)) {
      let imageDiv = document.createElement('div');
      njunis.addImages(imageDiv, point.id);
      content.appendChild(imageDiv);
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
            setLabel(labelPosition.x, labelPosition.y, false);
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
