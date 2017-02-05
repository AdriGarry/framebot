/** TTS component */
app.component('tts', {
	bindings: {
		data: '<'
	},
	templateUrl: '/templates/tiles.html',
	controller: function(DefaultTile){
		var tileParams = {
			label: 'TTS - Voice synthesizing',
			actionList:[],
			state: 'active' //collapsed
		};

		this.tile = new DefaultTile(tileParams);

		/** Overwrite tile action */
		this.action = function(){
			console.log('Overwrite tile action');
			toggleTileState();
		};

		function toggleTileState(){
			console.log('toggleTileState', toggleTileState);
		}
	}
});

/** mode component */
app.component('mode', {
	bindings: {
		data: '<'
	},
	templateUrl: '/templates/tiles.html',
	controller: function(DefaultTile){
		//function Tile(id, label, color, rowspan, colspan, viewMode, value, actionList){
		var tileParams = {
			label: 'Mode',
			actionList:[{label: 'Reset', icon: 'retweet', url: '/resetConfig'},{
				label: '!Debug', icon: 'terminal', url: '/toggleDebug'},{
				label: 'Sleep', icon: 'moon-o', url: '/sleep'},{
				label: 'Restart', icon: 'bolt', url: '/odi'}]
		};
		this.tile = new DefaultTile(tileParams); //console.log('this.tile', this.tile);
	}
});

/** Volume component */
app.component('volume', {
	bindings: {
		data: '<'
	},
	templateUrl: '/templates/tiles.html',
	controller: function(DefaultTile){
		var tileParams = {
			label: 'Volume',
			actionList:[{label: 'Mute', url: '/mute'}]
		};

		this.tile = new DefaultTile(tileParams);
		//this.tile.data = this.data;
	}
});

/** Alarm component */
app.component('alarm', {
	bindings: {
		data: '<',
		odiState: '<'
	},
	templateUrl: '/templates/tiles.html',
	controller: function(DefaultTile){
		var tileParams = {
			label: 'Alarms',
			actionList:[{url: '/alarm', params: {h:8,m:12,test:'bouts'}}]
		};
		this.tile = new DefaultTile(tileParams);
		this.odiState = this.odiState;

		/** Overwrite tile action */
		this.action = function(){
			console.log('Overwrite tile action');
		};
	}
});

/** Voicemail component */
app.component('voicemail', {
	bindings: {
		data: '<',
		odiState: '<'
	},
	templateUrl: '/templates/tiles.html',
	controller: function(DefaultTile){
		var tileParams = {
			label: 'Voicemail',
			actionList:[{label: 'Clear', icon: 'trash-o', url: '/clearVoiceMail'},{label: 'Play', icon: 'play', url: '/checkVoiceMail'}]
		};

		this.tile = new DefaultTile(tileParams);
		this.odiState = this.odiState;
	}
});

/** CPU component */
app.component('cpu', {
	bindings: {
		data: '<',
		odiState: '<'
	},
	templateUrl: '/templates/tiles.html',
	controller: function(DefaultTile){
		var tileParams = {
			label: 'CPU',
			//disableOnSleep: true,
			actionList:[{url: '/cpuTemp'}]
		};
		this.tile = new DefaultTile(tileParams);
		this.odiState = this.odiState;
	}
});

/** Exclamation component */
app.component('exclamation', {
	bindings: {
		data: '<',
		odiState: '<'
	},
	templateUrl: '/templates/tiles.html',
	controller: function(DefaultTile){
		var tileParams = {
			label: 'Exclamation',
			actionList:[{label: 'Conversation', icon: 'comments-o', url: '/conversation'},{
				label: 'TTS', icon: 'commenting-o', url: '/tts?msg=RANDOM'},{
				label: 'Exclamation', icon: 'bullhorn', url: '/exclamation'},{
				label: 'Last TTS', icon: 'undo', url: '/lastTTS'}]
		};
		this.tile = new DefaultTile(tileParams);
		this.odiState = this.odiState;
	}
});

/** Jukebox component */
app.component('jukebox', {
	bindings: {
		data: '<',
		odiState: '<'
	},
	templateUrl: '/templates/tiles.html',
	controller: function(DefaultTile){
		var tileParams = {
			label: 'Jukebox',
			actionList:[{label: 'Jukebox', icon: 'random', url: '/jukebox'},{label: 'FIP Radio', icon: 'globe', url: '/fip'}]
		};
		this.tile = new DefaultTile(tileParams);
		this.odiState = this.odiState;
	}
});

