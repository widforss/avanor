/**
 * @constructor
 */
function Utils() {
  const SETTINGS = {
    TIMEOUT: 30000,
    TRIES: 7,
    WAIT: 100,
  };
  var blockCount = 0;

  /**
   * @constructor
   */
  function Request(callback) {
    var counter = 0;

    function run_(url, wait, round, thisCount) {
      if (thisCount != counter) return;

      var thisBlock = blockCount;
      var xhr = new XMLHttpRequest(),
          method = "GET";
      xhr.timeout = SETTINGS.TIMEOUT;
      xhr.open(method, url, true);
      xhr.onload = function () {
        if (thisCount != counter || thisBlock != blockCount) {
          return;
        }
        callback(xhr.responseText);
      }
      xhr.onerror = function () {
        checkError_(url, wait, round, thisCount);
      }
      xhr.ontimeout = function () {
        checkError_(url, wait, round, thisCount);
        checkError_(url, wait, round, thisCount);
      }
      xhr.send();

      function checkError_(url, wait, round, thisCount) {
        if (thisBlock != blockCount) return;
        if (round < SETTINGS.TRIES) {
          var backoff = wait + Math.random() * SETTINGS.WAIT;
          window.setTimeout(run_, backoff, url, wait*2, round+1, thisCount);
        } else {
          throw new Error('Failed to fetch ' + url);
        }
      }
    }
    function run(url) {
      window.setTimeout(run_, 0, url, SETTINGS.WAIT, 1, ++counter);
    }
    this.run = run;

    function block() {
      ++blockCount;
    }
    this.block = block;
  }
  this.Request = Request;

  function formatDate(date) {
      var d = new Date(date),
          month = '' + (d.getUTCMonth() + 1),
          day = '' + d.getUTCDate(),
          year = d.getUTCFullYear();
  
      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;
  
      return [year, month, day].join('-');
  }
  this.formatDate = formatDate
}

/**
 * @constructor
 */
function ControlUtils() {

  /**
   * @constructor
   */
  function Control(children) {
    var controlBox = document.createElement('div');
    controlBox.classList.add('controlBox');

    if (children) {
      for (var child of children) {
        if (typeof child == 'string' || child instanceof String) {
          var controlContent = document.createElement('div');
          controlContent.innerHTML = child;
          controlBox.appendChild(controlContent);
        } else {
          controlBox.appendChild(child);
        }
      }
    }

    function getDiv() {
      return controlBox;
    }
    this.getDiv = getDiv;
  }
  this.Control = Control;

  /**
   * @constructor
   */
  function Text(text) {
    var controlText = document.createElement('div');
    controlText.classList.add('controlText');
    controlText.innerHTML = text;

    function getText() {
      return controlText.innerHTML;
    }
    this.getText = getText;

    function setText(text) {
      controlText.innerHTML = text;
    }
    this.setText = setText;

    function getDiv() {
      return controlText;
    }
    this.getDiv = getDiv;
  }
  this.Text = Text;

  /**
   * @constructor
   */
  function Button(text, callback) {
    var controlButton = document.createElement('div');
    controlButton.classList.add('controlButton');
    var controlText = new Text(text);
    controlButton.appendChild(controlText.getDiv());

    if (callback) {
      controlButton.onclick = callback; 
      controlButton.classList.add('clickable');
    }

    function setText(text) {
      controlText.setText(text);
    }
    this.setText = setText;

    function getText() {
      return controlText.getText();
    }
    this.getText = getText;

    function getDiv() {
      return controlButton;
    }
    this.getDiv = getDiv;
  }
  this.Button = Button;

  /**
   * @constructor
   */
  function Select(options, callback) {
    var selectList = document.createElement("select");
    setOptions(options);
    if (callback) selectList.addEventListener('change', callback);
 
    function setOptions(options, textOptions) {
      if (!textOptions || options.length !== textOptions.length) {
        textOptions = options;
      }

      selectList.options.length = 0;
      for (let i = 0; i < options.length; i++) {
        var option = document.createElement("option");
        option.value = options[i];
        option.text = textOptions[i];
        selectList.appendChild(option);
      }
      if (options.length > 1) {
        selectList.classList.add('multipleSelect');
      } else {
        selectList.classList.remove('multipleSelect');
      }
    }
    this.setOptions = setOptions;

    function setText(text) {
      selectList.classList.remove('multipleSelect');
      selectList.options.length = 0;
      var option = document.createElement("option");
      option.value = null;
      option.text = text;
      selectList.appendChild(option);
    }
    this.setText = setText;
 
    function getValue() {
      return selectList.children[selectList.selectedIndex].value;
    }
    this.getValue = getValue;

    function setValue(index) {
      if (index) selectList.value = selectList.children[index].value;
    }
    this.setValue = setValue;

    function setFunc(callback) {
      if (callback) selectList.addEventListener('change', callback);
    }
    this.setFunc = setFunc;

    function getDiv() {
      return selectList;
    }
    this.getDiv = getDiv;
  }
  this.Select = Select;
}

