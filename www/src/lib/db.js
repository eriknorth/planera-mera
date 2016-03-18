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
			//tx.executeSql('DROP TABLE IF EXISTS test_table');
			tx.executeSql('DROP TABLE IF EXISTS users');
			tx.executeSql('DROP TABLE IF EXISTS events');
			tx.executeSql('DROP TABLE IF EXISTS tasks');
			tx.executeSql('DROP TABLE IF EXISTS levels');
			tx.executeSql('DROP TABLE IF EXISTS rocket');
			
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
			tx.executeSql('CREATE TABLE IF NOT EXISTS users (' +
				'id INTEGER PRIMARY KEY, ' +
				'identity VARCHAR(16), ' +
				'level INTEGER, ' +
				'timestamp TIMESTAMP)');
			// Create event table
			tx.executeSql('CREATE TABLE IF NOT EXISTS events (' +
				'id INTEGER PRIMARY KEY, ' +
				'user_id INTEGER, ' +
				'event INTEGER, ' +
				'value VARCHAR(64), ' +
				'timestamp TIMESTAMP)');
			// Create task table
			tx.executeSql('CREATE TABLE IF NOT EXISTS tasks (' +
				'id INTEGER PRIMARY KEY, ' +
				'user_id INTEGER, ' +
				'level_id INTEGER, ' +
				'task INTEGER, ' +
				'wrong INTEGER, ' +
				'value INTEGER, ' +
				'timestamp TIMESTAMP)');
			// Create level table
			tx.executeSql('CREATE TABLE IF NOT EXISTS levels (' +
				'id INTEGER PRIMARY KEY, ' +
				'user_id INTEGER, ' +
				'room INTEGER, ' +
				'level INTEGER, ' +
				'cleared INTEGER, ' +
				'failed INTEGER, ' +
				'cleared_total INTEGER, ' +
				'failed_total INTEGER, ' +
				'timestamp TIMESTAMP)');
			// Create rocket table
			tx.executeSql('CREATE TABLE IF NOT EXISTS rocket (' +
				'id INTEGER PRIMARY KEY, ' +
				'user_id INTEGER, ' +
				'x INTEGER, ' +
				'y INTEGER, ' +
				'item INTEGER, ' +
				'state INTEGER, ' +
				'timestamp TIMESTAMP)');
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
			tx.executeSql(
				'UPDATE users ' +
				'SET level = level + 1, timestamp = ? ' +
				'WHERE id = ?', 
			[Date.now(), userId]);		
		});
	},
	// Decrease user level
	decUserLevel: function (userId) {
		this.db.transaction(function(tx) {
			tx.executeSql(
				'UPDATE users ' +
				'SET level = level - 1, timestamp = ? ' +
				'WHERE id = ?', 
			[Date.now(), userId]);		
		});
	},
	
	
	// Insert event
	insertEvent: function (userId, event, value) {
		this.db.transaction(function(tx) {
			tx.executeSql(
				'INSERT INTO events (user_id, event, value, timestamp) ' +
				'VALUES (?, ?, ?, ?)', 
			[userId, event, value, Date.now()]);		
		});
	},
	
	// Insert task
	insertTask: function (userId, levelId, task, callback) {
		this.db.transaction(function(tx) {
			tx.executeSql(
				'INSERT INTO tasks (user_id, level_id, task, wrong, value, timestamp) ' +
				'VALUES (?, ?, ?, ?, ?, ?)', 
			[userId, levelId, task, 0, 0, Date.now()], function(tx, res) {
				// Run callback if defined
				typeof callback === 'function' && callback(res.insertId);
			});	
		});
	},
	// Get task
	getTask: function (userId, levelId, callback) {
		this.db.transaction(function(tx) {
			tx.executeSql(
				'SELECT * FROM tasks ' + 
				'WHERE user_id = ? AND level_id = ? AND value = ? ' +
				'ORDER BY id DESC ' + 
				'LIMIT 1', 
			[userId, levelId, 0], function(tx, res) {
				// Run callback if defined
				typeof callback === 'function' && callback(res);
			});		
		});
	},
	// Insert task wrong
	incTaskWrong: function (taskId) {
		this.db.transaction(function(tx) {
			tx.executeSql(
				'UPDATE tasks ' +
				'SET wrong = wrong + 1, timestamp = ? ' +
				'WHERE id = ?', 
			[Date.now(), taskId]);		
		});
	},
	// Insert task wrong
	setTaskValue: function (taskId, value) {
		this.db.transaction(function(tx) {
			tx.executeSql(
				'UPDATE tasks ' +
				'SET value = ?, timestamp = ? ' +
				'WHERE id = ?', 
			[value, Date.now(), taskId]);		
		});
	},
	
	// Insert level
	insertLevel: function (userId, room, callback) {
		this.db.transaction(function(tx) {
			tx.executeSql(
				'INSERT INTO levels (user_id, room, level, cleared, failed, cleared_total, failed_total, timestamp) ' +
				'VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
			[userId, room, 0, 0, 0, 0, 0, Date.now()], function(tx, res) {
				// Run callback if defined
				typeof callback === 'function' && callback(res.insertId);
			});		
		});
	},
	
	// Get level
	getLevel: function (userId, room, callback) {
		this.db.transaction(function(tx) {
			tx.executeSql(
				'SELECT * FROM levels ' +
				'WHERE user_id = ? AND room = ? ' +
				'LIMIT 1', 
			[userId, room], function(tx, res) {				
				// Run callback if defined
				typeof callback === 'function' && callback(res);
			});		
		});
	},
	
	// Increase level
	incLevel: function (levelId) {
		this.db.transaction(function(tx) {
			tx.executeSql(
				'UPDATE levels ' +
				'SET level = level + 1, timestamp = ? ' +
				'WHERE id = ?',
			[Date.now(), levelId]);
		});
	},
	
	// Decrease level
	decLevel: function (levelId) {
		this.db.transaction(function(tx) {
			tx.executeSql(
				'UPDATE levels ' +
				'SET level = level - 1, timestamp = ? ' +
				'WHERE id = ?',
			[Date.now(), levelId]);	
		});
	},
	
	// Increase level cleared
	clearLevelCleared: function (levelId) {
		this.db.transaction(function(tx) {
			tx.executeSql(
				'UPDATE levels ' +
				'SET cleared = 0, timestamp = ? ' +
				'WHERE id = ?', 
			[Date.now(), levelId]);		
		});
	},
	
	// Increase level cleared
	incLevelCleared: function (levelId) {
		this.db.transaction(function(tx) {
			tx.executeSql(
				'UPDATE levels ' +
				'SET cleared = cleared + 1, timestamp = ? ' +
				'WHERE id = ?', 
			[Date.now(), levelId]);		
		});
	},
	
	// Decrease level cleared
	decLevelCleared: function (levelId) {
		this.db.transaction(function(tx) {
			tx.executeSql(
				'UPDATE levels ' +
				'SET cleared = cleared - 1, timestamp = ? ' +
				'WHERE id = ?', 
			[Date.now(), levelId]);
		});
	},
	
	// Increase level cleared
	clearLevelFailed: function (levelId) {
		this.db.transaction(function(tx) {
			tx.executeSql(
				'UPDATE levels ' +
				'SET failed = 0, timestamp = ? ' +
				'WHERE id = ?', 
			[Date.now(), levelId]);		
		});
	},
	
	// Increase level failed
	incLevelFailed: function (levelId) {
		this.db.transaction(function(tx) {
			tx.executeSql(
				'UPDATE levels ' +
				'SET failed = failed + 1, timestamp = ? ' +
				'WHERE id = ?', 
			[Date.now(), levelId]);
		});
	},
	
	// Decrease level failed
	decLevelFailed: function (levelId) {
		this.db.transaction(function(tx) {
			tx.executeSql(
				'UPDATE levels ' +
				'SET failed = failed - 1, timestamp = ? ' +
				'WHERE id = ?', 
			[Date.now(), levelId]);
		});
	},
	
	
	// Increase level cleared total
	incLevelClearedTotal: function (levelId) {
		this.db.transaction(function(tx) {
			tx.executeSql(
				'UPDATE levels ' +
				'SET cleared_total = cleared_total + 1, timestamp = ? ' +
				'WHERE id = ?', 
			[Date.now(), levelId]);		
		});
	},
	
	// Increase level failed total
	incLevelFailedTotal: function (levelId) {
		this.db.transaction(function(tx) {
			tx.executeSql(
				'UPDATE levels ' +
				'SET failed_total = failed_total + 1, timestamp = ? ' +
				'WHERE id = ?', 
			[Date.now(), levelId]);		
		});
	},
	
	// Inser rocket item
	insertRocketItem: function (userId, item, callback) {
		this.db.transaction(function(tx) {
			tx.executeSql('INSERT INTO rocket (user_id, x, y, item, state, timestamp) VALUES (?, ?, ?, ?, ?, ?)', 
			[
				userId, 
				0, 
				0,
				item,
				0,
				Date.now()
			], 
			function(tx, res) {
				// Run callback if defined
				typeof callback === 'function' && callback(res.insertId);
			});		
		});
	},

	updateRocketItem: function (id, x, y, state) {
		this.db.transaction(function(tx) {
			tx.executeSql(
				'UPDATE rocket ' +
				'SET x = ?, y = ?, state = ? ' +
				'WHERE id = ?', 
			[x, y, state, id]);		
		});
	},
	
	getRocketItems: function (userId, callback) {
		this.db.transaction(function(tx) {
			tx.executeSql(
				'SELECT * FROM rocket ' + 
				'WHERE user_id = ? ' +
				'ORDER BY id ASC ',
			[userId], function(tx, res) {
				// Run callback if defined
				typeof callback === 'function' && callback(res);
			});		
		});
	},
	
	getLastRocketItem: function (userId, callback) {
		this.db.transaction(function(tx) {
			tx.executeSql(
				'SELECT * FROM rocket ' + 
				'ORDER BY id DESC ' + 
				'WHERE user_id = ?', 
				'LIMIT 1', 
			[userId], function(tx, res) {
				// Run callback if defined
				typeof callback === 'function' && callback(res);
			});		
		});
	}
	
}