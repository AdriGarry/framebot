#!/usr/bin/env node
'use strict';

const logger = require('./Logger');

const log = new logger(__filename);

module.exports = class Scheduler {

   static TIMEOUTS = {};
 
   static decrement(id, minutesToTimeout, endCallback, decrementCallback){
      if(!minutesToTimeout){
         clearTimeout(this.TIMEOUTS[id]);
         endCallback();
      }
      this.TIMEOUTS[id] = setTimeout(()=>{
         if(decrementCallback){
            decrementCallback();
         }
         decrement(id, minutesToTimeout--, endCallback, decrementCallback)
      }, minutesToTimeout*60);
   }

}