'user strict'
const Phantom = require('phantomjs-prebuilt')
const Fs = require('fs')

function log(data) {
	console.log(data)
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
	//console.log(__dirname + '/' + path)
	return {
		data: Fs.readFileSync(__dirname + '/' + path),
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
			//console.log('ondata')
			path += data
		})
		//program.stdout.pipe(process.stdout)
		program.stderr.pipe(process.stdout)
		program.on('exit', (code) => {
			if(code === 0) {
				resolve(formatResponse(path, format))
			}
			else {
				log('rendering error ' + code)
				reject()
			}
		})
	})
}
