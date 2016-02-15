Box = function(game, x, y, num) {

	this.game = game;
	this.items = [];

    Phaser.Group.call(this, game, null);

	this.box = [];
	this.arrow = [];
	this.num = num;
	
	// Generate boxes and arrows
	var spacing = game.world.width / (num+1);
	for(i = num-1; i >= 0; i--) {
		this.box[i] = game.make.sprite(spacing * (i+1), 280, 'box');
		this.box[i].anchor.set(0.5);
		this.add(this.box[i]);
		
		if(i > 0) {
			this.arrow[i] = game.make.sprite(spacing * (i+1) - this.box[i].width/2+10, 280, 'arrow');
			this.arrow[i].anchor.set(1, 0.5);
			this.add(this.arrow[i]);
		}
	}
	
	// Add extra layer for items
	this.items = game.make.group();
	this.add(this.items);
};

Box.prototype = Object.create(Phaser.Group.prototype);
Box.prototype.constructor = Box;



// Add item to Box
Box.prototype.addItem = function(item) {
	this.items.add(item);
}

// Check overlap
Box.prototype.checkOverlap = function(item) {
		
	// Check colision
	for(i = 0; i < this.num; i++) {
		
		var b = this.box[i];
		
		if( item.x > (b.x - b.width/2) && 
			item.x < (b.x + b.width/2) &&
			item.y > (b.y - b.height/2) && 
			item.y < (b.y + b.height/2))
		{
			// If collision, set position as box
			item.x = b.x;
			item.y = b.y;
			
			// Scale to fit in
			if(item.getHeight() > 140) {
				var ratio = 140 / item.getHeight();
				item.scale.setTo(ratio);
			}
			else if(item.getWidth() > 140) {
				var ratio = 140 / item.getWidth();
				item.scale.setTo(ratio);
			}
		}
	}
	

}



