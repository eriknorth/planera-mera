Alien = function(game, x, y) {

	this.game = game;

    Phaser.Sprite.call(this, game, x, y, 'alien-body');
	this.anchor.set(0.5);
	
	// Eyes
	this.eyes = game.make.sprite(0, -50, 'alien-eyes');
	this.eyes.anchor.set(0.5);
	this.addChild(this.eyes);
	
	this.eyeBalls = game.make.sprite(this.eyes.x, this.eyes.y, 'alien-eye-balls');
	this.eyeBalls.anchor.set(0.5);
	this.addChild(this.eyeBalls);
	
	// Mouth
	this.mouth = game.make.sprite(0, 0, 'alien-mouth-talk');
	this.mouth.anchor.set(0.5);
	this.addChild(this.mouth);
	this.mouth.animations.add('talk');


};

Alien.prototype = Object.create(Phaser.Sprite.prototype);
Alien.prototype.constructor = Alien;


Alien.prototype.update = function() {

	var angle = this.game.physics.arcade.angleToPointer(this);

	this.eyeBalls.x = this.eyes.x + (8 * Math.cos(angle));
	this.eyeBalls.y = this.eyes.y + (8 * Math.sin(angle));
};

Alien.prototype.talk = function(enable) {

	if(enable == true)
		this.mouth.animations.play('talk', 8, true);
	else
		this.mouth.animations.stop(null, true);
};