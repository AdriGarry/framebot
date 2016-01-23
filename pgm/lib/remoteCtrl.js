// #!/usr/bin/env node

// var remoteCtrl = function(){

// var spawn = require('child_process').spawn;
// var request = require('request');
// var power = require('./power.js');
// var powerInstance = new power();
// var buttons = require('./buttons.js');
// var buttonsInstance = new buttons();
// var leds = require('./leds.js');
// var ledsInstance = new leds();
// var _tts = require('./tts.js');
// var tts = new _tts();
// var clock = require('./clock.js');
// var clockInstance = new clock();
// var utils = require('./utils.js');
// var utilsInstance = new utils();

// var self = this;
// var deploy;
// var content;
// var messages;

// self.checkMessages = function(){
				// console.log('Checking for messages...');
				// var messagesTTS = 'http://adrigarry.com/odiTools/messages.txt';
				// request(messagesTTS, function (error, response, body) {
					// if(typeof body === 'undefined') body = '';
					// if(body.indexOf('!DOCTYPE') == -1){
						// messages = body.split('\r\n');
						// var lg, txt;
						// for(i=messages.length-1;i>0;i--){
							// console.log(i + ' Message(s) TTS from OdiWeb');
							// txt = messages[i];
							// if(txt != undefined){
								// txt = txt.split(';');
								// lg = txt[0];
								// txt = txt[1];
								// var timeMessage = txt ? txt.length/5 : 'undefined';
								// console.log(lg.toUpperCase() + ' > "' + txt + '"  [' + timeMessage + ']');
								// if(lg == 'cmd'){
									// if(txt == 'reboot'){
										// powerInstance.reboot();
									// } else if(txt == 'shutdown' || txt == 'halt') {
										// powerInstance.shutdown();
									// } else if(txt == 'odi') {
										// powerInstance.restartOdi();
									// } else if(txt == 'mute') {
										// deploy = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh']);
										// console.log('>> MUTE ALL  :|');
									// } else if(txt == 'jukebox') {
										// console.log('Blue Btn >> Jukebox Loop !');
										// deploy = spawn('sh', ['/home/pi/odi/pgm/sh/jukebox.sh']);
										// utilsInstance.autoMute();
									// } else if(txt == 'jukebox m' || txt == 'medley') {
										// console.log('Blue Btn >> Medley Jukebox !!');
										// deploy = spawn('sh', ['/home/pi/odi/pgm/sh/jukebox.sh', 'medley']);
										// utilsInstance.autoMute();
									// } else if (txt == 'party') {
										// clockInstance.setParty();
									// } else {
										// tts.speak('','');
									// }
								// } else {
									// setTimeout(function(lg, txt){
										// tts.speak(lg,txt);
									// }.bind(this, lg, txt), timeMessage*1000);
								// }
							// }
						// }
						// request('http://adrigarry.com/odiTools/clearTTS.php', function (error, response, body){});
					// }
				// });
// };

// self.sendLogs = function(){
	// setInterval(function(){
		// console.log('Sending Logs...');
		// var sendLogsUrl = 'http://adrigarry.com/odiTools/odiLog.php';
		// request(messagesTTS, function (error, response, body) {
		// });
	// }, 5*1000);
// };
// }
// module.exports = remoteCtrl;