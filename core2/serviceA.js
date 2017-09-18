#!/usr/bin/env node
'use strict'

FLUX.out.subscribe({
	next: data => console.log('serviceA', data),
	error: err => console.error('error in serviceA' + err)
	// if(data.id)
});
