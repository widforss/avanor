/**
 * @constructor
 */
function Utils() {
  const SETTINGS = {
    TIMEOUT: 30000,
    TRIES: 7,
    WAIT: 100,
    COOKIELIFE: 30 * 24 * 3600
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

  function getCookie(cname) {
      var name = cname + "=";
      var decodedCookie = decodeURIComponent(document.cookie);
      var ca = decodedCookie.split(';');
      for(var i = 0; i <ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') {
              c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
              return c.substring(name.length, c.length);
          }
      }
      return "";
  }
  this.getCookie = getCookie;

  function setCookie(cname, value) {
    var expiry = new Date(Date.now() + SETTINGS.COOKIELIFE).toUTCString()
    document.cookie = cname + '=' + value + '; expires=' + expiry + ';';
  }
  this.setCookie = setCookie;
}

export {Utils};
