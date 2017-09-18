#!/usr/bin/env node

// Module server
/** Liste codes http
 *		200 : OK
 *		401 : Unauthorized (sleep)
 *		418 : I'm a teapot ! (autres requetes POST)
 *		424 : Method failure (erreur)
  */

var express = require('express');
var compression = require('compression');
var bodyParser = require('body-parser');
var path = require('path');
var spawn = require('child_process').spawn;
var fs = require('fs');

const FILE_REQUEST_HISTORY = LOG_PATH + 'requestHistory.log';
const FILE_GRANT = DATA_PATH + 'pwd.properties';
const FILE_VOICEMAIL_HISTORY = LOG_PATH + 'voicemailHistory.json';

var deploy;

module.exports = {
	startUI: startUI
};


/** Function to format logs */
function prepareLogs(lines, callback){
	var content = fs.readFileSync(LOG_PATH + 'odi.log', 'UTF-8').toString().split('\n');
	content = content.slice(-lines); //-120
	content = content.join('\n');
	callback(content);
	return content;
};

function startUI(mode){
	var ui = express();
	var request, ip, params, ipClient;

	ui.use(compression()); // Compression web
	ui.use(express.static(WEB_PATH)); // Pour fichiers statiques
	ui.use(bodyParser.json()); // to support JSON-encoded bodies
	ui.use(bodyParser.urlencoded({ // to support URL-encoded bodies
		extended: true
	}));

	// Middleware LOGGER
	var logger = function(req, res, next){
		//ODI.leds.toggle({led:'eye', mode: 1});
		res.header('Access-Control-Allow-Origin', 'http://adrigarry.com');
		//method = req.method;

		ODI.leds.blink({leds: ['satellite'], speed: 100, loop: 3});
		/*spawn('sh', [CORE_PATH + 'sh/sounds.sh', 'UI']);
		console.log('req.url', req.url);
		if(req.url == '/'){ // UI request
			spawn('sh', [CORE_PATH + 'sh/sounds.sh', 'UI']);
			console.log('======================>');
		}*/

		if(req.connection.remoteAddress.indexOf('192.168') == -1){ // Logging not local requests
			var newRequest = ODI.utils.logTime('D/M h:m:s ') + request + ' [' + req.connection.remoteAddress + ']\r\n';
			fs.appendFile(FILE_REQUEST_HISTORY, newRequest, function(err){
				if(err) return console.error(err);
			});
		}

		ip = req.connection.remoteAddress.indexOf('192.168') > -1 ? '' : '[' + req.connection.remoteAddress + ']';

		if(req.headers['user-interface'] === 'v4'){ // Allowed requests
			request = req.headers['user-interface'] + ' ' + req.url.replace('%20',' ');
			console.log(request, ip);
			next();
		}else if(req.url == '/favicon.ico'){
			console.log('favicon request', request, ip);
			res.status(401); // Unauthorized
			res.end();
		}else{ // Not allowed requests
			request = '401 ' + req.url.replace('%20',' ');
			if(CONFIG.mode == 'ready') ODI.tts.speak({voice:'espeak', lg:'en', msg:'Bad request'});
			console.error(request, ip);
			res.status(401); // Unauthorized
			res.end();
		}
	};
	ui.use(logger);

	// TRUC DE FOU NON ???
	/*ui.get('/', function(req, res){ // Init UI
		res.sendFile(path.join(WEB_PATH + 'index.html'));
		ipClient = req.connection.remoteAddress;
		console.log('UI initialized [' + ipClient + ']');
		ODI.leds.blink({leds: ['satellite'], speed: 100, loop: 3});
		console.log('MODE');
		console.log(mode);
		if(CONFIG.mode == 'ready'){
			spawn('sh', [CORE_PATH + 'sh/sounds.sh', 'UI']);
		}
		//res.set('Content-Type', 'text/javascript');
	});*/

	ui.get('/monitoring', function(req, res){ // DEPRECATED ???
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
	ui.post('/alarm', function(req, res){ // TODO re-passer en ui.post !!!
		params = req.body;
		console.debug('UI > Alarm', params);
		// TODO déplacer dans ODI.time.setAlarm()
		var newAlarms = {};
		Object.keys(CONFIG.alarms).forEach(function(key,index){
			if(key == params.when){
				newAlarms[key] = {
					h: params.hours,
					m: params.minutes,
					d: CONFIG.alarms[key].d,
					mode: CONFIG.alarms[key].mode
				}
				console.log('>> ' + params.when + ' alarm set to ' + params.h + '.' + params.m);
			}else{
				newAlarms[key] = CONFIG.alarms[key];
			}
		});
		ODI.config.update({alarms: newAlarms}, true);

	// "alarms": {
	// 	"weekDay": {"h":7,"m":10, "d": [1,2,3,4,5], "mode": "sea"},
	// 	"weekEnd": {"h":11,"m":59, "d": [0,6], "mode": "sea"}
	// },

		// ODI.config.update('alarm', null, true); // NOUVEAU FORMAT OBJET ... /!\
		res.writeHead(200);res.end();
	});

	/** TOGGLE DEBUG MODE */
	ui.post('/toggleDebug', function(req, res){
		console.debug('UI > Toggle debug');
		// ODI.config.update({debug: !CONFIG.debug}, true);
		ODI.config.update({debug: CONFIG.debug ? 0 : 30}, true);
		res.writeHead(200);res.end();
	});

	/** RESET CONFIG */
	ui.post('/resetConfig', function(req, res){
		console.debug('UI > Reset config');
		ODI.config.resetCfg(true);
		res.writeHead(200);res.end();
	});

	/** DASHBOARD SECTION */
	ui.get('/dashboard', function(req, res){
		var temp = parseInt(mode);
		var now = new Date();
		var h = now.getHours();
		var wakeUpTime;
		if(temp > h){
			wakeUpTime = 'Sleeping until ' + (h - temp) + 'h' + now.getMinutes();
		}
		var etatBtn = ODI.buttons.getEtat();
		var cpuTemp = ODI.hardware.getCPUTemp();
		var cpuUsage = ODI.hardware.getCPUUsage();
		var dashboard = {
			config: CONFIG,
			mode: {value: {
				// mode: isNaN(parseFloat(mode)) ? (CONFIG.debug ? 'Debug' : 'Ready') : 'Sleep',
				mode: CONFIG.mode != 'sleep' ? (CONFIG.debug ? 'Debug' : 'Ready') : 'Sleep',
				// param: isNaN(parseFloat(mode)) ? CONFIG.startTime : parseInt(mode),
				param: CONFIG.startTime,
				switch: etatBtn ? true : false,
				active: CONFIG.debug, // TRY TO DELETE THIS (deprecated)
				debug: CONFIG.debug}},
			switch: {value: etatBtn, active: etatBtn ? true : false}, 
			volume: {value: isNaN(temp) ? (etatBtn == 1 ? 'high' : 'normal') : 'mute', active: (isNaN(temp) && etatBtn == 1) ? true : false},
			voicemail: {value: ODI.voiceMail.areThereAnyMessages(), active: ODI.voiceMail.areThereAnyMessages()>0 ? true : false},
			jukebox: {value: '<i>Soon available</i>', active: false},
			timer: {value: ODI.time.timeLeftTimer(), active: ODI.time.timeLeftTimer()>0 ? true : false},
			hardware: {value: {usage: cpuUsage, temp: cpuTemp}, active: (cpuTemp > 55 || cpuUsage >= 20) ? true : false},
			alarms: {value: CONFIG.alarms, active: true},
			//config: {value: CONFIG},
			version: {value: CONFIG.version},// DEPRECATED !
			debug: {value: CONFIG.debug}// TO DEPRECATE...
		};
		res.writeHead(200);
		res.end(JSON.stringify(dashboard));
	});

	/** GET SECTION */
	ui.get('/log', function(req, res){ // Send Logs to UI
		var logSize = 100;
		params = req.query;
		if(params.hasOwnProperty('logSize') && !isNaN(params.logSize)){
			logSize = parseInt(params.logSize);
		}
		prepareLogs(logSize, function(log){
			res.end(log);
		});
	});

	ui.get('/config.json', function(req, res) { // Send Config file
		res.writeHead(200);
		//res.end(fs.readFileSync(CONFIG_FILE, 'utf8').toString());
		//console.debug(CONFIG.toString);
		ODI.config.logArray();
		res.end(JSON.stringify(CONFIG));
	});

	ui.get('/requestHistory', function(req, res) { // Send Request History
		res.writeHead(200);
		res.end(fs.readFileSync(FILE_REQUEST_HISTORY, 'utf8').toString());
	});

	ui.get('/voicemailHistory', function(req, res) { // Send Voicemail History
		res.writeHead(200);
		res.end(fs.readFileSync(FILE_VOICEMAIL_HISTORY, 'utf8').toString());
	});

	/** POST SECTION */
	ui.post('/odi', function(req, res){ // Restart Odi
		ODI.hardware.restartOdi();
		res.writeHead(200);res.end();
	});

	ui.post('/sleep', function(req, res){ // Restart Odi
		params = req.query;
		var sleepTime;
		if(params.hasOwnProperty('h')){
			sleepTime = params.h;
		}else{
			sleepTime = 255;
		}
		ODI.hardware.restartOdi(sleepTime);//255
		res.writeHead(200);res.end();
	});

	ui.post('/reboot', function(req, res){ // Reboot Odi
		ODI.hardware.reboot();
		res.writeHead(200);res.end();
	});

	ui.post('/shutdown', function(req, res){ // Shutdown Odi
		ODI.hardware.shutdown();
		res.writeHead(200);res.end();
	});

	ui.post('/mute', function(req, res){ // Mute Odi
		ODI.tts.clearTTSQueue();
		ODI.hardware.mute();
		res.writeHead(200);res.end();
	});

	var granted = false;
	ui.post('/grant', function(req, res){ // Get grant status
		var pattern = req.headers.pwd;
		if(pattern && ODI.admin.checkPassword(pattern)){
			granted = true;
			console.log('>> Admin granted !');
		}else{
			console.log('>> User NOT granted /!\\');
		}
		res.send(granted);
		if(granted) granted = false;
	});


	// if(mode < 1){ /////// WHEN ALIVE
	if(CONFIG.mode == 'ready'){

		ui.post('/tts', function(req, res){ // TTS ou Add Voice Mail Message
			var ttsMsg = req.query;
			// console.log(params);
			if(ttsMsg.voice && ttsMsg.lg && ttsMsg.msg){
				if(ttsMsg.hasOwnProperty('voicemail')){
					ODI.voiceMail.addVoiceMailMessage({voice: ttsMsg.voice, lg: ttsMsg.lg, msg: ttsMsg.msg});
				}else{
					ODI.tts.speak({voice: ttsMsg.voice, lg: ttsMsg.lg, msg: ttsMsg.msg});
				}
			}else{
				ODI.tts.speak({msg:'RANDOM'}); // Random TTS
			}
			res.writeHead(200);res.end();
		});

		ui.post('/lastTTS', function(req, res){ // Restart Odi
			ODI.tts.lastTTS();
			res.writeHead(200);res.end();
		});

		ui.post('/checkVoiceMail', function(req, res){ // Check Voice Mail
			// if(!voiceMail.checkVoiceMail()){
			// 	ODI.tts.speak({voice: 'espeak', lg: 'en',msg: 'No voicemail message'});
			// }
			ODI.voiceMail.checkVoiceMail(function(anyMessage){
				console.log(anyMessage);
				if(!anyMessage){
					//ODI.tts.speak({voice: 'espeak', lg: 'en',msg: 'No voicemail message'});
					ODI.tts.speak({voice: 'espeak', lg: 'en',msg: 'No voicemail message'});
				}
			});
			res.writeHead(200);res.end();
		});

		ui.post('/clearVoiceMail', function(req, res){ // Clear Voice Mail
			ODI.voiceMail.clearVoiceMail();
			res.writeHead(200);res.end();
		});

		ui.post('/conversation', function(req, res){ // Conversation
			ODI.tts.randomConversation();
			res.writeHead(200);res.end();
		});

		ui.post('/idea', function(req, res){ // Idea...
			// params = req.query;
			// ODI.tts.speak('en', 'I\'ve got an idea !');
			ODI.tts.speak({lg: 'en', msg: 'I\'ve got an idea !'});
			res.writeHead(200);res.end();
		});

		ui.post('/badBoy', function(req, res){ // Bad Boy...
			params = req.body;
			console.debug('/badBoy', params);
			ODI.service.badBoy(params.value);
			res.writeHead(200);res.end();
		});

		ui.post('/adriExclamation', function(req, res){ // Idea...
			ODI.service.adriExclamation();
			res.writeHead(200);res.end();
		});

		/*ui.post('/russia', function(req, res){ // Russia
			// console.log('UI > Russia');
			exclamation.russia();
			// exclamation.russiaLoop();
			res.writeHead(200);res.end();
		});*/

		ui.post('/russia', function(req, res){ // Russia
			params = req.query;
			console.debug('/russia', params);
			if(params.hasOwnProperty('hymn')){
				//exclamation.russiaLoop();
				spawn('sh', [CORE_PATH + 'sh/music.sh', 'urss']);
				ODI.leds.altLeds(70, 20);
			}else{
				ODI.exclamation.russia();
			}
			res.writeHead(200);res.end();
		});

		ui.post('/exclamation', function(req, res){ // Exclamation
			ODI.exclamation.exclamation();
			res.writeHead(200);res.end();
		});

		ui.post('/exclamationLoop', function(req, res){ // Exclamation Loop
			ODI.exclamation.exclamationLoop();
			res.writeHead(200);res.end();
		});

		ui.post('/fip', function(req, res){ // FIP Radio
			ODI.jukebox.playFip();
			res.writeHead(200);res.end();
		});

		ui.post('/music/*', function(req, res){ // 
			var song; // RECUPERER LE NOM DE LA CHANSON
			if(!song) song = 'mouthTrick';
			spawn('sh', [CORE_PATH + 'sh/music.sh', song]);
			res.writeHead(200);res.end();
		});

		ui.post('/jukebox', function(req, res){ // Jukebox
			ODI.jukebox.loop();
			res.writeHead(200);res.end();
		});

		ui.post('/medley', function(req, res){ // Medley
			ODI.jukebox.medley();
			res.writeHead(200);res.end();
		});

		ui.post('/naheulbeuk', function(req, res){ // Nahleubeuk
			spawn('sh', [CORE_PATH + 'sh/sounds.sh', 'Naheulbeuk']);
			res.writeHead(200);res.end();
		});

		ui.post('/survivaure', function(req, res){ // Survivaure
			spawn('sh', [CORE_PATH + 'sh/sounds.sh', 'Survivaure']);
			res.writeHead(200);res.end();
		});

		ui.post('/playVideo', function(req, res){ // Play Video
			ODI.video.startCycle();
			res.writeHead(200);res.end();
		});

		ui.post('/videoOff', function(req, res){ // Sleep Screen
			ODI.video.screenOff();
			res.writeHead(200);res.end();
		});

		ui.post('/date', function(req, res){ // Date
			ODI.time.today();
			res.writeHead(200);res.end();
		});

		ui.post('/age', function(req, res){ // Odi's Age
			ODI.time.sayOdiAge();
			res.writeHead(200);res.end();
		});

		ui.post('/time', function(req, res){ // Time
			// console.log('UI > Time');
			ODI.time.now();
			res.writeHead(200);res.end();
		});

		ui.post('/timer', function(req, res){ // Timer
			params = req.query;
			if(!isNaN(params.m)){
				console.log('!isNaN(params.m)');
				var min = parseInt(params.m, 10);
				console.log(min);
				ODI.time.setTimer(min);
			}else if(params.hasOwnProperty('stop')){
				ODI.time.stopTimer();
			}else{
				ODI.time.setTimer();
			}
			res.writeHead(200);res.end();
		});

		ui.post('/weather', function(req, res){ // Weather
			ODI.service.weather();
			res.writeHead(200);res.end();
		});
		ui.post('/weatherInteractive', function(req, res){ // Weather
			ODI.service.weatherInteractive();
			res.writeHead(200);res.end();
		});

		ui.post('/info', function(req, res){ // Info
			ODI.service.info();
			res.writeHead(200);res.end();
		});

		ui.post('/cpuTemp', function(req, res){ // TTS CPU Temp
			ODI.service.cpuTemp();
			res.writeHead(200);res.end();
		});

		ui.post('/cigales', function(req, res){ // Cigales
			spawn('sh', [CORE_PATH + 'sh/sounds.sh', 'cigales']);
			res.writeHead(200);res.end();
		});

		ui.post('/setParty', function(req, res){ // Set Party Mode
			ODI.party.setParty();
			res.writeHead(200);res.end();
		});

		ui.post('/test', function(req, res){ // Set Party Mode
			spawn('sh', [CORE_PATH + 'sh/sounds.sh', 'test']); //mouthTrick
			res.writeHead(200);res.end();
		});
		ui.post('/*', function(req, res){ // Redirect Error
			console.error('UI > I’m a teapot !');
			res.writeHead(418);res.end();
		});
	}else{
		ui.post('/tts', function(req, res){ // Add Voice Mail Message
			params = req.query;
			// console.log(params);
			if(params['voice'] && params['lg'] && params['msg']){
				ODI.voiceMail.addVoiceMailMessage({lg: params['lg'],voice: params['voice'], msg: params['msg']});
				res.writeHead(200);res.end();
			}else{
				console.error('Error while saving voiceMail message : ');
				console.error(params);
				res.writeHead(424);res.end();
			}
		});

		ui.post('/*', function(req, res){ // Redirect Error
			//console.error('UI > Odi\'s sleeping   -.-');
			console.log('Odi not allowed to interact  -.-');
			res.writeHead(401);res.end();
		});
	}

	ui.listen(8080, function() { // Listen port 8080
		console.log('UI server started [' + CONFIG.mode + ']');
		ODI.leds.blink({leds: ['satellite'], speed : 120, loop : 3})
	});
};