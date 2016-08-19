'user strict'
const Phantom = require('phantomjs-prebuilt')
const Fs = require('fs')

function log(level, data) {
	//console.log(data)
}

const formats = {
	'png': 'image/png',
	'svg': 'image/svg+xml',
	'jpg': 'image/jpeg',
}
const defaultFormat = 'png'

function validateFormat(format) {
	format = format || defaultFormat
	if(format in formats) {
		return format
	}
	else {
		return defaultFormat
	}
}

function formatResponse(path, format) {
	//console.log(path)
	var data = null
	var error = null
	try {
		data = Fs.readFileSync(path)
	}
	catch(e) {
		error = 'fs error'
	}
	return {
		data: data,
		error: error,
		type: formats[format]
	}
}

module.exports = function(user, template, format){
	format = validateFormat(format)

	return new Promise( (resolve, reject) => {
		var options = {
			template: template,
			format: format,
			id: user.user_id
		}
		var script = __dirname + '/phantom.js'
		var program = Phantom.exec(script, JSON.stringify(options), JSON.stringify(user))
		var path = ''
		program.stdout.on('data', function(data) {
			path += data
		})
		//program.stdout.pipe(process.stdout)
		program.stderr.pipe(process.stdout)
		program.on('exit', (code) => {
			if(code === 0) {
				resolve(formatResponse(path, format))
				log('verbose', 'rendering ok ' + code)
			}
			else {
				log('vebose', 'rendering error ' + code)
				reject()
			}
		})
	})
}
