'use strict'
var config

try {
	config = require('./config.json')
}
catch (e) {
	if (e instanceof Error && e.code === 'MODULE_NOT_FOUND')
		config = require('./config-default.json')
    else
        throw e
}

module.exports = config
