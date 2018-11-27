import {ControlUtils} from "./utils/utils_.js";

/**
 * @constructor
 */
function ControlNav(map, z, SETTINGS, toggle) {
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
  mapSelect.setValue(SETTINGS.MAPS.indexOf(SETTINGS.DEFAULT_MAP));
  setBaseMap_();

  var mapToggle = new controlUtils.Button(SETTINGS.HIDE_MAP, () => {
    if (mapToggle.getText() == SETTINGS.HIDE_MAP) {
      mapToggle.setText(SETTINGS.SHOW_MAP);
      mapToggle.getDiv().classList.add('clicked');
      map.toggleEeFrom(z);
    } else {
      mapToggle.setText(SETTINGS.HIDE_MAP);
      mapToggle.getDiv().classList.remove('clicked');
      map.toggleEeTo(z);
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
    map.setBaseMap(mapSelect.getValue().toLowerCase());
  }
}

export {ControlNav};
