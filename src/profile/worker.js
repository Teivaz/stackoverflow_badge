'use strict'
const _ = require('underscore')
const db = require('./database')
const online = require('./online')

const maxUsersPerRequest = 30
const requestInterval = 5*60*1000

module.exports = {
	/* 
	 * Callback will be triggered after each completed request
	 */
	onload: null,

	/* 
	 * Request will resolve to a specified user's profile
	 */
	request: function(id) {
		return new Promise( (resolve, reject) => {
			db.getUser(id).then( (user) => {
				resolve(user)
			}).catch( () => {
				this._requests[id] = {
					resolve:resolve, 
					reject: reject
				}
				// Start immediately if idle
				if (!online.isPending()) {
					this._downloadUserData()
				}
			})
		})
	},

	/* Private */

	_processResult: function(result) {
		db.saveUsers(result)
		result.forEach( (item) => {
			if (item.user_id in this._pendingRequests){
				this._pendingRequests[item.user_id].resolve(item)
				delete this._pendingRequests[item.user_id]
			}
		})
		_.keys(this._pendingRequests).forEach( (request) => {
			request.reject()
		})
		this._pendingRequests = {}
		if (typeof this.onload === 'function') {
			this.onload(result)
		}

		// If we have more pending requests then do it with minimal latency
		if(!_.isEmpty(this._requests)){
			this._downloadUserData()
		} else {
			// Otherwise start timer
			this._timer = setTimeout( () => {
				this._downloadUserData()
			}, requestInterval)
		}
	},

	_downloadUserData: function() {
		// clear timer
		clearTimeout(this._timer)
		this._timer = null

		this._pendingRequests = {}
		var user_ids = _.keys(this._requests).slice(0, maxUsersPerRequest)
		user_ids.forEach( (user_id) => {
			this._pendingRequests[user_id] = this._requests[user_id]
			delete this._requests[user_id]
		})

		db.getUsersToUpdate(maxUsersPerRequest - user_ids.length).then( (moreUser_ids) => {
			online.downloadUsers(user_ids.push(...moreUser_ids)).then( (users) => {
				this._processResult(users)
			}).catch( () => {
				this._processResult([])
			})
		})
	},

	_requests: {},
	_pendingRequests: {},
	_timer: null,
}
