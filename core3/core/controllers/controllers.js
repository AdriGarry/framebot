#!/usr/bin/env node
'use strict'

var ODI = require(ODI_PATH + 'core/shared.js');

 // OU A METTRE DIRECTEMENT DANS brain.js ???

module.exports = {
    button: require(ODI.path.CORE_PATH + 'controllers/button.js'),
    web: require(ODI.path.CORE_PATH + 'controllers/web.js'),
    jobs: require(ODI.path.CORE_PATH + 'controllers/jobs.js')
};