GameObj.Menu = function (game) {

	this.music = null;
	this.btnAbout = null;
	this.btnMovie = null;

};

GameObj.Menu.prototype = {

	create: function () {
		
		// Set backgound
		this.stage.backgroundColor = '#304656';
		this.add.sprite(0, 0, 'background');
		
		// Get JSONs
		var gameJson = this.cache.getJSON('game');
		var worldsJson = this.cache.getJSON('worlds');

		// Add title
		var title = this.add.sprite(this.world.centerX, 80, 'title');
		title.anchor.setTo(0.5, 0.5);
		
		// Defines position of icons depending on the number of worlds
		var dist = this.world.width/4;
		var worldIconPos = [
			[{x:dist*2.5,y:this.world.centerY}],
			[{x:dist*2,y:this.world.centerY},{x:dist*3,y:this.world.centerY}],
			[{x:dist*2.5,y:this.world.centerY-100},{x:dist*2,y:this.world.centerY+100},{x:dist*3,y:this.world.centerY+100}],
			[{x:dist*2,y:this.world.centerY-100},{x:dist*3,y:this.world.centerY-100},{x:dist*2,y:this.world.centerY+100},{x:dist*3,y:this.world.centerY+100}]	
		]
		
		// --- Add elements ---
		// Add rocket	
		var rocket = this.add.sprite(dist, this.world.centerY, 'rocket_icon');
		rocket.anchor.setTo(0.5, 0.5);
		rocket.inputEnabled = true;
		rocket.events.onInputUp.add(this.goToRocket, this);
		
		// Add world icons/padlocks
		var worldCount = worldsJson.worlds.length;
		var worldIcons = [];
		for(i = 0; i < worldCount; i++)
		{
			// Check if enabled
			if(worldsJson.worlds[i].enabled == true) {
				// Check if level is enough high to access
				if(GameObj.user.level >= worldsJson.worlds[i].level) {
					worldIcons[i] = this.add.sprite(worldIconPos[worldCount-1][i].x, worldIconPos[worldCount-1][i].y, 'w'+worldsJson.worlds[i].id+'_icon');
					worldIcons[i].inputEnabled = true;
					worldIcons[i].anchor.setTo(0.5, 0.5);
					// Add event
					worldIcons[i].events.onInputUp.add(this.goToWorld(i), this);
				}
				else {
					// Add padlock
					worldIcons[i] = this.add.sprite(worldIconPos[worldCount-1][i].x, worldIconPos[worldCount-1][i].y, 'padlock_icon');
					worldIcons[i].anchor.setTo(0.5, 0.5);
				}
			}
		}

		// Add buttons
		this.btnAbout = this.game.add.button(this.game.world.centerX - 60, this.game.world.height - 80, 'btnAbout', this.goToAbout, this, 2, 0, 1);
		this.btnAbout.anchor.setTo(0.5);
		this.btnMovie = this.game.add.button(this.game.world.centerX + 60, this.game.world.height - 80, 'btnMovie', this.goToMovie, this, 2, 0, 1);
		this.btnMovie.anchor.setTo(0.5);

	},

	update: function () {

		//	Do some nice funky main menu effect here

	},

	goToAbout: function (pointer) {

		GameObj.db.insertEvent(1, 'about');

		//	Go to About page
		this.state.start('About');

	},
	
	goToRocket: function (pointer) {

		//	Go to About page
		this.state.start('Rocket');

	},
	
	goToMovie: function (pointer) {

		GameObj.music.stop();

	},
	
	goToWorld: function (world) {
		return function () {
			GameObj.world = world;
			this.state.start('World');
		}
	}

};