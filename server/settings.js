const SETTINGS = {
  'TITLE':              'Avanor - avalanche observation platform',
  'TRACK_URL':          'https://www.googletagmanager.com/gtag/js',
  'MAP_URL':            'https://maps.googleapis.com/maps/api/js',
  'AUTHED':             'Authenticated at Earth Engine.',
  'STARTED':            'Server started.',
  'SENTINEL': {
    'PROP_DAYS':            6,
    'VIS_PARAMS':           {min: 0, max: 1},
    'CACHE': {
      'SIZE':               10000,
      'LIFE':               1000 * 60 * 60 * 18,
      'TIMEOUT':            1000 * 30,
    },
    'ROLL_SHORT': {
      'FAST':               15000,
      'SLOW':               500000,
      'DAYS':               7,
      'BUFFER':             0,
    },
    'ROLL_LONG': {
      'FAST':               15000,
      'SLOW':               125000,
      'DAYS':               1110,
      'BUFFER':             7,
    },
    'GEN': {
      'COLLECTION':        'COPERNICUS/S1_GRD_FLOAT',
      'MODE':              'IW',
      'POLARISATION':      'VH',
      'TERRAIN':           'users/widforss/terrain/no_se_50m_z33',
      'ANGLES':            [30, 50],
      'ORBIT_PERIOD':      6,
      'ORBITS':            175,
      'DOUBLE_PERIOD':     true,
      'SENTINEL_FACTOR':   0.04,
      'SHADOW_DIRECTORY':  'users/widforss/avanor/shadow',
      'VIEWPORT_STRIP':    true,
      'OPACITY':           0.2,
      'HILLSHADE':         false,
      'SEAMASK':           true,
      'VECTOR_SCALE':      10000,
      'SEASON_MONTHS':     [0, 1, 2, 3, 4, 11],
      'START_YEAR':        2015,
    },
  },
};

module.exports = SETTINGS;
