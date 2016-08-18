'use strict'
/*
 * Implementation of database in plain js object
 * Does not save on disc
 */ 

const _ = require('underscore')
var db = {}

module.exports = {
	saveUsers: function(users, resolve) {
		var time = Date.now()
		users.forEach( (user) => {
			var entry = {
				data: JSON.stringify(user),
				time: time
			}
			db[user.user_id] = entry
		})
		resolve()
	},

	hasUser(user_id, resolve, reject) {
		if(user_id in db) {
			resolve()
		}
		else {
			reject()
		}
	},

	getUser(user_id, resolve, reject) {
		var user = db[user_id] || null
		if(user) {
			resolve(JSON.parse(user.data))
		}
		else {
			reject()
		}
	},

	getUsersToUpdate(count, resolve) {
		function compare(a, b) {
			return a.time - b.time
		}
		var values = _.values(db)
		values.sort(compare)
		var result = []
		for(var i = 0; i < count; i++) {
			result.push(JSON.parse(values[i].data).user_id)
		}
		resolve(result)
	}
}
