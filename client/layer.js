import {Utils}   from "./utils/utils_.js";

/**
 * @constructor
 */
function Layer(map, layerSelect, firstLayer, SETTINGS, getDate, setState) {
  var utils = new Utils();

  var layerNames;
  var currentName;

  layerSelect.setFunc(selectEvent_);

  var mapRequest = new utils.Request((text) => {
    update_(JSON.parse(text));
  });
  var credsRequest = new utils.Request((text) => {
    var creds = JSON.parse(text);
    map.setEe(creds['mapid'], creds['token']);
  });

  function updateMap() {
    var xhr = new XMLHttpRequest(),
        method = "GET",
        date = utils.formatDate(getDate()),
        bounds = JSON.stringify(map.getBounds()),
        url = "./api/name/" + date + '?bounds=' + bounds;

    mapRequest.run(url);
  }
  this.updateMap = updateMap;

  function currentLayer() {
    if (currentName) return currentName;
    return firstLayer;
  }
  this.currentLayer = currentLayer;

  /**
   * Check if there is reason to change the current satellite layer.
   *     Expects RGB images!
   */
  function update_(layerNamesParam) {
    layerNames = layerNamesParam;
    
    if (layerNames.length) {
      layerSelect.setOptions(layerNames);
      var idx = layerNames.indexOf(currentName ?
                                   currentName :
                                   firstLayer);
      idx     = idx == -1 ? 0 : idx;
      layerSelect.setValue(idx);
      selectEvent_();
    } else {
      layerSelect.setText(SETTINGS.NO_LAYER_STR);
      currentName = null;
      firstLayer = null;
    }
  }

  /**
   * Handle new input.
   */
  function selectEvent_() {
    var oldName = currentName;
    currentName = layerSelect.getValue();
    setState();

    if (oldName !== currentName || !oldName) {
        map.removeEe();
        credsRequest.run("./api/map/" + currentName);
    }
  }
}

export {Layer};
