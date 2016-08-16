const Config = require('../config').database
const db = require('mongoskin').db(Config.path)

/* Database */

module.exports = {
	config: {
		port: 1
	},

	saveUsers: function(users) {
		return new Promise( (resolve) => {
			// update or save all users with current update time
			resolve()
		})
	},

	hasUser(user_id) {
		return new Promise( (resolve, reject) => {
			// user_id exists in database ? resolve() : reject()
			reject()
		})
	},

	getUser(user_id) {
		return new Promise( (resolve, reject) => {
			// user_id exists in database ? resolve(user) : reject()
			reject()
		})
	},

	/*
	 * Get list of user_id that have latest update time
	 * @param count - number of users to get
	 */
	getUsersToUpdate(count) {
		return new Promise( (resolve) => {
			// sort users by update time, fetch first *count*
			resolve([])
		})
	}
}
