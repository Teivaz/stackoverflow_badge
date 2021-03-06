'use strict'
const Http = require('http')
const Uri = require('urijs')
const Fs = require('fs')

const Config = require('./config').app
const ProfileWorker = require('./profile/worker')
const Render = require('./renderer/main')
const Cache = require('./cache/main')

const favicon = Fs.readFileSync(__dirname+'/../resources/favicon.ico')
const index = Fs.readFileSync(__dirname+'/../resources/index.html')

function log(level, text) {
	console.log(text)
}

function faviconPlease(res) {
	res.writeHead(200, {'Content-Type': 'image/x-icon'})
	res.end(favicon)
}

function indexPlease(res) {
	res.writeHead(200, {'Content-Type': 'text/html'})
	res.end(index)
}

function nothingPlease(res) {
	res.writeHead(404, {'Content-Type': 'text/plain'})
	res.end('404. Not found')
}

function noUserPlease(res) {
	res.writeHead(400, {'Content-Type': 'text/plain'})
	res.end('400. Requested user not found')
}

function internalErrorPlease(res, error) {
	res.writeHead(500, {'Content-Type': 'text/plain'})
	res.end('500. Internal error\n'+error)
	log('error', 'Internal error\n'+error)
}

function servePlease(path, res) {
	var parts = path.split('/')
	var userId = ''
	var format = 'png'
	var template = ''
	if(parts.length > 3) {
		nothingPlease(res)
		return
	}
	else if(parts.length > 2) {
		userId = parts[2]
		template = parts[1]
	}
	else if(parts.length > 1) {
		userId = parts[1]
	}
	else {
		nothingPlease(res)
		return
	}

	var idParts = userId.split('.')
	var user_id = Number(idParts[0])
	if(idParts.length > 1) {
		format = idParts[idParts.length-1]
	}

	var cached = Cache(template, user_id, format)
	if(cached) {
		res.writeHead(200, {'Content-Type': cached.type})
		res.end(cached.data)
		return
	}

	ProfileWorker.request(user_id).then( (user) => {
		Render(user, template, format).then( (image) => {
			if(image.error) {
				internalErrorPlease(res, image.error.toString())
			}
			else {
				res.writeHead(200, {'Content-Type': image.type})
				res.end(image.data)
			}
		}).catch( () => {
			internalErrorPlease(res, 'render error')
		})
	}).catch( () => {
		log('info', 'user not found')
		noUserPlease(res)
	})
}

ProfileWorker.onload = function(users) {
	// render some images when have free time
	var task = function() {
		if(users.length > 0)
			Render(users.shift(), 'default', 'png').then(task)
	}
}

var s = Http.createServer(function (req, res) {
	var uri = Uri(req.url)
	var path = uri.pathname()

	if(path === '/favicon.ico') {
		faviconPlease(res)
	}
	else if(path === '/') {
		indexPlease(res)
	}
	else{
		servePlease(path, res)
	}
})
s.listen(Config.port)
