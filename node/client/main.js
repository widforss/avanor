import {Layer} from "./layer.js";
import {Njunis} from "./njunis.js";
import {Control} from "./control.js";
import {Map} from "./ol.js";
import {Label} from "./label.js";
import {ReadState, Persistency} from "./persistency.js";
import {SETTINGS} from "./settings.js";

function run() {
  var timeOutKey;

  if (window.location.hostname == SETTINGS.HOST &&
      location.protocol != 'https:') {
        location.href =
            'https:' +
                window.location.href.substring(window.location.protocol.length);
  }

  var readState = new ReadState(SETTINGS.PERSISTENCY);
  var map = new Map('mapid', readState.mapInit(), SETTINGS.MAP, updateMap_);

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
  var njunis = new Njunis(map,
                        control.getLayerSelect(),
                        SETTINGS.NJUNIS,
                        control.getDate);
  var label = new Label(map, readState.labelInit(), getUrl_);
  var persistency = new Persistency(map,
                                    control,
                                    label,
                                    layer,
                                    SETTINGS.PERSISTENCY);

  map.onMove(mapMoved_);
  map.onClick(label.setLabel);
  map.infoPointClick(label.infoPointLabel);
  control.getLayerSelect().setFunc(label.clearLabel);

  document.getElementById('body').appendChild(control.getDiv());

  function updateDate_() {
    map.removeEe();
    map.removeInfoPoints();
    updateMap_();
  }

  function updateMap_() {
    label.clearLabel();
    mapMoved_();
  }

  function mapMoved_() {
    window.clearTimeout(timeOutKey);
    control.getLayerSelect().setText(SETTINGS.SEARCHING_STR);
    timeOutKey = window.setTimeout(() => {
      persistency.setState();
      layer.updateMap();
      njunis.updateMap();
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

run();
