GameObj.World = function (game) {

	this.btnBack = null;

};

GameObj.World.prototype = {

	create: function () {
		
		// Get JSONs
		var gameJson = this.cache.getJSON('game');
		var worldsJson = this.cache.getJSON('worlds');
		
		var worldObj = worldsJson.worlds[GameObj.world];
		
		// Background
		this.stage.backgroundColor = '#304656';
		this.add.sprite(0, 0, 'w'+worldObj.id+'_bg');
		
		// Room icons
		var roomIcons = [];
		for(i = 0; i < worldObj.rooms.length; i++) 
		{
			// Check if room is enabled
			if(worldObj.rooms[i].enabled == true)
			{
				// Check if level is enough high to access
				// TODO: Remove 1 == 1 ! TESTING...
				if(GameObj.user.level >= worldObj.rooms[i].level || 1 == 1) {
					roomIcons[i] = this.add.button(
						worldObj.rooms[i].icon_x, 
						worldObj.rooms[i].icon_y, 
						'w'+worldObj.id+'_r'+worldObj.rooms[i].id+'_icon', 
						this.goToRoom(i), this, 2, 0, 1);
					
					roomIcons[i].anchor.setTo(0.5);
					roomIcons[i].scale.setTo(0.8);
				}
				else {
					// Add padlock
					roomIcons[i] = this.add.sprite(worldObj.rooms[i].icon_x, worldObj.rooms[i].icon_y, 'padlock_icon');
					roomIcons[i].anchor.setTo(0.5);
					roomIcons[i].scale.setTo(0.8);
				}
			}
		}
		
		// Back button
		this.btnBack = this.add.button(60, 60, 'btnBack', this.goToMenu, this, 2, 0, 1);
		this.btnBack.anchor.set(0.5);

		// Add alien
		var alien = this.add.sprite(1080, 550, 'alien');
		alien.frame = 0;
		alien.anchor.setTo(0.5, 0.5);
		
		
		

		
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
	}


};