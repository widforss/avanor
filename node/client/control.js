import {Utils, ControlUtils}   from "./utils/utils_.js";
import {ControlCal}   from "./control/cal_.js";
import {ControlNav}   from "./control/nav_.js";
import {LoginHandler} from "./control/login_.js";

/**
 * @constructor
 */
function Control(map, initVals, SETTINGS, notify_, setState, setToken, readState) {
  var utils  = new Utils();
  var controlUtils  = new ControlUtils();

  var controlTitle = new controlUtils.Text(SETTINGS.TITLE);
  var controlCal   = new ControlCal(notify_, initVals.initDate, SETTINGS.DATE);
  var controlMap   = new controlUtils.Select([], () => {});
  var controlNav   = new ControlNav(map,
                                    SETTINGS.NAV,
                                    toggleHelp_,
                                    toggleLogin_,
                                    initVals.login);

  var aboutRequest = new utils.Request((text) => {
    aboutText.getDiv().innerHTML = text;
  });
  var loginRequest = new utils.Request((text) => {
    loginText.getDiv().innerHTML = text;
    new LoginHandler(setToken, readState, map);
  });
  window['fetchHelp'] = () => {
    aboutRequest.run(SETTINGS.HELP_ADDRESS);
  };
  window['fetchLogin'] = () => {
    loginRequest.run(SETTINGS.LOGIN_ADDRESS);
  };
  window['fetchHelp']();
  window['fetchLogin']();

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

  var aboutTitle  = new controlUtils.Text(SETTINGS.TITLE);
  var aboutText = new controlUtils.Text(null);
  var aboutOk = new controlUtils.Button('OK, got it!', toggleHelp_);
  var about = new controlUtils.Control([
    aboutTitle.getDiv(),
    aboutText.getDiv(),
    aboutOk.getDiv(),
  ]);
  about.getDiv().classList.add('about');
  aboutOk.getDiv().classList.add('help');
  aboutText.getDiv().classList.add('aboutText');

  var warning = new controlUtils.Control([
    new controlUtils.Text('Old avalanches may be visible<br>on this image!').getDiv(),
  ]);
  warning.getDiv().classList.add('hidden');

  var loginTitle = new controlUtils.Text(SETTINGS.LOGIN_TITLE);
  var loginText = new controlUtils.Text(null);
  var loginOk = new controlUtils.Button('Close this dialog', toggleLogin_);
  var login = new controlUtils.Control([
    loginTitle.getDiv(),
    loginText.getDiv(),
    loginOk.getDiv(),
  ]);
  login.getDiv().classList.add('about');
  loginOk.getDiv().classList.add('help');
  loginText.getDiv().classList.add('aboutText');
  login.getDiv().classList.add('hidden');
  if (!initVals.help) {
    toggleHelp_();
  }
  
  controlContainer.appendChild(controlPanel.getDiv());
  controlContainer.appendChild(warning.getDiv());
  controlContainer.appendChild(about.getDiv());
  controlContainer.appendChild(login.getDiv());

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

  function isHelpHidden() {
    return about.getDiv().classList.contains('hidden');
  }
  this.isHelpHidden = isHelpHidden;

  var warningState = false;
  function showWarning(value) {
    if (value !== undefined) warningState = value;
    let aboutHidden = about.getDiv().classList.contains('hidden');
    let loginHidden = login.getDiv().classList.contains('hidden');
    if (warningState && aboutHidden && loginHidden) {
      warning.getDiv().classList.remove('hidden');
    } else {
      warning.getDiv().classList.add('hidden');
    }
  }
  this.showWarning = showWarning;

  function toggleHelp_() {
    about.getDiv().classList.toggle('hidden');
    controlPanel.getDiv().classList.toggle('hidden');
    login.getDiv().classList.add('hidden');
    showWarning();
    setState();
  }

  function toggleLogin_() {
    about.getDiv().classList.add('hidden');
    controlPanel.getDiv().classList.remove('hidden');
    login.getDiv().classList.toggle('hidden');
    showWarning();
  }
}

export {Control};
