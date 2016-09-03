//'use strict'
const Uri = require('urijs')

const system = require('system')
const Fs = require('fs')
const options = JSON.parse(system.args[1])
var profile = JSON.parse(system.args[2])
var page = require('webpage').create()

function warning(msg) {
	//console.log('warning ' + options.id + ': ' + msg)
}

page.onError = function(msg, trace) {
	var msgStack = ['ERROR: ' + msg]
	if (trace && trace.length) {
		msgStack.push('TRACE:')
		trace.forEach(function(t) {
			msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''))
		})
	}
	console.error(msgStack.join('\n'))
}
page.onConsoleMessage = function(msg, lineNum, sourceId) {
	//console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")')
}

function toLocaleString(number) {
	var result = []
	while(number >= 1000) {
		var part = '000' + [number%1000]
		part = part.substr(part.length - 3)
		result.push(part)
		number = Math.floor(number/1000)
	}
	result.push(number)
	return result.reverse().join(',')
}

function formatReputation(n) {
	if(n < 10e3)
		return toLocaleString(n)
	else if(n < 100e3)
		return toLocaleString((n/1000).toFixed(1)) + 'k'
	else
		return toLocaleString((n/1000).toFixed(0)) + 'k'
}

function downloadAvatar(page, user, callback) {
	page.evaluate(function(src) {
		var img = document.getElementById('avatar')
		var timer = setTimeout(function(){
			if(!img.complete) {
				window.callPhantom('image error. timeout')
			}
		}, 3000)
		img.onerror = function(){
			clearTimeout(timer)
			window.callPhantom('image error. not loaded')
		}
		img.onload = function(){
			clearTimeout(timer)
			window.callPhantom()
		}
		img.src = src
	}, user.profile_image)
}

function createUserData(user) {
	user.reputation = user.reputation || warning('not set reputation') || 1
	return {
		user_id: user.user_id || warning('not set user_id') || 0,
		profile_image: user.profile_image || warning('not set profile_image') || '',
		display_name: user.display_name || warning('not set display_name') || 'anonymous',
		reputation: formatReputation(user.reputation),
		badges_bronze: user.badge_counts.bronze || 0,
		badges_silver: user.badge_counts.silver || 0,
		badges_gold: user.badge_counts.gold || 0,
	}
}

function gravatarResizeLink(page, user) {
	var link = Uri(user.profile_image)
	if (link.hostname() === 'www.gravatar.com') {
		var size = page.evaluate(function(){
			var element = document.getElementById('avatar')
			return Math.max(element.width, element.height)
		})
		link.setSearch({'s': size})
		user.profile_image = link.toString()
	}
}

function fill(page, user) {
	page.evaluate(function(user) {
		document.getElementById('name').textContent = user.display_name
		document.getElementById('reputation').textContent = user.reputation
		document.getElementById('badges-bronze').textContent = user.badges_bronze
		document.getElementById('badges-silver').textContent = user.badges_silver
		document.getElementById('badges-gold').textContent = user.badges_gold
  	}, user)
}

function setDimensions(page) {
	var dimensions = page.evaluate(function() {
		var attributes = document.body.attributes
		return {
			width: attributes.width.value,
			height: attributes.height.value,
		}
	})
	var width = parseInt(dimensions.width, 10)
	var height = parseInt(dimensions.height, 10)

	page.viewportSize = {
		width: width,
		height: height
	}
	page.clipRect = {
		top: 8,
		left: 8,
		width: width,
		height: height
	}
}

function renderPage(page, user) {
	var path = Fs.workingDirectory + 
		'/cache/' +
		user.user_id + '/' +
		options.templateName + '.' + options.format
	page.render(path)
	try {
		system.stdout.write(path)
	}
	catch(e) {
		console.error(e.toString())
	}
}

function finish() {
	phantom.exit()
}

page.open(options.templatePath, function(status) {
	if (status === 'success') {
		setDimensions(page)
		var user = createUserData(profile)

		page.onCallback = function(error) {
			if(error)
				warning(error)
			renderPage(page, user)
			finish()
		}
		gravatarResizeLink(page, user)
		fill(page, user)
		downloadAvatar(page, user)
	}
	else {
		finish()
	}
})
