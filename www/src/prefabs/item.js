Item = function(game, x, y, atlas, sprite, id, door) {

	this.game = game;
	this.initX = x;
	this.initY = y;
	this.id = id;
	this.name = sprite;
	this.xPos = x;
	this.yPos = y;
	this.depth = id;
	this._door = door;

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
	// Allow drag only if item is not door
	if(this._door == false) {
		this.input.enableDrag();
	}
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

// Get item id
Item.prototype.getName = function() {
	return this.name;
};

// Set position
Item.prototype.setPos = function(x, y) {
	this.x = x;
	this.y = y;
	
	this.xPos = x;
	this.yPos = y;
};

// Set position
Item.prototype.reinitPos = function(x, y) {
	this.x = x;
	this.y = y;
	
	this.xPos = x;
	this.yPos = y;
	this.initX = x;
	this.initY = y;
};

// Get last position
Item.prototype.getLastPos = function() {	
	return {x: this.xPos, y: this.yPos};
};

// Reset position
Item.prototype.resetPos = function() {
	this.x = this.initX;
	this.y = this.initY;
	
	// Reset depth
	this.depth = this.id;
	
	// Scale to normal
	this.scale.setTo(1);
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

Item.prototype.scaleItem = function(size) {
	
	if(this.item.width >= this.item.height) {
		// Scale to fit in width
		if(this.item.width > size) {
			var ratio = size / this.item.width;
			this.scale.setTo(ratio);
		}
	}
	else {
		// Scale to fit in height
		if(this.item.height > size) {
			var ratio = size / this.item.height;
			this.scale.setTo(ratio);
		}
	}
};

// For doors
Item.prototype.closeDoor = function() {
	// If door
	if(this._door == true) {
		this.alpha = 0;
		this.visible = true;
		this.game.add.tween(this).to( { alpha: 1 }, 500, Phaser.Easing.Linear.None, true, 0, 0, false);
	}
}

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
	
	// If door
	if(this._door == true) {
		this.visible = false;
	}
};
