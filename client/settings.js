var SETTINGS = {
  EE_LAYER_Z: 0,
  LAYER: {
    SEARCHING_STR:  'Looking for satellite data …',
    THROTTLE_DELAY: 100,
    HANDLER: {
      NO_LAYER_STR:   'No satellite data found.',
    }
  },
  CONTROL: {
    TITLE:        '<h1><img src="/static/media/logo/logo.svg"/> Avanor</h1>',
    HELP_FAIL:    'Failed to fetch help page. Click here to try again.',
    HELP_ADDRESS: './md/help.md',
    DATE: {
      START_YEAR:       2017,
      DEFAULT_DATE:     '2017-01-30',
      SEASON_MONTHS:    [0, 1, 2, 3, 11],
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
      DEFAULT_MAP: 'Terrain',
      MAPS: [
        'Roadmap',
        'Satellite',
        'Hybrid',
        'Terrain',
      ],
      HIDE_MAP:    'Hide',
      SHOW_MAP:    'Show',
    },
  },
  MAP: {
    center: {lat: 66.5, lng: 14.6},
    zoom: 12,
    zoomControl: false,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false,
    clickableIcons: false,
  },
};

export {SETTINGS};
