const SETTINGS = {
  'TITLE':              'Avanor - avalanche observation platform',
  'TRACK_URL':          'https://www.googletagmanager.com/gtag/js',
  'MAP_URL':            'https://maps.googleapis.com/maps/api/js',
  'AUTHED':             'Authenticated at Earth Engine.',
  'STARTED':            'Server started.',
  'SENTINEL': {
    'PROP_DAYS':            6,
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
      'SLOW':               70000,
      'DAYS':               1110,
      'BUFFER':             7,
    },
    'GEN': {
      'COLLECTION':        'COPERNICUS/S1_GRD_FLOAT',
      'SEC_COLLECTION':    'users/widforss/avanor/daily',
      'MODE':              'IW',
      'POLARISATION':      'VH',
      'ANGLES':            [30, 50],
      'ORBIT_PERIOD':      6,
      'ORBITS':            175,
      'DOUBLE_PERIOD':     true,
      'SENTINEL_FACTOR':   0.04,
      'SHADOW_DIRECTORY':  'users/widforss/avanor/layover_shadow_no_se',
      'SLOPE_MASK':        'users/widforss/avanor/avalanche_terrain_no_se_fill',
      'VIEWPORT_STRIP':    true,
      'OPACITY':           0.2,
      'HILLSHADE':         false,
      'SEAMASK':           true,
      'VECTOR_SCALE':      10000,
      'SEASON_MONTHS':     [0, 1, 2, 3, 4, 11],
      'START_YEAR':        2015,
      'TERRAIN': [
        'users/widforss/terrain/no_se_50m_z33_fill'
      ],
      'EXTENT': [
        {"type": "Polygon", "coordinates": [[[8.2, 63.70], [4.5, 62.2], [4.8, 57.9], [10.3, 57.9], [13.1, 55.1], [17.2, 56.0], [19.6, 57.4], [19.6, 61.9], [24.3, 65.7], [26.4, 68.9], [31.2, 69.1], [31.3, 71.2], [21.0, 71.2], [12.3, 68.4], [8.2, 63.7]]]},
      ],
    },
  },
};

module.exports = SETTINGS;
