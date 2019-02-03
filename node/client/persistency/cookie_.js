/**
 * @constructor
 */
function Cookie(SETTINGS) {
  var blockCount = 0;

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

export {Cookie};
