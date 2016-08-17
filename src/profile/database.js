const Config = require('../config').database

/* Database */

var impl
if (Config.mode == 'js') {
	impl = require('./database-impl-js')
}
else if (Config.mode == 'mongo') {
	impl = require('./database-impl-js')
}
else {
	throw new Error('Database '+Config.mode+' is not implemented')
}

module.exports = {
	saveUsers: function(users) {
		return new Promise( (resolve) => {
			// update or save all users with current update time
			impl.saveUsers(users, resolve)
		})
	},

	hasUser(user_id) {
		return new Promise( (resolve, reject) => {
			// user_id exists in database ? resolve() : reject()
			impl.hasUser(user_id, resolve, reject)
		})
	},

	getUser(user_id) {
		return new Promise( (resolve, reject) => {
			// user_id exists in database ? resolve(user) : reject()
			impl.getUser(user_id, resolve, reject)
		})
	},

	/*
	 * Get list of user_id that have latest update time
	 * @param count - number of users to get
	 */
	getUsersToUpdate(count) {
		return new Promise( (resolve) => {
			// sort users by update time, fetch first *count*
			impl.getUsersToUpdate(count, resolve)
		})
	}
}
