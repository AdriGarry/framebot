#!/usr/bin/env node

// Module server
/** Liste codes http
 *		200 : OK
 *		401 : Unauthorized (sleep)
 *		418 : I'm a teapot ! (autres requetes POST)
 *		424 : Method failure (erreur)
  */

var _express = require('express');
var _compression = require('compression');
var _path = require("path");
var _spawn = require('child_process').spawn;
var _fs = require('fs');
var _utils = require('./utils.js');
var _leds = require('./leds.js');
var _buttons = require('./buttons.js');
var _tts = require('./tts.js');
var _voiceMail = require('./voiceMail.js');
var _service = require('./service.js');
// var _timer = require('./timer.js');
var _fip = require('./fip.js');
var _jukebox = require('./jukebox.js');
var _exclamation = require('./exclamation.js');
var _party = require('./party.js');
var _admin = require('./admin.js');
var self = this;


// _tts.new({msg:'Leonard ou es tu ?'});

/*var DIR_NAME = '/home/pi/odi/core/';
var DIR_NAME_WEB = '/home/pi/odi/web/';*/
var FILE_REQUEST_HISTORY = LOG_PATH + 'requestHistory.log';
var FILE_GRANT = DATA_PATH + 'pwd.properties';
var FILE_VOICEMAIL_HISTORY = LOG_PATH + 'voicemailHistory.log';

var _deploy;

