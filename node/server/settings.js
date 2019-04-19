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
      'SLOW':               125000,
      'DAYS':               1110,
      'BUFFER':             7,
    },
    'GEN': {
      'COLLECTION':        'COPERNICUS/S1_GRD_FLOAT',
      'SEC_COLLECTION':    'users/widforss/avanor/daily_no_se',
      'MODE':              'IW',
      'POLARISATION':      'VH',
      'ANGLES':            [30, 50],
      'ORBIT_PERIOD':      6,
      'ORBITS':            175,
      'DOUBLE_PERIOD':     true,
      'SENTINEL_FACTOR':   0.04,
      'SHADOW_DIRECTORY':  'users/widforss/avanor/incident_no_se',
      'SLOPE_MASK':        'users/widforss/avanor/avalanche_terrain_no_se',
      'VIEWPORT_STRIP':    true,
      'OPACITY':           0.2,
      'HILLSHADE':         false,
      'SEAMASK':           true,
      'VECTOR_SCALE':      10000,
      'SEASON_MONTHS':     [0, 1, 2, 3, 4, 11],
      'START_YEAR':        2015,
      'TERRAIN': [
        'users/widforss/terrain/no_se_50m_z33'
      ],
      'EXTENT': [
        {"type":"Polygon","coordinates":[[[-117.04833,43.53262],[-112.34619,38.83970],[-104.32617,35.31736],[-105.07324,40.63063],[-106.85302,44.87144],[-113.40087,48.98021],[-117.07031,48.98021],[-117.04833,43.53262]]]},
        {"type":"Polygon","coordinates":[[[8.26171,63.64625],[4.35058,62.16550],[4.70214,57.91484],[10.23925,57.96150],[13.62304,59.37798],[15.86425,63.78248],[26.27929,68.86351],[31.06933,69.03714],[31.20117,71.23022],[20.87402,71.17357],[12.17285,68.33437],[8.26171,63.64625]]]}
      ],
    },
  },
};

module.exports = SETTINGS;
