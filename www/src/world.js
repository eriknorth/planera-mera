GameObj.World = function (game) {

	this._btnBack = null;

	// Alien
	this._alien = null;
	
	// Sound
	this._sound = null;
	
	// Room icons
	this._roomIcons = [];
	
	// Giggle
	this._giggle = false;
};

GameObj.World.prototype = {

	init: function (prevState) {
		if(prevState == 'room') {
			this._giggle = true;
		}
	},

	create: function () {
		
		// Get JSONs
		var gameJson = this.cache.getJSON('game');
		var worldsJson = this.cache.getJSON('worlds');
		
		var worldObj = worldsJson.worlds[GameObj.world];
		
		// Background
		this.stage.backgroundColor = '#304656';
		this.add.sprite(0, 0, 'w'+worldObj.id+'_bg');
		
		// Room icons
		for(i = 0; i < worldObj.rooms.length; i++) 
		{
			// Check if room is enabled
			if(worldObj.rooms[i].enabled == true)
			{
				// Check if level is enough high to access
				// TODO: Remove 1 == 1 ! TESTING...
				// if(GameObj.user.level >= worldObj.rooms[i].level || 1 == 1) {
				if(GameObj.user.level >= worldObj.rooms[i].level) {
					this._roomIcons[i] = this.add.button(
						worldObj.rooms[i].icon_x, 
						worldObj.rooms[i].icon_y, 
						'w'+worldObj.id+'_r'+worldObj.rooms[i].id+'_icon', 
						this.goToRoom(i), this, 2, 0, 1);
					
					this._roomIcons[i].anchor.setTo(0.5);
					this._roomIcons[i].scale.setTo(0.8);
				}
				else {
					// Add padlock
					this._roomIcons[i] = this.add.sprite(worldObj.rooms[i].icon_x, worldObj.rooms[i].icon_y, 'padlock_icon');
					this._roomIcons[i].anchor.setTo(0.5);
					this._roomIcons[i].scale.setTo(0.8);
				}
			}
		}
		
		// Back button
		this._btnBack = this.add.button(60, 60, 'btnBack', this.goToMenu, this, 2, 0, 1);
		this._btnBack.anchor.set(0.5);

		// Add alien
		// var alien = this.add.sprite(1080, 550, 'alien');
		// alien.frame = 0;
		// alien.anchor.setTo(0.5, 0.5);
		
		
		// Alien
		this._alien = new Alien(this, 1080, 550);
		this.add.existing(this._alien);
		this._alien.inputEnabled = true;
		this._alien.events.onInputDown.add(this.alienClickRelease, this);
		
		// Sound library
		this._sound = new Sound(this);
		
		// Give instruction
		this.giveInstruction();
	},
	
	goToMenu: function (pointer) {

		//	Go back to Menu
		this.state.start('Menu');

	},
	
	goToRoom: function (room) {
		return function () {
			
			var self = this;
			GameObj.room = room;
			
			// Get JSONs
			var worldsJson = this.cache.getJSON('worlds');
			// Get room objects
			var roomObj = worldsJson.worlds[GameObj.world].rooms[GameObj.room];
			
			// Get Stuff from DB
			// Get room level
			GameObj.db.getLevel(GameObj.user.id, roomObj.id, function (res) {
				
				// If no result returned -> first time this room has been opened
				if(res.rows.length == 0) {
					// Insert new clean room entry
					GameObj.db.insertLevel(GameObj.user.id, roomObj.id, function (id) {
						// Save user in game object
						GameObj.level = {id: id, user_id: GameObj.user.id, room: roomObj.id, level: 0, cleared: 0, failed: 0, timestamp: Date.now()};
						
						// Go to room only when level stuff loaded
						self.state.start('Room');
					});
				}
				else {
					// Save room in game object
					GameObj.level = res.rows.item(0);
					
					// Go to room only when level stuff loaded
					self.state.start('Room');
				}
			});
		}
	},

	// Click on _alien (release)
	alienClickRelease: function (sprite) {

		// TODO: tell something
		this.giveInstruction();
	},
	
	giveInstruction: function () {
		
		var self = this;
		
		// Choose audio
		// Allow only one giggle
		if(this._giggle == true) {
			this._giggle = false;
			
			// Start audio with delay
			setTimeout(function () {
				// Start talking animation
				self._alien.talk(true);
				self._sound.play('giggle_audio', function() { 
					self._alien.talk(false);
				});
			}, 1000);
		}
		else {
			// Start talking animation
			this._alien.talk(true);
			this.setButtonsActive(false);
		
			this._sound.play('introTeachMeHowToPlan_audio', function() { 
				self._alien.talk(false);
				self.setButtonsActive(true);
			});

		}
	},
	
	// Enable / Disable buttons
	setButtonsActive: function (state) {
		
		if(state == true) {
			for(var i = 0; i < this._roomIcons.length; i++) {
				this._roomIcons[i].alpha = 1;
				this._roomIcons[i].inputEnabled = true;
			}
			this._btnBack.alpha = 1;
			this._btnBack.inputEnabled = true;
		}
		else {
			for(var i = 0; i < this._roomIcons.length; i++) {
				this._roomIcons[i].alpha = 0.5;
				this._roomIcons[i].inputEnabled = false;
			}
			this._btnBack.alpha = 0.5;
			this._btnBack.inputEnabled = false;
		}
	},
	
	
};