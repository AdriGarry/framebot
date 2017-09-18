#!/usr/bin/env node
'use strict'

module.exports = {
	doSomething: doSomething,
	doSomethingElse: doSomethingElse
};

function doSomething(arg){
	console.log('serviceA.doSomething()', arg);
}

function doSomethingElse(arg){
	console.log('serviceA.doSomethingElse()', arg);
}
