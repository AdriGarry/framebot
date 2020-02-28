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

const Core = require(_PATH + 'src/core/Core.js').Core,
	Observers = require(Core._CORE + 'Observers.js');

const log = new (require(Core._API + 'Logger.js'))(__filename),
	Flux = require(Core._API + 'Flux.js'),
	{ Utils } = require(Core._API + 'api.js');

const middleware = require(Core._MODULES + 'controllers/server/middleware.js'),
	api = require(Core._MODULES + 'controllers/server/api.js');

const HTTP_SERVER_PORT = 3210,
	HTTPS_SERVER_PORT = 4321,
	CREDENTIALS = {
		key: fs.readFileSync(Core._SECURITY + 'key.pem'),
		cert: fs.readFileSync(Core._SECURITY + 'cert.pem')
	};

Observers.controller().server.subscribe({
	next: flux => {
		if (flux.id == 'start') {
			startUIServer();
		} else if (flux.id == 'closeUIServer') {
			closeUIServer(flux.value);
		} else Core.error('unmapped flux in Server controller', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

function startUIServer() {
	startHttpServer();
	startHttpsServer();
}

var ui, uiHttps;
var httpServer, httpsServer;

function startHttpServer() {
	ui = express();
	httpServer = http.createServer(ui);
	ui.get('*', (req, res) => {
		if (req.isSocket) return res.redirect('wss://' + req.headers.host + req.url);
		log.debug('Redirecting http to https');
		return res.redirect('https://' + req.headers.host + req.url);
	}).listen(HTTP_SERVER_PORT);
}

function startHttpsServer() {
	// ui = express();
	uiHttps = express();
	// CORS
	// ui.use(function(request, response, next) {
	// 	response.header('Access-Control-Allow-Origin', '*');
	// 	response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	// 	next();
	// });
	// ui.options('/*', function(request, response, next) {
	// 	response.header('Access-Control-Allow-Methods', 'GET, POST'); //'GET, PUT, POST, DELETE, OPTIONS'
	// 	response.send();
	// });

	uiHttps.use(compression()); // Compression web
	uiHttps.use(express.static(Core._WEB)); // For static files

	uiHttps.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
	uiHttps.use(bodyParser.text({ defaultCharset: 'utf-8' }));
	uiHttps.use(bodyParser.json()); // to support JSON-encoded bodies
	uiHttps.use(bodyParser.raw({ type: 'application/octet-stream', limit: '50mb' }));

	uiHttps.use(middleware.security());

	api.attachRoutes(uiHttps);

	httpsServer = https.createServer(CREDENTIALS, uiHttps).listen(HTTPS_SERVER_PORT, () => {
		log.info('API https server started [' + Utils.executionTime(Core.startTime) + 'ms]');
		new Flux('interface|led|blink', { leds: ['satellite'], speed: 120, loop: 3 }, { log: 'trace' });
	});
}

function closeUIServer(breakDuration) {
	log.INFO('closing UI server for', breakDuration / 1000, 'seconds');
	// ui.close();
	// servor.close();
	ui = null;
}
