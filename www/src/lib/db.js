Db = function () {

	this.db = null;

};

Db.prototype = {

	// Connect to DB
	connect: function () {
		
		// Open Database
		this.db = window.openDatabase('Database', '1.0', 'PlaneraMera', 1000000);

		this.db.transaction(function(tx) {
			// For testing
			// tx.executeSql('DROP TABLE IF EXISTS test_table');
			// tx.executeSql('DROP TABLE IF EXISTS users');
			// tx.executeSql('DROP TABLE IF EXISTS events');
			// tx.executeSql('DROP TABLE IF EXISTS tasks');
			// tx.executeSql('DROP TABLE IF EXISTS levels');
			
			// Create tables if they does not exist
			// tx.executeSql('CREATE TABLE IF NOT EXISTS test_table (id INTEGER PRIMARY KEY, data TEXT, data_num INTEGER)', [], function(tx, res) {
//
// 				console.log('CREATE TABLE');
// 				// Check if DB is created first time
// 				tx.executeSql('SELECT COUNT(*) AS cnt FROM test_table;', [], function(tx, res) {
// 					// Initialize table if no rows exist
// 					if(res.rows.item(0).cnt == 0) {
// 						tx.executeSql('INSERT INTO test_table (data, data_num) VALUES (?,?)', ['test', 100]);
// 					}
// 				});
// 			});
			
			
			// Create user table
			tx.executeSql('CREATE TABLE IF NOT EXISTS users (\
				id INTEGER PRIMARY KEY, \
				identity VARCHAR(16), \
				level INTEGER, \
				timestamp TIMESTAMP)');
			// Create event table
			tx.executeSql('CREATE TABLE IF NOT EXISTS events (\
				id INTEGER PRIMARY KEY, \
				user_id INTEGER, \
				event INTEGER, \
				value VARCHAR(64), \
				timestamp TIMESTAMP)');
			// Create task table
			tx.executeSql('CREATE TABLE IF NOT EXISTS tasks (\
				id INTEGER PRIMARY KEY, \
				user_id INTEGER, \
				task INTEGER, \
				value INTEGER, \
				timestamp TIMESTAMP)');
			// Create level table
			tx.executeSql('CREATE TABLE IF NOT EXISTS levels (\
				id INTEGER PRIMARY KEY, \
				user_id INTEGER, \
				room INTEGER, \
				level INTEGER, \
				cleared INTEGER, \
				failed INTEGER, \
				timestamp TIMESTAMP)');
		});
	
	},
	
	
	// Inser user
	insertUser: function (identity, callback) {
		this.db.transaction(function(tx) {
			tx.executeSql('INSERT INTO users (identity, level, timestamp) VALUES (?, ?, ?)', [identity, 0, Date.now()], function(tx, res) {
				// Run callback if defined
				typeof callback === 'function' && callback(res.insertId);
			});		
		});
	},
	// Get user
	getUser: function (callback) {
		this.db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM users LIMIT 1', [], function(tx, res) {
				// Run callback if defined
				typeof callback === 'function' && callback(res);
			});		
		});
	},
	// Increase user level
	incUserLevel: function (userId) {
		this.db.transaction(function(tx) {
			tx.executeSql('\
				UPDATE users \
				SET level = level + 1, timestamp = ?) \
				WHERE userId = ?', 
			[Date.now(), userId]);		
		});
	},
	// Decrease user level
	decUserLevel: function (userId) {
		this.db.transaction(function(tx) {
			tx.executeSql('\
				UPDATE users \
				SET level = level - 1, timestamp = ?) \
				WHERE userId = ?', 
			[Date.now(), userId]);		
		});
	},
	
	
	// Insert event
	insertEvent: function (userId, event, value) {
		this.db.transaction(function(tx) {
			tx.executeSql('\
				INSERT INTO events (user_id, event, value, timestamp) \
				VALUES (?, ?, ?, ?)', 
			[userId, event, value, Date.now()]);		
		});
	},
	
	// Insert task
	insertTask: function (userId, task, value) {
		this.db.transaction(function(tx) {
			tx.executeSql('\
				INSERT INTO tasks (user_id, task, value, timestamp) \
				VALUES (?, ?, ?, ?)', 
			[userId, task, value, Date.now()]);		
		});
	},
	
	// Insert level
	insertLevel: function (userId, room) {
		this.db.transaction(function(tx) {
			tx.executeSql('\
				INSERT INTO levels (user_id, room, level, cleared, failed, timestamp) \
				VALUES (?, ?, ?, ?, ?, ?)', 
			[userId, room, 0, 0, 0, Date.now()]);		
		});
	},
	
	// Get level
	getLevel: function (userId, room, callback) {
		this.db.transaction(function(tx) {
			tx.executeSql('\
				SELECT * FROM levels \
				WHERE userId = ? AND room = ? \
				LIMIT 1', 
			[userId, room], function(tx, res) {
				console.log(res);
				
				// Run callback if defined
				typeof callback === 'function' && callback(res);
			});		
		});
	},
	
	// Increase level
	incLevel: function (userId, room) {
		this.db.transaction(function(tx) {
			tx.executeSql('\
				UPDATE levels \
				SET level = level + 1, timestamp = ?) \
				WHERE userId = ? AND room = ?', 
			[Date.now(), userId, room]);		
		});
	},
	
	// Decrease level
	decLevel: function (userId, room) {
		this.db.transaction(function(tx) {
			tx.executeSql('\
				UPDATE levels \
				SET level = level - 1, timestamp = ?) \
				WHERE userId = ? AND room = ?', 
			[Date.now(), userId, room]);		
		});
	},
	
	// Increase level cleared
	incLevelCleared: function (userId, room) {
		this.db.transaction(function(tx) {
			tx.executeSql('\
				UPDATE levels \
				SET cleared = cleared + 1, timestamp = ?) \
				WHERE userId = ? AND room = ?', 
			[Date.now(), userId, room]);		
		});
	},
	
	// Decrease level cleared
	decLevelCleared: function (userId, room) {
		this.db.transaction(function(tx) {
			tx.executeSql('\
				UPDATE levels \
				SET cleared = cleared - 1, timestamp = ?) \
				WHERE userId = ? AND room = ?', 
			[Date.now(), userId, room]);		
		});
	},
	
	// Increase level failed
	incLevelFailed: function (userId, room) {
		this.db.transaction(function(tx) {
			tx.executeSql('\
				UPDATE levels \
				SET failed = failed + 1, timestamp = ?) \
				WHERE userId = ? AND room = ?', 
			[Date.now(), userId, room]);		
		});
	},
	
	// Decrease level failed
	decLevelFailed: function (userId, room) {
		this.db.transaction(function(tx) {
			tx.executeSql('\
				UPDATE levels \
				SET failed = failed - 1, timestamp = ?) \
				WHERE userId = ? AND room = ?', 
			[Date.now(), userId, room]);		
		});
	},
	
	
	
	
}