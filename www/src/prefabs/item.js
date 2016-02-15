Item = function(game, x, y, atlas, sprite) {

	this.game = game;
	this.initX = x;
	this.initY = y;

	// Make pixel
	var graphicPixel = new Phaser.Graphics(this, 0, 0);
	graphicPixel.beginFill(0x000000, 1.0);
	graphicPixel.drawRect(x, y, 1, 1);
	graphicPixel.endFill();

    Phaser.Sprite.call(this, game, x, y, graphicPixel.generateTexture());
	
	// Destroy graphics
	graphicPixel.destroy();
	
	// Add shadow (so it is under the item)
	this.shadow = game.make.sprite(0, 0, atlas, sprite);
	this.shadow.anchor.set(0.5);
	this.shadow.tint = 0x000000;
	this.shadow.alpha = 0.4;
	this.shadow.scale.setTo(1.15);
	this.shadow.visible = false;
	// Add to group
	this.addChild(this.shadow);
	
	// Add item
	this.item = game.make.sprite(10, 10, atlas, sprite);
	this.item.anchor.setTo(0.5, 0.5);
	this.item.inputEnabled = true;
	this.item.input.enableDrag();
	// Add to group
	this.addChild(this.item);
	// Add events 
	this.item.events.onInputDown.add(this.onInputDownHandler, this);
	this.item.events.onInputUp.add(this.onInputUpHandler, this);
	this.item.events.onDragUpdate.add(this.onDragUpdateHandler, this);

	// Add custom class events
	this.events.onInputDown = new Phaser.Signal;
	this.events.onInputUp = new Phaser.Signal;
};

Item.prototype = Object.create(Phaser.Sprite.prototype);
Item.prototype.constructor = Item;

// On mouse down
Item.prototype.onInputDownHandler = function(pointer) {
	// Item
	this.item.scale.setTo(1.1);
	
	// Shadow
	this.shadow.x = this.item.x+10;
	this.shadow.y = this.item.y+10;
	this.shadow.visible = true;
	
	if (this.events.onInputDown)
	{
		this.events.onInputDown.dispatch(this, pointer);
	}
};

// On mouse up
Item.prototype.onInputUpHandler = function() {
	// Item
	this.item.scale.setTo(1);
	
	// Shadow
	this.shadow.visible = false;
	
	if (this.events.onInputUp)
	{
		this.events.onInputUp.dispatch(this, pointer);
	}
};

// On drag
Item.prototype.onDragUpdateHandler = function() {
	this.shadow.x = this.item.x+10;
	this.shadow.y = this.item.y+10;
};