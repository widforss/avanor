import {ControlCal}   from "./control/cal_.js";
import {ControlNav}   from "./control/nav_.js";
import {ControlUtils} from "./control/utils/utils_.js";
import {Utils}   from "./utils/utils_.js";

/**
 * @constructor
 */
function Control(map, notify_, z, SETTINGS) {
  var controlUtils  = new ControlUtils();
  var utils = new Utils();

  var aboutTitle  = new controlUtils.Text(SETTINGS.TITLE);
  var aboutText = new controlUtils.Text(null);
  var aboutOk = new controlUtils.Button('OK, got it!', toggle_);
  var about = new controlUtils.Control([
    aboutTitle.getDiv(),
    aboutText.getDiv(),
    aboutOk.getDiv(),
  ]);
  about.getDiv().classList.add('about');
  aboutOk.getDiv().classList.add('help');
  aboutText.getDiv().classList.add('aboutText');
  
  var aboutRequest = new utils.Request((text) => {
    aboutText.getDiv().innerHTML = text;
  });
  window['fetchHelp'] = () => {
    aboutRequest.run(SETTINGS.HELP_ADDRESS);
  };
  window['fetchHelp']();

  var controlTitle = new controlUtils.Text(SETTINGS.TITLE);
  var controlCal   = new ControlCal(notify_, SETTINGS.DATE);
  var controlMap   = new controlUtils.Select([], () => {});
  var controlNav   = new ControlNav(map, z, SETTINGS.NAV, toggle_);

  var closed = false;
  var controlClose = new controlUtils.Button('⨯', () => {
    controlPanel.getDiv().style.width =
        controlPanel.getDiv().offsetWidth + 'px';
    if (closed = !closed) {
      controlClose.setText('＋');
    } else {
      controlClose.setText('⨯');
    }
    for(var elem of document.getElementsByClassName('hidable')) {
      elem.classList.toggle('hidden');
    }
  });
  controlClose.getDiv().classList.add('open');

  var mapContainer = document.createElement('div');
  mapContainer.appendChild(controlMap.getDiv());

  var closeContainer = document.createElement('div');
  closeContainer.appendChild(controlClose.getDiv());
  closeContainer.classList.add('closer');

  var controlContainer = document.createElement('div');
  controlContainer.classList.add('controlContainer');

  controlCal.getDiv().classList.add('hidable');
  mapContainer.classList.add('hidable');
  controlNav.getDiv().classList.add('hidable');

  var controlPanel = new controlUtils.Control([
    controlTitle.getDiv(),
    controlCal.getDiv(),
    mapContainer,
    controlNav.getDiv(),
    closeContainer,
  ]);
  controlPanel.getDiv().classList.add('controlPanel');
  controlPanel.getDiv().classList.add('hidden');

  controlContainer.appendChild(controlPanel.getDiv());
  controlContainer.appendChild(about.getDiv());

  if (utils.getCookie('help') == 'hidden') toggle_();

  function getDiv() {
    return controlContainer;
  }
  this.getDiv = getDiv;

  function getDate() {
    return controlCal.getDate();
  }
  this.getDate = getDate;

  function getLayerSelect() {
    return controlMap;
  }
  this.getLayerSelect = getLayerSelect;

  function toggle_() {
    var aboutClasses = about.getDiv().classList;
    aboutClasses.toggle('hidden');
    controlPanel.getDiv().classList.toggle('hidden');
    utils.setCookie('help', aboutClasses.contains('hidden') ? 'hidden' : '');
  }
}

export {Control};
