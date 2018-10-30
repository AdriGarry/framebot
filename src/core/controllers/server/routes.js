#!/usr/bin/env node

// Route sub-module (server)

const { spawn, exec } = require('child_process');
const fs = require('fs'),
	formidable = require('formidable');
// upload = multer({ storage: multer.memoryStorage() });

const Core = require(_PATH + 'src/core/Core.js').Core,
	log = new (require(Core._CORE + 'Logger.js'))(__filename.match(/(\w*).js/g)[0]),
	Utils = require(_PATH + 'src/core/Utils.js'),
	admin = require(Core._SECURITY + 'admin.js').init(Core._SECURITY);

const FILE_REQUEST_HISTORY = Core._LOG + Core.name + '_requestHistory.log';
const FILE_ERROR_HISTORY = Core._LOG + Core.name + '_errorHistory.json';
const FILE_TTS_UI_HISTORY = Core._LOG + Core.name + '_ttsUIHistory.json';
const FILE_VOICEMAIL_HISTORY = Core._LOG + Core.name + '_voicemailHistory.json';

module.exports = {
	attachRoutes: attachRoutes
};

function attachRoutes(ui) {
	attachDefaultRoutes(ui);
	if (Core.isAwake()) {
		attachAwakeRoutes(ui);
	} else {
		attachSleepRoutes(ui);
	}
}

