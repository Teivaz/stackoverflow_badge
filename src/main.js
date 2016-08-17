const Http = require('http')
const Uri = require('urijs')
const Fs = require('fs')

const ProfileWorker = require('./profile/worker')
const Render = require('./renderer/main')
const Templates = require('./templates')

const favicon = fs.readFileSync('resources/favicon.ico')

function log(level, text) {
	console.log(text)
}

function faviconPlease(res) {
	res.writeHead(200, {'Content-Type': 'image/x-icon'})
	res.end(favicon)
}

function nothingPlease(res) {
	res.writeHead(404, {'Content-Type': 'text/plain'})
	res.end('404. Not found')
}

function noUserPlease() {
	res.writeHead(400, {'Content-Type': 'text/plain'})
	res.end('400. Requested user not found')
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
	else{
		nothingPlease(res)
		return
	}

	var idParts = userId.split('.')
	var user_id = Number(idParts[0])
	if(idParts.length > 1) {
		ext = idParts[idParts.length-1]
	}

	ProfileWorker.request(user_id).then( (user) => {
		Render(user, Templates(template), format).then( (image, mime) => {
			res.writeHead(200, {'Content-Type': mime})
			res.end(image)
		})
	}).catch( () => {
		noUserPlease(res)
	})
}

ProfileWorker.onload = function(users) {
	// render some images when have free time
}

var s = Http.createServer(function (req, res) {
	var uri = Uri(req.url)
	var path = uri.pathname()

	if(path === '/favicon.ico'){
		faviconPlease(res)
	}
	else if(path === '/') {
		indexPlease(res)
	}
	else{
		servePlease(path, res)
	}
})
s.listen(3100)
