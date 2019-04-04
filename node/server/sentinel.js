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
    slopeCache.search('slopes', false, callback, sentinelGenerate.getSlopes);
  }
  this.getSlopes = getSlopes;

  function getRender(name, force, callback) {
      var properties = sentinelGenerate.parseName(name, callback);
      if (!properties) return;
      if (typeof callback !== 'function' && callback !== null) {
        Errors.handle(new Errors.ParameterError('callback is no function.'));
        return;
      }

      renderCache.search(name, force, (map) => {
        if (callback) callback(map);
      }, (callback) => {
        sentinelGenerate.queryName(name, callback, callback)
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
        if (nextDay > Date.now()) return;
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
          var properties;
          properties = sentinelGenerate.parseName(name, callback);
          if (!properties) return;
          cacheOrbits_([properties]);
          getNames_(dateString, bounds, propagate, true, true, callback);
        });
      });
    }

    function noNameCache_(bounds, callback, cacheback) {
      sentinelGenerate.queryDate(dateString, bounds, (imgList) => {
        // If we get into this function someone is going to want
        // coverage and renderings pretty soon. We need to get these
        // into a waiting state before calling callback.
        var names = imgList.map((entry) => entry.name);
        cacheOrbits_(names);
        cacheRenders_(names);

        cacheback(imgList);
      }, callback);
    }

    function cacheOrbits_(names) {
      orbitCache.cache(names, force, (i, back) => {
        sentinelGenerate.getCoverage(names[i], back, callback);
      });
    }

    function cacheRenders_(names) {
      renderCache.cache(names, force, (i, back) => {
        sentinelGenerate.queryName(names[i], back, callback);
      });
    }
  }
  function getNames(dateString, bounds, callback) {
    return getNames_(dateString, bounds, 0, false, false, callback);
  }
  this.getNames = getNames;
}

module.exports = Sentinel;
