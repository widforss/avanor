import {parseName, Utils, ControlUtils}   from "./utils/utils_.js";

/**
 * @constructor
 */
function Njunis(map, readState, control, SETTINGS) {
  window['NJUNIS_HOST'] = SETTINGS.NJUNIS_HOST;

  var utils = new Utils();
  var controlUtils  = new ControlUtils();
  var reqCallback;
  var reqCount;
  var images = {};

  function checkReq() {
    let num_callbacks = 9;
    if (map.foreverLayer.get('visible') === true) {
      num_callbacks = 4;
    }
    if (++reqCount == num_callbacks && reqCallback) {
      reqCallback();
    }
  }

  var trigRequest = new utils.Request((text) => {
    handleNjunisData_(text, 'trig');
    checkReq();
  });
  var obsRequest = new utils.Request((text) => {
    handleNjunisData_(text, 'obs');
    checkReq();
  });
  var oldRequest = new utils.Request((text) => {
    handleNjunisData_(text, 'old');
    checkReq();
  });
  var futureTrigRequest = new utils.Request((text) => {
    handleNjunisData_(text, 'future');
    checkReq();
  });
  var futureObsRequest = new utils.Request((text) => {
    handleNjunisData_(text, 'future');
    checkReq();
  });
  var fieldRadarRequest = new utils.Request((text) => {
    handleNjunisData_(text, 'field');
    checkReq();
  });
  var radarObsRequest = new utils.Request((text) => {
    map.clearRadar();
    handleNjunisData_(text, 'radar');
    checkReq();
  });
  var radarOldRequest = new utils.Request((text) => {
    handleNjunisData_(text, 'radarold');
    checkReq();
  });
  var radarFutureRequest = new utils.Request((text) => {
    handleNjunisData_(text, 'radarfuture');
    checkReq();
  });

  function updateMap(callback) {
    trigRequest.block();
    obsRequest.block();
    oldRequest.block();
    radarOldRequest.block();
    futureTrigRequest.block();
    futureObsRequest.block();
    radarFutureRequest.block();
    fieldRadarRequest.block();
    reqCount = 0;
    reqCallback = callback;

    var date = new Date(formatDate_(control.getDate(), SETTINGS.TIMEZONE)),
        startDate =
            new Date(date.getTime() - 3600000 * 24 * SETTINGS.START_DIST),
        endObs = new Date(date.getTime() + 3600000 * 24 * SETTINGS.OBSPERIOD),
        oldstart =
            new Date(date.getTime(date) - 3600000 * 24 * SETTINGS.OLD_DIST),
        futureend =
            new Date(date.getTime(date) + 3600000 * 24 * SETTINGS.OLD_DIST),
        bounds = JSON.stringify(map.getBounds());
    if (map.foreverLayer.get('visible') === true) {
      startDate = new Date('1971-01-01');
      date = new Date('2100-01-01');
      endObs = new Date('2100-01-01');
    }

    date.setDate(date.getDate() + 1);

    var trigurl = SETTINGS.NJUNIS_HOST + "/api/avalanche/trigdate?start="
            + startDate.toISOString() + '&end=' + date.toISOString()
            + '&geom=' + bounds + '&nullradar=true',
        obsurl = SETTINGS.NJUNIS_HOST + "/api/avalanche/obsdate?start="
            + startDate.toISOString() + '&end=' + endObs.toISOString()
            + '&geom=' + bounds + '&nulltrig=true&nullradar=true',
        oldurl = SETTINGS.NJUNIS_HOST + "/api/avalanche/bothdates?start="
            + oldstart.toISOString() + '&end=' + startDate.toISOString()
            + '&geom=' + bounds + '&nullradar=true',
        radarOldurl = SETTINGS.NJUNIS_HOST + "/api/radarobs/notfieldobserved?start="
            + oldstart.toISOString() + '&end=' + startDate.toISOString()
            + '&geom=' + bounds,
        futureTrigurl = SETTINGS.NJUNIS_HOST + "/api/avalanche/trigdate?start="
            + date.toISOString() + '&end=' + futureend.toISOString()
            + '&geom=' + bounds,
        futureObsurl = SETTINGS.NJUNIS_HOST + "/api/avalanche/obsdate?start="
            + endObs.toISOString() + '&end=' + futureend.toISOString()
            + '&geom=' + bounds + '&nulltrig=true&nullradar=true',
        radarFutureurl = SETTINGS.NJUNIS_HOST + "/api/radarobs/notfieldobserved?start="
            + date.toISOString() + '&end=' + futureend.toISOString()
            + '&geom=' + bounds,
        fieldRadarUrl = SETTINGS.NJUNIS_HOST + "/api/avalanche/radardate?start="
            + startDate.toISOString() + '&end=' + date.toISOString()
            + '&geom=' + bounds,
        radarObsUrl = SETTINGS.NJUNIS_HOST + "/api/radarobs/notfieldobserved?start="
            + startDate.toISOString() + '&end=' + date.toISOString()
            + '&geom=' + bounds;

    trigRequest.run(trigurl);
    obsRequest.run(obsurl);
    fieldRadarRequest.run(fieldRadarUrl);
    radarObsRequest.run(radarObsUrl);
    if (map.foreverLayer.get('visible') === false) {
      oldRequest.run(oldurl);
      radarOldRequest.run(radarOldurl);
      futureTrigRequest.run(futureTrigurl);
      futureObsRequest.run(futureObsurl);
      radarFutureRequest.run(radarFutureurl);
    }
  }
  this.updateMap = updateMap;

  function visibleButton(point, callback, coordinates) {
    let parent = document.createElement('div');
    let obsId;
    let token = readState.getToken();
    if (!token) {
      return parent;
    }

    let visible = new controlUtils.Button('Mark as visible on image.', () => {
      let radarObs = makeObs_(point);
      var addUrl = SETTINGS.NJUNIS_HOST + "/api/secure/radarobs?token=" + token;
      var req = new XMLHttpRequest();
      req.onload = callback;
      req.open('POST', addUrl, true);
      req.setRequestHeader("Content-Type", "application/json");
      req.send(JSON.stringify(radarObs));
    });

    let newObs = new controlUtils.Button('Create radar observation.', () => {
      let radarObs = makeObs_(point, coordinates);
      var addUrl = SETTINGS.NJUNIS_HOST + "/api/secure/radarobs?token=" + token;
      var req = new XMLHttpRequest();
      req.onload = () => {
        if (req.status == 200) {
          let point = JSON.parse(req.response);
          callback(formatPoint_(point, 'radar'));
        }
      }
      req.open('POST', addUrl, true);
      req.setRequestHeader("Content-Type", "application/json");
      req.send(JSON.stringify(radarObs));
    });

    let remove = new controlUtils.Button('Remove single image from avalanche.', () => {
      var rmUrl =
          SETTINGS.NJUNIS_HOST + "/api/secure/radarobs/" + obsId + "?token=" + token;
      var req = new XMLHttpRequest();
      req.onload = callback;
      req.open('DELETE', rmUrl, true);
      req.setRequestHeader("Content-Type", "application/json");
      req.send();
    });

    let removeObs = new controlUtils.Button('Clear ALL radar data.', () => {
      var rmUrl = SETTINGS.NJUNIS_HOST + "/api/secure/radarobs/" + point.radarId
          + "?token=" + token + '&full=true';
      var req = new XMLHttpRequest();
      req.onload = callback;
      req.open('DELETE', rmUrl, true);
      req.setRequestHeader("Content-Type", "application/json");
      req.send();
    });

    var radarReq = new utils.Request((text) => {
      let response = JSON.parse(text);
      if (!response) {
        parent.appendChild(visible.getDiv());
      } else if (response._id_public) {
        obsId = response._id_public;
        parent.appendChild(remove.getDiv());
      }
    });

    let radarObs = makeObs_(point);
    if (point && radarObs && radarObs.orbit) {
      var radarUrl = [
        SETTINGS.NJUNIS_HOST,
        "api/radarobs",
        radarObs.orbit,
        encodeURIComponent(formatDate_(radarObs.imageDate, SETTINGS.TIMEZONE)),
        point.id,
      ].join("/");

      radarReq.run(radarUrl);
    } else if (radarObs && radarObs.orbit) {
      parent.appendChild(newObs.getDiv());
    }

    if (point && point.radarId) {
      parent.appendChild(removeObs.getDiv());
    }

    return parent;
  }
  this.visibleButton = visibleButton;    

  function setPos(point) {
    let token = readState.getToken();
    if (!token) {
      return parent;
    }

    let radarObs = {
      "_radarObsId": point && point.radarId ? point.radarId : null,
      "_avalancheId": point ? point.id : null,
      "visibility": null,
      "ascending": null,
      "orbit": null,
      "imageDate": null,
      "coordinates": point ? point.coordinates : coordinates,
    };

    var addUrl =
        SETTINGS.NJUNIS_HOST + "/api/secure/radarobs?token=" + token;
    var req = new XMLHttpRequest();
    req.onload = () => {
      updateMap();
    }

    req.open('POST', addUrl, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(radarObs));
  }
  this.setPos = setPos;

  function handleNjunisData_(text, type) {
    var avalanches = JSON.parse(text).map((response) => {
      return formatPoint_(response, type);
    }).filter(x => x);

    avalanches.reverse();
    avalanches.forEach((point) => map.addInfoPoint(point));
  }

  function formatPoint_(response, type) {
    if (response.size < 2) return null;

    var dateFormat = {
      timeZone: SETTINGS.TIMEZONE,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    };
    var date = new Date(formatDate_(control.getDate(), SETTINGS.TIMEZONE)),
        startDate =
            new Date(date.getTime() - 3600000 * 24 * SETTINGS.START_DIST),
        trigDate = response.trigdate ? new Date(response.trigdate) : 0,
        obsDate = new Date(response.obsdate),
        id = response._id_public;

    let radarDate;
    if (response.radartrigdate) {
      radarDate = new Date(response.radartrigdate);
    } else if (response.imagedate) {
      radarDate = new Date(response.imagedate);
      id = response._radarobsid_public;
    } else {
      radarDate = 0;
    }

    var coordinates;
    if (response.radarcoordinates && response.radarcoordinates[0]) {
      coordinates = response.radarcoordinates;
    } else {
      coordinates = response.coordinates;
    }
    var point = {
      id,
      radarId: response._radarobsid,
      coordinates,
      type,
      info: {},
    }

    if (type !== 'radar' && type !== 'radarold' && type !== 'radarfuture') {
      point.info = {
        Size: response.size,
        Service: response.externalservice,
        Quantity: response.qty,
        Observed: obsDate.toLocaleString("sv-SE", dateFormat),
      }
    }

    switch (type) {
      case 'radarold':
      case 'radarfuture':
        point.radarId = response._id_public;
      case 'old':
      case 'future':
        point.color = 'grey';
        point.size = 3;
        break;
      case 'trig':
        point.color = 'orange';
        point.size = 6;
        break;
      case 'obs':
        point.color = 'red';
        point.size = 6;
        break;
      case 'field':
        point.color = 'green';
        point.size = 6;
        break;
      case 'radar':
        point.color = 'blue';
        point.size = 6;
        point.radarId = response._id_public;
        break;
      default:
        throw new Error('Invalid infopoint type!');
    }
    if (trigDate) {
      point.info['Trigged after (field data)'] =
          trigDate.toLocaleString("sv-SE", dateFormat);
    }
    if (radarDate) {
      point.info['Trigged before (radar data)'] =
          radarDate.toLocaleString("sv-SE", dateFormat);
    }
    if (response.type) point.info.Character = response.type;
    if (response.trigger) point.info.Trigger = response.trigger;

    return point;
  }

  function addImages(div, id) {
    let callback = (urls) => {
      images[id] = [];
      urls.forEach((imageUrl) => {
        let a = document.createElement('a');
        images[id].push(a);
        a.href = SETTINGS.NJUNIS_HOST + imageUrl + '?full=true';
        a.target = "_blank";
        let img = document.createElement('img');
        img.src = SETTINGS.NJUNIS_HOST + imageUrl;
        img.classList.add('avaImg');
        a.appendChild(img);
        div.appendChild(a);
      });
    };

    if (images[id]) {
      images[id].forEach((image) => {
        div.appendChild(image);
      });
    } else {
      var searchUrl = SETTINGS.NJUNIS_HOST + "/images/search/" + id;
      var req = new XMLHttpRequest();
      req.onload = () => {
        if (req.status == 200) {
          let urls = JSON.parse(req.response);
          callback(urls);
        }
      };
      req.open('GET', searchUrl, true);
      req.send();
    }
  }
  this.addImages = addImages;

  function formatDate_(date, timezone) {
      var d = new Date(date),
          month = '' + (d.getUTCMonth() + 1),
          day = '' + d.getUTCDate(),
          year = d.getUTCFullYear(),
          tz = '('+timezone+')';
  
      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;
  
      return [month, day, year].join('/') + ' ' + tz;
  }

  function makeObs_(point, coordinates) {
    let layer;
    try {
      layer = parseName(control.getLayerSelect().getValue());
    } catch(e) {
      return;
    }

    let token = readState.getToken();
    if (!token) {
      return parent;
    }
    
    let radarObs = {
      "_radarObsId": point ? point.radarId ? point.radarId : null : null,
      "_avalancheId": point ? point.id : null,
      "visibility": null,
      "ascending": layer.direction == "ASCENDING",
      "orbit": layer.orbit,
      "imageDate": layer.actionDate,
      "coordinates": point ? point.coordinates : coordinates,
    };

    return radarObs;
  }
}

export {Njunis};
