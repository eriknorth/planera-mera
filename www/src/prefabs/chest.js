Chest = function(game, x, y) {

	this.game = game;

    Phaser.Sprite.call(this, game, x, y, 'chest');
	
	this._spaceing = 0;
	this._prevHeight = 0;
};

Chest.prototype = Object.create(Phaser.Sprite.prototype);
Chest.prototype.constructor = Chest;

// Check overlap
Chest.prototype.checkOverlap = function(item) {
	
	var overlap = false;
	
	// Check overlap
	if( item.x > (this.x) && 
		item.x < (this.x + this.width))
	{

		// Set overlap
		overlap = true;
	}
	
	return overlap;
}

// Check overlap
Chest.prototype.putInChest = function(item) {
	
	item.resetPos();
	
	// Scale to fit in
	if(item.getWidth() > 140) {
		var ratio = 140 / item.getWidth();
		item.scale.setTo(ratio);
	}

}

Chest.prototype.setInChest = function(item) {
	
	this._spaceing += item.getHeight()/2 + this._prevHeight + 50;
	
	item.reinitPos(this.x + 100, this._spaceing);
	
	// Scale to fit in
	if(item.getWidth() > 140) {
		var ratio = 140 / item.getWidth();
		item.scale.setTo(ratio);
	}
	
	this._prevHeight = item.getHeight()/2;
}

Chest.prototype.getLimit = function() {
	
	return this._spaceing + this._prevHeight + 50;
}

