const Errors = require('../errors.js');

/**
 * Abstraction for SENTINEL imagery.
 * @constructor
 * @param {ee.Dictionary.<string, *>}
 *     SETTINGS Dictionary containing constants for abstraction:
 *  - {ee.Dictionary}
 *    - `COLLECTION`       _{string}_   SENTINEL-1 GRD collection.
 *    - `MODE`             _{string}_   SENTINEL-1 mode.
 *    - `POLARISATION`     _{string}_   Image polarisation.
 *    - `TERRAIN`          _{string}_   Terrain model to use.
 *    - `ANGLES`           _{number[]}_ Angles defining avalanche terrain.
 *      - `[0]`            _{number}_   Minimum angle.
 *      - `[1]`            _{number}_   Maximum angle, exclusive.
 *    - `ORBIT_PERIOD`     _{number}_   Time for one half orbit.
 *    - `DOUBLE_PERIOD`    _{boolean}_  Allow full orbit deltas.
 *    - `SENTINEL_FACTOR`  _{number}_   Factor to scale SENTINEL-1 data points.
 *    - `SHADOW_DIRECTORY` _{number}_   Where to find satellite shadow rasters.
 *    - `VIEWPORT_STRIP`   _{boolean}_  Bind returned orbits to viewport.
 */
function SentinelGenerate(SETTINGS) {
  var terrain = ee.Image(SETTINGS.TERRAIN).rename('terrain');
  var shadows = ee.ImageCollection(SETTINGS.SHADOW_DIRECTORY);
  
  /**
   * Return the state in the form of a list of satellite
   *     images available for the given date and bounds.
   * @param  {String}              dateString Date to search for (YYYY-MM-DD).
   * @param  {ee.Geometry.Polygon} bounds     Bounds to search within.
   * @return {ee.List.<ee.Dictionary.<string, Object>>} Images:
   *  - _{ee.List}_
   *    - _{ee.Dictionary}_
   *      - `name`            _{ee.String}_ Raster name.
   *      - `image`            _{ee.Image}_  Raster matching query.
   *        - band `delta`                 Delta image from Sentinel-1 image.
   *        - band `shadow`                Satellite shadow for this orbit.
   *        - band `terrain`               Terrain model.
   *        - band `slopes`                Potential avalanche terrain.
   */
  function queryDate(dateString, bounds) {
    bounds         = bounds ? ee.Geometry(bounds) : null;
    var dateLocal  = parseDate_(dateString, false);
    var date       = ee.Date(dateLocal);
    var copernicus = collection_(bounds);
    
    // Get a list of unique relative orbits in `copernicus` collection.
    var orbitNums = ee.List(getOrbits_(copernicus));
    
    // Get a list with information about images from the same relative orbit.
    return orbitNums.map(function(orbitNum) {
      var orbitCollection      =
          copernicus.filter(ee.Filter.eq('relativeOrbitNumber_start',
                                         orbitNum));
      var collectionPair = filterDate_(orbitCollection, date);
      var actionSize =
          ee.ImageCollection(collectionPair.get('action')).size().gt(0);
      var refSize = ee.ImageCollection(collectionPair.get('ref')).size().gt(0);
      var orbitDict = ee.Algorithms.If(actionSize.add(refSize).eq(2),
                                       delta_(collectionPair),
                                       null);
      return orbitDict;
    }).removeAll([null]);
  }
  this.queryDate = queryDate;
  
  /**
   * @param {string} name Name of queried image.
   * @return {ee.Dictionary.<string, ee>}
   *  - _{ee.Dictionary}_
   *    - `name`            _{ee.String}_ Raster name.
   *    - `image`           _{ee.Image}_  Raster matching query.
   *      - band `delta`                 Delta image from Sentinel-1 image.
   *      - band `shadow`                Satellite shadow for this orbit.
   *      - band `terrain`               Terrain model.
   *      - band `slopes`                Potential avalanche terrain.
   */
  function queryName(properties) {
    var orbitNum   = ee.Number(properties.orbit);
    var direction  = ee.String(properties.direction);
    var refDate    = ee.Date(properties.refDate);
    var actionDate = ee.Date(properties.actionDate);
    
    var copernicus = collection_(null);
    var filteredCollection =
        ee.ImageCollection(copernicus)
          .filter(ee.Filter.eq('relativeOrbitNumber_start', orbitNum))
          .filter(ee.Filter.eq('orbitProperties_pass', direction))
          .filter(ee.Filter.or(ee.Filter.date(refDate,
                                              refDate.advance(1, 'day')),
                               ee.Filter.date(actionDate,
                                              actionDate.advance(1, 'day'))));
    var collectionPair =
        ee.Dictionary(filterDate_(filteredCollection, actionDate));
    var actionSize =
        ee.ImageCollection(collectionPair.get('action')).size().gt(0);
    var refSize =
        ee.ImageCollection(collectionPair.get('ref')).size().gt(0);

    return ee.Algorithms.If(actionSize.add(refSize).eq(2),
                            delta_(collectionPair),
                            null);
  }
  this.queryName = queryName;

  function getCoverage(properties) {
      return ee.Image(ee.Dictionary(queryName(properties)).get('image'))
                   .select('delta')
                   .mask()
                   .eq(1)
                   .reduceToVectors({
                     scale: SETTINGS.VECTOR_SCALE,
                     geometry: terrain.geometry(),
                   })
                   .geometry()
                   .simplify(2 * SETTINGS.VECTOR_SCALE);
  }
  this.getCoverage = getCoverage;
  
  /**
   * Get image properties given image name like
   *     `B 29A (2017-01-24 -- 2017-01-30, 6)`. The meaning of
   *     this name is:
   *  - `B`:         The satellite capturing the images was Sentinel-1B.
   *  - `29`:        The relative orbit of the images is number 29 of 175.
   *  - `A`:         The image was taken on an ASCENDING orbit.
   *  - `2017-01-24: The date of the reference image.
   *  - `2017-01-30: The date of the action image.
   *  - `6`:         The difference between the two images is 6 days.
   * @param {String} name The name of an image.
   * @return {ee.Dictionary.<string, (string|number|Date)>}
   *  - {ee.Dictionary}
   *    - `satellite`  _{string}_ `'A'` or `'B'`.
   *    - `orbit`      _{number}_ Relative orbit of image.
   *    - `direction`  _{string}_ A- or DESCENDING.
   *    - `refDate`    _{Date}_   Date of reference image.
   *    - `actionDate` _{Date}_   Date of action image.
   */
  function parseName(origName) {
    function abort_() {
      throw new Errors.ParseNameError();
    }
    
    var name = origName;
    var satellite = name.slice(0, 1);
    if (!/^[A-D]$/.test(satellite)) abort_();

    var orbitString = name.slice(1, 4);
    if (!/^[0-9]{1,3}/.test(orbitString)) abort_();
    var orbitNum = parseInt(orbitString, 10);
    if (orbitNum < 1 || orbitNum > 175)  abort_();
    var orbitChars = orbitNum < 100 ? orbitNum < 10 ? 1 : 2 : 3;

    name = name.slice(1 + orbitChars);

    var direction;
    if (name.slice(0, 1) == 'D') {
      direction = 'DESCENDING';
    } else if (name.slice(0, 1) == 'A') {
      direction = 'ASCENDING';
    } else {
      abort_();
    }
    if (!/\(/.test(name.slice(1, 2))) abort_();

    var refDate = parseDate_(name.slice(2, 12), true);
    if(isNaN(refDate)) abort_();
    if(!/--/.test(name.slice(12, 16))) abort_();

    var actionDate = parseDate_(name.slice(14, 24), false);

    if(!/,/.test(name.slice(24, 25))) abort_();
    var periodString = name.slice(25, 27);
    if (!/^[0-9]{1,2}/.test(periodString)) abort_();
    var periodNum = parseInt(periodString, 10);
    if (periodNum != (actionDate - refDate) / (1000 * 60 * 60 * 24)) abort_();
    if (periodNum < 1) abort_();
    var periodChars = periodNum < 10 ? 1 : 2;

    name = name.slice(19 + periodChars);
    if (/^\)$/.test(name)) abort_();

    return {
      'name':       origName,
      'satellite':  satellite,
      'orbit':      orbitNum,
      'direction':  direction,
      'refDate':    refDate,
      'actionDate': actionDate,
    };
  }
  this.parseName = parseName;
  
  function parseDate_(dateString, noCheckStart) {
    var dateRegex = /20[1-9]{2}-[0-9]{2}-[0-9]{2}/
    if (!dateRegex.test(dateString)) {
      throw new Errors.ParseDateError('Invalid dateString: ' + dateString);
    }
    var dateTime = Date.parse(dateString);
    if (isNaN(dateTime)) {
      throw new Errors.ParseDateError('Invalid dateString: ' + dateString);
    }
    var date = new Date(dateTime);

    if (dateTime > Date.now()) throw new Errors.FutureDateError;
    if (!noCheckStart && date.getUTCFullYear() < SETTINGS.START_YEAR) {
      throw new Errors.BeforeStartError();
    }
    if (!noCheckStart && !SETTINGS.SEASON_MONTHS.includes(date.getUTCMonth())) {
      throw new Errors.OutOfSeasonError(dateString + ' is out of season');
    }

    return date;
  }
  function parseDate(dateString) {
    parseDate_(dateString, false);
  }
  this.parseDate = parseDate;

  /**
   * Creates an image name.
   * @param {ee.Image} action Action image, from the queried date.
   * @param {ee.Image} ref    Reference image.
   * @return {ee.String} A name for the image pair.
   */
  function generateName_(action, ref) {
    var orbitNum   = ee.Number(action.get('relativeOrbitNumber_start'));
    var direction  = ee.String(action.get('orbitProperties_pass')).slice(0, 1);
    var satellite  = action.get('platform_number');
    var dateDiff   = action.date().difference(ref.date(), 'day');
    return ee.String(satellite).cat(orbitNum.format('%d'))
                               .cat(direction)
                               .cat('(')
                               .cat(ref.date().format('yyyy-MM-dd', 'UTC'))
                               .cat('--')
                               .cat(action.date().format('yyyy-MM-dd', 'UTC'))
                               .cat(',')
                               .cat(dateDiff.format('%.0f'))
                               .cat(')');
  }
  
  /**
   * Returns a collection specified in settings after filtering it spatially.
   * @param  {ee.Geometry.Polygon} bounds Filter by these bounds.
   * @return {ee.ImageCollection} The images matching the search.
   */
  function collection_(bounds) {
    var allImgs = ee.ImageCollection(SETTINGS.COLLECTION)
                    .filter(ee.Filter.eq('instrumentMode', SETTINGS.MODE))
                    .filter(ee.Filter
                              .listContains('transmitterReceiverPolarisation',
                                            SETTINGS.POLARISATION))
                    .select([SETTINGS.POLARISATION])
                    .filterBounds(terrain.geometry())
                    .sort('system:time_start', false);
    
    if (bounds && SETTINGS.VIEWPORT_STRIP) {
      var filtered = allImgs.filterBounds(bounds)
                            .aggregate_array('relativeOrbitNumber_start');
      allImgs = allImgs.filter(ee.Filter.inList('relativeOrbitNumber_start',
                                                filtered));
    }
    return allImgs;
  }
  
  /**
   * @param  {ee.ImageCollection} imageCollection
   * @return {ee.List} List of orbits that exist in the collection.
   */
  function getOrbits_(imageCollection) {
    return ee.List(imageCollection.aggregate_array('relativeOrbitNumber_start'))
             .iterate(function(orbitNum, list) {
               return ee.Algorithms.If(ee.List(list).contains(orbitNum),
                                       list,
                                       ee.List(list).add(orbitNum));
             }, ee.List([]));
  }
  
  /**
   * Returns two collections, one containing action images, the other
   *     reference images. The reference image collection may contain images
   *     from two distinct dates, separated by a half orbit.
   * @param  {ee.ImageCollection} collection Images to filter.
   * @param  {ee.Date}            date       Date for action image set.
   * @return {ee.Dictionary.<string, ee.ImageCollection>} Filtered images:
   *  - _{ee.Dictionary}_
   *    - `action`: _{ee.ImageCollection}_  Action imagery.
   *    - `ref`:    _{ee.ImageCollection}_  Reference imagery.
   */
  function filterDate_(collection, date) {
    var refDate      = date.advance(-SETTINGS.ORBIT_PERIOD, 'day');
    var ref2Date     = date.advance(-2 * SETTINGS.ORBIT_PERIOD, 'day');
    var dateFilter;
    // Allow full orbit diffs (single satellite)?
    if (SETTINGS.DOUBLE_PERIOD) {
      dateFilter =
          ee.Filter.or(ee.Filter.date(refDate, refDate.advance(1, 'day')),
                       ee.Filter.date(ref2Date,ref2Date.advance(1, 'day')));
    } else {
      dateFilter = ee.Filter.date(refDate, refDate.advance(1, 'day'));
    }
    
    var action = collection.filterDate(date, date.advance(1, 'day'));
    var ref    = collection.filter(dateFilter);
    
    return ee.Dictionary({
      'action': action,
      'ref':    ref,
    });
  }
    
  /**
   * Returns information in dict about one specific orbit in `imgColl`.
   * @param {ee.Dictionary.<string, ee.ImageCollection>}
   *     imgCollection Imagecollections to analyze.
   * @return {ee.Dictionary.<string, ee>}
   *  - _{ee.Dictionary}_
   *    - `name`            _{ee.String}_ Raster name.
   *    - `image`           _{ee.Image}_  Raster matching query.
   *      - band `delta`                 Delta image from Sentinel-1 image.
   *      - band `shadow`                Satellite shadow for this orbit.
   *      - band `terrain`               Terrain model.
   *      - band `slopes`                Potential avalanche terrain.
   */
  function delta_(collectionPair) {
    var action = ee.ImageCollection(collectionPair.get('action'));
    var ref    = ee.ImageCollection(collectionPair.get('ref'));
    
    var refDate = ref.first().date().update(null, null, null, 0, 0, 0, 'UTC');
    ref = ref.filterDate(refDate, refDate.advance(1,  'day'));
    
    var imgName = generateName_(action.first(), ref.first());
    
    var actionImg = action.mosaic();
    var refImg    = ref.mosaic();
    var delta = actionImg.subtract(refImg).select(0).rename('delta');
    
    var orbitNum  = action.first().get('relativeOrbitNumber_start');
    var slopes            = ee.Terrain.slope(terrain);
    var slopemask = slopes.lt(SETTINGS.ANGLES[1])
                          .multiply(slopes.gte(SETTINGS.ANGLES[0]))
                          .rename('slopes');
    var shadow    = shadows.filter(ee.Filter.eq('orbit', orbitNum))
                           .first()
                           .rename('shadow');
    
    var image  = delta.addBands(shadow).addBands(terrain).addBands(slopemask);
    var render = render_(image);

    var imgSize = ee.Image(render).select(0).reduceRegion({
      reducer: ee.Reducer.sum(),
      geometry: terrain.geometry(),
      scale: SETTINGS.VECTOR_SCALE,
    }).toArray().get([0]);

    var renderDict = ee.Dictionary({
      'name':      imgName,
      'image':     image,
      'render':    render,
    });

    return ee.Algorithms.If(imgSize,
                            renderDict,
                            null);
  }

  /**
   * Make a good-looking image from the data.
   * @param  {ee.Dictionary.<string, Object>} orbitsDict Image.
   *     For details, see members of @return in AbstSentinel.queryDate().
   * @return {ee.Image}  Rendering of orbit image.
   */
  function render_(image) {
    image       = ee.Image(image);
    var delta   = image.select('delta');
    var shadow  = image.select('shadow');
    var terrain = image.select('terrain');
    var slopes  = image.select('slopes');

    delta = ee.Image(0).blend(delta.log10()
                                   .unitScale(-2.5, -0.3)
                                   .clamp(0, 1)
                                   .pow(2)
                                   .add(0.2)
                                   .multiply(shadow));
    shadow = shadow.neq(1).multiply(SETTINGS.OPACITY/2);
    slopes = slopes.multiply(SETTINGS.OPACITY);
    
    var bg = ee.Image(1);
    if (SETTINGS.SEAMASK) {
      bg = bg.mask(terrain.neq(0));
    }
    
    var red   = bg.subtract(delta).subtract(slopes);
    var green = bg.subtract(delta).subtract(shadow);
    var blue  = bg.subtract(slopes).subtract(shadow);

    var mask = red.lt(0.79).or(green.lt(0.79)).or(blue.lt(0.99))
    return ee.Image.rgb(red, green, blue).mask(mask);
  }
}

module.exports = SentinelGenerate;
