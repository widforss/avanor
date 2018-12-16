import {ControlUtils} from "./utils/utils_.js";

/**
 * @constructor
 */
function ControlNav(map, basemap, SETTINGS, toggle, setState) {
  var controlUtils = new ControlUtils();

  var minus = new controlUtils.Button('－', () => {
    var zoom = map.getZoom();
    if (zoom > SETTINGS.ZOOM[0]) map.setZoom(zoom - 1);
  });

  var plus  = new controlUtils.Button('＋', () => {
    var zoom = map.getZoom();
    if (zoom < SETTINGS.ZOOM[1]) map.setZoom(zoom + 1);
  });

  var mapSelect = new controlUtils.Select(SETTINGS.MAPS, setBaseMap_);
  var basemapIdx = SETTINGS.MAPS.indexOf(basemap);
  basemapIdx = basemapIdx == -1 ? 0 : basemapIdx;
  mapSelect.setValue(basemapIdx);
  setBaseMap_();

  var mapToggle = new controlUtils.Button(SETTINGS.HIDE_MAP, () => {
    if (mapToggle.getText() == SETTINGS.HIDE_MAP) {
      mapToggle.setText(SETTINGS.SHOW_MAP);
      mapToggle.getDiv().classList.add('clicked');
      map.toggleEeFrom();
    } else {
      mapToggle.setText(SETTINGS.HIDE_MAP);
      mapToggle.getDiv().classList.remove('clicked');
      map.toggleEeTo();
    }
  });
  mapToggle.getDiv().classList.add('showButton');

  var mapHelp = new controlUtils.Button('Help', toggle);
  mapHelp.getDiv().classList.add('help');

  var navDiv = document.createElement("div");
  navDiv.appendChild(minus.getDiv());
  navDiv.appendChild(plus.getDiv());
  navDiv.appendChild(mapSelect.getDiv());
  navDiv.appendChild(mapToggle.getDiv());
  navDiv.appendChild(mapHelp.getDiv());

  function getDiv() {
    return navDiv;
  }
  this.getDiv = getDiv;

  function setBaseMap_() {
    var basemap = mapSelect.getValue();
    map.setBaseMap(basemap);
    setState();
  }
}

export {ControlNav};
