/** TTS component */
app.component('tts', {
	bindings: {
		data: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function($window, DefaultTile, UIService) {
		var ctrl = this;
		var tileParams = {
			label: 'Text To Speech',
			actionList: [],
			expanded: false //collapsed
		};
		ctrl.access = true;
		ctrl.tile = new DefaultTile(tileParams, true);

		/** Overwrite tile action */
		ctrl.tile.click = function($event) {
			if (!ctrl.tile.expanded) {
				ctrl.toggleTileHeight();
				focusOnTtsInput();
			}
			return false;
		};

		ctrl.toggleTileHeight = function() {
			ctrl.tile.expanded = !ctrl.tile.expanded;
		};

		function focusOnTtsInput() {
			$window.document.getElementById('ttsMsg').focus(); // Setting to focus on tts message input
		}

		ctrl.tts = {
			voice: 'espeak',
			lg: 'fr',
			msg: '',
			voicemail: false,
			error: '',
			conf: {
				languageList: [
					{ code: 'fr', label: 'French' },
					{ code: 'en', label: 'English' },
					{ code: 'ru', label: 'Russian' },
					{ code: 'es', label: 'Spanish' },
					{ code: 'it', label: 'Italian' },
					{ code: 'de', label: 'German' }
				]
			},
			cleanText: function() {
				// TODO create an UtilsService.. ==> OR A FILTER !!!!
				console.log('cleanText');
				var message = ctrl.tts.msg || '';
				// message = message.replace(/[àáâãäå]/g, 'a'); // TODO chainer les replace
				// message = message.replace(/[ç]/g, 'c');
				// message = message.replace(/[èéêë]/g, 'e');
				// message = message.replace(/[îï]/g, 'i');
				// message = message.replace(/[ôóö]/g, 'o');
				// message = message.replace(/[ûüù]/g, 'u');
				// TODO TOTEST chainer les replace
				message = message
					.replace(/[àáâãäå]/g, 'a')
					.replace(/[ç]/g, 'c')
					.replace(/[èéêë]/g, 'e')
					.replace(/[îï]/g, 'i')
					.replace(/[ôóö]/g, 'o')
					.replace(/[ûüù]/g, 'u');
				//message = message.replace(/[<>]/g,''); // Others characters
				ctrl.tts.msg = message;
			},
			submit: function() {
				console.log('submit', ctrl.tts);
				if (ctrl.tts.msg != '') {
					UIService.sendTTS(ctrl.tts, function(callback) {
						if (callback.status == 200) {
							ctrl.tts.msg = '';
							ctrl.tts.error = ''; // Reinit TTS
						}
					});
				} else {
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
	controller: function(DefaultTile) {
		var ctrl = this;
		var tileParams = {
			label: 'Mode',
			actionList: [
				{ label: 'Reset', icon: 'fas fa-retweet', url: '/resetConfig' },
				{ label: '!Debug', icon: 'fas fa-terminal', url: '/toggleDebug' },
				{ label: 'Sleep', icon: 'far fa-moon', url: '/sleep' },
				{ label: 'Restart', icon: 'fas fa-bolt', url: '/odi' }
			]
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
	controller: function(DefaultTile) {
		var ctrl = this;
		var tileParams = {
			label: 'Volume',
			actionList: [{ label: 'Mute', url: '/mute' }]
		};
		ctrl.tile = new DefaultTile(tileParams);
		ctrl.hasAccess = function() {
			console.log('hasAccess()', ctrl.access);
			return ctrl.access;
		};
	}
});

/** Runtime component */
app.component('runtime', {
	bindings: {
		data: '<',
		access: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile) {
		var ctrl = this;
		var tileParams = {
			label: 'Runtime',
			actionList: [
				{ label: 'Errors', icon: 'fas fa-exclamation-triangle', url: 'http://odi.adrigarry.com/errors' },
				{ label: 'Config', icon: 'fab fa-whmcs', url: 'http://odi.adrigarry.com/config.json' },
				{ label: 'Runtime', icon: 'fab fa-codepen', url: 'http://odi.adrigarry.com/runtime' }
			]
		};
		ctrl.tile = new DefaultTile(tileParams);
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
	controller: function(DefaultTile, $rootScope, UIService, $mdpTimePicker) {
		var ctrl = this;
		var tileParams = {
			label: 'Alarms',
			actionList: [
				{ label: 'Disable all', icon: 'fas fa-ban', url: '/alarmOff' },
				{ label: 'weekDay', icon: 'far fa-frown', url: '/alarm' },
				{ label: 'weekEnd', icon: 'far fa-smile', url: '/alarm' }
			]
		};
		ctrl.tile = new DefaultTile(tileParams);
		ctrl.odiState = ctrl.odiState;

		/** Overwrite tile action */
		ctrl.tile.click = function() {
			if (!$rootScope.irda) {
				UIService.showErrorToast('Unauthorized action.');
			} else {
				ctrl.tile.openBottomSheet(this.actionList, specificActions);
			}
		};

		var showTimePicker = function(ev) {
			// A déplacer dans Tile.js ?
			$mdpTimePicker(new Date(), {
				targetEvent: ev,
				autoSwitch: true
			}).then(function(selectedDate) {
				ctrl.newAlarm.params = {
					when: ctrl.newAlarm.label,
					h: selectedDate.getHours(),
					m: selectedDate.getMinutes()
				};
				ctrl.newAlarm.toast =
					ctrl.newAlarm.label + ' alarm set to ' + ctrl.newAlarm.params.h + ':' + ctrl.newAlarm.params.m;
				UIService.sendCommand(ctrl.newAlarm);
			});
		};

		var specificActions = function(button) {
			if (button.url == '/alarmOff') {
				UIService.sendCommand(button);
			} else {
				ctrl.newAlarm = button;
				showTimePicker();
			}
		};

		/** Function to display alarm of the day */
		const WEEK_DAYS = [1, 2, 3, 4, 5];
		ctrl.getTodayAlarm = function() {
			if (ctrl.data.value.weekDay || ctrl.data.value.weekEnd) {
				let alarmType = WEEK_DAYS.indexOf(new Date().getDay()) > -1 ? 'weekDay' : 'weekEnd';
				return ctrl.data.value[alarmType];
			}
			return false;
		};
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
	controller: function(DefaultTile) {
		var ctrl = this;
		var tileParams = {
			label: 'Voicemail',
			actionList: [
				{ label: 'Clear', icon: 'far fa-trash-alt', url: '/clearVoiceMail' },
				{ label: 'Play', icon: 'fas fa-play', url: '/checkVoiceMail' }
			]
		};

		ctrl.tile = new DefaultTile(tileParams);
		ctrl.odiState = ctrl.odiState;
	}
});

/** CPU component */
app.component('hardware', {
	bindings: {
		data: '<',
		access: '<',
		odiState: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile) {
		var ctrl = this;
		var tileParams = {
			label: 'Hardware',
			//disableOnSleep: true,
			actionList: [
				{ label: 'Disk Space', icon: 'fas fa-3x fa-chart-pie', url: '/diskSpaceTTS' },
				{ label: 'CPU', icon: 'fab fa-3x fa-empire', url: '/cpuTTS' },
				{ label: 'Memory', icon: 'fas fa-3x fa-microchip', url: '/soulTTS' }
			]
		};
		ctrl.tile = new DefaultTile(tileParams);
		ctrl.odiState = ctrl.odiState;

		ctrl.getMemoryPerCent = function() {
			var memory = ctrl.data.value.memory.system;
			var memoryRegex = /([\d]+)\/([\d]+)/g;
			var match = memoryRegex.exec(memory);
			var value = match[1],
				total = match[2];
			return (value / total * 100).toFixed(0);
		};
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
	controller: function(DefaultTile) {
		var ctrl = this;
		var tileParams = {
			label: 'Exclamation',
			actionList: [
				{ label: 'TTS', icon: 'far fa-comment-alt', url: '/tts?msg=RANDOM' },
				{ label: 'Exclamation', icon: 'fas fa-bullhorn', url: '/exclamation' },
				{ label: 'Last TTS', icon: 'fas fa-undo', url: '/lastTTS' }
			]
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
	controller: function(DefaultTile) {
		var ctrl = this;
		var tileParams = {
			label: 'Jukebox',
			actionList: [
				{ label: 'Jukebox', icon: 'fas fa-random', url: '/jukebox' },
				{ label: 'FIP Radio', icon: 'fas fa-globe', url: '/fip' }
			]
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
	controller: function(DefaultTile) {
		var ctrl = this;
		var tileParams = {
			label: 'Timer',
			actionList: [
				{ label: 'Stop timer', icon: 'fas fa-stop', url: '/timer?stop' },
				{ label: 'Timer +3', icon: 'fas fa-plus', url: '/timer?min=3' },
				{ label: 'Timer +1', icon: 'fas fa-plus', url: '/timer' }
			]
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
		odiState: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile) {
		var ctrl = this;
		var tileParams = {
			label: 'Time',
			// actionList:[{url: '/time'}]
			actionList: [
				{ label: "Odi's age", icon: 'fas fa-birthday-cake', url: '/age' },
				{ label: 'Today', icon: 'fas fa-calendar-alt', url: '/date' },
				{ label: 'Time', icon: 'far fa-clock', url: '/time' }
			]
		};
		ctrl.tile = new DefaultTile(tileParams);
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
	controller: function(DefaultTile) {
		var ctrl = this;
		var tileParams = {
			label: 'Weather',
			actionList: [
				{ label: 'Official weather', icon: 'fas fa-cloud', url: '/weather' },
				{ label: 'Random weather', icon: 'fas fa-cloud-upload-alt', url: '/weatherInteractive' }
			]
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
	controller: function(DefaultTile) {
		var ctrl = this;
		var tileParams = {
			label: 'Idea',
			actionList: [
				{ label: 'Total lines', icon: 'far fa-file-code', url: '/totalLinesTTS' },
				{ label: 'Cigales', icon: 'fas fa-bug', url: '/cigales' },
				{ label: 'Idea', icon: 'far fa-lightbulb', url: '/idea' },
				{ label: 'Test', icon: 'fas fa-flag-checkered', url: '/test' }
			]
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
	controller: function(DefaultTile) {
		var ctrl = this;
		var tileParams = {
			label: 'Stories',
			actionList: [
				{ label: 'Naheulbeuk', icon: 'fab fa-fort-awesome', url: '/naheulbeuk' },
				{ label: 'Survivaure', icon: 'fas fa-space-shuttle', url: '/survivaure' }
			]
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
	controller: function(DefaultTile, $rootScope, UIService) {
		var ctrl = this;
		var tileParams = {
			label: 'Bad boy',
			actionList: [
				{ label: 'BadBoy Mode', icon: 'fas fa-comments', url: '/badBoy', continu: true },
				{ label: 'BadBoy TTS', icon: 'fas fa-comment', url: '/badBoy' }
			]
		};
		ctrl.tile = new DefaultTile(tileParams);
		ctrl.odiState = ctrl.odiState;

		/** Overwrite tile action */
		ctrl.tile.click = function() {
			if (!$rootScope.irda) {
				UIService.showErrorToast('Unauthorized action.');
			} else {
				ctrl.tile.openBottomSheet(this.actionList, specificActions);
			}
		};

		var specificActions = function(button) {
			if (button.label.indexOf('TTS') != -1) {
				ctrl.tile.action(button);
			} else {
				var slider = {
					label: 'Bad boy interval',
					url: '/badBoy',
					legend: 'min',
					min: 10,
					max: 300,
					step: 1,
					value: 60,
					action: null
				};
				ctrl.tile.openSliderBottomSheet(slider);
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
	controller: function(DefaultTile) {
		var ctrl = this;
		var tileParams = {
			label: 'Party',
			actionList: [
				{ label: 'Birthday song', icon: 'fas fa-birthday-cake', url: '/birthday' },
				{ label: 'Party mode', icon: 'fas fa-child', url: '/setParty' },
				{ label: 'Pirate', icon: 'fas fa-beer', url: '/pirate' },
				{ label: 'TTS', icon: 'far fa-comment-alt', url: '/partyTTS' }
			]
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
	controller: function(DefaultTile) {
		var ctrl = this;
		var tileParams = {
			label: 'Russia',
			actionList: [
				{ label: 'Subway / Street', icon: 'fas fa-subway', url: '/russia' },
				{ label: 'Hymn', icon: 'fas fa-star', url: '/russia?hymn' }
			]
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
	controller: function(DefaultTile) {
		var ctrl = this;
		var tileParams = {
			label: 'Video',
			actionList: [
				{ label: 'Sleep', icon: 'fas fa-stop', url: '/videoOff' },
				{ label: 'Play', icon: 'fas fa-play', url: '/playVideo' }
			]
		};
		ctrl.tile = new DefaultTile(tileParams);
	}
});

/** Arduino component */
app.component('arduino', {
	bindings: {
		data: '<',
		access: '<',
		odiState: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile) {
		var ctrl = this;
		var tileParams = {
			label: 'Arduino',
			actionList: [
				// { label: 'Sleep', icon: 'fas fa-stop', url: '/arduinoSleep' },
				// { label: 'Go', icon: 'fas fa-play', url: '/arduino' }
				{ label: 'Melody', icon: 'fas fa-music', url: '/arduinoMelody' },
				{ label: 'RDM Melody', icon: 'fas fa-music', url: '/arduinoRdmMelody' },
				{ label: 'Horn', icon: 'fas fa-bullhorn', url: '/arduinoHorn' }
			]
		};
		ctrl.tile = new DefaultTile(tileParams);
	}
});

/** Options component */
app.component('options', {
	bindings: {
		data: '<',
		access: '<',
		odiState: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile) {
		var ctrl = this;
		var tileParams = {
			label: 'Options',
			actionList: [
				{ label: 'Test cycle', icon: 'fab fa-nintendo-switch', url: '/testSequence' },
				{ label: 'Demo', icon: 'fas fa-play', url: '/demo' },
				{ label: 'Watcher', icon: 'fas fa-eye', url: '/watcher' }
			]
		};
		ctrl.tile = new DefaultTile(tileParams);
	}
});

/** Logs component */
app.component('history', {
	bindings: {
		data: '<',
		access: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile) {
		var ctrl = this;
		var tileParams = {
			label: 'History',
			actionList: [
				{ label: 'Archive', icon: 'fas fa-file-archive', url: '/archiveLog' },
				{ label: 'TTS', icon: 'far fa-comment-alt', url: 'http://odi.adrigarry.com/ttsUIHistory' },
				{ label: 'Voicemail', icon: 'far fa-envelope', url: 'http://odi.adrigarry.com/voicemailHistory' },
				{ label: 'Request', icon: 'fas fa-exchange-alt', url: 'http://odi.adrigarry.com/requestHistory' },
				{ label: 'Errors', icon: 'fas fa-exclamation-triangle', url: 'http://odi.adrigarry.com/errorHistory' }
			]
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
	controller: function(DefaultTile) {
		var ctrl = this;
		var tileParams = {
			label: 'System',
			actionList: [
				{ label: 'Shutdown', icon: 'fas fa-power-off', url: '/shutdown' },
				{ label: 'Reboot', icon: 'fas fa-sync', url: '/reboot' }
			]
		};
		ctrl.tile = new DefaultTile(tileParams);
	}
});

/** About component */
app.component('about', {
	bindings: {
		data: '<'
	},
	templateUrl: 'templates/tiles.html',
	controller: function(DefaultTile) {
		var ctrl = this;
		var tileParams = {
			label: 'About',
			actionList: [{ url: 'http://odi.adrigarry.com/about' }]
		};
		ctrl.access = true;
		ctrl.tile = new DefaultTile(tileParams, true);
	}
});
