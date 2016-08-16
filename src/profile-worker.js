const Uri = require('urijs')
const _ = require('underscore')

const db = require('./profile/database')
const online = require('./profile/online')

const config = {
	maxUsersPerRequest: 100,
	maxRequestsPerSecond: 30,
	requestInterval: 5*60*1000
}

var loader = {
	/* 
	 * Callback will be triggered after each completed request
	 */
	onload: null,

	/* 
	 * Request will be triggered after each completed request
	 */
	request: function(id) {
		return new Promise( (resolve) => {
			db.getUser(id).then( (user) => {
				resolve(user)
			}).catch( () => {
				this._requests[id] = resolve

				// Start immediately if idle
				if (!online.isPending()) {
					downloadUserData()
				}
			})
		})
	},

	/* Private */

	processResult: function(result) {
		result.forEach( (item) => {
			if (item.user_id in this._requests){
				this._requests[item.user_id](item)
				delete this._requests[item.user_id]
			}
		})
		if (typeof loader.onload === 'function') {
			loader.onload(result)
		}
		// start timer
	},

	downloadUserData: function() {
		// clear timer
		online.
	},

	_requests: {},
	_timer: null,
}

module.exports = loader
