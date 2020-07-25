#!/usr/bin/env node
'use strict';

const Core = require('./../../core/Core').Core;

const Logger = require('./../../api/Logger'),
	Flux = require('./../../api/Flux'),
	Utils = require('./../../api/Utils'),
	Observers = require('./../../api/Observers');

const log = new Logger(__filename);


const FLUX_PARSE_OPTIONS = [
];

Observers.attachFluxParseOptions('service', 'mood', FLUX_PARSE_OPTIONS);

