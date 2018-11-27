import {Utils}   from "../utils/utils_.js";

/**
 * Presentation for layer selector.
 * @constructor
 */
function LayerHandler(map, layerSelect, z, SETTINGS) {
  var utils = new Utils();

  var layerNames;
  var currentName;
  var request = new utils.Request((text) => {
    var creds = JSON.parse(text);
    map.setEe(z, creds['mapid'], creds['token']);
  });

  layerSelect.setFunc(selectEvent_);

  /**
   * Check if there is reason to change the current satellite layer.
   *     Expects RGB images!
   */
  function update(layerNamesParam) {
    layerNames = layerNamesParam;
    
    if (layerNames.length) {
      layerSelect.setOptions(layerNames);
      var idx = layerNames.indexOf(currentName);
      idx     = idx == -1 ? 0 : idx;
      layerSelect.setValue(idx);
      selectEvent_();
    } else {
      layerSelect.setText(SETTINGS.NO_LAYER_STR);
      currentName = null;
    }
  }
  this.update = update;
  
  /**
   * Handle new input.
   */
  function selectEvent_() {
    var oldName = currentName;
    currentName = layerSelect.getValue();

    if (oldName !== currentName || !oldName) {
        request.run("./api/map/" + currentName);
    }
  }
}

export {LayerHandler};