/** Timer component */
app.component('timer', {
	bindings: {
		data: '<',
		odiState: '<'
	},
	templateUrl: '/templates/tiles.html',
	controller: function(DefaultTile){
		var tileParams = {
			label: 'Timer',
			actionList:[{label: 'Stop timer', icon: 'stop', url: '/timer?stop'},{label: 'Timer +1', icon: 'plus', url: '/timer'}]
		};
		this.tile = new DefaultTile(tileParams);
		this.odiState = this.odiState;
	}
});

/** Time component */
app.component('time', {
	bindings: {
		data: '<',
		odiState: '<'
	},
	templateUrl: '/templates/tiles.html',
	controller: function(DefaultTile){
		var tileParams = {
			label: 'Time',
			actionList:[{url: '/time'}]
		};
		this.tile = new DefaultTile(tileParams);
		this.odiState = this.odiState;
	}
});

/** Date component */
app.component('date', {
	bindings: {
		data: '<',
		odiState: '<'
	},
	templateUrl: '/templates/tiles.html',
	controller: function(DefaultTile){
		var tileParams = {
			label: 'Date',
			actionList:[{label: 'Odi\'s age', icon: 'birthday-cake', url: '/age'},{label: 'Today', icon: 'calendar', url: '/date'}]
		};
		this.tile = new DefaultTile(tileParams);
		//this.tile.data = this.data;
		this.odiState = this.odiState;
	}
});

/** Weather component */
app.component('weather', {
	bindings: {
		data: '<',
		odiState: '<'
	},
	templateUrl: '/templates/tiles.html',
	controller: function(DefaultTile){
		var tileParams = {
			label: 'Weather',
			actionList:[{url: '/meteo'}]
		};

		this.tile = new DefaultTile(tileParams);
		this.odiState = this.odiState;
	}
});

/** Idea component */
app.component('idea', {
	bindings: {
		data: '<',
		odiState: '<'
	},
	templateUrl: '/templates/tiles.html',
	controller: function(DefaultTile){
		var tileParams = {
			label: 'Idea',
			actionList:[{label: 'Survivaure', icon: 'space-shuttle', url: '/survivaure'},{
				label: 'Naheulbeuk', icon: 'fort-awesome', url: '/naheulbeuk'},{
				label: 'AAAdri', icon: 'font', url: '/adriExclamation'},{
				label: 'Idea', icon: 'lightbulb-o', url: '/idea'},{
				label: 'Test', icon: 'flag-checkered', url:'/test'}]
		};
		this.tile = new DefaultTile(tileParams);
		this.odiState = this.odiState;
	}
});

/** Party component */
app.component('party', {
	bindings: {
		data: '<',
		odiState: '<'
	},
	templateUrl: '/templates/tiles.html',
	controller: function(DefaultTile){
		var tileParams = {
			label: 'Party',
			actionList:[{url: '/setParty'}]
		};
		this.tile = new DefaultTile(tileParams);
		this.odiState = this.odiState;
	}
});

/** Russia component */
app.component('russia', {
	bindings: {
		data: '<',
		odiState: '<'
	},
	templateUrl: '/templates/tiles.html',
	controller: function(DefaultTile){
		var tileParams = {
			label: 'Russia',
			actionList:[{label: 'Subway / Street', icon: 'subway', url: '/russia'},{
				label: 'Hymn', icon: 'star', url: '/russia?hymn'}]
		};
		this.tile = new DefaultTile(tileParams);
		this.odiState = this.odiState;
	}
});

/** Logs component */
app.component('logs', {
	bindings: {
		data: '<',
	},
	templateUrl: '/templates/tiles.html',
	controller: function(DefaultTile){
		var tileParams = {
			label: 'Logs',
			actionList:[{label: 'Voicemail History', icon: 'file-text-o', url: 'http://odi.adrigarry.com/voicemailHistory'},{
				label: 'Request History', icon: 'file-text-o', url: 'http://odi.adrigarry.com/requestHistory'},{
				label: 'Config', icon: 'sliders', url: 'http://odi.adrigarry.com/config.json'}]
		};
		this.tile = new DefaultTile(tileParams);
	}
});

/** System component */
app.component('system', {
	bindings: {
		data: '<',
	},
	templateUrl: '/templates/tiles.html',
	controller: function(DefaultTile){
		var tileParams = {
			label: 'System',
			actionList:[{label: 'Shutdown', icon: 'power-off', url: '/shutdown'},{label: 'Reboot', icon: 'refresh', url: '/reboot'}]
		};
		this.tile = new DefaultTile(tileParams);
	}
});

/** About component */
app.component('about', {
	bindings: {
		data: '<',
	},
	templateUrl: '/templates/tiles.html',
	controller: function(DefaultTile){
		var tileParams = {
			label: 'About',
			actionList:[]
		};
		this.tile = new DefaultTile(tileParams);
	}
});