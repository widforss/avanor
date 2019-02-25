import OlMap from 'ol/Map';
import OSM from 'ol/source/OSM';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import Vector from 'ol/source/Vector';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import WMTS from 'ol/source/WMTS';
import XYZ from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import {transform, transformExtent, get as getProjection} from 'ol/proj';
import {defaults as defaultInteractions} from 'ol/interaction';
import {register} from 'ol/proj/proj4.js';
import proj4 from 'proj4';

import {Popup} from './ol/popup.js';

function Map(div, initPos, SETTINGS, updateMap) {
  var eeLayers = [];
  var eeHidden = false;
  var labelCounter = 0;

  const utm33 = '+proj=utm +zone=33 +ellps=GRS80 ' +
                '+towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
  proj4.defs('EPSG:25833', utm33);
  register(proj4);

  const googResolutions = [
    78271.51696402048,
    39135.75848201023,
    19567.87924100512,
    9783.93962050256,
    4891.96981025128,
    2445.98490512564,
    1222.99245256282,
    611.49622628141,
    305.7481131407048,
    152.8740565703525,
    76.43702828517624,
    38.21851414258813,
    19.10925707129406,
    9.554628535647032,
    4.777314267823516,
    2.388657133911758,
    1.194328566955879,
    0.5971642834779395,
    0.29858214173896974,
    0.14929107086948487,
  ];

  var popup = new Popup(updateMap);

  var map = new OlMap({
    target : div,
    logo : false,
    view : new View({
      extent:
          transform([9.72839, 47.07947], 'EPSG:4326', 'EPSG:3857').concat(
              transform([10.71441, 47.56911], 'EPSG:4326', 'EPSG:3857')),
      resolutions: googResolutions,
      minZoom: 9,
      center : transform([initPos.x, initPos.y], 'EPSG:4326', 'EPSG:3857'),
      zoom : initPos.z,
      projection: 'EPSG:3857',
    }),
    interactions: defaultInteractions({
      altShiftDragRotate: false,
      pinchRotate: false,
    }),
    overlays: [popup.getOverlay()],
  });

  addOSM_('https://a.tile.opentopomap.org/{z}/{x}/{y}.png', 1);

  function onMove(func) {
    map.on('moveend', () => {
      func();
    });
  }
  this.onMove = onMove;

  function onClick(func) {
    map.on('singleclick', (e) => {
      var proj = map.getView().getProjection();
      var coord = transform(e.coordinate, proj, 'EPSG:4326');
      var lat = coord[1];
      var lon = coord[0];
      func(lon, lat);
    });
  }
  this.onClick = onClick;

  function addLabel(x, y, content) {
    var proj = map.getView().getProjection();
    var coord = transform([x, y], 'EPSG:4326', proj);
    popup.setContent(content);
    popup.setPosition(coord);
    return ++labelCounter;
  }
  this.addLabel = addLabel;

  function rmLabel() {
    popup.setPosition(undefined);
  }
  this.rmLabel = rmLabel;

  function toggleEeTo() {
    if (eeHidden) {
      var eeLayer = eeLayers[SETTINGS.EE_LAYER_Z];
      var slopesLayer = eeLayers[SETTINGS.SLOPES_LAYER_Z];
      if (eeLayer) map.addLayer(eeLayer);
      if (slopesLayer) map.addLayer(slopesLayer);
      eeHidden = false;
    }
  }
  this.toggleEeTo = toggleEeTo;

  function toggleEeFrom() {
    if (!eeHidden) {
      map.removeLayer(eeLayers[SETTINGS.EE_LAYER_Z]);
      map.removeLayer(eeLayers[SETTINGS.SLOPES_LAYER_Z]);
      eeHidden = true;
    }
  }
  this.toggleEeFrom = toggleEeFrom;

  function removeEe() {
    map.removeLayer(eeLayers[SETTINGS.EE_LAYER_Z]);
    eeLayers[SETTINGS.EE_LAYER_Z] = null;
  }
  this.removeEe = removeEe;

  function setEe(mapid, token) {
    setEeLayer_(mapid, token, SETTINGS.EE_LAYER_Z);
  }
  this.setEe = setEe;

  function setSlopes(mapid, token) {
    setEeLayer_(mapid, token, SETTINGS.SLOPES_LAYER_Z);
  }
  this.setSlopes = setSlopes;

  function getBounds() {
    var proj = map.getView().getProjection();
    var latlonbounds =
        transformExtent(map.getView().calculateExtent(), proj, 'EPSG:4326');

    return {
      "type": "Polygon",
      "geodesic": false,
      "coordinates": [[
          [latlonbounds[0], latlonbounds[3]],
          [latlonbounds[2], latlonbounds[3]],
          [latlonbounds[2], latlonbounds[1]],
          [latlonbounds[0], latlonbounds[1]],
          [latlonbounds[0], latlonbounds[3]],
      ]],
    };  
  }
  this.getBounds = getBounds;

  function setBaseMap() {
  }
  this.setBaseMap = setBaseMap;

  function getBaseMap() {
    return 'at';
  }
  this.getBaseMap = getBaseMap;

  function setZoom(z) {
    map.getView().setZoom(z);
  }
  this.setZoom = setZoom;

  function setPos(x, y, z) {
    var proj = map.getView().getProjection();
    map.getView().setCenter(transform([x, y], 'EPSG:4326', proj));
    setZoom(z);
  }
  this.setPos = setPos;

  function getX() {
    var proj = map.getView().getProjection();
    return transform(map.getView().getCenter(), proj, 'EPSG:4326')[0];
  }
  this.getX = getX;

  function getY() {
    var proj = map.getView().getProjection();
    return transform(map.getView().getCenter(), proj, 'EPSG:4326')[1];
  }
  this.getY = getY;

  function getZ() {
    return map.getView().getZoom();
  }
  this.getZ = getZ;

  function getZoom() {
    return getZ();
  }
  this.getZoom = getZoom;

  function addGeoJSON_(url, z) {
    const vector = new VectorLayer({
      source: new Vector({
        url: url,
        format: new GeoJSON({
        }),
      }),
      style: new Style({
        stroke: new Stroke({
          color: 'red',
        }),
        fill: new Fill({
          color: [255, 255, 255, 0.4],
        }),
      }),
    });
    map.addLayer(vector);
    vector.setZIndex(z);
    return vector;
  }
  function addGeoJSON(url) {
    addGeoJSON_(url, 3);
  }
  this.addGeoJSON = addGeoJSON;

  function addOSM_(tileUrl, z) {
    const xyz = new TileLayer({
      source: new OSM({
        url: tileUrl,
      }),
    });

    map.addLayer(xyz);
    xyz.setZIndex(z);
  }

  function setEeLayer_(mapid, token, z) {
    const baseUrl = 'https://earthengine.googleapis.com/map';
    const url =
        [baseUrl, mapid, '{z}', '{x}', '{y}'].join('/') + '?token=' + token;

    eeLayers[z] = new TileLayer({
      source: new XYZ({
        url: url,
        projection: 'EPSG:3857',
      }),
    });

    eeLayers[z].getSource().on('tileloaderror', function(e) {
      exponentialBackoff_(e.tile);
    });

    eeLayers[z].setZIndex(z);

    if (!eeHidden) {
      map.addLayer(eeLayers[z]);
    }
  }

  function exponentialBackoff_(tile) {
    if (!tile.tries) {
      tile.tries = 0;
    } else if (tile.tries == 5) {
      return;
    }
    var delay =
        Math.random() * SETTINGS.EXP_TIMEOUT * Math.pow(2, tile.tries++);

    setTimeout(() => { tile.load(); }, delay);
  }
}

export {Map};
