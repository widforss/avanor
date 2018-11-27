import {LayerHandler}   from "./layer/handler_.js";
import {Utils}   from "./utils/utils_.js";

/**
 * @constructor
 */
function Layer(map, layerSelect, z, SETTINGS, getDate) {
  var utils = new Utils();
  var layerHandler = new LayerHandler(map, layerSelect, z, SETTINGS.HANDLER);

  var timeOutKey;
  var request = new utils.Request((text) => {
    layerHandler.update(JSON.parse(text));
  });

  function updateMap() {
    window.clearTimeout(timeOutKey);
    timeOutKey = window.setTimeout(notify_, SETTINGS.THROTTLE_DELAY);
    layerSelect.setOptions([SETTINGS.SEARCHING_STR]);
    layerSelect.setValue(0);
  }
  this.updateMap = updateMap;

  function notify_() {
    var xhr = new XMLHttpRequest(),
        method = "GET",
        date = getDate().toLocaleDateString('sv-SE', 'UTC'),
        bounds = JSON.stringify(map.getBounds()),
        url = "./api/name/" + date + '?bounds=' + bounds;
    
    request.run(url);
  }
}

export {Layer};
