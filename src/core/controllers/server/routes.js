#!/usr/bin/env node

// Route sub-module (server)

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
const log = new (require(Odi._CORE + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]);
const Flux = require(Odi._CORE + 'Flux.js');
const Utils = require(ODI_PATH + 'src/core/Utils.js');
const admin = require(ODI_PATH + 'src/core/services/admin.js');
const spawn = require('child_process').spawn;
const fs = require('fs');

const FILE_REQUEST_HISTORY = ODI_PATH + 'log/requestHistory.log';
const FILE_ERROR_HISTORY = ODI_PATH + 'log/errorHistory.json';
const FILE_TTS_UI_HISTORY = Odi._LOG + 'ttsUIHistory.json';
const FILE_VOICEMAIL_HISTORY = ODI_PATH + 'log/voicemailHistory.json';

module.exports = {
	attachRoutes: attachRoutes
};

function attachRoutes(ui) {
	attachDefaultRoutes(ui);
	if (Odi.isAwake()) {
		attachAwakeRoutes(ui);
	} else {
		attachSleepRoutes(ui);
	}
}
function attachDefaultRoutes(ui) {
	/** DASHBOARD SECTION */
	ui.get('/dashboard', function(req, res) {
		Flux.next('interface|hardware|runtime');
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
							: Odi.conf('log') == 'debug'
								? 'Debug'
								: Utils.firstLetterUpper(Odi.conf('mode')),
					param: Odi.conf('startTime'),
					switch: etatBtn == 'high' ? true : false
				}
			},
			switch: { value: etatBtn, active: etatBtn ? true : false },
			volume: {
				value: Odi.run('volume'),
				active: etatBtn == 1 ? true : false
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
		res.end(JSON.stringify(dashboard));
	});

	/** ==> GET SECTION */
	ui.get('/log', function(req, res) {
		// Send Logs to UI
		var logSize = 100;
		let params = req.query;
		if (params.hasOwnProperty('logSize') && !isNaN(params.logSize)) {
			logSize = parseInt(params.logSize);
		}
		prepareLogs(logSize, function(log) {
			res.end(log);
		});
	});

	ui.get('/config.json', function(req, res) {
		res.end(fs.readFileSync(Odi._CONF, 'utf8').toString());
		log.table(Odi.conf(), 'CONFIG');
		res.end(JSON.stringify(Odi.conf()));
	});

	ui.get('/runtime', function(req, res) {
		Flux.next('interface|hardware|runtime');
		log.table(Odi.run(), 'RUNTIME...');
		res.end(JSON.stringify(Odi.run()));
	});

	ui.get('/errors', function(req, res) {
		res.end(JSON.stringify(Odi.errors));
	});

	ui.get('/errorHistory', function(req, res) {
		res.end(fs.readFileSync(FILE_ERROR_HISTORY, 'utf8').toString());
	});

	ui.get('/requestHistory', function(req, res) {
		res.end(fs.readFileSync(FILE_REQUEST_HISTORY, 'utf8').toString());
	});

	ui.get('/ttsUIHistory', function(req, res) {
		res.end(fs.readFileSync(FILE_TTS_UI_HISTORY, 'utf8').toString());
	});

	ui.get('/voicemailHistory', function(req, res) {
		res.end(fs.readFileSync(FILE_VOICEMAIL_HISTORY, 'utf8').toString());
	});

	ui.get('/about', function(req, res) {
		res.end(fs.readFileSync(ODI_PATH + 'README.md', 'utf8').toString());
	});

	/** ==> POST SECTION */
	ui.post('/odi', function(req, res) {
		Flux.next('service|system|restart', null, { delay: 1 });

		res.end();
	});

	ui.post('/toggleDebug', function(req, res) {
		log.info('UI > Toggle debug');
		let newLogLevel = log.level() == 'debug' ? 'info' : 'debug';
		log.level(newLogLevel);
		Flux.next('interface|runtime|update', { log: newLogLevel });
		// Odi.conf('log', newLogLevel, false, true);
		res.end();
	});

	ui.post('/toggleTrace', function(req, res) {
		log.info('UI > Toggle trace');
		let newLogLevel = log.level() == 'trace' ? 'info' : 'trace';
		log.level(newLogLevel);
		Flux.next('interface|runtime|update', { log: newLogLevel });
		// Odi.conf('log', newLogLevel, false, true);
		res.end();
	});

	ui.post('/testSequence', function(req, res) {
		Flux.next('interface|runtime|updateRestart', { mode: 'test' }, { delay: 1 });
		res.end();
	});

	ui.post('/watcher', function(req, res) {
		if (Odi.conf('watcher')) {
			Flux.next('controller|watcher|stopWatch');
		} else {
			Flux.next('controller|watcher|startWatch');
		}
		res.end();
	});

	ui.post('/demo', function(req, res) {
		Flux.next('service|interaction|demo');
		res.end();
	});

	ui.post('/resetConfig', function(req, res) {
		log.debug('UI > Reset config');
		Flux.next('interface|runtime|reset', true, { delay: 1 });
		res.end();
	});

	ui.post('/sleep', function(req, res) {
		Flux.next('service|system|restart', 'sleep', { delay: 1 });
		res.end();
	});

	ui.post('/reboot', function(req, res) {
		Flux.next('service|system|reboot', null, { delay: 1 });
		res.end();
	});

	ui.post('/shutdown', function(req, res) {
		Flux.next('service|system|shutdown', null, { delay: 1 });
		res.end();
	});

	ui.post('/light', function(req, res) {
		Flux.next('service|system|light', 30);
		res.end();
	});

	ui.post('/mute', function(req, res) {
		Flux.next('interface|sound|mute');
		res.end();
	});

	ui.post('/alarm', function(req, res) {
		let params = req.body;
		Flux.next('service|time|setAlarm', params);
		res.end();
	});

	ui.post('/alarmOff', function(req, res) {
		Flux.next('service|time|alarmOff');
		res.end();
	});

	ui.post('/archiveLog', function(req, res) {
		Flux.next('interface|hardware|archiveLog');
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
}

function attachAwakeRoutes(ui) {
	ui.post('/tts', function(req, res) {
		let params = req.query;
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
		res.end();
	});

	ui.post('/lastTTS', function(req, res) {
		Flux.next('interface|tts|lastTTS');
		res.end();
	});

	ui.post('/checkVoiceMail', function(req, res) {
		Flux.next('service|voicemail|check', true);
		res.end();
	});

	ui.post('/clearVoiceMail', function(req, res) {
		Flux.next('service|voicemail|clear');
		res.end();
	});

	ui.post('/idea', function(req, res) {
		Flux.next('interface|tts|speak', { lg: 'en', msg: "I've got an idea !" });
		res.end();
	});

	ui.post('/badBoy', function(req, res) {
		let params = req.body;
		log.debug('/badBoy', params);
		Flux.next('service|mood|badBoy', params.value);
		res.end();
	});

	ui.post('/java', function(req, res) {
		let params = req.body;
		log.debug('/java', params);
		Flux.next('service|mood|java', params.value);
		res.end();
	});

	ui.post('/russia', function(req, res) {
		let params = req.query;
		log.debug('/russia', params);
		if (params.hasOwnProperty('hymn')) {
			spawn('sh', [Odi._SHELL + 'music.sh', 'urss']);
			Flux.next('interface|led|altLeds', { speed: 70, loop: 20 }, { hidden: true });
		} else {
			Flux.next('service|interaction|russia');
		}
		res.end();
	});

	ui.post('/exclamation', function(req, res) {
		Flux.next('service|interaction|exclamation');
		res.end();
	});

	ui.post('/fip', function(req, res) {
		Flux.next('service|music|fip');
		res.end();
	});

	ui.post('/music/*', function(req, res) {
		var song; // RECUPERER LE NOM DE LA CHANSON
		if (!song) song = 'mouthTrick';
		spawn('sh', [Odi._SHELL + 'music.sh', song]);
		res.end();
	});

	ui.post('/jukebox', function(req, res) {
		Flux.next('service|music|jukebox');
		res.end();
	});

	ui.post('/naheulbeuk', function(req, res) {
		Flux.next('service|music|story', 'Naheulbeuk');
		res.end();
	});

	ui.post('/survivaure', function(req, res) {
		Flux.next('service|music|story', 'Survivaure');
		res.end();
	});

	ui.post('/arduino/connect', function(req, res) {
		Flux.next('interface|arduino|connect');
		res.end();
	});

	ui.post('/arduino/stop', function(req, res) {
		Flux.next('interface|arduino|stop');
		res.end();
	});

	ui.post('/max/blinkAllLed', function(req, res) {
		Flux.next('service|max|blinkAllLed');
		res.end();
	});

	ui.post('/max/blinkRdmLed', function(req, res) {
		Flux.next('service|max|blinkRdmLed');
		res.end();
	});

	ui.post('/max/playOneMelody', function(req, res) {
		Flux.next('service|max|playOneMelody');
		res.end();
	});

	ui.post('/max/playRdmMelody', function(req, res) {
		Flux.next('service|max|playRdmMelody');
		res.end();
	});

	ui.post('/max/hornRdm', function(req, res) {
		Flux.next('service|max|hornRdm');
		res.end();
	});

	ui.post('/max/turn', function(req, res) {
		Flux.next('service|max|turn');
		res.end();
	});

	ui.post('/playVideo', function(req, res) {
		Flux.next('interface|video|cycle');
		res.end();
	});

	ui.post('/videoOff', function(req, res) {
		Flux.next('interface|video|screenOff');
		res.end();
	});

	ui.post('/time', function(req, res) {
		Flux.next('service|time|now');
		res.end();
	});

	ui.post('/date', function(req, res) {
		Flux.next('service|time|today');
		res.end();
	});

	ui.post('/birthday', function(req, res) {
		Flux.next('service|time|birthday');
		res.end();
	});

	ui.post('/age', function(req, res) {
		Flux.next('service|time|OdiAge');
		res.end();
	});

	ui.post('/timer', function(req, res) {
		let params = req.query; // affiner pour récupérer les params
		if (params.hasOwnProperty('stop')) {
			Flux.next('service|time|timer', 'stop');
		} else {
			var min = parseInt(params.min, 10) || 1;
			Flux.next('service|time|timer', min);
		}
		res.end();
	});

	ui.post('/weather', function(req, res) {
		Flux.next('service|interaction|weather');
		res.end();
	});
	ui.post('/weatherInteractive', function(req, res) {
		Flux.next('service|interaction|weather', 'interactive');
		res.end();
	});

	ui.post('/cpuTTS', function(req, res) {
		Flux.next('interface|hardware|cpuTTS');
		res.end();
	});

	ui.post('/soulTTS', function(req, res) {
		Flux.next('interface|hardware|soulTTS');
		res.end();
	});

	ui.post('/diskSpaceTTS', function(req, res) {
		Flux.next('interface|hardware|diskSpaceTTS');
		res.end();
	});

	ui.post('/totalLinesTTS', function(req, res) {
		Flux.next('interface|hardware|totalLinesTTS');
		res.end();
	});

	ui.post('/cigales', function(req, res) {
		spawn('sh', [Odi._SHELL + 'sounds.sh', 'cigales']);
		res.end();
	});

	ui.post('/setParty', function(req, res) {
		Flux.next('service|party|start');
		res.end();
	});

	ui.post('/partyTTS', function(req, res) {
		Flux.next('service|party|tts');
		res.end();
	});

	ui.post('/pirate', function(req, res) {
		Flux.next('service|party|pirate');
		res.end();
	});

	ui.post('/test', function(req, res) {
		spawn('sh', [Odi._SHELL + 'sounds.sh', 'test']); //mouthTrick
		Flux.next('interface|tts|speak', { lg: 'en', msg: '.undefined' });
		res.end();
	});

	ui.post('/*', function(req, res) {
		Odi.error('Error UI > not mapped: ' + req.url, null, false);
		res.writeHead(418);
		res.end();
	});
}

function attachSleepRoutes(ui) {
	ui.post('/tts', function(req, res) {
		// Add Voice Mail Message
		let params = req.query;
		if (params['voice'] && params['lg'] && params['msg']) {
			Flux.next('service|voicemail|new', { voice: params.voice, lg: params.lg, msg: params.msg });
			params.timestamp = Utils.logTime('D/M h:m:s', new Date());
			Utils.appendJsonFile(FILE_TTS_UI_HISTORY, params);
			res.end();
		} else {
			Odi.error('Error while saving voiceMail message:', params);
			res.writeHead(424); // TODO changer ce code ?
			res.end();
		}
	});

	ui.post('/*', function(req, res) {
		Odi.error('Sleep mode, not allowed to interact  -.-', null, false);
		res.writeHead(401);
		res.end();
	});
}

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
