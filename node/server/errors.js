var Errors = {
  ParseNameError: class ParseNameError extends Error {
    constructor(message) {
      super(message);
      this.name = "ParseNameError";
    }
  },

  ParseDateError: class ParseDateError extends Error {
    constructor(message) {
      super(message);
      this.name = "parseDateError";
    }
  },

  OutOfSeasonError: class OutOfSeasonError extends Error {
    constructor(message) {
      super(message);
      this.name = "OutOfSeasonError";
    }
  },

  BeforeStartError: class BeforeStartError extends Error {
    constructor(message) {
      super(message);
      this.name = "BeforeStartError";
    }
  },

  FutureDateError: class FutureDateError extends Error {
    constructor(message) {
      super(message);
      this.name = "FutureDateError";
    }
  },

  NoImageError: class NoImageError extends Error {
    constructor(message) {
      super(message);
      this.name = "NoImageError";
    }
  },

  NotANumberError: class NotANumberError extends Error {
    constructor(message) {
      super(message);
      this.name = "NotANumberError";
    }
  },

  LatLngRangeError: class LatLngRangeError extends Error {
    constructor(message) {
      super(message);
      this.name = "LatLngRangeError";
    }
  },

  UtmZoneError: class UtmZoneError extends Error {
    constructor(message) {
      super(message);
      this.name = "UtmZoneError";
    }
  },

  ParameterError: class ParameterError extends Error {
    constructor(message) {
      super(message);
      this.name = "ParameterError";
    }
  },

  StackError: class StackError extends Error {
    constructor(message) {
      super(message);
      this.name = "StackError";
    }
  },

  EeEvalError: class EeEvalError extends Error {
    constructor(message) {
      super(message);
      this.name = "EeEvalError";
    }
  },

  handle: function(e, callback) {
    if (callback) {
      var message = e.message ? e.message : "Internal Server Error";
      callback(message, 500);
    } else {
      console.error(e.stack);
    }
  }
}

module.exports = Errors;
