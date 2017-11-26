#!/usr/bin/env node

// Module server
/** Liste codes http
 *		200 : OK
 *		401 : Unauthorized (sleep)
 *		418 : I'm a teapot ! (autres requetes POST)
 *		424 : Method failure (erreur)
  */

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);
var Flux = require(Odi._CORE + 'Flux.js');
var Utils = require(ODI_PATH + 'src/core/Utils.js');
const admin = require(ODI_PATH + 'src/core/services/admin.js');

var express = require('express');
var compression = require('compression');
var bodyParser = require('body-parser');
var path = require('path');
var spawn = require('child_process').spawn;
var fs = require('fs');

const FILE_ERROR_HISTORY = ODI_PATH + 'log/errorHistory.log';
const FILE_REQUEST_HISTORY = ODI_PATH + 'log/requestHistory.log';
const FILE_GRANT = ODI_PATH + 'data/pwd.properties';
const FILE_TTS_UI_HISTORY = Odi._LOG + 'ttsUIHistory.json';
const FILE_VOICEMAIL_HISTORY = ODI_PATH + 'log/voicemailHistory.json';

var ui, deploy;

/** Function to format logs */
function prepareLogs(lines, callback) {
	var content = fs
		.readFileSync(Odi._LOG + 'odi.log', 'UTF-8')
		.toString()
		.split('\n');
	content = content.slice(-lines); //-120
	content = content.join('\n');
	callback(content);
	return content;
}

