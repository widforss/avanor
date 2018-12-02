import {Cookie} from "./persistency/cookie_.js";
import {Utils} from "./utils/utils_.js";

/**
 * @constructor
 */
function ReadState(SETTINGS) {
  var cookie = new Cookie(SETTINGS.COOKIE);
  var url = new URL(window.location.href);

  var mapCookie = {
    x: parseFloat(cookie.getCookie('x')),
    y: parseFloat(cookie.getCookie('y')),
    z: parseFloat(cookie.getCookie('z')),
  }
  var params = {
    x: parseFloat(url.searchParams.get('x')),
    y: parseFloat(url.searchParams.get('y')),
    z: parseFloat(url.searchParams.get('z')),
  }

  function mapInit() {
    if (params.x && params.y && params.z) {
      return {x: params.x, y: params.y, z: params.z};
    } else if (mapCookie.x && mapCookie.y && mapCookie.z) {
      return {x: mapCookie.x, y: mapCookie.y, z: mapCookie.z};
    } else {
      return SETTINGS.INITPOS;
    }
  }
  this.mapInit = mapInit;

  function layerInit() {
    var imgParam = url.searchParams.get('img')
    return imgParam ? imgParam : cookie.getCookie('img');
  }
  this.layerInit = layerInit;

  function labelInit() {
    return url.searchParams.get('label') == 'yes';
  }
  this.labelInit = labelInit;

  function controlInit() {
    var dateParam    = url.searchParams.get('date');
    var dateCookie       = cookie.getCookie('date');
    var initDate   =
        new Date(dateParam ?
                 dateParam :
                 dateCookie ?
                 parseInt(dateCookie, 10) :
                 SETTINGS.DEFAULT_DATE);

    var basemapParam = url.searchParams.get('basemap');
    var mapCookie = cookie.getCookie('basemap');
    var basemap = basemapParam ?
                  basemapParam :
                  mapCookie ?
                      mapCookie :
                      SETTINGS.DEFAULT_MAP;

    var helpParam = url.searchParams.get('label');
    var helpCookie = cookie.getCookie('help')
    var help = helpParam == 'yes' ?
               false :
               helpCookie == 'hidden' ?
                   false :
                   true;

    return {initDate, basemap, help};
  }
  this.controlInit = controlInit;
}

/**
 * @constructor
 */
function Persistency(map, control, label, layer, SETTINGS) {
  var utils = new Utils();
  var cookie = new Cookie(SETTINGS.COOKIE);

  function setState() {
    cookie.setCookie('x', map.getX());
    cookie.setCookie('y', map.getY());
    cookie.setCookie('z', map.getZ());
    cookie.setCookie('img', layer.currentLayer());
    cookie.setCookie('basemap', map.getBaseMap());
    cookie.setCookie('help', control.isHelpHidden() ? 'hidden' : '');
    cookie.setCookie('date', control.getDate().getTime());
    
    var url = constructUrl_();
    history.replaceState(null, '', url);
  }
  this.setState = setState;

  function getUrl() {
    setState();
    return constructUrl_();
  }
  this.getUrl = getUrl;

  function constructUrl_() {
    var url = [
      '?x=' + map.getX().toFixed(5),
      'y=' + map.getY().toFixed(5), 
      'z=' + map.getZ(),
      'date=' + utils.formatDate(control.getDate()),
      'basemap=' + map.getBaseMap(),
    ].join('&');
    if (layer.currentLayer()) {
      url += '&img=' + layer.currentLayer();
    }
    if (label.getLabel()) {
      url += '&label=yes';
    }
    return url;
  }
}

export {ReadState, Persistency};
