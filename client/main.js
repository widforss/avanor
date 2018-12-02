import {Layer} from "./layer.js";
import {Control} from "./control.js";
import {Map} from "./map.js";
import {Label} from "./label.js";
import {ReadState, Persistency} from "./persistency.js";
import {SETTINGS} from "./settings.js";

function run() {
  var timeOutKey;

  var mapDiv = document.createElement('div');
  mapDiv.classList.add('map');

  var readState = new ReadState(SETTINGS.PERSISTENCY);
  var map = new Map(mapDiv, readState.mapInit(), SETTINGS.MAP);

  var control = new Control(map,
                            readState.controlInit(),
                            SETTINGS.CONTROL,
                            updateDate_,
                            setState_);
  var layer = new Layer(map,
                        control.getLayerSelect(),
                        readState.layerInit(),
                        SETTINGS.LAYER,
                        control.getDate,
                        setState_);
  var label = new Label(map, readState.labelInit(), getUrl_);
  var persistency = new Persistency(map,
                                    control,
                                    label,
                                    layer,
                                    SETTINGS.PERSISTENCY);

  map.onLoad(updateMap_);
  map.onMove(updateMap_);
  map.onClick(label.setLabel);
  control.getLayerSelect().setFunc(label.clearLabel);

  document.getElementById('body').appendChild(mapDiv);
  document.getElementById('body').appendChild(control.getDiv());

  function updateDate_() {
    map.removeEe();
    updateMap_();
  }

  function updateMap_() {
    label.clearLabel();
    window.clearTimeout(timeOutKey);
    control.getLayerSelect().setText(SETTINGS.SEARCHING_STR);
    timeOutKey = window.setTimeout(() => {
      persistency.setState();
      layer.updateMap();
    }, SETTINGS.THROTTLE_DELAY);
  }

  function getUrl_() {
    return persistency.getUrl();
  }

  function setState_() {
    if (persistency) {
      return persistency.setState();
    } else {
      return () => {};
    }
  }
}
window['run'] = run;
