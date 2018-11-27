import {Layer} from "./layer.js";
import {Control} from "./control.js";
import {Map} from "./map.js";
import {Utils} from "./utils/utils_.js";
import {SETTINGS} from "./settings.js";

function run() {
  var utils = new Utils();

  var mapDiv = document.createElement('div');
  mapDiv.classList.add('map');

  var map = new Map(mapDiv, SETTINGS.MAP);
  var control = new Control(map,
                            updateDate_,
                            SETTINGS.EE_LAYER_Z,
                            SETTINGS.CONTROL);
  var layer = new Layer(map,
                        control.getLayerSelect(),
                        SETTINGS.EE_LAYER_Z,
                        SETTINGS.LAYER,
                        control.getDate);
  var currentLabel;
  var labelPosition;
  var request = new utils.Request((text) => {
    var content = document.createElement('div');
    
    var answer = JSON.parse(text);
    var string = '';
    for (var proj in answer) {
      string += '<strong>' + proj + '</strong> ' + answer[proj] + '<br>';
    }
    content.innerHTML = string;
    currentLabel = map.addLabel(labelPosition, content);
  });

  map.onLoad(layer.updateMap);
  map.onMove(() => {
    if (currentLabel) {
      map.rmLabel(currentLabel);
      currentLabel = null;
    }
    layer.updateMap();
  });
  map.onClick((pos) => {
    if (currentLabel) {
      map.rmLabel(currentLabel);
      currentLabel = null;
    }
    labelPosition = pos;
    request.run('api/coordinates/' + pos.lat() + '/' + pos.lng());
  });

  document.getElementById('body').appendChild(mapDiv);
  document.getElementById('body').appendChild(control.getDiv());

  function updateDate_() {
    map.removeEe(SETTINGS.EE_LAYER_Z);
    layer.updateMap();
  }
}
window['run'] = run;
