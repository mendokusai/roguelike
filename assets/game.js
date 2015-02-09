var Game = {
	_display: null,
	_currentScreen: null,
	_screenWidth: 80,
	_screenHeight: 24,

	init: function() {
			//any initialization will happen here
		this._display = new ROT.Display({ width: this._screenWidth, 
			height: this._screenHeight + 1 });
		//create a helper for binding to an event and making it send to the screen
		var game = this;
		var bindEventToScreen = function(event) {
			window.addEventListener(event, function(e) {
				//event is received, send to screen
				if (game._currentScreen !== null){
					//send event type and data to screen
					game._currentScreen.handleInput(event, e);
				}
			});
		};
		bindEventToScreen('keydown');
		// bindEventToScreen('keyup');
		bindEventToScreen('keypress');
	},

	getDisplay: function() {
		return this._display;
	},

	getScreenWidth: function() {
		return this._screenWidth;
	},

	getScreenHeight: function() {
		return this._screenHeight;
	},

	refresh: function() {
		//clear the screen
		this._display.clear();
		//render the screen
		this._currentScreen.render(this._display);
	},

	switchScreen: function(screen) {
		//if screen exists, notify that we exited
		if (this._currentScreen !== null) {
			this._currentScreen.exit();
		}
		//clear display
		this.getDisplay().clear();
		//update current screen, notice if we enter, render it.
		this._currentScreen = screen;
		if(!this._currentScreen !== null) {
			this._currentScreen.enter();
			this.refresh();
		}
	}
}

	

window.onload = function(){
// Check if rot.js can work on this browser
	if (!ROT.isSupported()) {
	    alert("The rot.js library isn't supported by your browser.");
	} else {
    //initialize game
    Game.init();
    //add container to page
		document.body.appendChild(Game.getDisplay().getContainer());
		//load start screen
		Game.switchScreen(Game.Screen.startScreen);
	}
}