exports.startUI = function startUI(mode){
	var ui = _express();
	var request, method, params, ipClient;

	ui.use(_compression()); // Compression web
	ui.use(_express.static(WEB_PATH)); // Pour fichiers statiques

	ui.get('/', function (req, res) { // Init UI
		res.sendFile(_path.join(WEB_PATH + 'index.html'));
		ipClient = req.connection.remoteAddress;
		console.log('UI initialized [' + ipClient + ']');
		_leds.blink({leds : ['satellite'], speed : 100, loop : 3});
		console.log('MODE');
		console.log(mode);
		if(mode < 1){
			deploy = _spawn('sh', [CORE_PATH + 'sh/sounds.sh', 'UI']);
		}
		//res.set('Content-Type', 'text/javascript');
	});

	// Middleware LOGGER
	var logger = function(req, res, next){
		res.header("Access-Control-Allow-Origin", "http://adrigarry.com");
		_leds.blink({leds : ['satellite'], speed : 180, loop : 1});
		method = req.method;
		/*if(method == 'GET') method = '< ';
		else method = '> ';
		request = ' Odi' + (method == 'GET' ? ' > ' : ' < ');*/
		request = (req.headers.ui ? 'UI' + req.headers.ui + ' ' : '??? ') + req.url.replace('%20',' ') + ' [' + req.connection.remoteAddress + ']';
		console.log(request);

		if(req.connection.remoteAddress.indexOf('192.168') == -1){
			_fs.appendFile(FILE_REQUEST_HISTORY, _utils.formatedDate() + request + '\r\n', function(err){
				if(err){
					return console.error(err);
				}
			});
		}
		if(req.headers.ui === 'v3' || req.url == '/voicemailHistory' || req.url == '/requestHistory'){
			next();
		}else{
			res.status(401);//Unauthorized
			res.end();
		}
	};

	ui.use(logger);

	/** MONITORING ACTIVITY */
	ui.get('/monitoring', function (req, res){
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
	ui.get('/dashboard', function (req, res){
		var temp = parseInt(mode);
		var now = new Date();
		var h = now.getHours();
		var wakeUpTime;
		if(temp > h){
			wakeUpTime = 'Sleeping until ' + (h - temp) + 'h' + now.getMinutes();
		}
		var dashboard = {
			mode: {value: {
				mode: isNaN(parseFloat(mode)) ? 'Ready' : 'Sleep',
				param: isNaN(parseFloat(mode)) ? _service.getStartTime() : parseInt(mode)}},
			switch: {value: _buttons.getEtat()}, 
			volume: {value: isNaN(temp) ? (_buttons.getEtat() == 1 ? 'high' : 'normal') : 'mute'},
			voicemail: {value: _voiceMail.areThereAnyMessages()},
			jukebox: {value: '<i>Soon available</i>'},
			timer: {value: _service.timeLeftTimer()},
			cpu: {value: {usage: _utils.getCPUUsage(), temp: _utils.getCPUTemp()}},
			alarms: {value: '<i>Soon available</i>'}
		};
		res.writeHead(200);
		res.end(JSON.stringify(dashboard));
	});

	/** GET SECTION */
	ui.get('/log', function (req, res) { // Send Logs to UI
		var logSize = 100;
		params = req.query;
		if(params.hasOwnProperty('logSize') && !isNaN(params.logSize)){
			logSize = parseInt(params.logSize);
		}
		//console.log(params);
		_utils.prepareLogs(logSize, function(log){
			res.end(log);
		});
	});

	ui.get('/requestHistory', function (req, res) { // Send Request History
		res.writeHead(200);
		res.end(_fs.readFileSync(FILE_REQUEST_HISTORY, 'utf8').toString());
	});

	ui.get('/voicemailHistory', function (req, res) { // Send Voicemail History
		res.writeHead(200);
		res.end(_fs.readFileSync(FILE_VOICEMAIL_HISTORY, 'utf8').toString());
	});

	/** POST SECTION */
	ui.post('/odi', function (req, res) { // Restart Odi
		_utils.restartOdi();
		res.writeHead(200);res.end();
	});

	ui.post('/sleep', function (req, res) { // Restart Odi
		params = req.query;
		var sleepTime;
		if(params.hasOwnProperty('h')){
			sleepTime = params.h;
		}else{
			sleepTime = 255;
		}
		_utils.restartOdi(sleepTime);//255
		res.writeHead(200);res.end();
	});

	ui.post('/reboot', function (req, res) { // Reboot Odi
		_utils.reboot();
		res.writeHead(200);res.end();
	});

	ui.post('/shutdown', function (req, res) { // Shutdown Odi
		_utils.shutdown();
		res.writeHead(200);res.end();
	});

	ui.post('/mute', function (req, res) { // Mute Odi
		_utils.mute();
		res.writeHead(200);res.end();
	});

	var granted = false;
	//var pwd = _fs.readFileSync(FILE_GRANT, 'UTF-8');
	ui.post('/grant', function (req, res) { // Get grant status

		// console.log(req.headers);
		// console.log(req.headers.pwd.slice(-2));
		var pattern = req.headers.pwd;
		// if(pattern && new Date().getUTCDate().toString() == pattern.slice(-2)){
		if(pattern && _admin.checkPassword(pattern)){
			console.log('>> User granted /!\\');
			granted = true;
		}
		res.send(granted);
		if(granted) granted = false;
	});


	if(mode < 1){ /////// WHEN ALIVE

		ui.post('/tts', function (req, res) { // TTS ou Add Voice Mail Message
			tts = req.query;
			// console.log(params);
			if(tts.voice && tts.lg && tts.msg){
				if(tts.hasOwnProperty('voicemail')){
					_voiceMail.addVoiceMailMessage(tts.lg, tts.msg + tts.voice);
				}else{
					// _tts.speak(params['lg'], params['msg'] + params['voice']);
					_tts.new({voice: tts.voice, lg: tts.lg, msg: tts.msg});
				}
			}else{
				// _tts.speak('','RANDOM'); // Random TTS
				_tts.new({msg:'RANDOM'}); // Random TTS
			}
			res.writeHead(200);res.end();
		});

		ui.post('/lastTTS', function (req, res) { // Restart Odi
			_tts.lastTTS();
			res.writeHead(200);res.end();
		});

		ui.post('/checkVoiceMail', function (req, res) { // Check Voice Mail
			if(!_voiceMail.checkVoiceMail()){
				// _tts.speak('en', 'No voicemail message:1');
				_tts.new({voice: 'google', lg: 'en',msg: 'No voicemail message'});
			}
			res.writeHead(200);res.end();
		});

		ui.post('/clearVoiceMail', function (req, res) { // Clear Voice Mail
			_voiceMail.clearVoiceMail();
			res.writeHead(200);res.end();
		});

		ui.post('/conversation', function (req, res) { // Conversation
			params = req.query;
			if(/\d/.test(params.m)){
				var rdmNb = txt.replace(/[^\d.]/g, '');
				var rdmNb = parseInt(rdmNb, 10);
				//_tts.conversation(rdmNb);
				_tts.new({voice: 'espeak', lg: 'fr', msg:'CONVERSATION NON DEFINI !'});

			}else{
				_tts.conversation('random');
			}
			res.writeHead(200);res.end();
		});

		ui.post('/idea', function (req, res) { // Idea...
			// params = req.query;
			// _tts.speak('en', 'I\'ve got an idea !');
			_tts.new({lg: 'en', msg: 'I\'ve got an idea !'});
			res.writeHead(200);res.end();
		});

		/*ui.post('/russia', function (req, res) { // Russia
			// console.log('UI > Russia');
			_exclamation.russia();
			// _exclamation.russiaLoop();
			res.writeHead(200);res.end();
		});*/

		ui.post('/russia', function (req, res) { // Russia
			params = req.query;
			console.log(params);
			if(params.hasOwnProperty('hymn')){
				//_exclamation.russiaLoop();
				_deploy = _spawn('sh', [CORE_PATH + 'sh/music.sh', 'urss']);
			}else{
				_exclamation.russia();
			}
			res.writeHead(200);res.end();
		});

		ui.post('/exclamation', function (req, res) { // Exclamation
			_exclamation.exclamation();
			res.writeHead(200);res.end();
		});

		ui.post('/exclamationLoop', function (req, res) { // Exclamation Loop
			_exclamation.exclamationLoop();
			res.writeHead(200);res.end();
		});

		ui.post('/fip', function (req, res) { // FIP Radio
			_fip.playFip();
			res.writeHead(200);res.end();
		});

		ui.post('/music/*', function (req, res) { // 
			var song; // RECUPERER LE NOM DE LA CHANSON
			if(!song) song = 'mouthTrick';
			_deploy = _spawn('sh', [CORE_PATH + 'sh/music.sh', song]);
			res.writeHead(200);res.end();
		});

		ui.post('/jukebox', function (req, res) { // Jukebox
			_jukebox.loop();
			res.writeHead(200);res.end();
		});

		ui.post('/medley', function (req, res) { // Medley
			_jukebox.medley();
			res.writeHead(200);res.end();
		});

		ui.post('/naheulbeuk', function (req, res) { // Nahleubeuk
			_deploy = _spawn('sh', [CORE_PATH + 'sh/sounds.sh', 'Naheulbeuk']);
			res.writeHead(200);res.end();
		});

		ui.post('/date', function (req, res) { // Date
			_service.date();
			res.writeHead(200);res.end();
		});

		ui.post('/age', function (req, res) { // Odi's Age
			_service.sayOdiAge();
			res.writeHead(200);res.end();
		});

		ui.post('/time', function (req, res) { // Time
			// console.log('UI > Time');
			_service.time();
			res.writeHead(200);res.end();
		});

		ui.post('/timer', function (req, res) { // Timer
			params = req.query;
			if(!isNaN(params.m)){
				console.log('!isNaN(params.m)');
				var min = parseInt(params.m, 10);
				console.log(min);
				_service.setTimer(min);
			}else if(params.hasOwnProperty('stop')){
				_service.stopTimer();
			}else{
				_service.setTimer();
			}
			res.writeHead(200);res.end();
		});

		ui.post('/meteo', function (req, res) { // Weather
			_service.weather();
			res.writeHead(200);res.end();
		});

		ui.post('/info', function (req, res) { // Info
			_service.info();
			res.writeHead(200);res.end();
		});

		ui.post('/cpuTemp', function (req, res) { // TTS CPU Temp
			_service.cpuTemp();
			res.writeHead(200);res.end();
		});

		ui.post('/cigales', function (req, res) { // Cigales
			_deploy = _spawn('sh', [CORE_PATH + 'sh/sounds.sh', 'cigales']);
			res.writeHead(200);res.end();
		});

		ui.post('/setParty', function (req, res) { // Set Party Mode
			_party.setParty();
			res.writeHead(200);res.end();
		});

		ui.post('/test', function (req, res) { // Set Party Mode
			_deploy = _spawn('sh', [CORE_PATH + 'sh/sounds.sh', 'test']); //mouthTrick
			res.writeHead(200);res.end();
		});
		ui.post('/*', function (req, res) { // Redirect Error
			console.error('UI > I’m a teapot !');
			res.writeHead(418);res.end();
		});
	}else{
		ui.post('/tts', function (req, res) { // Add Voice Mail Message
			params = req.query;
			// console.log(params);
			if(params['voice'] && params['lg'] && params['msg']){
				_voiceMail.addVoiceMailMessage(params['lg'], params['msg'] + params['voice']);
				res.writeHead(200);res.end();
			}else{
				console.error('Error while saving voiceMail message : ');
				console.error(params);
				res.writeHead(424);res.end();
			}
		});

		ui.post('/*', function (req, res) { // Redirect Error
			//console.error('UI > Odi\'s sleeping   -.-');
			console.log('Odi not allowed to interact  -.-');
			res.writeHead(401);res.end();
		});
	}

	ui.listen(8080, function () { // Listen port 8080
		console.log('Odi\'s UI server started [' + mode + ']');
		_leds.blink({leds: ['satellite'], speed : 120, loop : 3})
	});


	/** SETTINGS SECTION */
	ui.get('/settings', function (req, res){
		var temp = parseInt(mode);
		//console.log(temp);
		var now = new Date();
		var h = now.getHours();
		var wakeUpTime;
		if(temp > h){
			wakeUpTime = 'Sleeping until ' + (h - temp) + 'h' + now.getMinutes();
		}
		var settings = {
			mode: {lib: 'Mode',
				value: isNaN(parseFloat(mode)) ? 'Ready' : parseInt(mode),
			}, switch: {
				lib: 'Switch', value: _buttons.getEtat(),
			}, volume: {
				lib: 'Volume',
				value: isNaN(temp) ? (_buttons.getEtat() == 1 ? 'High' : 'Normal') : 'Mute',
			}, tts: {
				lib: 'TTS - Exclamation',
				value: '<i>Soon available</i>',
			}, jukebox: {
				lib: 'Jukebox & Radio',
				value: '<i>Soon available</i>',
			}, voiceMail: {
				lib: 'VoiceMail',
				value: _voiceMail.areThereAnyMessages()/* + ' '
					+ (_voiceMail.areThereAnyMessages() > 1 ? ' messages' : 'message')*/,
			}, dateTime: {
				lib: 'Date & Time',
				value: '<i class="fa fa-3x fa-calendar"></i>&nbsp;&nbsp;&nbsp;<i class="fa fa-3x fa-clock-o"></i><br><i>Soon available</i>',
			}, timer: {
				lib: 'timer',
				value: '<i class="fa fa-3x fa-hourglass"></i>',
			}, cpuUsage: {
				lib: 'CPU usage',
				value: _utils.getCPUUsage(),// + ' %',
			}, cpuTemp: {
				lib: 'CPU temperature',
				value: _utils.getCPUTemp(),// + ' ° C',
			}, alarms: {
				lib: 'Alarms',
				value: '<i>Soon available</i>',
			}, stats: {
				lib: 'Stats',
				value: 'X refresh (dashboard)',
				value: 'X refresh (dashboard)',
			}, about: {
				lib: 'About',
				value: 'Hi,<br>I\'m Odi the robot !',
			}, system: {
				lib: 'System',
				value: '<i>Soon available</i>',
			}
		};
		res.writeHead(200);
		res.end(JSON.stringify(settings));
	});

}