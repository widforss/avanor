import {Utils}   from "./utils/utils_.js";

/**
 * @constructor
 */
function Layer(map, control, firstLayer, SETTINGS, setState, label) {
  var utils = new Utils();

  var layerNames;
  var currentName;

  control.getLayerSelect().setFunc(selectEvent_);

  var slopesRequest = new utils.Request((text) => {
    var creds = JSON.parse(text)
    map.setSlopes(creds['mapid'], creds['token']);
  });
  var mapRequest = new utils.Request((text) => {
    update_(JSON.parse(text));
  });
  var credsRequest = new utils.Request((text) => {
    var creds = JSON.parse(text);
    map.setEe(creds['mapid'], creds['token']);
  });

  slopesRequest.run('./api/slopes');

  map.addGeoJSON('/static/geojson/se-forecast-areas_wgs84.geojson');

  function updateMap() {
    var date = utils.formatDate(control.getDate()),
        bounds = JSON.stringify(map.getBounds()),
        url = "./api/name/" + date + '?bounds=' + bounds;

    mapRequest.run(url);
  }
  this.updateMap = updateMap;

  function currentLayer() {
    if (currentName) return currentName;
    if (firstLayer != 'null') return firstLayer;
    return null;
  }
  this.currentLayer = currentLayer;

  /**
   * Check if there is reason to change the current satellite layer.
   *     Expects RGB images!
   */
  function update_(layerNamesParam) {
    layerNames = layerNamesParam;
    
    if (layerNames.length) {
      let layerText = layerNames.map((text) => {
        if (typeof text == "string" && text.match(/^[AB][0-9]{1,3}A/)) {
          return "Dusk: " + text;
        } else if (typeof text == "string" && text.match(/^[AB][0-9]{1,3}D/)) {
          return "Dawn: " + text;
        }
        return text;
      });
      control.getLayerSelect().setOptions(layerNames, layerText);
      var idx = layerNames.indexOf(currentName ?
                                   currentName :
                                   firstLayer);
      idx     = idx == -1 ? 0 : idx;
      control.getLayerSelect().setValue(idx);
      selectEvent_();
    } else {
      control.getLayerSelect().setText(SETTINGS.NO_LAYER_STR);
      currentName = null;
      firstLayer = null;
    }
  }

  /**
   * Handle new input.
   */
  function selectEvent_() {
    var oldName = currentName;
    currentName = control.getLayerSelect().getValue();
    setState();

    if (oldName !== currentName || !oldName) {
        map.removeEe();
        credsRequest.run("./api/map/" + currentName);
    }
  }
}

export {Layer};
