import {returnPopupClass} from "./map/popup.js";

/**
 * @constructor
 */
function Map(div, initPos, SETTINGS) {
  var Popup = returnPopupClass();
  var map = new google.maps.Map(div, SETTINGS.MAP);

  var eeLayers = [];
  var eeHidden = [];
  var labelCounter = 0;
  var labels = [];
  var basemap;

  setPos(initPos.x, initPos.y, initPos.z);

  map.data.setStyle(SETTINGS.DATA);

  function onMove(func) {
    map.addListener('center_changed', func);
  }
  this.onMove = onMove;

  function onLoad(func) {
    google.maps.event.addListenerOnce(map, 'idle', func);
  }
  this.onLoad = onLoad;

  function onClick(func) {
    var update_timeout = null;
    
    google.maps.event.addListener(map, 'click', function(event){
      update_timeout = setTimeout(function(){
        func(event.latLng.lng(), event.latLng.lat());
      }, 200);        
    });
    
    google.maps.event.addListener(map, 'dblclick', function(event) {       
      clearTimeout(update_timeout);
    });
  }
  this.onClick = onClick;

  function addLabel(x, y, content) {
    labels[++labelCounter] = new Popup({'lat': () => y, 'lng': () => x},
                                       content);
    labels[labelCounter].setMap(map);
    return labelCounter;
  }
  this.addLabel = addLabel;

  function rmLabel(labelRef) {
    if (labels[labelCounter]) {
      labels[labelCounter].setMap(null);
      delete labels[labelCounter];
    }
  }
  this.rmLabel = rmLabel;

  function toggleEeTo() {
    if (eeLayers[SETTINGS.EE_LAYER_Z]) {
      map.overlayMapTypes.setAt(SETTINGS.EE_LAYER_Z,
                                eeLayers[SETTINGS.EE_LAYER_Z]);
      eeHidden[SETTINGS.EE_LAYER_Z] = false;
    }
    if (eeLayers[SETTINGS.SLOPES_LAYER_Z]) {
      map.overlayMapTypes.setAt(SETTINGS.SLOPES_LAYER_Z,
                                eeLayers[SETTINGS.SLOPES_LAYER_Z]);
      eeHidden[SETTINGS.SLOPES_LAYER_Z] = false;
    }
  }
  this.toggleEeTo = toggleEeTo;

  function toggleEeFrom() {
    if (map.overlayMapTypes.getAt(SETTINGS.EE_LAYER_Z)) {
      map.overlayMapTypes.removeAt(SETTINGS.EE_LAYER_Z);
      eeHidden[SETTINGS.EE_LAYER_Z] = true;
    }
    if (map.overlayMapTypes.getAt(SETTINGS.SLOPES_LAYER_Z)) {
      map.overlayMapTypes.removeAt(SETTINGS.SLOPES_LAYER_Z);
      eeHidden[SETTINGS.SLOPES_LAYER_Z] = true;
    }
  }
  this.toggleEeFrom = toggleEeFrom;

  function removeEe() {
    map.overlayMapTypes.removeAt(SETTINGS.EE_LAYER_Z);
    eeLayers[SETTINGS.EE_LAYER_Z] = null;
  }
  this.removeEe = removeEe;

  function setEe(mapid, token) {
    setEeLayer(mapid, token, SETTINGS.EE_LAYER_Z)
  }
  this.setEe = setEe;

  function setSlopes(mapid, token) {
    setEeLayer(mapid, token, SETTINGS.SLOPES_LAYER_Z)
  }
  this.setSlopes = setSlopes;

  function getBounds() {
    var latlonbounds = map.getBounds().toJSON();

    return {
      "type": "Polygon",
      "geodesic": false,
      "coordinates": [[
          [latlonbounds.west, latlonbounds.north],
          [latlonbounds.east, latlonbounds.north],
          [latlonbounds.east, latlonbounds.south],
          [latlonbounds.west, latlonbounds.south],
          [latlonbounds.west, latlonbounds.north],
      ]]
    };
  }
  this.getBounds = getBounds;

  function setBaseMap(mapName) {
    basemap = mapName;
    map.setMapTypeId(mapName.toLowerCase());
  }
  this.setBaseMap = setBaseMap;

  function getBaseMap() {
    return basemap;
  }
  this.getBaseMap = getBaseMap;

  function getZoom() {
    return map.getZoom();
  }
  this.getZoom = getZoom;

  function setZoom(zoom) {
    map.setZoom(zoom);
  }
  this.setZoom = setZoom;

  function setPos(x, y, z) {
    map.setCenter({'lat': y, 'lng': x});
    setZoom(z);
  }
  this.setPos = setPos;

  function getX() {
    return map.getCenter().lng();
  }
  this.getX = getX;

  function getY() {
    return map.getCenter().lat();
  }
  this.getY = getY;

  function getZ() {
    return map.getZoom();
  }
  this.getZ = getZ;

  function addGeoJSON(url) {
    map.data.loadGeoJson(url);
  }
  this.addGeoJSON = addGeoJSON;

  function setEeLayer(mapid, token, z) {
    const eeMapOptions = {
      'getTileUrl': (tile, zoom) => {
        const baseUrl = 'https://earthengine.googleapis.com/map';
        const url = [baseUrl, mapid, zoom, tile.x, tile.y].join('/');
        return `${url}?token=${token}`;
      },
      'tileSize': new google.maps.Size(256, 256)
    };

    eeLayers[z] =
        new google.maps.ImageMapType(eeMapOptions);

    if (!eeHidden[z]) {
      map.overlayMapTypes.setAt(z,
                                eeLayers[z]);
    }
  }
  this.setEeLayer = setEeLayer;
}

export {Map};
