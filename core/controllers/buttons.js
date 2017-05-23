#!/usr/bin/env node

// Module Button

//TODO en mode veille, si bouton vers le haut: alumer écran et tail odi.log

module.exports = {
	getEtat: getEtat,
	initButtonAwake: initButtonAwake,
};

/** Function to get switch state */
function getEtat(callback){
	var switchState = etat.readSync();
	return switchState;
};

/** Button initialization in normal mode */
function initButtonAwake(){
	/** Interval pour l'etat du switch + fonctions associees */
	var instance = false;
	var interval;
	var intervalDelay = CONFIG.debug ? 2*60*1000 : 5*60*1000;
	setInterval(function(){
		var value = etat.readSync();
		ODI.leds.satellite.writeSync(value);
		if(1 === value){
			if(!instance){
				instance = true;
				interval = setInterval(function(){
					console.log('Etat bouton On_');
					ODI.service.randomAction();
				}, intervalDelay); //5*60*1000
			}
		}else{
			instance = false;
			clearInterval(interval);
		}
	}, 2000);

	/** Switch watch for radio volume */
	etat.watch(function(err, value){
		value = etat.readSync();
		console.log('Etat:', value, '[Etat has changed]', ODI.jukebox.isPlayingFip());
		if(ODI.jukebox.isPlayingFip()){
			ODI.jukebox.stopFip('Rebooting FIP RADIO (volume changed)');
			setTimeout(function(){
				ODI.jukebox.playFip();
			}, 100);
		}
	});

	var pushed = 0; pushedLimit = 3;
	function oneMorePush(){
		pushed++;
		console.debug('oneMorePush', pushed + '/' + pushedLimit);
		if(pushed >= pushedLimit){
			switch(Math.round(Math.random()*2)){
				case 0:
					ODI.tts.speak({msg:'Et ho ! Arraite un peu avec mes boutons tu veux'});
					break;
				case 1:
					ODI.tts.speak({msg:'Arraite de me toucher, sa menairve !'});
					break;
				case 2:
					ODI.tts.speak({msg:'Pas touche a mes boutons !'});
					break;
			}
			pushed = 0;
		}
	};

	function getPushTime(button){
		// console.debug('getPushTime(' + button.id + ')'/*, button*/);
		var pushTime, pushedTime = new Date();
		while(button.readSync() == 1){
			; // Pause
			var t = Math.round((new Date() - pushedTime)/100)/10;
			if(t%1 == 0){
				// console.log(t);
				// process.stdout.write('.');
				ODI.leds.belly.write(0);
			}else{
				ODI.leds.belly.write(1);
			}
		}
		pushTime = Math.round((new Date() - pushedTime)/100)/10;
		console.debug('getPushTime(' + button.id + ')', pushedTime);
		ODI.leds.ledOff('belly');
		return pushTime;
	}

	/** Green (ok) button watch */
	ok.watch(function(err, value){
		var pushTime = getPushTime(ok);
		console.log('Ok btn pressed for ' + pushTime + ' sec [2,3]'); //[val:' + value + ']
		oneMorePush();
		if(pushTime < 2){
			// if(!ODI.voiceMail.checkVoiceMail()){
			// 	ODI.service.randomAction();
			// }
			ODI.voiceMail.checkVoiceMail(function(message){
				if(!message){
					ODI.service.randomAction();
				}
			})
		}else if(pushTime >= 2 && pushTime < 3){
			ODI.tts.lastTTS();
		}else if(pushTime >= 3){
			ODI.time.now();
		}
	});

	/** Red (cancel) button watch */
	cancel.watch(function(err, value){
		var pushTime = getPushTime(cancel);
		ODI.tts.clearTTSQueue();
		ODI.hardware.mute();
		console.log('Cancel btn pressed for ' + pushTime + ' sec [1,3]');//[val:' + value + ']
		oneMorePush();
		if(pushTime >= 1 && pushTime < 3){
			ODI.hardware.restartOdi();
		}else if(pushTime >= 3){
			ODI.hardware.restartOdi(255);
		}
	});

	/** White (white) button watch */
	white.watch(function(err, value){
		var pushTime = getPushTime(white);
		console.log('White btn pressed for   ' + pushTime + ' sec [2;2]');//[val:' + value + ']
		oneMorePush();
		ODI.time.setTimer(Math.round(pushTime));
	});

	/** Blue (blue) button watch */
	blue.watch(function(err, value){
		var pushTime = getPushTime(blue);
		console.log('Blue btn pressed for ' + pushTime + ' sec [2;5]');//[val:' + value + ']
		oneMorePush();
		if(pushTime < 2){
			if(etat.readSync() == 0){
				ODI.jukebox.playFip();
			}else{
				ODI.jukebox.loop();
			}
		}else if(pushTime > 2 && pushTime < 5){
			if(etat.readSync() == 0){
				setTimeout(function(){
					ODI.hardware.mute();
					ODI.leds.allLedsOff();
					console.log('TEST _A_ : mute + party.setParty(true)');
					ODI.party.setParty(true);
				}, 1200);			
			}else{
				setTimeout(function(){
					ODI.hardware.mute();
					ODI.leds.allLedsOff();
					console.log('TEST _B_ : party.setParty(false)');
					ODI.party.setParty(false);
				}, 1200);
			}
		}else{
			console.log('Push Blue button canceled !');
		}
	});
	console.log('Buttons initialised');
};
