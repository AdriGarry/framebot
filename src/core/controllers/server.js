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
	log = new (require(Core._CORE + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]),
	middleware = require(Core._CORE + 'controllers/server/middleware.js'),
	api = require(Core._CORE + 'controllers/server/api.js');

const HTTP_SERVER_PORT = 3210,
	HTTPS_SERVER_PORT = 4321,
	CREDENTIALS = {
		key: fs.readFileSync(Core._SECURITY + 'key.pem'),
		cert: fs.readFileSync(Core._SECURITY + 'cert.pem')
	};

Core.flux.controller.server.subscribe({
	next: flux => {
		if (flux.id == 'startUIServer') {
			startUIServer();
		} else if (flux.id == 'addApi') {
			// api.add(uiHttps, flux.value);
			addApi(flux.value);
		} else if (flux.id == 'closeUIServer') {
			closeUIServer(flux.value);
		} else Core.error('unmapped flux in Server controller', flux, false);
	},
	error: err => {
		Core.error('Flux error', err);
	}
});

setImmediate(() => {
	startUIServer();
});

function startUIServer() {
	startHttpServer();
	resetHttpsServerAndStart();
}

// var ui = express(),
// 	uiHttps = express();
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

function resetHttpsServerAndStart(additionalApi) {
	resetServer(httpsServer)
		// .then(() => {
		// 	return resetServer(httpsServer);
		// })
		.then(() => {
			return startHttpsServer(additionalApi);
		})
		.catch(err => Core.error('Reset UI failed', err));
}

function resetServer(server) {
	return new Promise((resolve, reject) => {
		if (server) {
			log.info('Restarting ui server...');
			server.close(() => {
				log.warn('server closed');
				resolve();
			});
		} else resolve();
	});
}

function startHttpsServer(additionalApi) {
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

	uiHttps.use(bodyParser.json()); // to support JSON-encoded bodies
	uiHttps.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
	uiHttps.use(bodyParser.raw({ type: 'application/octet-stream', limit: '50mb' }));

	uiHttps.use(middleware.security());

	api.attachRoutes(uiHttps);
	if (additionalApi) attachAdditionalApi(uiHttps, additionalApi);
	// attachRoutesFromDescriptor();

	httpsServer = https.createServer(CREDENTIALS, uiHttps).listen(HTTPS_SERVER_PORT, () => {
		log.info('UI https server started [' + Core.conf('mode') + ']');
		Core.do('interface|led|blink', { leds: ['satellite'], speed: 120, loop: 3 }, { log: 'trace' });
	});
}

function addApi(route) {
	// log.INFO('addApi', route);
	resetHttpsServerAndStart(route);
}

function attachAdditionalApi(ui, additionalApi) {
	// console.log(typeof additionalApi);
	// console.log(additionalApi);
	if (!Array.isArray(additionalApi)) additionalApi = [additionalApi];
	additionalApi.forEach(item => {
		log.info('server.item=', item);
		log.info('/' + item.url);
		ui.post('/' + item.url, (req, res) => {
			log.warn('------------hey this is from json url api');
			// add to url: /api/... ?
			item.flux.forEach(flux => {
				Core.do(flux.id, flux.data, flux.conf);
			});
			res.end();
		});
		// console.log();
		log.info('attachAdditionalApi');
	});
}

// function attachRoutesFromDescriptor(ui) {
// 	Core.descriptor.api.POST.forEach(item => {
// 		log.info('server.item=', item);
// 		log.info('/' + item.url);
// 		ui.post('/' + item.url, (req, res) => {
// 			log.warn('------------hey this is from json url api');
// 			// add to url: /api/...
// 			item.flux.forEach(flux => {
// 				Core.do(flux.id, flux.data, flux.conf);
// 			});
// 			res.end();
// 		});
// 		console.log();
// 		log.info('attachRoutesFromDescriptor');
// 	});
// }

function closeUIServer(breakDuration) {
	log.INFO('closing UI server for', breakDuration / 1000, 'seconds');
	// ui.close();
	// servor.close();
	ui = null;
}
