'use strict'

const Fs = require('fs')
const Templates = require('../templates/main')
const formats = require('../renderer/main').formats
const defaultFormat = require('../renderer/main').defaultFormat

module.exports = function(template, user_id, format) {
	template = Templates(template)
	if(!(format in formats)) {
		format = defaultFormat
	} 
	var path = __dirname +
		'/../../cache/' +
		user_id + '/' +
		template.name + '.' + format

	if(Fs.existsSync(path)){
		return {
			data: Fs.readFileSync(path),
			type: formats[format]
		}
	}
	else {
		return null
	}
}
