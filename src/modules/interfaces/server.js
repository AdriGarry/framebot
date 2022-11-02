#!/usr/bin/env node

/** http codes
 *		200 : OK
 *		401 : Unauthorized (sleep)
 *		418 : I'm a teapot ! (other POST request)
 */

const http = require('http'),
  https = require('https'),
  express = require('express'),
  fs = require('fs'),
  compression = require('compression'),
  bodyParser = require('body-parser');

const { Core, Flux, Logger, Observers, Utils } = require('./../../api');

const log = new Logger(__filename);

const middleware = require('./server/middleware'),
  api = require('./server/api'),
  webSocket = require('./server/webSocket');

const FLUX_PARSE_OPTIONS = [
  { id: 'start', fn: startUIServer },
  { id: 'closeUIServer', fn: closeUIServer }
];

Observers.attachFluxParseOptions('interface', 'server', FLUX_PARSE_OPTIONS);

const HTTP_SERVER_PORT = 3210,
  HTTPS_SERVER_PORT = 4321,
  CREDENTIALS = {
    key: fs.readFileSync(Core._SECURITY + 'key.pem'),
    cert: fs.readFileSync(Core._SECURITY + 'cert.pem')
  };

function startUIServer() {
  startHttpServer();
  startHttpsServer();
}

let ui, uiHttps;
let httpServer, httpsServer;

function startHttpServer() {
  ui = express();
  httpServer = http.Server(ui);
  ui.get('*', (req, res) => {
    if (req.isSocket) return res.redirect('wss://' + req.headers.host + req.url);
    log.debug('Redirecting http to https');
    return res.redirect('https://' + req.headers.host + req.url);
  });
  httpServer.listen(HTTP_SERVER_PORT);
}

function startHttpsServer() {
  uiHttps = express();

  uiHttps.use(compression()); // Compression web
  uiHttps.use(express.static(Core._WEB)); // For static files

  uiHttps.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  uiHttps.use(bodyParser.text({ defaultCharset: 'utf-8' }));
  uiHttps.use(bodyParser.json()); // to support JSON-encoded bodies
  uiHttps.use(bodyParser.raw({ type: 'application/octet-stream', limit: '50mb' }));

  uiHttps.use(middleware.security());

  api.attachRoutes(uiHttps);

  httpsServer = https.Server(CREDENTIALS, uiHttps);
  httpsServer.listen(HTTPS_SERVER_PORT, () => {
    log.info('Https server started [' + Utils.executionTime(Core.startTime) + 'ms]');
    httpsServer = webSocket.init(httpsServer);
    Flux.do('interface|led|blink', { leds: ['satellite'], speed: 120, loop: 3 }, { log: 'trace' });
  });
}

function closeUIServer(breakDuration) {
  log.INFO('closing UI server for', breakDuration / 1000, 'seconds');
  // ui.close();
  // servor.close();
  ui = null;
}
