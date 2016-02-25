Cloud = function(game, x, y) {

	this.game = game;

    Phaser.Sprite.call(this, game, x, y, 'cloud');
};

Cloud.prototype = Object.create(Phaser.Sprite.prototype);
Cloud.prototype.constructor = Cloud;

// Check overlap
Cloud.prototype.checkOverlap = function(item) {
	
	var overlap = false;
	
	// Check overlap
	if( item.x > (this.x) && 
		item.x < (this.x + this.width) &&
		item.y > (this.y) && 
		item.y < (this.y + this.height))
	{

		// Set overlap
		overlap = true;
	}
	
	return overlap;
}

// Check overlap
Cloud.prototype.putInCloud = function(item) {
	
	item.setPos(item.x, this.y + 120);
	
	// Scale to fit in
	if(item.getHeight() > 140) {
		var ratio = 140 / item.getHeight();
		item.scale.setTo(ratio);
	}

}