/**
 * Get image properties given image name like
 *     `B 29A (2017-01-24 -- 2017-01-30, 6)`. The meaning of
 *     this name is:
 *  - `B`:         The satellite capturing the images was Sentinel-1B.
 *  - `29`:        The relative orbit of the images is number 29 of 175.
 *  - `A`:         The image was taken on an ASCENDING orbit.
 *  - `2017-01-24: The date of the reference image.
 *  - `2017-01-30: The date of the action image.
 *  - `6`:         The difference between the two images is 6 days.
 * @param {String} name The name of an image.
 * @return {ee.Dictionary.<string, (string|number|Date)>}
 *  - {ee.Dictionary}
 *    - `satellite`  _{string}_ `'A'` or `'B'`.
 *    - `orbit`      _{number}_ Relative orbit of image.
 *    - `direction`  _{string}_ A- or DESCENDING.
 *    - `refDate`    _{Date}_   Date of reference image.
 *    - `actionDate` _{Date}_   Date of action image.
 */
function parseName_(origName) {
  function abort_() {
    throw new Error();
  }

  var name = origName;
  var satellite = name.slice(0, 1);
  if (!/^[A-D]$/.test(satellite)) abort_();

  var orbitString = name.slice(1, 4);
  if (!/^[0-9]{1,3}/.test(orbitString)) abort_();
  var orbitNum = parseInt(orbitString, 10);
  if (orbitNum < 1 || orbitNum > 175)  abort_();
  var orbitChars = orbitNum < 100 ? orbitNum < 10 ? 1 : 2 : 3;

  name = name.slice(1 + orbitChars);

  var direction;
  if (name.slice(0, 1) == 'D') {
    direction = 'DESCENDING';
  } else if (name.slice(0, 1) == 'A') {
    direction = 'ASCENDING';
  } else {
    abort_();
  }
  if (!/\(/.test(name.slice(1, 2))) abort_();

  var refDate = parseDate_(name.slice(2, 12), true);
  if(isNaN(refDate)) abort_();
  if(!/--/.test(name.slice(12, 16))) abort_();

  var actionDate = parseDate_(name.slice(14, 24), false);

  if(!/,/.test(name.slice(24, 25))) abort_();
  var periodString = name.slice(25, 27);
  if (!/^[0-9]{1,2}/.test(periodString)) abort_();
  var periodNum = parseInt(periodString, 10);
  if (periodNum != (actionDate - refDate) / (1000 * 60 * 60 * 24)) abort_();
  if (periodNum < 1) abort_();
  var periodChars = periodNum < 10 ? 1 : 2;

  name = name.slice(19 + periodChars);
  if (/^\)$/.test(name)) abort_();

  return {
    'name':       origName,
    'satellite':  satellite,
    'orbit':      orbitNum,
    'direction':  direction,
    'refDate':    refDate,
    'actionDate': actionDate,
  };
}
function parseName(origName) {
  var properties;
  properties = parseName_(origName);
  return properties;
}

function parseDate_(dateString, noCheckStart) {
  var dateRegex = /20[0-9]{2}-[0-9]{2}-[0-9]{2}/
  if (!dateRegex.test(dateString)) {
    throw new Errors.ParseDateError('Invalid dateString: ' + dateString);
  }
  var dateTime = Date.parse(dateString);
  if (isNaN(dateTime)) {
    throw new Errors.ParseDateError('Invalid dateString: ' + dateString);
  }
  var date = new Date(dateTime);

  if (dateTime > Date.now()) throw new Errors.FutureDateError;

  return date;
}

export {parseName, ControlUtils, Utils};
