#!/usr/bin/env node
// Module de gestion des leds

var Gpio = require('onoff').Gpio;

var cpBtn = 1;
var timer;

var blinkEye = function(speed, duration){
	clearInterval(timer);
	var etat = 1;
	timer = setInterval(function(){
		eye.write(etat);
		etat = 1 - etat;
	}, speed);
	var stopTimer = setTimeout(function(){
		clearInterval(timer);
		eye.write(0);
	}, duration*1000);
};
exports.blinkEye = blinkEye;

var blinkBelly = function(speed, duration){
	clearInterval(timer);
	var etat = 1;
	timer = setInterval(function(){
		belly.write(etat);
		etat = 1 - etat;
	}, speed);
	var stopTimer = setTimeout(function(){
		clearInterval(timer);
		belly.write(0);
	}, duration*1000);
};
exports.blinkBelly = blinkBelly;

var blinkSatellite = function(speed, duration){
	clearInterval(timer);
	var etat = 1;
	timer = setInterval(function(){
		satellite.write(etat);
		etat = 1 - etat;
	}, speed);
	var stopTimer = setTimeout(function(){
		clearInterval(timer);
		satellite.write(0);
	}, duration*1000);
};
exports.blinkSatellite = blinkSatellite;

var blinkLed = function(speed, duration){
	clearInterval(timer);
	var etat = 1;
	timer = setInterval(function(){
		led.write(etat);
		etat = 1 - etat;
	}, speed);
	var stopTimer = setTimeout(function(){
		clearInterval(timer);
		led.write(1);
	}, duration*1000);
};
exports.blinkLed = blinkLed;

var blinkAllLeds = function(speed, duration){
	clearInterval(timer);
	var etat = 1;
	timer = setInterval(function(){
		eye.write(etat);
		belly.write(etat);
		etat = 1 - etat;
	}, speed);
	var stopTimer = setTimeout(function(){
		clearInterval(timer);
		eye.write(0);
		belly.write(0);
	}, duration*1000);
};
exports.blinkAllLeds = blinkAllLeds;

var altLeds = function(speed, duration){
	clearInterval(timer);
	var etat = 1;
	timer = setInterval(function(){
			eye.write(etat);
			etat = 1 - etat;
			belly.write(etat);
	}, speed);
	var stopTimer = setTimeout(function(){
		clearInterval(timer);
		eye.write(0);
		belly.write(0);
	}, duration*1000);
};
exports.altLeds = altLeds;

var clearLeds = function(){
	clearInterval(timer);
};
exports.clearLeds = clearLeds;

var buttonPush = function(param){
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
};
exports.buttonPush = buttonPush;

var ledOn = function(led){
	if(led == 'led'){
		led.write(1);
	}else if(led == 'eye'){
		eye.write(1);
	}else if(led == 'belly'){
		belly.write(1);
	}else if(led == 'satellite'){
		satellite.write(1);
	}
};
exports.ledOn = ledOn;

var ledOff = function(led){
	if(led == 'led'){
		led.write(0);
	}else if(led == 'eye'){
		eye.write(0);
	}else if(led == 'belly'){
		belly.write(0);
	}else if(led == 'satellite'){
		satellite.write(0);
	}
};
exports.ledOff = ledOff;

var allLedsOff = function(){
	eye.write(0);
	belly.write(0);
	satellite.write(0);
	led.write(0);
};
exports.allLedsOff = allLedsOff;

var allLedsOn = function(){
	eye.write(1);
	belly.write(1);
	satellite.write(1);
	led.write(1);
};
exports.allLedsOn = allLedsOn;