#!/usr/bin/env node
// Module Service

var spawn = require('child_process').spawn;
// var Gpio = require('onoff').Gpio;
var request = require('request');
var xmlreader = require('xmlreader');
var leds = require('./leds.js');
var tts = require('./tts.js');

var weather = function(){
	request.post({
		url:'http://weather.yahooapis.com/forecastrss?w=610264&u=c',
		//body: content,
		headers: {'Content-Type': 'text/plain'}
	},
	function (error, response, body){
		if(error){
			console.error('Error getting weather info  /!\\');	
		}else if(!error && response.statusCode == 200){
			xmlreader.read(response, function (err, res){
				if(err) return console.log(err);
				// use .text() to get the content of a node: 
				console.log(res.response.text());
				// use .attributes() to get the attributes of a node: 
				console.log(res.response.attributes().shop);
			 
				// using the .count() and the .at() function, you can loop through nodes with the same name: 
				// for(var i = 0; i < res.response.who.count(); i++){
					// console.log(res.response.who.at(i).text());
				// }
			 
				// you can also use .each() to loop through the nodes of the same name: 
				// res.response.who.each(function (i, who){
					// console.log(who.text());
				// });
				// console.log(res.response.who.at(1).text());

				// you can also get the parent of a node using .parent(): 
				// console.log(res.response.who.at(1).parent().attributes().id);
			});
		}
	});
};
exports.weather = weather;
