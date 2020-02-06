import OlMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import Vector from 'ol/source/Vector';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import WMTS from 'ol/source/WMTS';
import XYZ from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style.js';
import Point from 'ol/geom/Point';
import Collection from 'ol/Collection';
import {transform, transformExtent, get as getProjection} from 'ol/proj';
import {defaults as defaultInteractions} from 'ol/interaction';
import Translate from 'ol/interaction/Translate';
import {register} from 'ol/proj/proj4.js';
import proj4 from 'proj4';

import {Popup} from './ol/popup.js';
import LayerSwitcher from 'ol-layerswitcher';

function Map(div, readState, SETTINGS, updateMap, setObsPos) {
  var that = this;
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

  this.points = [];
  var trigpointLayer = new VectorLayer({
    title: '<span style="color:orange">■</span> Field obs (estimated age)',
    source: new Vector({
      renderers: ['Canvas', 'VML'],
      wrapX: false,
    }),
    zIndex: SETTINGS.NJUNIS_TRIG_Z,
  });
  var obspointLayer = new VectorLayer({
    title: '<span style="color:red">■</span> Field obs',
    source: new Vector({
      renderers: ['Canvas', 'VML'],
      wrapX: false,
    }),
    zIndex: SETTINGS.NJUNIS_OBS_Z,
  });
  var oldpointLayer = new VectorLayer({
    title: '<span style="color:grey">■</span> Old and new',
    source: new Vector({
      renderers: ['Canvas', 'VML'],
      wrapX: false,
    }),
    zIndex: SETTINGS.NJUNIS_OLD_Z,
  });
  var fieldpointLayer = new VectorLayer({
    title: '<span style="color:green">■</span> Verified radar obs',
    source: new Vector({
      renderers: ['Canvas', 'VML'],
      wrapX: false,
    }),
    zIndex: SETTINGS.NJUNIS_FIELD_Z,
  });
  var radarpointLayer = new VectorLayer({
    title: '<span style="color:blue">■</span> Radar obs',
    source: new Vector({
      renderers: ['Canvas', 'VML'],
      wrapX: false,
    }),
    zIndex: SETTINGS.NJUNIS_RADAR_Z,
  });
  var foreverLayer = new VectorLayer({
    title: 'Forever',
    source: new Vector({
      renderers: ['Canvas', 'VML'],
      wrapX: false,
    }),
    visible: false,
    zIndex: 0,
  });
  this.foreverLayer = foreverLayer;
  let initPos = readState.mapInit();
  var map = new OlMap({
    target : div,
    logo : false,
    view : new View({
      extent: [ 444000, 7374000, 3548000, 11549000 ],
      resolutions: googResolutions,
      minZoom: 6,
      center : transform([initPos.x, initPos.y], 'EPSG:4326', 'EPSG:3857'),
      zoom : initPos.z,
      projection: 'EPSG:3857',
    }),
    interactions: defaultInteractions({
      altShiftDragRotate: false,
      pinchRotate: false,
    }),
    overlays: [popup.getOverlay()],
    layers: [
      foreverLayer,
      oldpointLayer,
      radarpointLayer,
      fieldpointLayer,
      obspointLayer,
      trigpointLayer,
    ]
  });

  let infoPointTimeout;
  let infoPointFeatures = [];
  var infoPointTranslate = new Translate({
    features: new Collection(infoPointFeatures),
    layers: [
      trigpointLayer,
      obspointLayer,
      oldpointLayer,
      fieldpointLayer,
      radarpointLayer,
    ],
  });
  infoPointTranslate.on('translatestart', (e) => {
    clearTimeout(infoPointTimeout);
  });
  infoPointTranslate.on('translateend', (e) => {
    let point = infoPointFeatures.pop();
    var proj = map.getView().getProjection();
    let coordinates =
        transform(point.getGeometry().getCoordinates(), proj, 'EPSG:4326');
    point.values_.coordinates = coordinates;
    setObsPos(point.values_);
    rmLabel();
  });

  addLayer_([ -20037508.34, -20037508.34, 20037508.34, 20037508.34 ],
            // License required for higher resolution.
            // However, it is wide open at (use all caps parameters):
            // https://kso.etjanster.lantmateriet.se/karta/topowebb/v1.1/wmts?
            [ 156543.033928041 ].concat(googResolutions.slice(0, 15)),
            'EPSG:3857',
            '/static/geojson/se-simplified_wgs84.geojson',

            // Changed due to licensing issues. The current is CC0.
            //'https://kso.etjanster.lantmateriet.se/karta/topowebb/v1.1/wmts?'+
            'https://api.lantmateriet.se/open/topowebb-ccby/v1/wmts/' +
                'token/f6004f59-323f-36ac-b83c-be300ee533d7/?' +
                'SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=topowebb&' +
                'STYLE=default&TILEMATRIXSET=3857&' +
                'TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png',
            1);
  
  addLayer_([ -20037508.34, -20037508.34, 20037508.34, 20037508.34 ],
            [ 156543.033928041 ].concat(googResolutions),
            'EPSG:3857',
            '/static/geojson/no-simplified_wgs84.geojson',
            'https://opencache.statkart.no/gatekeeper/gk/gk.open_wmts/?' +
                 'layer=topo4&style=default&tilematrixset=EPSG:3857&' +
                 'Service=WMTS&Request=GetTile&Version=1.0.0&' +
                 'Format=image/png&' +
                 'TileMatrix=EPSG:3857:{z}&TileCol={x}&TileRow={y}',
            2);
  
  let prevZoom;
  let prevOldVisible;
  foreverLayer.on('change:visible', (e) => {
    let visible = e.target.get('visible');
    if (visible) {
      prevZoom = map.getView().getZoom();
      map.getView().setMinZoom(11);
      prevOldVisible = oldpointLayer.get('visible');
      oldpointLayer.set('visible', false);
    } else {
      map.getView().setMinZoom(6);
      map.getView().setZoom(prevZoom);
      oldpointLayer.set('visible', prevOldVisible);
    }
  });
  oldpointLayer.on('change:visible', (e) => {
    if (foreverLayer.get('visible')) {
      oldpointLayer.set('visible', false);
    }
  });

function onForever(func) {
    foreverLayer.on('change:visible', (e) => {
      func(e);
    });
  }
  this.onForever = onForever;

  function onMove(func) {
    map.on('moveend', () => {
      func();
    });
  }
  this.onMove = onMove;

  function onClick(func) {
    map.on('singleclick', (e) => {
      var features =
          map.getFeaturesAtPixel(e.pixel).map((feat) => feat.getProperties());
      var isInfoPoint;
      for (var feature of features) {
        if (feature.id) isInfoPoint = true;
      }
      if (!isInfoPoint) {
        var proj = map.getView().getProjection();
        var coord = transform(e.coordinate, proj, 'EPSG:4326');
        var lat = coord[1];
        var lon = coord[0];
        func(lon, lat);
      }
    });
  }
  this.onClick = onClick;

  function setTranslate(active) {
    if (active) {
      map.addInteraction(infoPointTranslate);
    } else {
      map.removeInteraction(infoPointTranslate);
    }
  }
  this.setTranslate = setTranslate;

  function infoPointClick(func) {
    map.on('click', (e) => {
      var done;
      map.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
        var feat = feature.getProperties();
        if (!done && feat.id) {
          done = true;
          let token = readState.getToken();
          if (!token) {
            func(feat);
          } else {
            infoPointFeatures.push(feature)
            infoPointTimeout = setTimeout(() => {
              infoPointFeatures.pop()
              func(feat);
            }, 500);
          }
          return true;
        }
      });
    });
  }
  this.infoPointClick = infoPointClick;

  function addLabel(x, y, content, doPopup) {
    var proj = map.getView().getProjection();
    var coord = transform([x, y], 'EPSG:4326', proj);
    popup.setContent(content);
    console.log(popup.getPosition())
    if (doPopup !== false || popup.getPosition()) popup.setPosition(coord);
    return ++labelCounter;
  }
  this.addLabel = addLabel;

  function rmLabel() {
    popup.setPosition(undefined);
    that.EeTrigger = null;
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
    if (this.EeTrigger) this.EeTrigger();
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
    return 'se/no';
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

  function clearRadar() {
    radarpointLayer.getSource().forEachFeature((point) => {
      delete this.points[point.values_.id];
    });
    radarpointLayer.getSource().clear();
  }
  this.clearRadar = clearRadar;

  function addInfoPoint(point) {
    var proj = map.getView().getProjection();
    let points = this.points;
    point.geometry = new Point(transform(point.coordinates, 'EPSG:4326', proj));
    point.date = new Date();

    if (!points[point.id] ||
      point.date - points[point.id].values_.date > 60000 ||
      point.size != points[point.id].values_.size ||
      point.color != points[point.id].values_color) {

      var pointFeature = new Feature(point);
      pointFeature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: point.size,
            fill: new Fill({
              color: [55, 55, 55, 0.5],
            }),
            stroke: new Stroke({
              color: point.color,
              width: 3,
            }),
          })
        })
      );

      if (points[point.id]) {
        [
          trigpointLayer,
          obspointLayer,
          oldpointLayer,
          oldpointLayer,
          fieldpointLayer,
          radarpointLayer,
        ].forEach((layer) => {
          try {
            layer.getSource().removeFeature(points[point.id]);
          } catch(e) {}
        });
      }

      switch (point.type) {
        case 'trig':
          trigpointLayer.getSource().addFeature(pointFeature);
          break;
        case 'obs':
          obspointLayer.getSource().addFeature(pointFeature);
          break;
        case 'old':
        case 'radarold':
        case 'future':
        case 'radarfuture':
          oldpointLayer.getSource().addFeature(pointFeature);
          break;
        case 'field':
          fieldpointLayer.getSource().addFeature(pointFeature);
          break;
        case 'radar':
          radarpointLayer.getSource().addFeature(pointFeature);
          break;
        default:
          throw new Error('Invalid infopoint type!');
      }
    }
    points[point.id] = pointFeature;
  }
  this.addInfoPoint = addInfoPoint;

  function removeInfoPoints() {
    trigpointLayer.getSource().clear();
    obspointLayer.getSource().clear();
    oldpointLayer.getSource().clear();
    fieldpointLayer.getSource().clear();
    radarpointLayer.getSource().clear();
  }
  this.removeInfoPoints = removeInfoPoints;

  function addLayer_(extent, resolutions, projection, boundsUrl, tileUrl, z) {
    const tileGrid = new WMTSTileGrid({
      tileSize : 256,
      extent : extent,
      resolutions : resolutions,
      projection: projection,
    });

    const xyz = new TileLayer({
      source: new XYZ({
        url: tileUrl,
        tileGrid: tileGrid,
        crossOrigin: 'Anonymous',
        projection: projection,
      }),
    });

    if (boundsUrl) {
      const urlFunction = xyz.getSource().getTileUrlFunction();
      xyz.getSource().setTileUrlFunction(function(tileCoord,
                                                  pixelRatio,
                                                  projection) {
        for (var feature of bounds.getSource().getFeatures()) {
          var featureIntersects =
              feature.getGeometry()
                     .intersectsExtent(this.getTileGrid()
                                           .getTileCoordExtent(tileCoord));
          if (featureIntersects) {
            return urlFunction(tileCoord, pixelRatio, projection);
          }
        };
      });

      const bounds = addGeoJSON_(boundsUrl, 0);
      bounds.getSource().on('change', (e) => {
        if (bounds.getSource().getState() == 'ready') {
          map.addLayer(xyz);
          xyz.setZIndex(z);
        }
      });
    } else {
      map.addLayer(xyz);
      xyz.setZIndex(z);
    }
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

  var layerSwitcher = new LayerSwitcher({
    tipLabel: 'Layers', // Optional label for button
    groupSelectStyle: 'group' // Can be 'children' [default], 'group' or 'none'
  });
  //Add filter legend
  map.addControl(layerSwitcher);
}

export {Map};
