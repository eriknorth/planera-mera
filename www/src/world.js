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
			if(worldObj.rooms[i].enabled == true)
			{
				roomIcons[i] = this.add.sprite(worldObj.rooms[i].icon_x, worldObj.rooms[i].icon_y, 'w'+worldObj.id+'_r'+worldObj.rooms[i].id+'_icon');
				roomIcons[i].inputEnabled = true;
				roomIcons[i].anchor.setTo(0.5, 0.5);
				roomIcons[i].scale.setTo(0.8);
				// Add event
				roomIcons[i].events.onInputUp.add(this.goToRoom(i), this);
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
			GameObj.room = room;
			this.state.start('Room');
		}
	}


};