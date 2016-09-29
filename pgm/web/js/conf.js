'use strict'
var app = angular.module('odiUI', ['ngMaterial', 'pr.longpress']);

app.config(function($httpProvider){
	delete $httpProvider.defaults.headers.common['X-Requested-With'];
});