var SETTINGS = {
  HOST: 'avanor.se',
  THROTTLE_DELAY: 100,
  SEARCHING_STR:  'Looking for satellite data …',
  PERSISTENCY: {
    INITPOS: {x: 14.6, y: 66.5, z: 12},
    DEFAULT_DATE: '2017-01-30',
    COOKIE: {
      COOKIELIFE: 30 * 24 * 3600 * 1000,
    },
  },
  LAYER: {
    NO_LAYER_STR:   'No satellite data found.',
  },
  NJUNIS: {
    NJUNIS_HOST: 'https://njunis.avanor.se',
    TIMEZONE: 'Europe/Stockholm',
    OBSPERIOD: 6,
    START_DIST: 6,
    OLD_DIST: 30,
  },
  CONTROL: {
    TITLE:        '<h1><img src="/static/media/logo/logo.svg"/> Avanor</h1>',
    LOGIN_TITLE: '<span class="header">Avalanche Database Login</span>',
    HELP_FAIL:    'Failed to fetch help page. Click here to try again.',
    HELP_ADDRESS: './md/help.md',
    LOGIN_ADDRESS: './static/html/login.html',
    DATE: {
      START_YEAR:       2017,
      SEASON_MONTHS:    [0, 1, 2, 3, 4, 11],
      PARSE_MONTH_ERR:  'Illegal month given as argument.',
      SEASON_MONTH_ERR: 'Month out of season.',
      NEGATIVE_YEAR:    'Negative year range.',
      MONTHS:  [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sept',
        'Oct',
        'Nov',
        'Dec',
      ],
    },
    NAV: {
      ZOOM:        [0, 24],
      HIDE_MAP:    'Hide',
      SHOW_MAP:    'Show',
    },
  },
  MAP: {
    SLOPES_LAYER_Z: 4,
    EE_LAYER_Z: 5,
    NJUNIS_TRIG_Z: 10,
    NJUNIS_OBS_Z: 11,
    NJUNIS_OLD_Z: 6,
    NJUNIS_FUTURE_Z: 7,
    NJUNIS_FIELD_Z: 9,
    NJUNIS_RADAR_Z: 8,
    EXP_TIMEOUT: 500,
  },
};

export {SETTINGS};
