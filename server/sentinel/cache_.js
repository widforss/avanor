/**
 * @constructor
 */
function SentinelCache(SETTINGS) {
  var cacheObj = {};
  var removeQueue = [];
  var cacheQueue  = [];

  function cache(keys, force, fetch) {
    if (typeof fetch !== 'function') {
      Errors.handle(new Errors.ParameterError('fetch is no function.'));
      return;
    }

    keys.map((key, i) => {
      var oldVal = cacheObj[key];
      var timestamp = Date.now();
      if (oldVal && timestamp - oldVal.timestamp < SETTINGS.LIFE && !force) {
        return;
      }
      if (!oldVal) cacheObj[key] = 1;
      fetch(i, (value) => {
        cacheObj[key] = {value, timestamp};
        removeQueue.push(key);
        var queue = cacheQueue[key];
        while (queue && queue.length) {
          var head = queue.shift();
          clearTimeout(head.timeOut);
          head.func(value);
        }
        while (removeQueue.length > SETTINGS.SIZE) {
          delete cacheObj[removeQueue.shift()];
        }
        delete cacheQueue[key];
      });
    });
  }
  this.cache = cache;

  function search(key, force, hit, miss) {
    if (typeof hit !== 'function' || typeof miss !== 'function') {
      Errors.handle(new Errors.ParameterError('hit or miss is no function.'));
      return;
    }

    var entry = cacheObj[key];
    if (entry == 1) {
      queueHit_(key, hit);
    } else if(entry && Date.now() - entry.timestamp < SETTINGS.LIFE && !force) {
      hit(entry.value);
    } else {
      queueHit_(key, hit);
      cache([key], force, (i, callback) => {
        miss(callback);
      });
    }

    function queueHit_(key, hit) {
      if (cacheQueue[key] === undefined) cacheQueue[key] = [];
      var timeOut = setTimeout(() => {
        cacheQueue[key].shift();
        delete cacheObj[key];
      }, SETTINGS.TIMEOUT);
      cacheQueue[key].push({'func': hit, 'timeOut': timeOut});
    }
  }
  this.search = search;
}

module.exports = SentinelCache;
