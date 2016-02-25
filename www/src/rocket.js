GameObj.Rocket = function (game) {

	this.btnBack = null;

};

GameObj.Rocket.prototype = {

	create: function () {
		
		// Background
		this.add.sprite(0, 0, 'rocket_bg');
		this.game.stage.backgroundColor = '#304656';


		// Back button
		this.btnBack = this.add.button(60, 60, 'btnBack', this.goToMenu, this, 2, 0, 1);
		this.btnBack.anchor.set(0.5);

	},
	
	goToMenu: function (pointer) {

		//	Go back to Menu
		this.state.start('Menu');

	}
};