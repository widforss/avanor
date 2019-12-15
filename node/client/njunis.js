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

  function checkReq() {
    if (++reqCount == 6 && reqCallback) {
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

  function updateMap(callback) {
    trigRequest.block();
    obsRequest.block();
    oldRequest.block();
    futureTrigRequest.block();
    futureObsRequest.block();
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
        futureTrigurl = SETTINGS.NJUNIS_HOST + "/api/avalanche/trigdate?start="
            + date.toISOString() + '&end=' + futureend.toISOString()
            + '&geom=' + bounds,
        futureObsurl = SETTINGS.NJUNIS_HOST + "/api/avalanche/obsdate?start="
            + endObs.toISOString() + '&end=' + futureend.toISOString()
            + '&geom=' + bounds + '&nulltrig=true&nullradar=true',
        fieldRadarUrl = SETTINGS.NJUNIS_HOST + "/api/avalanche/radardate?start="
            + startDate.toISOString() + '&end=' + date.toISOString()
            + '&geom=' + bounds;

    trigRequest.run(trigurl);
    obsRequest.run(obsurl);
    oldRequest.run(oldurl);
    futureTrigRequest.run(futureTrigurl);
    futureObsRequest.run(futureObsurl);
    fieldRadarRequest.run(fieldRadarUrl);
  }
  this.updateMap = updateMap;

  function visibleButton(point, callback) {
    let parent = document.createElement('div');
    let obsId;

    let visible = new controlUtils.Button('Mark as visible on image.', () => {
      let layer;
      try {
        layer = parseName(control.getLayerSelect().getValue());
      } catch(e) {
        return;
      }

      let token = readState.getToken();
      if (!token) {
        return;
      }

      let radarObs = {
        "_radarObsId": null,
        "_avalancheId": point.id,
        "visibility": null,
        "ascending": layer.direction == "ASCENDING",
        "orbit": layer.orbit,
        "imageDate": layer.actionDate,
        "coordinates": null,
      };
      var addUrl =
          SETTINGS.NJUNIS_HOST + "/api/secure/radarobs?token=" + token;
      var req = new XMLHttpRequest();
      req.onload = callback;

      req.open('POST', addUrl, true);
      req.setRequestHeader("Content-Type", "application/json");
      req.send(JSON.stringify(radarObs));
    });

    let remove = new controlUtils.Button('Remove image from avalanche.', () => {
      let token = readState.getToken();
      if (!token) {
        return;
      }

      var rmUrl =
          SETTINGS.NJUNIS_HOST + "/api/secure/radarobs/" + obsId + "?token=" + token;
      var req = new XMLHttpRequest();
      req.onload = callback;

      req.open('DELETE', rmUrl, true);
      req.setRequestHeader("Content-Type", "application/json");
      req.send();
    });

    let layer;
    try {
      layer = parseName(control.getLayerSelect().getValue());
    } catch(e) {
      return parent;
    }

    let token = readState.getToken();
    if (!token) {
      return parent;
    }

    var radarUrl = [
      SETTINGS.NJUNIS_HOST,
      "api/radarobs",
      layer.orbit,
      encodeURIComponent(formatDate_(layer.actionDate, SETTINGS.TIMEZONE)),
      point.id,
    ].join("/");

    var radarReq = new utils.Request((text) => {
      let response = JSON.parse(text);
      if (!response) {
        parent.appendChild(visible.getDiv());
      } else if (response._id_public) {
        obsId = response._id_public;
        parent.appendChild(remove.getDiv());
      }
    });
    radarReq.run(radarUrl);

    return parent;
  }
  this.visibleButton = visibleButton;    

  function handleNjunisData_(text, type) {
    var avalanches = JSON.parse(text).map((response) => {
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
          radarDate = response.radartrigdate ? new Date(response.radartrigdate) : 0,
          obsDate = new Date(response.obsdate);

      var point = {
        id: response._id_public,
        coordinates: response.coordinates,
        type,
        info: {
          Size: response.size,
          Service: response.externalservice,
          Quantity: response.qty,
          Observed: obsDate.toLocaleString("sv-SE", dateFormat),
        },
      }
      switch (type) {
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
    }).filter(x => x);

    avalanches.reverse();
    avalanches.forEach((point) => map.addInfoPoint(point));
  }

  function formatDate_(date, timezone) {
      var d = new Date(date),
          month = '' + (d.getUTCMonth() + 1),
          day = '' + d.getUTCDate(),
          year = d.getUTCFullYear(),
          tz = '('+timezone+')';
  
      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;
  
      return [month, day, year, tz].join(' ');
  }
}

export {Njunis};
