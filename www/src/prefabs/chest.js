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
	
	item.scaleItem(140);

}

Chest.prototype.setInChest = function(item, offset) {
	
	this._spaceing += 70 + 50;
	// item.reinitPos(this.x + 100, this._spaceing);
	item.setPos(this.x - offset, this._spaceing);
	item.scaleItem(140);
	this._spaceing += 70;

}

Chest.prototype.resetChest = function() {
	
	this._spaceing = 0;
}

Chest.prototype.getLimit = function() {
	
	return this._spaceing + this._prevHeight + 50;
}

