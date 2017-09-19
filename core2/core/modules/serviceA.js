#!/usr/bin/env node
'use strict'

FLUX.action.subscribe({
	next: data => console.log('serviceA', data),
	error: err => console.error('error in serviceA' + err)
	// if(data.id)
});
