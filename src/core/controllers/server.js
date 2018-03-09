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

const FILE_REQUEST_HISTORY = ODI_PATH + 'log/requestHistory.log';
const FILE_GRANT = ODI_PATH + 'data/pwd.properties';
const FILE_ERROR_HISTORY = ODI_PATH + 'log/errorHistory.json';
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
	var request,
		ip,
		params,
		ipClient,
		unauthorizedRequestNb = 0,
		tooMuchBadRequests = false;
	const noSoundUrl = ['/dashboard', '/log'];

	// CORS
	ui.use(function(request, response, next) {
		response.header('Access-Control-Allow-Origin', '*');
		response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
		next();
	});
	ui.options('/*', function(request, response, next) {
		response.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
		response.send();
	});

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

		Flux.next('interface|led|blink', { leds: ['satellite'], speed: 80, loop: 3 }, { hidden: true });

		if (!Utils.searchStringInArray(req.url, noSoundUrl)) Flux.next('interface|sound|UI', null, { hidden: true });

		if (!req.connection.remoteAddress) {
			// log.INFO('req.connection.remoteAddress undefined ?');
			// log.info(req.connection);
			Odi.error('req.connection.remoteAddress undefined ?', req.connection);
		}
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
				// closingServerTemporary();
				var badRequestTimeout = setTimeout(function() {
					clearTimeout(badRequestTimeout);
					tooMuchBadRequests = false;
					unauthorizedRequestNb = 0;
				}, 10000);
			}
			unauthorizedRequestNb++;

			if (!tooMuchBadRequests) {
				if (Odi.isAwake()) {
					Flux.next(
						'interface|tts|speak',
						{ voice: 'espeak', lg: 'en', msg: 'Bad request' },
						{ delay: 0.5, hidden: true }
					);
				}
			}

			// Not allowed requests
			request = '401 ' + req.url.replace('%20', ' ');
			Odi.error('Bad request', request + ' ' + ip, false);
			res.status(401); // Unauthorized
			res.end();
		}
	};
	ui.use(logger);

	/** DASHBOARD SECTION */
	ui.get('/dashboard', function(req, res) {
		Flux.next('interface|hardware|runtime');
		var temp = parseInt(mode);
		var now = new Date();
		var h = now.getHours();
		var wakeUpTime;
		if (temp > h) {
			wakeUpTime = 'Sleeping until ' + (h - temp) + 'h' + now.getMinutes();
		}
		var etatBtn = Odi.run('etat');
		var cpuTemp = Odi.run('cpu.temp');
		var cpuUsage = Odi.run('cpu.usage');
		var dashboard = {
			config: Odi.conf(),
			errors: Odi.errors,
			mode: {
				value: {
					mode:
						Odi.conf('log') == 'trace'
							? 'Trace'
							: Odi.conf('log') == 'debug' ? 'Debug' : Utils.firstLetterUpper(Odi.conf('mode')),
					param: Odi.conf('startTime'),
					switch: etatBtn == 'high' ? true : false
				}
			},
			switch: { value: etatBtn, active: etatBtn ? true : false },
			volume: {
				value: Odi.run('volume'),
				active: isNaN(temp) && etatBtn == 1 ? true : false
			},
			voicemail: {
				value: Odi.run('voicemail'),
				active: Odi.run('voicemail') > 0 ? true : false
			},
			music: { value: Odi.run('music'), active: false },
			timer: { value: Odi.run('timer'), active: Odi.run('timer') > 0 ? true : false },
			hardware: {
				value: {
					usage: cpuUsage,
					temp: cpuTemp,
					memory: { odi: Odi.run('memory.odi'), system: Odi.run('memory.system') }
				},
				active: cpuTemp > 55 || cpuUsage >= 20 ? true : false
			},
			alarms: { value: Odi.conf('alarms'), active: true },
			update: { value: Odi.run('stats.update') },
			version: { value: 'toto' /*Odi.conf('version')*/ }, // DEPRECATED !
			debug: { value: Odi.conf('log') == 'debug' ? 'debug' : '' },
			trace: { value: Odi.conf('log') == 'trace' ? 'trace' : '' },
			watcher: { value: Odi.conf('watcher') }
		};
		res.writeHead(200);
		res.end(JSON.stringify(dashboard));
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
		log.table(Odi.conf(), 'CONFIG');
		res.end(JSON.stringify(Odi.conf()));
	});

	ui.get('/runtime', function(req, res) {
		res.writeHead(200);
		Flux.next('interface|hardware|runtime');
		log.table(Odi.run(), 'RUNTIME...');
		res.end(JSON.stringify(Odi.run()));
	});

	ui.get('/errors', function(req, res) {
		res.writeHead(200);
		res.end(JSON.stringify(Odi.errors));
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

	ui.get('/about', function(req, res) {
		res.writeHead(200);
		res.end(fs.readFileSync(ODI_PATH + 'README.md', 'utf8').toString());
	});

	/** ==> POST SECTION */
	ui.post('/odi', function(req, res) {
		Flux.next('service|system|restart', null, { delay: 1 });
		res.writeHead(200);
		res.end();
	});

	ui.post('/toggleDebug', function(req, res) {
		log.info('UI > Toggle debug');
		let newLogLevel = log.level() == 'debug' ? 'info' : 'debug';
		log.level(newLogLevel);
		Flux.next('interface|runtime|update', { log: newLogLevel });
		// Odi.conf('log', newLogLevel, false, true);
		res.writeHead(200);
		res.end();
	});

	ui.post('/toggleTrace', function(req, res) {
		log.info('UI > Toggle trace');
		let newLogLevel = log.level() == 'trace' ? 'info' : 'trace';
		log.level(newLogLevel);
		Flux.next('interface|runtime|update', { log: newLogLevel });
		// Odi.conf('log', newLogLevel, false, true);
		res.writeHead(200);
		res.end();
	});

	ui.post('/testSequence', function(req, res) {
		Flux.next('interface|runtime|updateRestart', { mode: 'test' }, { delay: 1 });
		res.writeHead(200);
		res.end();
	});

	ui.post('/watcher', function(req, res) {
		if (Odi.conf('watcher')) {
			Flux.next('controller|watcher|stopWatch');
		} else {
			Flux.next('controller|watcher|startWatch');
		}
		res.writeHead(200);
		res.end();
	});

	ui.post('/demo', function(req, res) {
		Flux.next('service|interaction|demo');
		res.writeHead(200);
		res.end();
	});

	ui.post('/resetConfig', function(req, res) {
		log.debug('UI > Reset config');
		Flux.next('interface|runtime|reset', true, { delay: 1 });
		res.writeHead(200);
		res.end();
	});

	ui.post('/sleep', function(req, res) {
		Flux.next('service|system|restart', 'sleep', { delay: 1 });
		res.writeHead(200);
		res.end();
	});

	ui.post('/reboot', function(req, res) {
		Flux.next('service|system|reboot', null, { delay: 1 });
		res.writeHead(200);
		res.end();
	});

	ui.post('/shutdown', function(req, res) {
		Flux.next('service|system|shutdown', null, { delay: 1 });
		res.writeHead(200);
		res.end();
	});

	ui.post('/mute', function(req, res) {
		Flux.next('interface|sound|mute');
		res.writeHead(200);
		res.end();
	});

	ui.post('/alarm', function(req, res) {
		params = req.body;
		Flux.next('service|time|setAlarm', params);
		res.writeHead(200);
		res.end();
	});

	ui.post('/alarmOff', function(req, res) {
		params = req.body;
		Flux.next('service|time|alarmOff');
		res.writeHead(200);
		res.end();
	});

	ui.post('/archiveLog', function(req, res) {
		Flux.next('interface|hardware|archiveLog');
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
			Flux.next('interface|tts|speak', { lg: 'en', msg: 'User NOT granted' }, { delay: 0.5 });
		}
		res.send(granted);
		if (granted) granted = false;
	});

	if (Odi.isAwake()) {
		ui.post('/tts', function(req, res) {
			var params = req.query;
			if (params.voice && params.lg && params.msg) {
				if (params.hasOwnProperty('voicemail')) {
					Flux.next('service|voicemail|new', { voice: params.voice, lg: params.lg, msg: params.msg });
				} else {
					Flux.next('interface|tts|speak', { voice: params.voice, lg: params.lg, msg: params.msg });
				}
				params.timestamp = Utils.logTime('D/M h:m:s', new Date());
				Utils.appendJsonFile(FILE_TTS_UI_HISTORY, params);
			} else {
				Flux.next('interface|tts|random');
			}
			res.writeHead(200);
			res.end();
		});

		ui.post('/lastTTS', function(req, res) {
			Flux.next('interface|tts|lastTTS');
			res.writeHead(200);
			res.end();
		});

		ui.post('/checkVoiceMail', function(req, res) {
			Flux.next('service|voicemail|check', true);
			res.writeHead(200);
			res.end();
		});

		ui.post('/clearVoiceMail', function(req, res) {
			Flux.next('service|voicemail|clear');
			res.writeHead(200);
			res.end();
		});

		// ui.post('/conversation', function(req, res) {
		// 	Flux.next('interface|tts|conversation');
		// 	res.writeHead(200);
		// 	res.end();
		// });

		ui.post('/idea', function(req, res) {
			// params = req.query;
			Flux.next('interface|tts|speak', { lg: 'en', msg: "I've got an idea !" });
			res.writeHead(200);
			res.end();
		});

		ui.post('/badBoy', function(req, res) {
			params = req.body;
			log.debug('/badBoy', params);
			Flux.next('service|mood|badBoy', params.value);
			res.writeHead(200);
			res.end();
		});

		ui.post('/russia', function(req, res) {
			params = req.query;
			log.debug('/russia', params);
			if (params.hasOwnProperty('hymn')) {
				spawn('sh', [Odi._SHELL + 'music.sh', 'urss']);
				Flux.next('interface|led|altLeds', { speed: 70, loop: 20 }, { hidden: true });
			} else {
				Flux.next('service|interaction|russia');
			}
			res.writeHead(200);
			res.end();
		});

		ui.post('/exclamation', function(req, res) {
			Flux.next('service|interaction|exclamation');
			res.writeHead(200);
			res.end();
		});

		ui.post('/fip', function(req, res) {
			Flux.next('service|music|fip');
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
			Flux.next('service|music|jukebox');
			res.writeHead(200);
			res.end();
		});

		ui.post('/naheulbeuk', function(req, res) {
			Flux.next('service|music|story', 'Naheulbeuk');
			res.writeHead(200);
			res.end();
		});

		ui.post('/survivaure', function(req, res) {
			Flux.next('service|music|story', 'Survivaure');
			res.writeHead(200);
			res.end();
		});

		ui.post('/playVideo', function(req, res) {
			Flux.next('interface|video|cycle');
			res.writeHead(200);
			res.end();
		});

		ui.post('/max/playOneMelody', function(req, res) {
			Flux.next('service|max|playOneMelody');
			res.writeHead(200);
			res.end();
		});

		ui.post('/max/hornRdm', function(req, res) {
			Flux.next('service|max|hornRdm');
			res.writeHead(200);
			res.end();
		});

		ui.post('/max/turn', function(req, res) {
			Flux.next('service|max|turn');
			res.writeHead(200);
			res.end();
		});

		// ui.post('/arduinoSleep', function(req, res) {
		// 	Flux.next('interface|arduino|sleep');
		// 	res.writeHead(200);
		// 	res.end();
		// });

		ui.post('/videoOff', function(req, res) {
			Flux.next('interface|video|screenOff');
			res.writeHead(200);
			res.end();
		});

		ui.post('/time', function(req, res) {
			Flux.next('service|time|now');
			res.writeHead(200);
			res.end();
		});

		ui.post('/date', function(req, res) {
			Flux.next('service|time|today');
			res.writeHead(200);
			res.end();
		});

		ui.post('/birthday', function(req, res) {
			Flux.next('service|time|birthday');
			res.writeHead(200);
			res.end();
		});

		ui.post('/age', function(req, res) {
			Flux.next('service|time|OdiAge');
			res.writeHead(200);
			res.end();
		});

		ui.post('/timer', function(req, res) {
			params = req.query; // affiner pour récupérer les params
			if (params.hasOwnProperty('stop')) {
				Flux.next('service|time|timer', 'stop');
			} else {
				/*if (!isNaN(params.min))*/
				var min = parseInt(params.min, 10) || 1;
				// log.info(min);
				Flux.next('service|time|timer', min);
			}
			res.writeHead(200);
			res.end();
		});

		ui.post('/weather', function(req, res) {
			Flux.next('service|interaction|weather');
			res.writeHead(200);
			res.end();
		});
		ui.post('/weatherInteractive', function(req, res) {
			Flux.next('service|interaction|weather', 'interactive');
			res.writeHead(200);
			res.end();
		});

		ui.post('/cpuTTS', function(req, res) {
			Flux.next('interface|hardware|cpuTTS');
			res.writeHead(200);
			res.end();
		});

		ui.post('/soulTTS', function(req, res) {
			Flux.next('interface|hardware|soulTTS');
			res.writeHead(200);
			res.end();
		});

		ui.post('/diskSpaceTTS', function(req, res) {
			Flux.next('interface|hardware|diskSpaceTTS');
			res.writeHead(200);
			res.end();
		});

		ui.post('/totalLinesTTS', function(req, res) {
			Flux.next('interface|hardware|totalLinesTTS');
			res.writeHead(200);
			res.end();
		});

		ui.post('/cigales', function(req, res) {
			spawn('sh', [Odi._SHELL + 'sounds.sh', 'cigales']);
			res.writeHead(200);
			res.end();
		});

		ui.post('/setParty', function(req, res) {
			Flux.next('service|party|start');
			res.writeHead(200);
			res.end();
		});

		ui.post('/partyTTS', function(req, res) {
			Flux.next('service|party|tts');
			res.writeHead(200);
			res.end();
		});

		ui.post('/pirate', function(req, res) {
			Flux.next('service|party|pirate');
			res.writeHead(200);
			res.end();
		});

		ui.post('/test', function(req, res) {
			spawn('sh', [Odi._SHELL + 'sounds.sh', 'test']); //mouthTrick
			Flux.next('interface|tts|speak', { lg: 'en', msg: '.undefined' });
			res.writeHead(200);
			res.end();
		});

		ui.post('/*', function(req, res) {
			// Others
			Odi.error('Error UI > not mapped: ' + req.url, null, false);
			res.writeHead(418);
			res.end();
		});
	} else {
		ui.post('/tts', function(req, res) {
			// Add Voice Mail Message
			params = req.query;
			if (params['voice'] && params['lg'] && params['msg']) {
				Flux.next('service|voicemail|new', { voice: params.voice, lg: params.lg, msg: params.msg });
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
		log.info('UI server started [' + Odi.conf('mode') + ']');
		Flux.next('interface|led|blink', { leds: ['satellite'], speed: 120, loop: 3 }, { hidden: true });
	});
}

function closingServerTemporary() {
	// Deprecated ?
	log.INFO('closing UI server temporary.');
	ui.close;
	setTimeout(function() {
		log.info('restarting UI server...');
		startUIServer();
	}, 3000);
}
