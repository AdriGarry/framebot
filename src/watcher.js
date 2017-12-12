#!/usr/bin/env node

console.log('watcher...');
var fs = require('fs');

fs.watch('./tmp', { encoding: 'buffer' }, (eventType, filename) => {
	if (eventType) {
		console.log(eventType);
		// Prints: <Buffer ...>
	}
	if (filename) {
		console.log(filename);
		// Prints: <Buffer ...>
	}
});
