/*
 * Implementation of database in mongodb
 * todo
 */ 

module.exports = {
	saveUsers: function(users, resolve) {
		var time = Date.now()
		resolve()
	},

	hasUser(user_id, resolve, reject) {
		reject()
	},

	getUser(user_id, resolve, reject) {
		reject()
	},

	getUsersToUpdate(count, resolve) {
		resolve([])
	}
}
