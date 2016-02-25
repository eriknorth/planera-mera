GameObj.About = function (game) {

	this.btnBack = null;
	this.alien = null;
	this.shadow = null;

};

GameObj.About.prototype = {

	create: function () {
		
		this.game.stage.backgroundColor = '#304656';

		// Back button
		this.btnBack = this.add.button(60, 60, 'btnBack', this.goToMenu, this, 2, 0, 1);
		this.btnBack.anchor.set(0.5);
		
		// Back button
		this.add.button(200, 200, 'btnRound', null, this, 2, 0, 1);

		// Shadow
		this.shadow = this.add.sprite(this.world.centerX, this.world.centerY, 'alien');
		this.shadow.frame = 3;
		this.shadow.anchor.set(0.5);
		this.shadow.tint = 0x000000;
		this.shadow.alpha = 0.4;
		this.shadow.visible = false;

		// Alien
		this.alien = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'alien');
		this.alien.frame = 1;
		this.alien.anchor.setTo(0.5, 0.5);
		this.alien.scale.setTo(0.9);
		this.alien.inputEnabled = true;
		this.alien.input.enableDrag();
		this.alien.events.onInputDown.add(this.alienDown, this);
		this.alien.events.onInputUp.add(this.alienUp, this);
		this.alien.events.onDragUpdate.add(this.alienDrag, this);
	},
	
	goToMenu: function (pointer) {

		//	Go back to Menu
		this.state.start('Menu');

	},
	
	alienDown: function () {

		this.alien.frame = 3;
		
		// Shadow
		this.shadow.visible = true;
		this.shadow.x = this.alien.x+10;
		this.shadow.y = this.alien.y+10;
		this.alien.scale.setTo(1);
	},
	alienUp: function () {

		this.alien.frame = 1;
		this.alien.scale.setTo(0.9);
		
		// Shadow
		this.shadow.visible = false;

	},
	
	alienDrag: function () {

		// Shadow
		this.shadow.x = this.alien.x+10;
		this.shadow.y = this.alien.y+10;
		this.alien.scale.setTo(1);

	},


};