const Errors = require('../errors.js');

const Utils = require('../utils/utils_.js');

/**
 * @constructor
 */
function SentinelRoll(SETTINGS, testDate, func) {
  var utils = new Utils();
  var cacheDate = new Date();
  var rollWait = SETTINGS.FAST;
  var cachedDays = 0;

  resetCacheDate_();
  rollInstance_();
 
  function rollInstance_() {
    cacheDate.setUTCDate(cacheDate.getUTCDate() - 1);
    var dateString = utils.formatDate(cacheDate);

    if (Date.now() - cacheDate >= 1000 * 60 * 60 * 24 * SETTINGS.DAYS) {
      wrapAround_();
      return;
    }

    try {
      testDate(dateString);
      cachedDays++;
    } catch (e) {
      if (e instanceof Errors.BeforeStartError) {
        wrapAround_();
      } else if (e instanceof Errors.OutOfSeasonError) {
        rollInstance_();
      } else {
        Errors.handle(e);
      }
      return;
    }

    func(dateString);
    setTimeout(rollInstance_, rollWait);
  }

  function wrapAround_() {
    if (cachedDays) {
      var wrapWait = SETTINGS.SLOW;
      if (rollWait == SETTINGS.FAST) {
        wrapWait = cachedDays * (SETTINGS.SLOW - SETTINGS.FAST);
      }
      rollWait = SETTINGS.SLOW;
      resetCacheDate_();
      setTimeout(rollInstance_, wrapWait);
    }
  }

  function resetCacheDate_() {
    cacheDate.setTime(Date.now() - 1000 * 60 * 60 * 24 * SETTINGS.BUFFER);
    cacheDate.setUTCDate(cacheDate.getUTCDate() + 1);
    cacheDate.setUTCHours(0, 0, 0, 0);
  }
}

module.exports = SentinelRoll;
