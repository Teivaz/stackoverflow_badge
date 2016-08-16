const Http = require('http')
const Uri = require('urijs')

function log(level, text) {
	console.log(text)
}

var s = Http.createServer(function (req, res) {
	var uri = Uri(req.url)
	var path = uri.pathname()
	if(path === '/favicon.ico'){
		faviconPlease(res)
	}
	else{
		var params = uri.search(true)
		if(path === '/') {
			log('info', '')
			servePlease(params, res)
		}
		else {
			log('warn', '')
			nothingPlease(res)
		}
	}
})
s.listen(3100)
