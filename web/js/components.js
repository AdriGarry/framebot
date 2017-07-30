/** TTS component */
app.component('tts', {
	bindings: {
		data: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function($window, DefaultTile, UIService){
		var ctrl = this;
		var tileParams = {
			label: 'TTS - Voice synthesizing',
			actionList:[],
			expanded: false //collapsed
		};
		ctrl.access = true;
		ctrl.tile = new DefaultTile(tileParams, true);

		/** Overwrite tile action */
		ctrl.tile.click = function($event){
			if(!ctrl.tile.expanded){
				ctrl.toggleTileHeight();
				focusOnTtsInput();
			}
			return false;
		};

		ctrl.toggleTileHeight = function(){
			ctrl.tile.expanded = !ctrl.tile.expanded;
		};

		function focusOnTtsInput(){
			$window.document.getElementById('ttsMsg').focus(); // Setting to focus on tts message input
		};

		ctrl.tts = {
			voice: 'espeak',
			lg: 'fr',
			msg: '',
			voicemail: false,
			error: '',
			conf: {
				languageList: [{code: 'fr', label: 'French'}, {code: 'en', label: 'English'}, {code: 'ru', label: 'Russian'},
					{code: 'es', label: 'Spanish'}, {code: 'it', label: 'Italian'}, {code: 'de', label: 'German'}]/*,
				voiceList: [{code: ':3', label: 'Nice voice'}, {code: ':1', label: 'Robot voice'}]*/
			},
			cleanText: function(){ // TODO create an UtilsService.. ==> OR A FILTER !!!!
				console.log('cleanText');
				var message = ctrl.tts.msg || '';
				message = message.replace(/[àáâãäå]/g,'a'); // TODO chainer les replace
				message = message.replace(/[ç]/g,'c');
				message = message.replace(/[èéêë]/g,'e');
				message = message.replace(/[îï]/g,'i');
				message = message.replace(/[ôóö]/g,'o');
				message = message.replace(/[ûüù]/g,'u');
				ctrl.tts.msg = message;
			},
			submit: function(){
				console.log('submit', ctrl.tts);
				if(ctrl.tts.msg != ''){
					UIService.sendTTS(ctrl.tts, function(callback){
						if(callback.status == 200){
							ctrl.tts.msg = ''; ctrl.tts.error = ''; // Reinit TTS
						}
					});
				}else{
					focusOnTtsInput();
				}
			}
		};
	}
});

/** Mode component */
app.component('mode', {
	bindings: {
		data: '<',
		access: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile){
		var ctrl = this;
		var tileParams = {
			label: 'Mode',
			actionList:[{label: 'Reset', icon: 'retweet', url: '/resetConfig'},{
				label: '!Debug', icon: 'terminal', url: '/toggleDebug'},{
				label: 'Sleep', icon: 'moon-o', url: '/sleep'},{
				label: 'Restart', icon: 'bolt', url: '/odi'}]
		};
		ctrl.tile = new DefaultTile(tileParams);
	}
});

/** Volume component */
app.component('volume', {
	bindings: {
		data: '<',
		access: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile){
		var ctrl = this;
		var tileParams = {
			label: 'Volume',
			actionList:[{label: 'Mute', url: '/mute'}]
		};
		ctrl.tile = new DefaultTile(tileParams);
		ctrl.hasAccess = function(){
			console.log('hasAccess()', ctrl.access);
			return ctrl.access;
		}
	}
});

/** Alarms component */
app.component('alarms', {
	bindings: {
		data: '<',
		access: '<',
		odiState: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile, UIService, $mdpTimePicker){
		var ctrl = this;
		var tileParams = {
			label: 'Alarms',
			actionList:[{label: 'weekDay', icon: 'frown-o', url: '/alarm'},{
				label: 'weekEnd', icon: 'smile-o', url: '/alarm'}]
		};
		ctrl.tile = new DefaultTile(tileParams);
		ctrl.odiState = ctrl.odiState;

		/** Overwrite tile action */
		ctrl.tile.click = function(){
			ctrl.tile.openBottomSheet(this.actionList, specificActions);
		}

		var showTimePicker = function(ev){ // A déplacer dans Tile.js ?
			$mdpTimePicker(new Date(), {
				targetEvent: ev,
				autoSwitch: true
			}).then(function(selectedDate){
				ctrl.newAlarm.params = {
					when: ctrl.newAlarm.label,
					hours:selectedDate.getHours(),
					minutes:selectedDate.getMinutes()
				};
				ctrl.newAlarm.toast = ctrl.newAlarm.label + ' alarm set to ' + ctrl.newAlarm.params.hours
					+ ':' + ctrl.newAlarm.params.minutes;
				UIService.sendCommand(ctrl.newAlarm, function(data){
				});
			});;
		};

		var specificActions = function(button){
			ctrl.newAlarm = button;
			showTimePicker();
		};

		/** Function to display alarm of the day */
		ctrl.isTodayAlarm = function(days){
			if(days.indexOf(new Date().getDay()) >- 1){
				return true;
			}
			return;
		}
	}
});

/** Voicemail component */
app.component('voicemail', {
	bindings: {
		data: '<',
		access: '<',
		odiState: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile){
		var ctrl = this;
		var tileParams = {
			label: 'Voicemail',
			actionList:[{label: 'Clear', icon: 'trash-o', url: '/clearVoiceMail'},{label: 'Play', icon: 'play', url: '/checkVoiceMail'}]
		};

		ctrl.tile = new DefaultTile(tileParams);
		ctrl.odiState = ctrl.odiState;
	}
});

/** Hardware component */
app.component('hardware', {
	bindings: {
		data: '<',
		access: '<',
		odiState: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile){
		var ctrl = this;
		var tileParams = {
			label: 'Hardware',
			//disableOnSleep: true,
			actionList:[{url: '/cpuTemp'}]
		};
		ctrl.tile = new DefaultTile(tileParams);
		ctrl.odiState = ctrl.odiState;
	}
});

/** Exclamation component */
app.component('exclamation', {
	bindings: {
		data: '<',
		access: '<',
		odiState: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile){
		var ctrl = this;
		var tileParams = {
			label: 'Exclamation',
			actionList:[{label: 'Conversation', icon: 'comments-o', url: '/conversation'},{
				label: 'TTS', icon: 'commenting-o', url: '/tts?msg=RANDOM'},{
				label: 'Exclamation', icon: 'bullhorn', url: '/exclamation'},{
				label: 'Last TTS', icon: 'undo', url: '/lastTTS'}]
		};
		ctrl.tile = new DefaultTile(tileParams);
		ctrl.odiState = ctrl.odiState;
	}
});

/** Jukebox component */
app.component('jukebox', {
	bindings: {
		data: '<',
		access: '<',
		odiState: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile){
		var ctrl = this;
		var tileParams = {
			label: 'Jukebox',
			actionList:[{label: 'Jukebox', icon: 'random', url: '/jukebox'},{label: 'FIP Radio', icon: 'globe', url: '/fip'}]
		};
		ctrl.tile = new DefaultTile(tileParams);
		ctrl.odiState = ctrl.odiState;
	}
});

/** Timer component */
app.component('timer', {
	bindings: {
		data: '<',
		access: '<',
		odiState: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile){
		var ctrl = this;
		var tileParams = {
			label: 'Timer',
			actionList:[{label: 'Stop timer', icon: 'stop', url: '/timer?stop'},{label: 'Timer +1', icon: 'plus', url: '/timer'}]
		};
		ctrl.tile = new DefaultTile(tileParams);
		ctrl.odiState = ctrl.odiState;
	}
});

/** Time component */
app.component('time', {
	bindings: {
		data: '<',
		access: '<',
		odiState: '<',
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile){
		var ctrl = this;
		var tileParams = {
			label: 'Time',
			// actionList:[{url: '/time'}]
			actionList:[{label: 'Odi\'s age', icon: 'birthday-cake', url: '/age'},{
				label: 'Today', icon: 'calendar', url: '/date'},{
				label: 'Time', icon: 'clock-o', url: '/time'}]
		};
		ctrl.tile = new DefaultTile(tileParams);
		ctrl.odiState = ctrl.odiState;
	}
});

/** Date component */
app.component('date', {
	bindings: {
		data: '<',
		access: '<',
		odiState: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile){
		var ctrl = this;
		var tileParams = {
			label: 'Date',
			actionList:[{label: 'Odi\'s age', icon: 'birthday-cake', url: '/age'},{label: 'Today', icon: 'calendar', url: '/date'}]
		};
		ctrl.tile = new DefaultTile(tileParams);
		//this.tile.data = this.data;
		ctrl.odiState = ctrl.odiState;
	}
});

/** Weather component */
app.component('weather', {
	bindings: {
		data: '<',
		access: '<',
		odiState: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile){
		var ctrl = this;
		var tileParams = {
			label: 'Weather',
			actionList:[{label: 'Official weather', icon: 'cloud', url: '/weather'},{
				label: 'Random weather', icon: 'cloud-upload', url: '/weatherInteractive'}]
		};
		ctrl.tile = new DefaultTile(tileParams);
		ctrl.odiState = ctrl.odiState;
	}
});

/** Idea component */
app.component('idea', {
	bindings: {
		data: '<',
		access: '<',
		odiState: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile){
		var ctrl = this;
		var tileParams = {
			label: 'Idea',
			actionList:[{label: 'AAAdri', icon: 'font', url: '/adriExclamation'},{
				label: 'Idea', icon: 'lightbulb-o', url: '/idea'},{
				label: 'Test', icon: 'flag-checkered', url:'/test'}]
		};
		ctrl.tile = new DefaultTile(tileParams);
		ctrl.odiState = ctrl.odiState;
	}
});

/** Stories component */
app.component('stories', {
	bindings: {
		data: '<',
		access: '<',
		odiState: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile){
		var ctrl = this;
		var tileParams = {
			label: 'Stories',
			actionList:[{label: 'Naheulbeuk', icon: 'fort-awesome', url: '/naheulbeuk'},{
				label: 'Survivaure', icon: 'space-shuttle', url: '/survivaure'}]
		};
		ctrl.tile = new DefaultTile(tileParams);
		ctrl.odiState = ctrl.odiState;
	}
});

/** Bad boy component */
app.component('badBoy', {
	bindings: {
		data: '<',
		access: '<',
		odiState: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile){
		var ctrl = this;
		var tileParams = {
			label: 'Bad boy',
			actionList:[{label: 'BadBoy Mode', icon: 'comments', url:'/badBoy', continu: true},{
				label: 'BadBoy TTS', icon: 'comment', url:'/badBoy'}]
		};
		ctrl.tile = new DefaultTile(tileParams);
		ctrl.odiState = ctrl.odiState;

		/** Overwrite tile action */
		ctrl.tile.click = function(){
			ctrl.tile.openBottomSheet(this.actionList, specificActions);
		}

		var specificActions = function(button){
			if(button.label.indexOf('TTS') != -1){
				ctrl.tile.action(button);
			}else{
				var slider = {
					label: 'Bad boy interval',
					url: '/badBoy',
					legend: 'min',
					min: 10,
					max: 180,
					step: 1,
					value: 60,
					action: null
				};
				ctrl.tile.openSliderBottomSheet(slider)
			}
		};
	}
});

/** Party component */
app.component('party', {
	bindings: {
		data: '<',
		access: '<',
		odiState: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile){
		var ctrl = this;
		var tileParams = {
			label: 'Party',
			actionList:[{label: 'Party mode', icon: 'child', url: '/setParty'},{
				label: 'Cigales', icon: 'bug', url: '/cigales'}]
		};
		ctrl.tile = new DefaultTile(tileParams);
		ctrl.odiState = ctrl.odiState;
	}
});

/** Russia component */
app.component('russia', {
	bindings: {
		data: '<',
		access: '<',
		odiState: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile){
		var ctrl = this;
		var tileParams = {
			label: 'Russia',
			actionList:[{label: 'Subway / Street', icon: 'subway', url: '/russia'},{
				label: 'Hymn', icon: 'star', url: '/russia?hymn'}]
		};
		ctrl.tile = new DefaultTile(tileParams);
		ctrl.odiState = ctrl.odiState;
	}
});

/** Video component */
app.component('videos', {
	bindings: {
		data: '<',
		access: '<',
		odiState: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile){
		var ctrl = this;
		var tileParams = {
			label: 'Video',
			actionList:[{label: 'Sleep', icon: 'stop', url: '/videoOff'},
				{label: 'Play', icon: 'play', url: '/playVideo'}]
		};
		ctrl.tile = new DefaultTile(tileParams);
	}
});

/** Logs component */
app.component('logs', {
	bindings: {
		data: '<',
		access: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile){
		var ctrl = this;
		var tileParams = {
			label: 'Logs',
			actionList:[{label: 'Voicemail History', icon: 'file-text-o', url: 'http://odi.adrigarry.com/voicemailHistory'},{
				label: 'Request History', icon: 'file-text-o', url: 'http://odi.adrigarry.com/requestHistory'},{
				label: 'Config', icon: 'sliders', url: 'http://odi.adrigarry.com/config.json'}]
		};
		ctrl.tile = new DefaultTile(tileParams);
	}
});

/** System component */
app.component('system', {
	bindings: {
		data: '<',
		access: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile){
		var ctrl = this;
		var tileParams = {
			label: 'System',
			actionList:[{label: 'Shutdown', icon: 'power-off', url: '/shutdown'},{label: 'Reboot', icon: 'refresh', url: '/reboot'}]
		};
		ctrl.tile = new DefaultTile(tileParams);
	}
});

/** About component */
app.component('about', {
	bindings: {
		data: '<',
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile){
		var ctrl = this;
		var tileParams = {
			label: 'About',
			actionList:[]
		};
		ctrl.access = true;
		ctrl.tile = new DefaultTile(tileParams, true);
	}
});