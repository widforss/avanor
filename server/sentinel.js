const Errors            = require('./errors.js');

const Utils = require('./utils/utils_.js');
const booleanIntersects = require('@turf/boolean-intersects').default;
const SentinelCache     = require('./sentinel/cache_.js');
const SentinelGenerate  = require('./sentinel/generate_.js');
const SentinelRoll      = require('./sentinel/roll_.js');

/**
 * @constructor
 */
function Sentinel(SETTINGS) {
  var utils = new Utils();
  var renderCache       = new SentinelCache(SETTINGS.CACHE);
  var nameCache         = new SentinelCache(SETTINGS.CACHE);
  var orbitCache        = new SentinelCache(SETTINGS.CACHE);
  var slopeCache        = new SentinelCache(SETTINGS.CACHE);
  var sentinelGenerate  = new SentinelGenerate(SETTINGS.GEN);

  [SETTINGS.ROLL_LONG, SETTINGS.ROLL_SHORT].forEach((roll) => {
    if (roll) {
      new SentinelRoll(roll, sentinelGenerate.parseDate, (dateString) => {
        getNames_(dateString, null, SETTINGS.PROP_DAYS, true, false, null);
      })
    }
  });

  function getSlopes(callback) {
    slopeCache.search('slopes', false, (map) => {
      callback(map);
    }, (cacheback) => {
      sentinelGenerate.getSlopes().getMap({palette: '#99ff99'}, (slopes) => {
        cacheback({'mapid': slopes.mapid, 'token': slopes.token});
      });
    })
  }
  this.getSlopes = getSlopes;

  function getRender(name, force, callback) {
      var properties;
      try {
        properties = sentinelGenerate.parseName(name);
      } catch (e) {
        Errors.handle(e, callback);
        return;
      }
      if (typeof callback !== 'function' && callback !== null) {
        Errors.handle(new Errors.ParameterError('callback is no function.'));
        return;
      }

      renderCache.search(name, force, (map) => {
        if (callback) callback(map);
      }, (callback) => {
        var render = ee.Dictionary(sentinelGenerate.queryName(properties))
                       .get('render');
        getMap_(render, callback);
      });
  }
  this.getRender = getRender;

  function getNames_(dateString, bounds, propagate, force, stack, callback) {
    if (typeof callback !== 'function' && callback !== null) {
      Errors.handle(new Errors.ParameterError('callback is no function.'));
      return;
    }

    if (!bounds) {
      nameCache.search(dateString, force, (nameList) => {
        if (callback) callback(nameList.map(({name}) => name));

        propagateCache_();
      }, (cacheback) => {
        noNameCache_(bounds, callback, (nameList) => {
          cacheback(nameList);
        });
      });
    } else {
      var answered;
      nameCache.search(dateString, force, (nameList) => {
        // If we get a cache miss here, the miss callback will answer.
        if (!answered) handleIntersections_(nameList);

        propagateCache_();
      }, (cacheback) => {
        answered = true;

        // Do the bounds check on EE to avoid waiting for the cache. The
        // result might differ slightly from local checks when near edges.
        if (callback) {
          noNameCache_(bounds, callback, (nameList) => {
            callback(nameList.map(({name}) => name));
          });
        }

        // And fill the cache with all the values of the day.
        noNameCache_(null, null, cacheback);
      });
    }

    //
    // It's just helper functions from here.
    //

    function propagateCache_() {
      if (propagate <= 0 && -propagate < SETTINGS.PROP_DAYS) {
        var pastDay = new Date(dateString)
        pastDay.setUTCDate(pastDay.getUTCDate() - 1)
        pastDay = utils.formatDate(pastDay);
        getNames_(pastDay, null, propagate - 1, false, stack, null);
      }

      if (propagate >= 0 && propagate < SETTINGS.PROP_DAYS) {
        var nextDay = new Date(dateString)
        nextDay.setUTCDate(nextDay.getUTCDate() + 1)
        nextDay = utils.formatDate(nextDay);
        getNames_(nextDay, null, propagate + 1, false, stack, null);
      }
    }

    function handleIntersections_(nameList) {
      var returnNames = [];

      var abort;
      if (nameList.length == 0 && callback) {
        callback(nameList);
        return;
      }
      nameList.forEach(({name, orbit}) => {
        orbitCache.search(name, force, (geom) => {
          if (abort) return;

          var intersects;
          if (bounds) {
            try {
              intersects = booleanIntersects(bounds, geom);
            } catch (e) {
              Errors.handle(new Error(), callback);
              abort = true;
              return;
            }
            if (!intersects) {
              returnNames.push(null);
            }
          }
          if (!bounds || intersects) {
            returnNames.push(name);
          }
          if(returnNames.length == nameList.length) {
            returnNames = returnNames.filter(function( element ) {
              return element !== null;
            });
            if (callback) callback(returnNames);
          }
        }, () => {
          // We really shouldn't be here. Something was lost in transfer.
          if (stack) {
            if (callback) Errors.handle(new Errors.StackError(), callback);
            Errors.handle(new Errors.StackError('Network seems flaky?'));
            return;
          };
          cacheOrbits_([sentinelGenerate.parseName(name)]);
          getNames_(dateString, bounds, propagate, true, true, callback);
        });
      });
    }

    function noNameCache_(bounds, callback, cacheback) {
      var imgList;
      try {
        imgList = ee.List(sentinelGenerate.queryDate(dateString, bounds));
      } catch (e) {
        if (e instanceof Errors.OutOfSeasonError) {
          if (callback) Errors.handle(e, callback);
        } else if (e instanceof Errors.FutureDateError) {
          if (callback) Errors.handle(e, callback);
        } else if (e instanceof Errors.BeforeStartError) {
          if (callback) Errors.handle(e, callback);
        } else {
          Errors.handle(e, callback);
        }
        return;
      }

      var names   = imgList.map(function(imgDict) {
        return ee.Dictionary(imgDict).get('name');
      });
      var renders = imgList.map(function(imgDict) {
        return ee.Dictionary(imgDict).get('render');
      });

      ee.List(names).evaluate(function(namesLocal, errMsg) {
        if (errMsg) {
          if (callback) {
            Errors.handle(new Errors.EeEvalError(), callback);
          }
          Errors.handle(new Errors.EeEvalError(errMsg));
          return;
        }

        var properties = {};
        namesLocal.forEach((name) => {
          properties[name] = sentinelGenerate.parseName(name);
        });

        var orbits = namesLocal.map((name) => {
            return properties[name].orbit;
        });

        var cacheList = namesLocal.map((name, j) => {
          return {'name': name, 'orbit': orbits[j]};
        });
        cacheList.sort((cacheA, cacheB) => {
          var propA = properties[cacheA.name];
          var propB = properties[cacheB.name];
          return sort_(propA, propB);
        });

        // If we get into this function someone is going to want
        // coverage and renderings pretty soon. We need to get these
        // into a waiting state before calling callback.
        cacheOrbits_(Object.values(properties));
        cacheRenders_(namesLocal, renders);

        cacheback(cacheList);
      });
    }

    function cacheOrbits_(properties) {
      var names = properties.map((property) => property.name);
      orbitCache.cache(names, force, (i, back) => {
        var coverage = sentinelGenerate.getCoverage(properties[i]);
        ee.Geometry(coverage).evaluate((geom, errMsg) => {
          if (errMsg) {
            if (callback) {
              Errors.handle(new Errors.EeEvalError(), callback);
            }
            callback = null;
            Errors.handle(new Errors.EeEvalError(errMsg));
            return;
          }
          back(geom);
        })
      });
    }

    function cacheRenders_(names, renders) {
      renderCache.cache(names, force, (i, callback) => {
        var render = renders.get(i);
        getMap_(render, callback);
      });
    }
  }
  function getNames(dateString, bounds, callback) {
    return getNames_(dateString, bounds, 0, false, false, callback);
  }
  this.getNames = getNames;

  function getMap_(render, callback) {
    ee.Image(render).getMap(SETTINGS.VIS_PARAMS, (map, errMsg) => {

      // I want to apologise to God, the world and my teachers for this.
      if (/^Dictionary.get: Dictionary/.test(errMsg)) {
        Errors.handle(new Errors.NoImageError(errMsg), callback);
        return;
      } else if (errMsg) {
        Errors.handle(new Errors.EeEvalError(errMsg));
        Errors.handle(new Errors.EeEvalError(), callback);
        return;
      }

      if (callback) callback({'mapid': map.mapid, 'token': map.token});
    });
  }

  function sort_(propA, propB) {
    if (propA.direction != propB.direction) {
      return propA.direction == 'ASCENDING' ? 1 : -1;
    }
    if (propA.orbit != propB.orbit) {
      return propA.orbit > propB.orbit ? 1 : -1;
    }
    return 0;
  }
}

module.exports = Sentinel;
