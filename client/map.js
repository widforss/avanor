import {returnPopupClass} from "./map/popup.js";

/**
 * @constructor
 */
function Map(div, SETTINGS) {
  var Popup = returnPopupClass();
  var map = new google.maps.Map(div, SETTINGS);

  var eeLayers = [];
  var eeHidden = [];
  var labelCounter = 0;
  var labels = [];

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
        func(event.latLng);
      }, 200);        
    });
    
    google.maps.event.addListener(map, 'dblclick', function(event) {       
      clearTimeout(update_timeout);
    });
  }
  this.onClick = onClick;

  function addLabel(position, content) {
    labels[++labelCounter] = new Popup(position, content);
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

  function toggleEeTo(i) {
    if (eeLayers[i]) {
      map.overlayMapTypes.setAt(i, eeLayers[i]);
      eeHidden[i] = false;
    }
  }
  this.toggleEeTo = toggleEeTo;

  function toggleEeFrom(i) {
    if (map.overlayMapTypes.getAt(i)) {
      map.overlayMapTypes.removeAt(i);
      eeHidden[i] = true;
    }
  }
  this.toggleEeFrom = toggleEeFrom;

  function removeEe(i) {
    map.overlayMapTypes.removeAt(i);
    eeLayers[i] = null;
  }
  this.removeEe = removeEe;

  function setEe(i, mapid, token) {
    const eeMapOptions = {
      'getTileUrl': (tile, zoom) => {
        const baseUrl = 'https://earthengine.googleapis.com/map';
        const url = [baseUrl, mapid, zoom, tile.x, tile.y].join('/');
        return `${url}?token=${token}`;
      },
      'tileSize': new google.maps.Size(256, 256)
    };

    eeLayers[i] = new google.maps.ImageMapType(eeMapOptions);

    if (!eeHidden[i]) map.overlayMapTypes.setAt(i, eeLayers[i]);
  }
  this.setEe = setEe;

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
    map.setMapTypeId(mapName);
  }
  this.setBaseMap = setBaseMap;

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
}

export {Map};
