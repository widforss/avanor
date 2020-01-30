import {ControlUtils} from "../utils/utils_.js";

/**
 * @constructor
 */
function ControlLayer(map, SETTINGS) {
  var controlUtils = new ControlUtils();

  var minus = new controlUtils.Button('－', () => {
    var zoom = map.getZoom();
    if (zoom > SETTINGS.ZOOM[0]) map.setZoom(zoom - 1);
  });

  var plus  = new controlUtils.Button('＋', () => {
    var zoom = map.getZoom();
    if (zoom < SETTINGS.ZOOM[1]) map.setZoom(zoom + 1);
  });

  var login = new controlUtils.Button('Sign in', loginToggle);
  login.getDiv().id = "login";
  var logout = new controlUtils.Button('Sign out');
  logout.getDiv().id = "logout";
  logout.getDiv().classList.add("clicked");

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

  var mapHelp = new controlUtils.Button('About', helpToggle);
  mapHelp.getDiv().classList.add('help');

  var navDiv = document.createElement("div");
  navDiv.appendChild(minus.getDiv());
  navDiv.appendChild(plus.getDiv());
  navDiv.appendChild(login.getDiv());
  navDiv.appendChild(logout.getDiv());
  navDiv.appendChild(mapToggle.getDiv());
  navDiv.appendChild(mapHelp.getDiv());

  if (loginState) {
    login.getDiv().classList.add('hidden');
    map.setTranslate(true);
  } else {
    logout.getDiv().classList.add('hidden');
    map.setTranslate(false);
  }

  function getDiv() {
    return navDiv;
  }
  this.getDiv = getDiv;
}

export {ControlNav};
