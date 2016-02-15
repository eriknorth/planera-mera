Item = function(game, x, y, atlas, sprite, id) {

	this.game = game;
	this.initX = x;
	this.initY = y;
	this.id = id;

	// Make pixel
	var graphicPixel = new Phaser.Graphics(this, 0, 0);
	graphicPixel.beginFill(0x000000, 1.0);
	graphicPixel.drawRect(x, y, 1, 1);
	graphicPixel.endFill();

    Phaser.Sprite.call(this, game, x, y, graphicPixel.generateTexture());
	
	// Destroy graphics
	graphicPixel.destroy();
	
	// Add events
	this.inputEnabled = true;
	this.input.enableDrag();
	this.events.onInputDown.add(this.onInputDownHandler, this);
	this.events.onInputUp.add(this.onInputUpHandler, this);
	
	// Add shadow (so it is under the item)
	this.shadow = game.make.sprite(10, 10, atlas, sprite);
	this.shadow.anchor.set(0.5);
	this.shadow.tint = 0x000000;
	this.shadow.alpha = 0.4;
	this.shadow.scale.setTo(1.05);
	this.shadow.visible = false;
	// Add to group
	this.addChild(this.shadow);
	
	// Add item
	this.item = game.make.sprite(0, 0, atlas, sprite);
	this.item.anchor.set(0.5);
	// Add to group
	this.addChild(this.item);
};

Item.prototype = Object.create(Phaser.Sprite.prototype);
Item.prototype.constructor = Item;


// Get item id
Item.prototype.getId = function() {
	return this.id;
};

// Set position
Item.prototype.setPos = function(x, y) {
	this.item.x = x;
	this.item.y = y;
};

// Reset position
Item.prototype.resetPos = function() {
	this.x = this.initX;
	this.y = this.initY;
};

Item.prototype.getHeight = function() {
	return this.item.height;
};
Item.prototype.getWidth = function() {
	return this.item.width;
};

Item.prototype.getBounds = function() {
	// Override method
	var bounds = Phaser.Sprite.prototype.getBounds.call(this);
	bounds.width = this.item.width;
	bounds.height = this.item.height;
	bounds.x -= bounds.width/2;
	bounds.y -= bounds.height/2;
	return bounds;
};


// Events
// On mouse down
Item.prototype.onInputDownHandler = function(pointer) {
	
	// Scale up
	this.scale.setTo(1.1);
	
	// Shadow
	this.shadow.visible = true;

};

// On mouse up
Item.prototype.onInputUpHandler = function(pointer) {
	
	// Scale to normal
	this.scale.setTo(1);
	
	// Shadow
	this.shadow.visible = false;
};