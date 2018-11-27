global.ee        = require('@google/earthengine');

const express    = require('express');
const handlebars = require('express-handlebars');
const fs         = require('fs');
const path       = require('path');
const MarkdownIt = require('markdown-it');

const Errors     = require('./server/errors.js');

const Sentinel    = require('./server/sentinel.js');
const Coordinates = require('./server/coordinates.js');

const privateKey = require('./privatekey.json');
const pjson      = require('./package.json');
const SETTINGS   = require('./server/settings.js');

function Server() {
  const mapKey   = fs.readFileSync('./map.key').slice(0, -1);
  const trackId  = fs.readFileSync('./track.id').slice(0, -1);
  var markdownIt = new MarkdownIt().set({ html: true });

  ee.data.authenticateViaPrivateKey(privateKey, initialize_, function(e) {
    console.error('Authentication error: ' + e);
  });

  function initialize_() {
    ee.initialize(null, null, run_, function(e) {
      console.error('Initialization error: ' + e);
    });
  }

  function run_() {
    console.log(SETTINGS.AUTHED);
    var sentinel = new Sentinel(SETTINGS.SENTINEL);
    var coordinates = new Coordinates();

    var app = express()
        .engine('.hbs', handlebars({extname: '.hbs', cache: false}))
        .set('view engine', '.hbs')
        .use('/static', express.static('static'));
    
    app.set('trust proxy', true);
    app.use(wwwRedirect_);
    app.use(ieRedirect_);
    
    app.get('/', function(req, res) {
      var title    = SETTINGS.TITLE;
      var trackUrl = SETTINGS.TRACK_URL;
      var mapUrl   = SETTINGS.MAP_URL;
      var version  = pjson.version;
      res.render('index', {title, trackUrl, mapUrl, trackId, mapKey, version});
    });
    
    app.get('/client.js', function(req, res) {
      res.sendFile(__dirname + '/client.js');
    });

    app.get('/md/:file', function(req, res) {
      md_(path.join('./md', req.params.file), res);
    });
    
    app.get('/api/map/:id', function(req, res) {
      var force = req.query.force ? true : false;
      sentinel.getRender(req.params.id, force, respond_(res));
    });

    app.get('/api/name/:date', function(req, res) {
      var bounds     = req.query.bounds ? JSON.parse(req.query.bounds) : null;
      var imgList    = sentinel.getNames(req.params.date, bounds, respond_(res));
    });

    app.get('/api/coordinates/:lat/:lon', function(req, res) {
      var lat = Number.parseFloat(req.params.lat);
      var lon = Number.parseFloat(req.params.lon);
      coordinates.getCoords(lat, lon, respond_(res));
    });

    app.use(function(req, res){
      res.sendStatus(404);
    });

    app.listen(8080, '0.0.0.0');
    console.log(SETTINGS.STARTED);

    function respond_(res) {
      return (data, status) => {
        status = status ? status : 200;
        res.status(status).send(data);
      }
    }

    function wwwRedirect_(req, res, next) {
      if (req.headers.host.slice(0, 4) === 'www.') {
        var newHost = req.headers.host.slice(4);
        return res.redirect(301,
                            req.protocol + '://' + newHost + req.originalUrl);
      }
      next();
    };

    // This is bad practice
    function ieRedirect_(req, res, next) {
      if (!req.headers['user-agent']) {
        next();
        return;
      }

      for(var agent of ['MSIE', 'Trident', 'Edge']) {
        if (req.headers['user-agent'].indexOf(agent) >= 0) {
          return md_('./md/ie.md', res);
        }
      }
      next();
    };

    function md_(uri, res) {
      fs.readFile(uri, 'utf8', (err, msg) => {
                    var md;

                    // I haven't had time to check this module properly.
                    try {
                      md = markdownIt.render(msg);
                    } catch (e) {
                      err = e;
                    } finally {
                      if (!err) {
                        res.send(md);
                      } else {
                        res.sendStatus(404);
                      }
                    }
                  });
    }
  }
}
new Server();
