var mtime = {core:null, web:null, data: null};

mtime.core = new Date('Thu Apr 27 2017 20:59:36 GMT+0200 (CEST)');
mtime.data = new Date('Wed Apr 26 2017 01:39:08 GMT+0200 (CEST)');
mtime.web = new Date();
console.log(mtime);

var dateArray = ['Thu Apr 27 2017 20:59:36 GMT+0200 (CEST)', 'Wed Apr 26 2017 01:39:08 GMT+0200 (CEST)', new Date()];

var lastDate = new Date(Math.max.apply(null, dateArray.map(function(e){
  return new Date(e);
})));


console.log('lastDate=>', lastDate);

console.log('end');


function getLastModifiedDate(paths){ // typeof paths => Array
  var dates = [];
  for(var i=0;i<paths.length;i++){
    fs.stat(paths[i], function(err, stats){
      console.log(paths[i], stats.mtime);
      dates.push(stats.mtime);
      //TODO calculer la date la plus récente...
    });
  }(i)
}
// getLastModifiedDate(['toto']);

/********************************************************************************************************************/



// process.stdout.write('toto');
console.log('start');
// console.debug = function(o){console.log(o)};
console.debug = function(){
  var log = '\u2022';
  for(var arg=0;arg<arguments.length;++arg){
    if(typeof arguments[arg] == 'object'){
      log = log + ' ' + util.format(util.inspect(arguments[arg]));
    }else{
      log = log + ' ' + arguments[arg];
    }
  }
  console.log(log);
};

var arr = ['firstItem', 'secondItem', 'thirdItem'];
var obj = {param1: 'value1', param2: "value2"};
console.debug('test', 'test2');
console.debug(arr);
console.debug('arr:', arr, 'end.');
console.debug('arr %j:', arr, 'end.');
console.debug(obj, 'end.');
console.debug('obj:', obj, 'end.');
console.debug('obj: %j', obj, 'end.'); //http://stackoverflow.com/questions/7428235/how-do-you-log-content-of-a-json-object-in-node-js


// if(CONFIG.debug){
// 	console.log('\u2022\u2022\u2022 DEBUG MODE \u2022\u2022\u2022');
// 	// console.debug = function(a,b,c){console.log(a,b,c);}
// 	// console.debug = function(o){process.stdout.write(util.format('\u2022 %s\n', util.inspect(o).replace(/^'+/g, '').replace(/'$/g, '')));}
// 	console.debug = function(o){
// 		//process.stdout.write(util.format('\u2022 %s\n', util.inspect(o).replace(/^'+/g, '').replace(/'$/g, '')));
// 		var log = '\u2022 %s\n';
// 		for(var arg=0;arg<arguments.length;++arg){
// 			// console.log(util.format(util.inspect(arg).replace(/^'+/g, '').replace(/'$/g, '')));
// 			log += util.format(util.inspect(arg).replace(/^'+/g, '').replace(/'$/g, ''));
// 		}
// 		process.stdout.write(log);
// 	}
// }else console.debug = function(o){};


// console.debug('test');
