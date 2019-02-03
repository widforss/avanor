const Errors            = require('./errors.js');

const fs         = require('fs');
const utm        = require('utm');
const booleanIntersects = require('@turf/boolean-intersects').default;

function Coordinates() {
  const se = JSON.parse(fs.readFileSync('./server/coordinates/se.geojson'));
  const no = JSON.parse(fs.readFileSync('./server/coordinates/no.geojson'));
  const no32 = JSON.parse(fs.readFileSync('./server/coordinates/no32.geojson'));
  const no35 = JSON.parse(fs.readFileSync('./server/coordinates/no35.geojson'));

  function getCoords(lat, lon, callback) {
    if (isNaN(lat) || isNaN(lon)) {
      Errors.handle(new Errors.NotANumberError(), callback);
      return;
    }
    if ((lat > 90 || lat < -90) || (lon > 180 || lon <= -180)) {
      Errors.handle(new Errors.LatLngRangeError(), callback);
      return;
    }

    var coords = {};

    var nS = northSouth_(lat);
    var eW = eastWest_(lon);
    var posLat = Math.abs(lat);
    var posLon = Math.abs(lon);
    var latMin = anglify_(posLat);
    var lonMin = anglify_(posLon);
    var latSec = anglify_(latMin);
    var lonSec = anglify_(lonMin);
    coords['WGS 84 (DD)'] =
        posLat.toFixed(5) + '° ' + nS + ', ' + posLon.toFixed(5) + '° ' + eW;
    coords['WGS 84 (DM)'] =
        Math.floor(posLat) + '° ' + latMin.toFixed(3) + '′ ' + nS + ', '
            + Math.floor(posLon) + '° ' + lonMin.toFixed(3) + '′ ' + eW;
    coords['WGS 84 (DMS)'] =
        Math.floor(posLat) + '° ' + Math.floor(latMin) + '′ ' 
            + latSec.toFixed(1) + '″ ' + nS + ', '
            + Math.floor(posLon) + '° ' + Math.floor(lonMin) + '′ ' 
            + lonSec.toFixed(1) + '″ ' + eW;

    if (lat <= 84 && lat >= -80) {
      setUTM(lat, lon, coords);
      setNo(lat, lon, coords);
      setSe(lat, lon, coords);
    }

    callback(coords);
  }
  this.getCoords = getCoords;

  function setUTM(lat, lon, coords) {
    var utmCoords = utm.fromLatLon(lat, lon);

    coords[
      'UTM ' + utmCoords.zoneNum + ' ' + getHemisphere_(utmCoords.zoneLetter)
    ] = formatUTM_(utmCoords.northing, utmCoords.easting);
  }

  function setNo(lat, lon, coords) {
    var point = getPoint_(lat, lon);
    if (!booleanIntersects(no, point)) return;

    if(!coords['UTM 33 N']) {
      var utm33 = utm.fromLatLon(lat, lon, 33);
      coords['UTM 33 N'] = formatUTM_(utm33.northing, utm33.easting);
    }

    if(!coords['UTM 32 N'] && booleanIntersects(no32, point)) {
      var utm32 = utm.fromLatLon(lat, lon, 32);
      coords['UTM 32 N'] = formatUTM_(utm32.northing, utm32.easting);
    }

    if(!coords['UTM 35 N'] && booleanIntersects(no35, point)) {
      var utm35 = utm.fromLatLon(lat, lon, 35);
      coords['UTM 35 N'] = formatUTM_(utm35.northing, utm35.easting);
    }
  }

  function setSe(lat, lon, coords) {
    var point = getPoint_(lat, lon);
    if (!booleanIntersects(se, point)) return;

    var utm33 = utm.fromLatLon(lat, lon, 33);

    coords['SWEREF 99 TM'] =
        'N: ' + Math.floor(utm33.northing) + ', E: ' + Math.floor(utm33.easting);
  }

  function getHemisphere_(letter) {
    if (['C','D','E','F','G','H','J','K','L','M'].indexOf(letter) != -1)
      return 'S';
    if (['N','P','Q','R','S','T','U','V','W','X'].indexOf(letter) != -1)
      return 'N';
    Errors.handle(new Errors.UtmZoneError('Failed to parse zone ' + letter));
  }

  function getPoint_(lat, lon) {
    return {
      'type': 'Point',
      'coordinates': [
        lon,
        lat
      ]
    }
  }

  function anglify_(number) {
    return (number % 1) * 60;
  }

  function northSouth_(number) {
    if (number < 0) return 'S';
    return 'N';
  }

  function eastWest_(number) {
    if (number < 0) return 'W';
    return 'E';
  }

  function formatUTM_(n, e) {
    return Math.floor(e) + 'mE ' + Math.floor(n) + 'mN';
  }
}

module.exports = Coordinates;
