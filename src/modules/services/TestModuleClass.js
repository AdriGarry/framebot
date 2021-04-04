const Module = require('../../api/Module');
const Logger = require('../../api/Logger');
const log = new Logger(__filename);

module.exports = class TestModuleClass extends Module {
   constructor(arg) {
      super();
      this.crons = {
         full: [
            { cron: '5 0 0 * * 1-5', flux: { id: 'service|context|goToSleep' } },
            { cron: '5 0 2 * * 0,6', flux: { id: 'service|context|goToSleep' } },
            {
               cron: '13 13 13 * * 1-6',
               flux: [
                  { id: 'interface|tts|speak', data: { lg: 'en', msg: 'Auto restart' } },
                  { id: 'service|context|restart', conf: { delay: 3 } }
               ]
            },
            {
               cron: '13 13 13 * * 0',
               flux: [
                  { id: 'interface|tts|speak', data: { lg: 'en', msg: 'Reset config' } },
                  { id: 'service|context|reset', conf: { delay: 3 } }
               ]
            }
         ]
      };
   }

   onInit() {
      log.test('new test module as class instanciation');
      privateMethod();
   }
}

function privateMethod() {
   log.test('inside private method!')
}

// const exportData = {
//    cron: {
//       full: [
//          { cron: '5 0 0 * * 1-5', flux: { id: 'service|context|goToSleep' } },
//          { cron: '5 0 2 * * 0,6', flux: { id: 'service|context|goToSleep' } },
//          {
//             cron: '13 13 13 * * 1-6',
//             flux: [
//                { id: 'interface|tts|speak', data: { lg: 'en', msg: 'Auto restart' } },
//                { id: 'service|context|restart', conf: { delay: 3 } }
//             ]
//          },
//          {
//             cron: '13 13 13 * * 0',
//             flux: [
//                { id: 'interface|tts|speak', data: { lg: 'en', msg: 'Reset config' } },
//                { id: 'service|context|reset', conf: { delay: 3 } }
//             ]
//          }
//       ]
//    }
// };