startUIServer();
function startUIServer(mode) {
	ui = express();
	var request, ip, params, ipClient, unauthorizedRequestNb = 0, tooMuchBadRequests = false;
	const noSoundUrl = ['/dashboard', '/log'];

	ui.use(compression()); // Compression web
	ui.use(express.static(Odi._WEB)); // Pour fichiers statiques
	ui.use(bodyParser.json()); // to support JSON-encoded bodies
	ui.use(
		bodyParser.urlencoded({
			extended: true // to support URL-encoded bodies
		})
	);

	// Middleware LOGGER
	var logger = function(req, res, next) {
		res.header('Access-Control-Allow-Origin', 'http://adrigarry.com');

		Flux.next('module', 'led', 'blink', { leds: ['satellite'], speed: 80, loop: 3 }, null, null, true);
		
		//if(req.url != '/dashboard' && req.url != '/log') Flux.next('module', 'sound', 'UI', null, null, null, true);
		if(!Utils.searchStringInArray(req.url, noSoundUrl)) Flux.next('module', 'sound', 'UI', null, null, null, true);
		
		if (req.connection.remoteAddress.indexOf('192.168') == -1) {
			// Logging not local requests
			var newRequest = Utils.logTime('D/M h:m:s ') + request + ' [' + req.connection.remoteAddress + ']\r\n';
			fs.appendFile(FILE_REQUEST_HISTORY, newRequest, function(err) {
				if (err) return Odi.error(err);
			});
		}

		ip = req.connection.remoteAddress.indexOf('192.168') > -1 ? '' : 'from [' + req.connection.remoteAddress + ']';

		if (req.headers['user-interface'] === 'UIv5') {
			// Allowed requests
			request = req.headers['user-interface'] + ' ' + req.url.replace('%20', ' ');
			log.info(request, ip);
			next();
		} else if (req.url == '/favicon.ico') {
			log.info('favicon request', request, ip);
			res.status(401); // Unauthorized
			res.end();
		} else {
			if (unauthorizedRequestNb >= 2) {
				tooMuchBadRequests = true;
				var badRequestTimeout = setTimeout(function() {
					clearTimeout(badRequestTimeout);
					tooMuchBadRequests = false;
					unauthorizedRequestNb = 0;
				}, 10000);
			}
			unauthorizedRequestNb++;

			if (!tooMuchBadRequests) {
				if (Odi.conf.mode == 'ready'){
					Flux.next('module', 'tts', 'speak', { voice: 'espeak', lg: 'en', msg: 'Bad request' }, .5, null, true);
				}
			}

			// Not allowed requests
			request = '401 ' + req.url.replace('%20', ' ');
			Odi.error(request + ' ' + ip, null, false);
			res.status(401); // Unauthorized
			res.end();
		}
	};
	ui.use(logger);
	
	ui.get('/monitoring2', function(req, res) {
		// DEPRECATED ???
		//console.log(/\d/.test(mode));
		var activity = {
			mode: /\d/.test(mode) ? 'sleep' : 'awake',
			pauseUI: false,
			info: 'Refresh status'
		};
		//console.log(activity);
		res.writeHead(200);
		res.end(JSON.stringify(activity));
	});

	/** DASHBOARD SECTION */
	ui.get('/dashboard', function(req, res) {
		var temp = parseInt(mode);
		var now = new Date();
		var h = now.getHours();
		var wakeUpTime;
		if (temp > h) {
			wakeUpTime = 'Sleeping until ' + (h - temp) + 'h' + now.getMinutes();
		}
		var etatBtn = null; //ODI.buttons.getEtat();
		var cpuTemp = Odi.run.cpuTemp;
		var cpuUsage = Odi.run.cpuUsage;
		var dashboard = {
			config: Odi.conf,
			run: Odi.run,
			mode: {
				value: {
					// mode: Odi.conf.mode != 'sleep' ? (Odi.conf.debug ? 'Debug' : 'Ready') : 'Sleep',
					mode: Odi.conf.debug ? 'Debug' : Utils.firstLetterUpper(Odi.conf.mode),
					// param: isNaN(parseFloat(mode)) ? Odi.conf.startTime : parseInt(mode),
					param: Odi.conf.startTime,
					switch: etatBtn ? true : false,
					active: Odi.conf.debug, // TRY TO DELETE THIS (deprecated)
					debug: Odi.conf.debug
				}
			},
			switch: { value: etatBtn, active: etatBtn ? true : false },
			volume: {
				value: isNaN(temp) ? (etatBtn == 1 ? 'high' : 'normal') : 'mute',
				active: isNaN(temp) && etatBtn == 1 ? true : false
			},
			voicemail: {
				value: Odi.run.voicemail,
				active: Odi.run.voicemail > 0 ? true : false
			},
			music: { value: Odi.run.music, active: false },
			timer: { value: Odi.run.timer, active: Odi.run.timer > 0 ? true : false },
			hardware: { value: { usage: cpuUsage, temp: cpuTemp }, active: cpuTemp > 55 || cpuUsage >= 20 ? true : false },
			alarms: { value: Odi.conf.alarms, active: true },
			//config: {value: Odi.conf},
			version: { value: 'toto'/*Odi.conf.version*/ }, // DEPRECATED !
			debug: { value: Odi.conf.debug } // TO DEPRECATE...
		};
		res.writeHead(200);
		res.end(JSON.stringify(dashboard));
	});
	
	/** POST ALARM SETTING */
	ui.post('/alarm', function(req, res) {
		params = req.body;
		// log.INFO(params);
		Flux.next('service', 'time', 'setAlarm', params);
		res.writeHead(200);
		res.end();
	});

	/** TOGGLE DEBUG MODE */
	ui.post('/toggleDebug', function(req, res) {
		log.debug('UI > Toggle debug');
		Flux.next('module', 'conf', 'updateRestart', { debug: Odi.conf.debug ? 0 : 20 });
		// Odi.update({ debug: Odi.conf.debug ? 0 : 20 }, true);
		res.writeHead(200);
		res.end();
	});

	ui.post('/testSequence', function(req, res) {
		Flux.next('module', 'conf', 'updateRestart', { mode: 'test' });
		// Odi.update({ mode: 'test' }, true);
		res.writeHead(200);
		res.end();
	});

	ui.post('/resetConfig', function(req, res) {
		log.debug('UI > Reset config');
		Flux.next('module', 'conf', 'reset', true);
		// Odi.reset(true);
		res.writeHead(200);
		res.end();
	});

	/** ==> GET SECTION */
	ui.get('/log', function(req, res) {
		// Send Logs to UI
		var logSize = 100;
		params = req.query;
		if (params.hasOwnProperty('logSize') && !isNaN(params.logSize)) {
			logSize = parseInt(params.logSize);
		}
		prepareLogs(logSize, function(log) {
			res.end(log);
		});
	});

	ui.get('/config.json', function(req, res) {
		res.writeHead(200);
		res.end(fs.readFileSync(Odi._CONF, 'utf8').toString());
		//console.debug(Odi.conf.toString());
		log.conf(Odi.conf);
		res.end(JSON.stringify(Odi.conf));
	});

	ui.get('/errorHistory', function(req, res) {
		res.writeHead(200);
		res.end(fs.readFileSync(FILE_ERROR_HISTORY, 'utf8').toString());
	});

	ui.get('/requestHistory', function(req, res) {
		res.writeHead(200);
		res.end(fs.readFileSync(FILE_REQUEST_HISTORY, 'utf8').toString());
	});

	ui.get('/ttsUIHistory', function(req, res) {
		res.writeHead(200);
		res.end(fs.readFileSync(FILE_TTS_UI_HISTORY, 'utf8').toString());
	});

	ui.get('/voicemailHistory', function(req, res) {
		res.writeHead(200);
		res.end(fs.readFileSync(FILE_VOICEMAIL_HISTORY, 'utf8').toString());
	});

	/** ==> POST SECTION */
	ui.post('/odi', function(req, res) {
		Flux.next('service', 'system', 'restart');
		res.writeHead(200);
		res.end();
	});

	ui.post('/sleep', function(req, res) {
		Flux.next('service', 'system', 'restart', 'sleep');
		res.writeHead(200);
		res.end();
	});

	ui.post('/reboot', function(req, res) {
		Flux.next('service', 'system', 'reboot');
		res.writeHead(200);
		res.end();
	});

	ui.post('/shutdown', function(req, res) {
		Flux.next('service', 'system', 'shutdown');
		res.writeHead(200);
		res.end();
	});

	ui.post('/mute', function(req, res) {
		Flux.next('module', 'sound', 'mute');
		res.writeHead(200);
		res.end();
	});

	var granted = false;
	ui.post('/grant', function(req, res) {
		var pattern = req.headers.pwd;
		if (pattern && admin.checkPassword(pattern)) {
			granted = true;
			log.info('>> Admin granted !');
		} else {
			Odi.error('>> User NOT granted /!\\', pattern, false);
			Flux.next('module', 'tts', 'speak', {lg:'en', msg:'User NOT granted'}, .5);
		}
		res.send(granted);
		if (granted) granted = false;
	});

	if (Odi.conf.mode != 'sleep') {
		ui.post('/tts', function(req, res) {
			var params = req.query;
			if (params.voice && params.lg && params.msg) {
				if (params.hasOwnProperty('voicemail')) {
					Flux.next('service', 'voicemail', 'new', { voice: params.voice, lg: params.lg, msg: params.msg });
				} else {
					Flux.next('module', 'tts', 'speak', { voice: params.voice, lg: params.lg, msg: params.msg });
				}
				params.timestamp = Utils.logTime('D/M h:m:s', new Date());
				Utils.appendJsonFile(FILE_TTS_UI_HISTORY, params);
			} else {
				Flux.next('module', 'tts', 'random');
			}
			res.writeHead(200);
			res.end();
		});

		ui.post('/lastTTS', function(req, res) {
			Flux.next('module', 'tts', 'lastTTS');
			res.writeHead(200);
			res.end();
		});

		ui.post('/checkVoiceMail', function(req, res) {
			Flux.next('service', 'voicemail', 'check');
			res.writeHead(200);
			res.end();
		});

		ui.post('/clearVoiceMail', function(req, res) {
			Flux.next('service', 'voicemail', 'clear');
			res.writeHead(200);
			res.end();
		});

		ui.post('/conversation', function(req, res) {
			Flux.next('module', 'tts', 'conversation');
			res.writeHead(200);
			res.end();
		});

		ui.post('/idea', function(req, res) {
			// params = req.query;
			Flux.next('module', 'tts', 'speak', { lg: 'en', msg: "I've got an idea !" });
			res.writeHead(200);
			res.end();
		});

		ui.post('/badBoy', function(req, res) {
			params = req.body;
			log.debug('/badBoy', params);
			Flux.next('service', 'mood', 'badBoy', params.value);
			res.writeHead(200);
			res.end();
		});

		ui.post('/adriExclamation', function(req, res) {
			Flux.next('service', 'interaction', 'adriExclamation');
			res.writeHead(200);
			res.end();
		});

		ui.post('/russia', function(req, res) {
			params = req.query;
			log.debug('/russia', params);
			if (params.hasOwnProperty('hymn')) {
				spawn('sh', [Odi._SHELL + 'music.sh', 'urss']);
				Flux.next('module', 'led', 'altLeds', {speed: 70, loop: 20}, null, null, true);
			} else {
				Flux.next('service', 'interaction', 'russia');
			}
			res.writeHead(200);
			res.end();
		});

		ui.post('/exclamation', function(req, res) {
			Flux.next('service', 'interaction', 'exclamation');
			res.writeHead(200);
			res.end();
		});

		ui.post('/fip', function(req, res) {
			Flux.next('service', 'music', 'fip');
			res.writeHead(200);
			res.end();
		});

		ui.post('/music/*', function(req, res) {
			var song; // RECUPERER LE NOM DE LA CHANSON
			if (!song) song = 'mouthTrick';
			spawn('sh', [Odi._SHELL + 'music.sh', song]);
			res.writeHead(200);
			res.end();
		});

		ui.post('/jukebox', function(req, res) {
			Flux.next('service', 'music', 'jukebox');
			res.writeHead(200);
			res.end();
		});

		ui.post('/naheulbeuk', function(req, res) {
			spawn('sh', [Odi._SHELL + 'sounds.sh', 'Naheulbeuk']);
			res.writeHead(200);
			res.end();
		});

		ui.post('/survivaure', function(req, res) {
			spawn('sh', [Odi._SHELL + 'sounds.sh', 'Survivaure']);
			res.writeHead(200);
			res.end();
		});

		ui.post('/playVideo', function(req, res) {
			Flux.next('service', 'video', 'cycle');
			res.writeHead(200);
			res.end();
		});

		ui.post('/videoOff', function(req, res) {
			Flux.next('service', 'video', 'screenOff');
			res.writeHead(200);
			res.end();
		});

		ui.post('/time', function(req, res) {
			Flux.next('service', 'time', 'now');
			res.writeHead(200);
			res.end();
		});

		ui.post('/date', function(req, res) {
			Flux.next('service', 'time', 'today');
			res.writeHead(200);
			res.end();
		});

		ui.post('/age', function(req, res) {
			Flux.next('service', 'time', 'OdiAge');
			res.writeHead(200);
			res.end();
		});

		ui.post('/timer', function(req, res) {
			params = req.query; // affiner pour récupérer les params
			// console.log(params);
			params.m = 1;
			if (params.hasOwnProperty('stop')) {
				Flux.next('service', 'time', 'timer', 'stop');
			} else if (!isNaN(params.m)) {
				var min = parseInt(params.m, 10);
				// log.info(min);
				Flux.next('service', 'time', 'timer', min);
			}
			res.writeHead(200);
			res.end();
		});

		ui.post('/weather', function(req, res) {
			Flux.next('service', 'interaction', 'weather');
			res.writeHead(200);
			res.end();
		});
		ui.post('/weatherInteractive', function(req, res) {
			Flux.next('service', 'interaction', 'weatherInteractive');
			res.writeHead(200);
			res.end();
		});

		// ui.post('/info', function(req, res) { // NOT USED...
		// 	// Info
		// 	// ODI.service.info();
		// 	res.writeHead(200);
		// 	res.end();
		// });

		ui.post('/cpuTemp', function(req, res) {
			Flux.next('module', 'hardware', 'cpu');
			res.writeHead(200);
			res.end();
		});

		ui.post('/cigales', function(req, res) {
			spawn('sh', [Odi._SHELL + 'sounds.sh', 'cigales']);
			res.writeHead(200);
			res.end();
		});

		ui.post('/setParty', function(req, res) {
			// Set Party Mode
			// ODI.party.setParty();
			res.writeHead(200);
			res.end();
		});

		ui.post('/test', function(req, res) {
			spawn('sh', [Odi._SHELL + 'sounds.sh', 'test']); //mouthTrick
			res.writeHead(200);
			res.end();
		});

		ui.post('/*', function(req, res) {
			// Redirect Error
			Odi.error('UI > I’m a teapot !', null, false);
			res.writeHead(418);
			res.end();
		});
	} else {
		ui.post('/tts', function(req, res) { // Add Voice Mail Message
			params = req.query;
			if (params['voice'] && params['lg'] && params['msg']) {
				Flux.next('service', 'voicemail', 'new', { voice: params.voice, lg: params.lg, msg: params.msg });
				params.timestamp = Utils.logTime('D/M h:m:s', new Date());
				Utils.appendJsonFile(FILE_TTS_UI_HISTORY, params);
				res.writeHead(200);
				res.end();
			} else {
				Odi.error('Error while saving voiceMail message:', params);
				res.writeHead(424);
				res.end();
			}
		});

		ui.post('/*', function(req, res) {
			Odi.error('Odi not allowed to interact  -.-', null, false);
			res.writeHead(401);
			res.end();
		});
	}

	ui.listen(8080, function() {
		// Listen port 8080
		log.info('UI server started [' + Odi.conf.mode + ']');
		Flux.next('module', 'led', 'blink', { leds: ['satellite'], speed: 120, loop: 3 }, null, null, 'hidden');
	});
};

function closingServerTemporary(){
	log.info('closingServerTemporary');
	ui.close;
	setTimeout(function(){
		startUIServer();
	}, 3000);
}