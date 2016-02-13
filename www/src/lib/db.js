Db = function () {

	this.db = null;

};

Db.prototype = {

	// Connect to DB
	connect: function () {
		
		// Open Database
		this.db = window.openDatabase("Database", "1.0", "PlaneraMera", 1000000);

		this.db.transaction(function(tx) {
			// For testing
			//tx.executeSql('DROP TABLE IF EXISTS test_table');
			
			// Create tables if they does not exist
			tx.executeSql('CREATE TABLE IF NOT EXISTS test_table (id integer primary key, data text, data_num integer)', [], function(tx, res) {
				// Check if DB is created first time
				tx.executeSql("SELECT COUNT(*) AS cnt FROM test_table;", [], function(tx, res) {					
					// Initialize table if no rows exist
					if(res.rows.item(0).cnt == 0) {
						tx.executeSql("INSERT INTO test_table (data, data_num) VALUES (?,?)", ["test", 100]);
					}
				});				
			});
		});
	
	},
	
	query: function() {
		
	}
	
}