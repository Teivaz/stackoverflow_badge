'use strict'

const templates = {
	'default': {
		name: 'default',
		path: __dirname+'/../../templates/badge-template.html'
	}
}

module.exports = function(name) {
	if(name in templates) {
		return templates[name]
	}
	else {
		return templates.default
	}
}
