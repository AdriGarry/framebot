#!/usr/bin/env node

/** http codes
 *		200 : OK
 *		401 : Unauthorized (sleep)
 *		418 : I'm a teapot ! (other POST request)
 */

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
const log = new (require(Odi._CORE + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);
const Flux = require(Odi._CORE + 'Flux.js');
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');

const MIDDLEWARE = require(Odi._CORE + 'controllers/server/middleware.js');

var ui = express();

Flux.controller.server.subscribe({
	next: flux => {
		if (flux.id == 'startUIServer') {
			startUIServer();
		} else if (flux.id == 'closeUIServer') {
			closeUIServer();
		} else Odi.error('unmapped flux in Server controller', flux, false);
	},
	error: err => {
		Odi.error(flux);
	}
});

startUIServer();
function startUIServer() {
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

	ui.use(compression()); // Compression web
	ui.use(express.static(Odi._WEB)); // For static files
	ui.use(bodyParser.json()); // to support JSON-encoded bodies
	ui.use(
		bodyParser.urlencoded({
			extended: true // to support URL-encoded bodies
		})
	);

	ui.use(MIDDLEWARE.security());

	require(Odi._CORE + 'controllers/server/routes.js').attachRoutes(ui);

	ui.listen(69, function() {
		log.info('UI server started [' + Odi.conf('mode') + ']');
		Flux.next('interface|led|blink', { leds: ['satellite'], speed: 120, loop: 3 }, { hidden: true });
	});
}

function closeUIServer(breakDuration) {
	log.INFO('closing UI server for', breakDuration / 1000, 'seconds');
	ui.close;
}
