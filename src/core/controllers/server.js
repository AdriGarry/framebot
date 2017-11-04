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
const admin = require(ODI_PATH + 'src/core/modules/admin.js');

var express = require('express');
var compression = require('compression');
var bodyParser = require('body-parser');
var path = require('path');
var spawn = require('child_process').spawn;
var fs = require('fs');

const FILE_REQUEST_HISTORY = ODI_PATH + 'log/requestHistory.log';
const FILE_GRANT = ODI_PATH + 'data/pwd.properties';
const FILE_VOICEMAIL_HISTORY = ODI_PATH + 'log/voicemailHistory.json';

var deploy;

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

startUI();
function startUI(mode) {
	var ui = express();
	var request, ip, params, ipClient;

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
		//ODI.leds.toggle({led:'eye', mode: 1});
		res.header('Access-Control-Allow-Origin', 'http://adrigarry.com');

		Flux.next('module', 'led', 'blink', { leds: ['satellite'], speed: 80, loop: 3 }, null, null, true);
		
		if(req.url != '/dashboard' && req.url != '/log') Flux.next('module', 'sound', 'UI', null, null, null, true);
		
		if (req.connection.remoteAddress.indexOf('192.168') == -1) {
			// Logging not local requests
			var newRequest = Utils.logTime('D/M h:m:s ') + request + ' [' + req.connection.remoteAddress + ']\r\n';
			fs.appendFile(FILE_REQUEST_HISTORY, newRequest, function(err) {
				if (err) return Odi.error(err);
			});
		}

		ip = req.connection.remoteAddress.indexOf('192.168') > -1 ? '' : 'from [' + req.connection.remoteAddress + ']';

		if (req.headers['user-interface'] === 'v4') {
			// Allowed requests
			request = req.headers['user-interface'] + ' ' + req.url.replace('%20', ' ');
			log.info(request, ip);
			next();
		} else if (req.url == '/favicon.ico') {
			log.info('favicon request', request, ip);
			res.status(401); // Unauthorized
			res.end();
		} else {
			// Not allowed requests
			request = '401 ' + req.url.replace('%20', ' ');
			if (Odi.conf.mode == 'ready'){
				Flux.next('module', 'tts', 'speak', { voice: 'espeak', lg: 'en', msg: 'Bad request' }, .5);
			}
			console.log(ip);
			Odi.error(request + ' ' + ip, false);
			res.status(401); // Unauthorized
			res.end();
		}
	};
	ui.use(logger);
	
	ui.get('/monitoring', function(req, res) {
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

	/** POST ALARM SETTING */
	ui.post('/alarm', function(req, res) {
		params = req.body;
		log.debug('UI > Alarm', params);
		// TODO déplacer dans ODI.time.setAlarm()
		var newAlarms = {};
		Object.keys(Odi.conf.alarms).forEach(function(key, index) {
			if (key == params.when) {
				newAlarms[key] = {
					h: params.hours,
					m: params.minutes,
					d: Odi.conf.alarms[key].d,
					mode: Odi.conf.alarms[key].mode
				};
				log.info('>> ' + params.when + ' alarm set to ' + params.h + '.' + params.m);
			} else {
				newAlarms[key] = Odi.conf.alarms[key];
			}
		});
		Odi.update({ alarms: newAlarms }, true);

		res.writeHead(200);
		res.end();
	});

	/** TOGGLE DEBUG MODE */
	ui.post('/toggleDebug', function(req, res) {
		log.debug('UI > Toggle debug');
		// ODI.config.update({debug: !Odi.conf.debug}, true);
		Odi.update({ debug: Odi.conf.debug ? 0 : 30 }, true);
		res.writeHead(200);
		res.end();
	});

	/** RESET Odi.conf */
	ui.post('/resetConfig', function(req, res) {
		log.debug('UI > Reset config');
		Odi.reset(true);
		res.writeHead(200);
		res.end();
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
		//var cpuTemp = ODI.hardware.getCPUTemp();
		//var cpuUsage = ODI.hardware.getCPUUsage();
		var dashboard = {
			config: Odi.conf,
			mode: {
				value: {
					// mode: isNaN(parseFloat(mode)) ? (Odi.conf.debug ? 'Debug' : 'Ready') : 'Sleep',
					mode: Odi.conf.mode != 'sleep' ? (Odi.conf.debug ? 'Debug' : 'Ready') : 'Sleep',
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
				// value: ODI.voiceMail.areThereAnyMessages(),
				// active: ODI.voiceMail.areThereAnyMessages() > 0 ? true : false
			},
			jukebox: { value: '<i>Soon available</i>', active: false },
			//timer: { value: ODI.time.timeLeftTimer(), active: ODI.time.timeLeftTimer() > 0 ? true : false },
			//hardware: { value: { usage: cpuUsage, temp: cpuTemp }, active: cpuTemp > 55 || cpuUsage >= 20 ? true : false },
			alarms: { value: Odi.conf.alarms, active: true },
			//config: {value: Odi.conf},
			version: { value: Odi.conf.version }, // DEPRECATED !
			debug: { value: Odi.conf.debug } // TO DEPRECATE...
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
		// Send Config file
		res.writeHead(200);
		//res.end(fs.readFileSync(Odi.CONFIG_FILE, 'utf8').toString());
		//console.debug(Odi.conf.toString());
		Odi.logArray();
		res.end(JSON.stringify(Odi.conf));
	});

	ui.get('/requestHistory', function(req, res) {
		// Send Request History
		res.writeHead(200);
		res.end(fs.readFileSync(FILE_REQUEST_HISTORY, 'utf8').toString());
	});

	ui.get('/voicemailHistory', function(req, res) {
		// Send Voicemail History
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
		// params = req.query;
		// var sleepTime;
		// if (params.hasOwnProperty('h')) {
		// 	sleepTime = params.h;
		// } else {
		// 	sleepTime = 255;
		// }
		// ODI.hardware.restartOdi(sleepTime); //255
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
			Odi.error('>> User NOT granted /!\\', false);
			Flux.next('module', 'tts', 'speak', {lg:'en', msg:'User NOT granted'}, .5);
		}
		res.send(granted);
		if (granted) granted = false;
	});

	// if(mode < 1){ /////// WHEN ALIVE
	if (Odi.conf.mode == 'ready') {
		ui.post('/tts', function(req, res) {
			// TTS ou Add Voice Mail Message
			var ttsMsg = req.query;
			// console.log(params);
			if (ttsMsg.voice && ttsMsg.lg && ttsMsg.msg) {
				if (ttsMsg.hasOwnProperty('voicemail')) {
					// ODI.voiceMail.addVoiceMailMessage({ voice: ttsMsg.voice, lg: ttsMsg.lg, msg: ttsMsg.msg });
				} else {
					// ODI.tts.speak({ voice: ttsMsg.voice, lg: ttsMsg.lg, msg: ttsMsg.msg });
				}
			} else {
				// ODI.tts.speak({ msg: 'RANDOM' }); // Random TTS
			}
			res.writeHead(200);
			res.end();
		});

		ui.post('/lastTTS', function(req, res) {
			// ODI.tts.lastTTS();
			res.writeHead(200);
			res.end();
		});

		ui.post('/checkVoiceMail', function(req, res) {
			// Check Voice Mail
			// if(!voiceMail.checkVoiceMail()){
			// 	ODI.tts.speak({voice: 'espeak', lg: 'en',msg: 'No voicemail message'});
			// }
			/*ODI.voiceMail.checkVoiceMail(function(anyMessage) {
				console.log(anyMessage);
				if (!anyMessage) {
					//ODI.tts.speak({voice: 'espeak', lg: 'en',msg: 'No voicemail message'});
					ODI.tts.speak({ voice: 'espeak', lg: 'en', msg: 'No voicemail message' });
				}
			});*/
			res.writeHead(200);
			res.end();
		});

		ui.post('/clearVoiceMail', function(req, res) {
			// Clear Voice Mail
			// ODI.voiceMail.clearVoiceMail();
			res.writeHead(200);
			res.end();
		});

		ui.post('/conversation', function(req, res) {
			// Conversation
			// ODI.tts.randomConversation();
			res.writeHead(200);
			res.end();
		});

		ui.post('/idea', function(req, res) {
			// Idea...
			// params = req.query;
			// ODI.tts.speak('en', 'I\'ve got an idea !');
			// ODI.tts.speak({ lg: 'en', msg: "I've got an idea !" });
			res.writeHead(200);
			res.end();
		});

		ui.post('/badBoy', function(req, res) {
			// Bad Boy...
			params = req.body;
			log.debug('/badBoy', params);
			// ODI.service.badBoy(params.value);
			res.writeHead(200);
			res.end();
		});

		ui.post('/adriExclamation', function(req, res) {
			// ODI.service.adriExclamation();
			res.writeHead(200);
			res.end();
		});

		ui.post('/russia', function(req, res) {
			// Russia
			params = req.query;
			log.debug('/russia', params);
			if (params.hasOwnProperty('hymn')) {
				//exclamation.russiaLoop();
				spawn('sh', [Odi._SHELL + 'music.sh', 'urss']);
				// ODI.leds.altLeds(70, 20);
			} else {
				// ODI.exclamation.russia();
			}
			res.writeHead(200);
			res.end();
		});

		ui.post('/exclamation', function(req, res) {
			// Exclamation
			// ODI.exclamation.exclamation();
			res.writeHead(200);
			res.end();
		});

		ui.post('/exclamationLoop', function(req, res) {
			// Exclamation Loop
			// ODI.exclamation.exclamationLoop();
			res.writeHead(200);
			res.end();
		});

		ui.post('/fip', function(req, res) {
			// FIP Radio
			// ODI.jukebox.playFip();
			res.writeHead(200);
			res.end();
		});

		ui.post('/music/*', function(req, res) {
			//
			var song; // RECUPERER LE NOM DE LA CHANSON
			if (!song) song = 'mouthTrick';
			spawn('sh', [Odi._SHELL + 'music.sh', song]);
			res.writeHead(200);
			res.end();
		});

		ui.post('/jukebox', function(req, res) {
			// Jukebox
			// ODI.jukebox.loop();
			res.writeHead(200);
			res.end();
		});

		ui.post('/medley', function(req, res) {
			// Medley
			// ODI.jukebox.medley();
			res.writeHead(200);
			res.end();
		});

		ui.post('/naheulbeuk', function(req, res) {
			// Nahleubeuk
			spawn('sh', [Odi._SHELL + 'sounds.sh', 'Naheulbeuk']);
			res.writeHead(200);
			res.end();
		});

		ui.post('/survivaure', function(req, res) {
			// Survivaure
			spawn('sh', [Odi._SHELL + 'sounds.sh', 'Survivaure']);
			res.writeHead(200);
			res.end();
		});

		ui.post('/playVideo', function(req, res) {
			// Play Video
			// ODI.video.startCycle();
			res.writeHead(200);
			res.end();
		});

		ui.post('/videoOff', function(req, res) {
			// Sleep Screen
			// ODI.video.screenOff();
			res.writeHead(200);
			res.end();
		});

		ui.post('/date', function(req, res) {
			// Date
			// ODI.time.today();
			res.writeHead(200);
			res.end();
		});

		ui.post('/age', function(req, res) {
			// Odi's Age
			// ODI.time.sayOdiAge();
			res.writeHead(200);
			res.end();
		});

		ui.post('/time', function(req, res) {
			// Time
			// ODI.time.now();
			res.writeHead(200);
			res.end();
		});

		ui.post('/timer', function(req, res) {
			// Timer
			params = req.query;
			if (!isNaN(params.m)) {
				log.info('!isNaN(params.m)');
				var min = parseInt(params.m, 10);
				log.info(min);
				// ODI.time.setTimer(min);
			} else if (params.hasOwnProperty('stop')) {
				// ODI.time.stopTimer();
			} else {
				// ODI.time.setTimer();
			}
			res.writeHead(200);
			res.end();
		});

		ui.post('/weather', function(req, res) {
			// Weather
			// ODI.service.weather();
			res.writeHead(200);
			res.end();
		});
		ui.post('/weatherInteractive', function(req, res) {
			// Weather
			// ODI.service.weatherInteractive();
			res.writeHead(200);
			res.end();
		});

		ui.post('/info', function(req, res) {
			// Info
			// ODI.service.info();
			res.writeHead(200);
			res.end();
		});

		ui.post('/cpuTemp', function(req, res) {
			// TTS CPU Temp
			// ODI.service.cpuTemp();
			res.writeHead(200);
			res.end();
		});

		ui.post('/cigales', function(req, res) {
			// Cigales
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
			// Set Party Mode
			spawn('sh', [Odi._SHELL + 'sounds.sh', 'test']); //mouthTrick
			res.writeHead(200);
			res.end();
		});
		ui.post('/*', function(req, res) {
			// Redirect Error
			log.info('UI > I’m a teapot !');
			res.writeHead(418);
			res.end();
		});
	} else {
		ui.post('/tts', function(req, res) {
			// Add Voice Mail Message
			params = req.query;
			// console.log(params);
			if (params['voice'] && params['lg'] && params['msg']) {
				// ODI.voiceMail.addVoiceMailMessage({ lg: params['lg'], voice: params['voice'], msg: params['msg'] });
				res.writeHead(200);
				res.end();
			} else {
				Odi.error('Error while saving voiceMail message:', params);
				res.writeHead(424);
				res.end();
			}
		});

		ui.post('/*', function(req, res) {
			Odi.error('Odi not allowed to interact  -.-', false);
			res.writeHead(401);
			res.end();
		});
	}

	ui.listen(8080, function() {
		// Listen port 8080
		log.info('UI server started [' + Odi.conf.mode + ']');
		Flux.next('module', 'led', 'blink', { leds: ['satellite'], speed: 120, loop: 3 }, null, null, 'hidden');
	});
}
