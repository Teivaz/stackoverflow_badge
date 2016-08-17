const Config = require('../config').online

const Http = require('https')
const Uri = require('urijs')
const Zlib = require('zlib')

/* Online */

const maxRequestsPerSecond = 30
const requestInterval = 1000/maxRequestsPerSecond
const backoffInterval = 1000

function log(text){
	//console.log(text)
}

module.exports = {
	/*
	 * If any request in progress
	 */
	isPending: function() {
		return this._pending
	},

	isTimeout: function() {
		return this._timeout
	},

	isBackoff: function() {
		return this._backoff
	},

	quotaRemaining: function() {
		return this._quotaRemaining
	},

	maxUsersPerRequest: function() {
		return 30
	},

	/*
	 * Generates request URL to get info about usere
	 */
	generateUrl: function(user_ids) {
		var url = Uri('https://api.stackexchange.com/2.2/users/' + user_ids.join(';'))
		url.search({
			key: Config.key,
			site: 'stackoverflow'
		})
		return url.href()
	},

	downloadUsers: function(user_ids) {
		this._pending = true
		const url = this.generateUrl(user_ids)
		log(url)
		return new Promise( (resolve, reject) => {
			if (this._timeout) {
				setTimeout(() => {
					this._startRequest(url, resolve, reject)
				}, requestInterval)
			}
			else {
				this._startRequest(url, resolve, reject)
			}
		})
	},

	/* Private */

	_startRequest: function(url, resolve, reject) {
		// download profiles of requested users
		// on any error reject
		// resolves on success with json array of user profiles
		var body = ''
		Http.get(url, (res) => {
			var output = res
			if (res.headers['content-encoding'] == 'gzip') {
				var gzip = Zlib.createGunzip()
				res.pipe(gzip)
				output = gzip
			}
			output.on('data', (chunk) => {
				body += chunk
			})
			output.on('end', () => {
				const response = JSON.parse(body)
				if(res.statusCode === 200) {
					this._onRequestEnd(response)
					resolve(response.items || [])
				}
				else {
					this._onRequestEnd(response, res.statusCode)
					reject(response)
				}
			})
		}).on('error', (e) => {
			self._onRequestEnd({}, e)
			reject(e)
		})
	},

	_onRequestEnd: function(response, error) {
		var delay = requestInterval
		if (error) {
			delay = backoffInterval
			this._backoff = true
		}
		else {
			this._quotaRemaining = response.quota_remaining
			var quota = Number(100 * this._quotaRemaining / response.quota_max).toFixed(0)
			log('quota '+quota+'%'+' ('+this._quotaRemaining+')')
		}

		this._timeout = true
		this._pending = false
		setTimeout(() => {
			this._timeout = false
			this._backoff = false
		}, delay)
	},

	_pending: false,
	_quotaRemaining: 10000,
	_timeout: false,
	_backoff: false,

}
