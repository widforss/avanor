import {Utils}   from "./utils/utils_.js";

/**
 * @constructor
 */
function Njunis(map, layerSelect, SETTINGS, getDate) {
  var utils = new Utils();

  var trigRequest = new utils.Request((text) => {
    handleNjunisData_(text, 'trig');
  });
  var obsRequest = new utils.Request((text) => {
    handleNjunisData_(text, 'obs');
  });
  var oldRequest = new utils.Request((text) => {
    handleNjunisData_(text, 'old');
  });

  function updateMap() {
    var date = new Date(formatDate_(getDate(), SETTINGS.TIMEZONE)),
        startDate =
            new Date(date.getTime() - 3600000 * 24 * SETTINGS.START_DIST),
        endObs = new Date(date.getTime() + 3600000 * 24 * SETTINGS.OBSPERIOD),
        oldstart =
            new Date(date.getTime(date) - 3600000 * 24 * SETTINGS.OLD_DIST),
        bounds = JSON.stringify(map.getBounds());

    date.setDate(date.getDate() + 1);

    var trigurl = SETTINGS.NJUNIS_HOST + "/api/avalanche/trigdate?start="
            + startDate.toISOString() + '&end=' + date.toISOString()
            + '&geom=' + bounds,
        obsurl = SETTINGS.NJUNIS_HOST + "/api/avalanche/obsdate?start="
            + startDate.toISOString() + '&end=' + endObs.toISOString()
            + '&geom=' + bounds + '&nulltrig=true',
        oldurl = SETTINGS.NJUNIS_HOST + "/api/avalanche/bothdates?start="
            + oldstart.toISOString() + '&end=' + startDate.toISOString()
            + '&geom=' + bounds;

    trigRequest.run(trigurl);
    obsRequest.run(obsurl);
    oldRequest.run(oldurl);
  }
  this.updateMap = updateMap;

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
      var date = new Date(formatDate_(getDate(), SETTINGS.TIMEZONE)),
          startDate =
              new Date(date.getTime() - 3600000 * 24 * SETTINGS.START_DIST),
          trigDate = response.trigdate ? new Date(response.trigdate) : 0,
          obsDate = new Date(response.obsdate);

      var point = {
        id: response._id_public,
        coordinates: response.coordinates,
        info: {
          Size: response.size,
          Service: response.externalservice,
          Quantity: response.qty,
          Observed: obsDate.toLocaleString("sv-SE", dateFormat),
        },
      }
      switch (type) {
        case 'old':
          point.color = 'grey';
          point.size = 3;
          break;
        case 'trig':
          point.info['Trigged (field data)'] =
              trigDate.toLocaleString("sv-SE", dateFormat);
          point.color = 'orange';
          point.size = 6;
          break;
        case 'obs':
          point.color = 'red';
          point.size = 6;
          break;
        default:
          throw new Error('Invalid infopoint type!');
      }
      if (response.type) point.info.Character = response.type;
      if (response.trigger) point.info.Trigger = response.trigger;

      return point;
    }).filter(x => x);

    avalanches.reverse();
    avalanches.forEach((point) => map.addInfoPoint(point, type));
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