function attachDefaultRoutes(ui) {
	/** DASHBOARD SECTION */
	ui.get('/dashboard', function(req, res) {
		Core.do('interface|hardware|runtime');
		var etatBtn = Core.run('etat');
		var cpuTemp = Core.run('cpu.temp');
		var cpuUsage = Core.run('cpu.usage');
		var dashboard = {
			config: Core.conf(),
			errors: Core.errors,
			mode: {
				value: {
					mode:
						Core.conf('log') == 'trace'
							? 'Trace'
							: Core.conf('log') == 'debug'
								? 'Debug'
								: Utils.firstLetterUpper(Core.conf('mode')),
					param: Core.conf('startTime'),
					switch: etatBtn == 'high' ? true : false
				}
			},
			switch: {
				value: etatBtn,
				active: etatBtn ? true : false
			},
			volume: {
				value: Core.run('volume'),
				active: etatBtn == 1 ? true : false
			},
			voicemail: {
				value: Core.run('voicemail'),
				active: Core.run('voicemail') > 0 ? true : false
			},
			music: {
				value: Core.run('music'),
				active: false
			},
			timer: {
				value: Core.run('timer'),
				active: Core.run('timer') > 0 ? true : false
			},
			hardware: {
				value: {
					usage: cpuUsage,
					temp: cpuTemp,
					memory: {
						odi: Core.run('memory.odi'),
						system: Core.run('memory.system')
					}
				},
				active: cpuTemp > 55 || cpuUsage >= 20 ? true : false
			},
			alarms: {
				value: Core.conf('alarms'),
				active: true
			},
			update: {
				value: Core.run('stats.update')
			},
			version: {
				value: 'toto' /*Core.conf('version')*/
			}, // DEPRECATED !
			debug: {
				value: Core.conf('log') == 'debug' ? 'debug' : ''
			},
			trace: {
				value: Core.conf('log') == 'trace' ? 'trace' : ''
			},
			watcher: {
				value: Core.conf('watcher')
			}
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
		log.table(Core.conf(), 'CONFIG');
		// res.end(fs.readFileSync(Core._CONF, 'utf8').toString());
		res.end(JSON.stringify(Core.conf())); // TODO useless ?
	});

	ui.get('/runtime', function(req, res) {
		Core.do('interface|hardware|runtime');
		log.table(Core.run(), 'RUNTIME...       ' + Core.run('memory.loadAverage'));
		res.end(JSON.stringify(Core.run()));
	});

	ui.get('/errors', function(req, res) {
		res.end(JSON.stringify(Core.errors));
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
		res.end(fs.readFileSync(_PATH + 'README.md', 'utf8').toString());
	});

	/** ==> POST SECTION */
	ui.post('/odi', function(req, res) {
		Core.do('service|system|restart', null, {
			delay: 1
		});

		res.end();
	});

	// const audioRecordUpload = multer({
	// 	storage: multer.memoryStorage(),
	// 	fileFilter: function(req, file, callback) {
	// 		log.info('\naudioRecordUpload');
	// 		let ext = path.extname(file.originalname);

	// 		if (ext !== '.wav') {
	// 			return callback(Core.error('Only images are allowed' + exc, file));
	// 		}

	// 		callback(null, true);
	// 	}
	// }).single('post_image');

	// var Storage = multer.diskStorage({
	// 	destination: function(req, file, callback) {
	// 		callback(null, 'toto/');
	// 	},
	// 	filename: function(req, file, callback) {
	// 		callback(null, file.fieldname + '_' + Date.now() + '.wav');
	// 	}
	// });
	// var upload = multer({ storage: Storage }).single('audioPath');

	// ui.post('/audio', upload.single('somefile.wav'), function(req, res) {
	ui.post('/audio', function(req, res) {
		log.INFO('Audio received !!!');
		log.info(JSON.stringify(res.headers));
		console.log(req.body, req.files);

		// log.info(req.body);
		// new formidable.IncomingForm().parse(req, (err, fields, files) => {
		// 	if (err) {
		// 		console.error('Error', err);
		// 		throw err;
		// 	}
		// 	console.log('Fields', fields);
		// 	console.log('Files', files);
		// 	files.map(file => {
		// 		console.log(file);
		// 	});
		// });
		// log.info(req.file);
		// log.info(req.files);

		// log.info(req.file);
		// console.log('RECIEVED AUDIO TO EXTRACT INDICATORS: ');

		// fs.writeFile('sample.wav', req.body, function(err) {
		// 	if (err) {
		// 		log.error('Error while writing audio file', err);
		// 		res.statusCode = 503;
		// 		res.end();
		// 	}
		// 	log.INFO('...............THIS IS OK !');
		// 	res.end();
		// });
		// Core.do('service|system|restart');
	});

	ui.post('/toggleDebug', function(req, res) {
		log.info('UI > Toggle debug');
		let newLogLevel = log.level() == 'debug' ? 'info' : 'debug';
		log.level(newLogLevel);
		// Core.do('interface|runtime|update', {
		// 	log: newLogLevel
		// });
		// Core.conf('log', newLogLevel, false, true);
		res.end();
	});

	ui.post('/toggleTrace', function(req, res) {
		log.info('UI > Toggle trace');
		let newLogLevel = log.level() == 'trace' ? 'info' : 'trace';
		log.level(newLogLevel);
		Core.do('interface|runtime|update', {
			log: newLogLevel
		});
		// Core.conf('log', newLogLevel, false, true);
		res.end();
	});

	ui.post('/testSequence', function(req, res) {
		Core.do(
			'interface|runtime|updateRestart',
			{
				mode: 'test'
			},
			{
				delay: 1
			}
		);
		res.end();
	});

	ui.post('/watcher', function(req, res) {
		if (Core.conf('watcher')) {
			Core.do('controller|watcher|stopWatch');
		} else {
			Core.do('controller|watcher|startWatch');
		}
		res.end();
	});

	ui.post('/volume/:volume', function(req, res) {
		if (Core.isAwake()) {
			Core.do('interface|sound|volume', req.params.volume);
			res.end();
		} else {
			log.error("Can't ajust volume in " + Core.conf('mode') + ' mode');
			res.statusCode = 503;
			res.end();
		}
	});

	ui.post('/demo', function(req, res) {
		Core.do('service|interaction|demo');
		res.end();
	});

	ui.post('/resetConfig', function(req, res) {
		log.debug('UI > Reset config');
		Core.do('interface|runtime|reset', true, {
			delay: 1
		});
		res.end();
	});

	ui.post('/sleep', function(req, res) {
		Core.do('service|system|restart', 'sleep', {
			delay: 1
		});
		res.end();
	});

	ui.post('/reboot', function(req, res) {
		Core.do('service|system|reboot', null, {
			delay: 1
		});
		res.end();
	});

	ui.post('/shutdown', function(req, res) {
		Core.do('service|system|shutdown', null, {
			delay: 1
		});
		res.end();
	});

	ui.post('/light', function(req, res) {
		Core.do('service|system|light', 120);
		res.end();
	});

	ui.post('/mute', function(req, res) {
		Core.do('interface|sound|mute');
		res.end();
	});

	ui.post('/alarm', function(req, res) {
		let params = req.body;
		Core.do('service|time|setAlarm', params);
		res.end();
	});

	ui.post('/alarmOff', function(req, res) {
		Core.do('service|time|alarmOff');
		res.end();
	});

	ui.post('/archiveLog', function(req, res) {
		Core.do('interface|hardware|archiveLog');
		res.end();
	});

	var granted = false;
	ui.post('/grant', function(req, res) {
		var pattern = req.headers.pwd;
		if (pattern && admin.checkPassword(pattern)) {
			granted = true;
			log.info('>> Admin granted !');
		} else {
			Core.error('>> User NOT granted /!\\', pattern, false);
			Core.do(
				'interface|tts|speak',
				{
					lg: 'en',
					msg: 'User NOT granted'
				},
				{
					delay: 0.5
				}
			);
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
				Core.do('service|voicemail|new', {
					voice: params.voice,
					lg: params.lg,
					msg: params.msg
				});
			} else {
				Core.do('interface|tts|speak', {
					voice: params.voice,
					lg: params.lg,
					msg: params.msg
				});
			}
			params.timestamp = Utils.logTime('D/M h:m:s', new Date());
			Utils.appendJsonFile(FILE_TTS_UI_HISTORY, params);
		} else {
			Core.do('interface|tts|random');
		}
		res.end();
	});

	ui.post('/lastTTS', function(req, res) {
		Core.do('interface|tts|lastTTS');
		res.end();
	});

	ui.post('/checkVoiceMail', function(req, res) {
		Core.do('service|voicemail|check', true);
		res.end();
	});

	ui.post('/clearVoiceMail', function(req, res) {
		Core.do('service|voicemail|clear');
		res.end();
	});

	ui.post('/idea', function(req, res) {
		Core.do('interface|tts|speak', {
			lg: 'en',
			msg: "I've got an idea !"
		});
		res.end();
	});

	ui.post('/badBoy', function(req, res) {
		let params = req.body;
		log.debug('/badBoy', params);
		Core.do('service|mood|badBoy', params.value);
		res.end();
	});

	ui.post('/java', function(req, res) {
		let params = req.body;
		log.debug('/java', params);
		Core.do('service|mood|java', params.value);
		res.end();
	});

	ui.post('/russia', function(req, res) {
		let params = req.query;
		log.debug('/russia', params);
		if (params.hasOwnProperty('hymn')) {
			Core.do('interface|sound|play', {
				mp3: 'jukebox/HymneSovietique.mp3'
			});
			Core.do(
				'interface|led|altLeds',
				{
					speed: 70,
					loop: 20
				},
				{
					hidden: true
				}
			);
		} else {
			Core.do('service|interaction|russia');
		}
		res.end();
	});

	ui.post('/exclamation', function(req, res) {
		Core.do('service|interaction|exclamation');
		res.end();
	});

	ui.post('/fip', function(req, res) {
		Core.do('service|music|fip');
		res.end();
	});

	ui.post('/music/*', function(req, res) {
		let song; //TODO RECUPERER LE NOM DE LA CHANSON
		if (!song) song = 'mouthTrick.mp3';
		Core.do('interface|sound|play', {
			mp3: 'jukebox/' + song
		});
		res.end();
	});

	ui.post('/jukebox', function(req, res) {
		Core.do('service|music|jukebox');
		res.end();
	});

	ui.post('/naheulbeuk', function(req, res) {
		Core.do('service|music|story', 'Naheulbeuk');
		res.end();
	});

	ui.post('/survivaure', function(req, res) {
		Core.do('service|music|story', 'Survivaure');
		res.end();
	});

	ui.post('/arduino/connect', function(req, res) {
		Core.do('interface|arduino|connect');
		res.end();
	});

	ui.post('/arduino/stop', function(req, res) {
		Core.do('interface|arduino|disconnect');
		res.end();
	});

	ui.post('/max/blinkAllLed', function(req, res) {
		Core.do('service|max|blinkAllLed');
		res.end();
	});

	ui.post('/max/blinkRdmLed', function(req, res) {
		Core.do('service|max|blinkRdmLed');
		res.end();
	});

	ui.post('/max/playOneMelody', function(req, res) {
		Core.do('service|max|playOneMelody');
		res.end();
	});

	ui.post('/max/playRdmMelody', function(req, res) {
		Core.do('service|max|playRdmMelody');
		res.end();
	});

	ui.post('/max/hornRdm', function(req, res) {
		Core.do('service|max|hornRdm');
		res.end();
	});

	ui.post('/max/turn', function(req, res) {
		Core.do('service|max|turn');
		res.end();
	});

	ui.post('/playVideo', function(req, res) {
		Core.do('interface|video|cycle');
		res.end();
	});

	ui.post('/videoOff', function(req, res) {
		Core.do('interface|video|screenOff');
		res.end();
	});

	ui.post('/time', function(req, res) {
		Core.do('service|time|now');
		res.end();
	});

	ui.post('/date', function(req, res) {
		Core.do('service|time|today');
		res.end();
	});

	ui.post('/birthday', function(req, res) {
		Core.do('service|time|birthday');
		res.end();
	});

	ui.post('/age', function(req, res) {
		Core.do('service|time|age');
		res.end();
	});

	ui.post('/timer', function(req, res) {
		let params = req.query; // affiner pour récupérer les params
		if (params.hasOwnProperty('stop')) {
			Core.do('service|time|timer', 'stop');
		} else {
			var min = parseInt(params.min, 10) || 1;
			Core.do('service|time|timer', min);
		}
		res.end();
	});

	ui.post('/weather', function(req, res) {
		Core.do('service|weather|report');
		res.end();
	});
	ui.post('/weatherAlternative', function(req, res) {
		Core.do('service|weather|alternative');
		res.end();
	});

	ui.post('/maya/lePetitVer', function(req, res) {
		Core.do('interface|sound|play', {
			mp3: 'maya/songs/lePetitVer.mp3'
		});
		res.end();
	});

	ui.post('/maya/comptine', function(req, res) {
		Core.do('service|maya|comptine');
		res.end();
	});

	ui.post('/maya/goodNight', function(req, res) {
		Core.do('interface|tts|speak', {
			voice: 'google',
			msg: 'Bonne nuit Maya'
		});
		Core.do('interface|tts|speak', 'Oui, fais de beaux reves !');
		res.end();
	});

	ui.post('/cpuTTS', function(req, res) {
		Core.do('interface|hardware|cpuTTS');
		res.end();
	});

	ui.post('/soulTTS', function(req, res) {
		Core.do('interface|hardware|soulTTS');
		res.end();
	});

	ui.post('/diskSpaceTTS', function(req, res) {
		Core.do('interface|hardware|diskSpaceTTS');
		res.end();
	});

	ui.post('/totalLinesTTS', function(req, res) {
		Core.do('interface|hardware|totalLinesTTS');
		res.end();
	});

	ui.post('/cigales', function(req, res) {
		Core.do('interface|sound|play', {
			mp3: 'system/cigales.mp3'
		});
		res.end();
	});

	ui.post('/setParty', function(req, res) {
		Core.do('service|party|start');
		res.end();
	});

	ui.post('/partyTTS', function(req, res) {
		Core.do('service|party|tts');
		res.end();
	});

	ui.post('/pirate', function(req, res) {
		Core.do('service|party|pirate');
		res.end();
	});

	ui.post('/test', function(req, res) {
		Core.do('interface|tts|speak', {
			lg: 'en',
			msg: '.undefined'
		});
		res.end();
	});

	ui.post('/*', function(req, res) {
		Core.error('Error UI > not mapped: ' + req.url, null, false);
		res.writeHead(401);
		res.end();
	});
}

function attachSleepRoutes(ui) {
	ui.post('/tts', function(req, res) {
		// Add Voice Mail Message
		let params = req.query;
		if (params['voice'] && params['lg'] && params['msg']) {
			Core.do('service|voicemail|new', {
				voice: params.voice,
				lg: params.lg,
				msg: params.msg
			});
			params.timestamp = Utils.logTime('D/M h:m:s', new Date());
			Utils.appendJsonFile(FILE_TTS_UI_HISTORY, params);
			res.end();
		} else {
			Core.error('Error while saving voiceMail message:', params);
			res.writeHead(424); // TODO changer ce code ?
			res.end();
		}
	});

	ui.post('/*', function(req, res) {
		Core.error('Sleep mode, not allowed to interact  -.-', null, false);
		res.writeHead(401);
		res.end();
	});
}

function prepareLogs(lines, callback) {
	var content = fs
		.readFileSync(Core._LOG + Core.name + '.log', 'UTF-8')
		.toString()
		.split('\n');
	content = content.slice(-lines); //-120
	content = content.join('\n');
	callback(content);
	return content;
}
