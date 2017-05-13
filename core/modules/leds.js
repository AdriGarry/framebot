#!/usr/bin/env node

// Module leds
var Gpio = require('onoff').Gpio;
var CronJob = require('cron').CronJob;

/*led = new Gpio(15, 'out');
nose = new Gpio(15, 'out');
eye = new Gpio(14, 'out');
belly = new Gpio(17, 'out');
satellite = new Gpio(23, 'out');*/

const odiLeds = {
	eye: new Gpio(14, 'out'),
	nose: new Gpio(15, 'out'),
	belly: new Gpio(17, 'out'),
	satellite: new Gpio(23, 'out')
};
// odiLeds.nose = new Gpio(15, 'out'); // global. ?
// odiLeds.eye = new Gpio(14, 'out'); // global. ?
// odiLeds.belly = new Gpio(17, 'out'); // global. ?
// odiLeds.satellite = new Gpio(23, 'out'); // global. ?


etat = new Gpio(13, 'in', 'both', {persistentWatch:true,debounceTimeout:500});
etat.id = 'etat';
ok = new Gpio(20, 'in', 'rising', {persistentWatch:true,debounceTimeout:500});
cancel = new Gpio(16, 'in', 'rising', {persistentWatch:true,debounceTimeout:500});
cancel.id = 'cancel';
white = new Gpio(19, 'in', 'rising', {persistentWatch:true,debounceTimeout:500});
blue = new Gpio(26, 'in', 'rising', {persistentWatch:true,debounceTimeout:500});

module.exports = {
	eye: odiLeds.eye,
	nose: odiLeds.nose,
	belly: odiLeds.belly,
	satellite: odiLeds.satellite,
	blink: blink,
	toggle: toggle,
	activity: activity,
	altLeds: altLeds,
	clearLeds: clearLeds,
	//buttonPush: buttonPush,
	ledOn: ledOn,
	ledOff: ledOff,
	allLedsOn: allLedsOn,
	allLedsOff: allLedsOff
}

/** Fonction clignotement
 * @param config : {
 * 		leds : ['eye', 'satellite'...]
 *		speed : number (50 - 200)
 *		loop : number (<1)
 }
 */
function blink(config){
	// console.log(config);
	try{
		var etat = 1, loop;
		if(config.hasOwnProperty('leds')){
			setTimeout(function(){
				for(var led in config.leds){
					// console.log(config.leds[led] + '  => END');
					//eval(config.leds[led]).write(0); // TODO remplacer eval
					// console.log(config.leds[led]);
					odiLeds[config.leds[led]].write(0);
				}
			}, config.speed * config.loop * 2 +50);
			for(loop = config.loop * 2; loop > 0; loop--){
				setTimeout(function(leds){
					for(var i in leds){
						var led = leds[i]
						// console.log('led : ' + led);
						//eval(led).write(etat); // TODO remplacer eval
						odiLeds[led].write(etat);
					}
					etat = 1 - etat; // VOIR POUR ALTERNER ??
				}, config.speed * loop, config.leds);
			}
		}
	}catch(e){
		console.trace(e);
		console.error(e);
	}
};

/** Function to toggle a led
 * @param config : {
 * 		led : 'eye'
 *		mode : true/false
 }
 */
function toggle(config){
	// console.log('toogle() ' + config.led + (config.mode ? ' on':' off'));
	if(['nose', 'eye', 'satellite', 'belly'].indexOf(config.led) > -1){
		// eval(config.led).write(config.mode? 1 : 0); // TODO remplacer eval
		odiLeds[config.led].write(config.mode? 1 : 0);
	}
};

/** Function activity : program mode flag (ready/sleep) */
//function activity(mode){
function activity(){
	//if(typeof mode === 'undefined') mode = 'awake';
	//if(mode == 'ready') mode = 'awake';
	console.log('Activity led initialised [' + CONFIG.mode + ']');
	//mode = parseInt(mode, 10);
	if(CONFIG.mode == 'sleep') mode = 0;
	else mode = 1;
	setInterval(function(){
		odiLeds.nose.write(mode);
	}, 900);

	new CronJob('*/3 * * * * *', function(){
		blink({leds: ['nose'], speed: 200, loop: 1}); // Initialisation du temoin d'activite 2/2
	}, null, 1, 'Europe/Paris');
};

var timer;
/** Function to start inverted blink (Eye/Belly) */
function altLeds(speed, duration){
	clearInterval(timer);
	var etat = 1;
	timer = setInterval(function(){
			odiLeds.eye.write(etat);
			etat = 1 - etat;
			odiLeds.belly.write(etat);
	}, speed);
	var stopTimer = setTimeout(function(){
		clearInterval(timer);
		odiLeds.eye.write(0);
		odiLeds.belly.write(0);
	}, duration*1000);
};

/** Function to cancel blinkState */
function clearLeds(){
	clearInterval(timer);
};

/** Function pushed button flag */
/*function buttonPush(param){
	if(param == 'stop'){
		belly.write(0);
	}else{
		belly.write(1);
		setInterval(function(){
			belly.write(1);
		}, 300);
		setTimeout(function(){
			belly.write(1);
		}, 1000);		
	}
};*/

/** Function to swith on a led */
function ledOn(led){
	if(led == 'led'){
		odiLeds.nose.write(1);
	}else if(led == 'eye'){
		odiLeds.eye.write(1);
	}else if(led == 'belly'){
		odiLeds.belly.write(1);
	}else if(led == 'satellite'){
		odiLeds.satellite.write(1);
	}
};

/** Function to swith off a led */
function ledOff(led){
	if(led == 'led'){
		odiLeds.nose.write(0);
	}else if(led == 'eye'){
		odiLeds.eye.write(0);
	}else if(led == 'belly'){
		odiLeds.belly.write(0);
	}else if(led == 'satellite'){
		odiLeds.satellite.write(0);
	}
};

/** Function to switch on all leds */
function allLedsOn(){
	odiLeds.eye.write(1);
	odiLeds.belly.write(1);
	odiLeds.satellite.write(1);
	odiLeds.nose.write(1); // EXCEPT ACTIVITY LED ??
};

/** Function to swith off all leds */
function allLedsOff(){
	odiLeds.eye.write(0);
	odiLeds.belly.write(0);
	odiLeds.satellite.write(0);
	odiLeds.nose.write(0); // EXCEPT ACTIVITY LED ??
};

/** Params detection for direct call */
var params = process.argv[2];
if(params){
	// console.log('leds params:', params);
	var gpioPins = require('./gpioPins.js');
	if(params === 'allLedsOn'){
		console.log('All Leds On');
		allLedsOn();
	}else if(params === 'allLedsOff'){
		console.log('All Leds Off');
		allLedsOff();
	}
}