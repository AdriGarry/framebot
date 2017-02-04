#!/usr/bin/env node
'use strict'

/** Gulpfile */
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var useref = require('gulp-useref');
// console.log('useref', useref);
// console.log('useref.assets()', useref.assets());


gulp.task('watch', function(){
	console.log('watch task started');
	gulp.watch('/home/pi/odi/web/**/*.js', ['jsProd']);
	//gulp.watch('/home/pi/odi/web/**/*.css', ['cssProd']);
});


gulp.task('jsProd', function(){
	console.log('jsProd task running...');
	// console.log('useref', useref);
	// var assets = useref.assets();
	// var assets = useref();
	return gulp.src('web/index.html')
		.pipe(useref())
		.pipe(uglify()) // minify JS files
		// .pipe(useref().restore())
		.pipe(useref())
		.pipe(gulp.dest('dist'))
});


/*var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifyJS = require('gulp-minify');
gulp.task('concat', function(){
	return gulp.src('web/index.html')
		.pipe(minifyJS())
		.pipe(concat('bundle.min.js'))
		.pipe(uglify({ mangle: false }))
		.pipe(gulp.dest('dist/'));
});*/