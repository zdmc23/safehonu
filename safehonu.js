var http_mod = require('http');
var url_mod = require('url');

http_mod.createServer(function (req, res) {
	var url_parts = url_mod.parse(req.url);
	console.log(url_parts.pathname);
	switch(url_parts.pathname) {
		case '/post':
			post(req,res);
		break;
		case '/confirm':
			confirm(req,res);
		break;
		case '/delete':
			delete(req,res);
		break;
		default:
			res.writeHead(404);
			console.log('oh dear, 404, but nginx should\'ve handled this!');
	}
}).listen(8125, "localhost");
console.log('Server running at http://localhost:8125');

function post(req,res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
	var body = "";
	req.addListener('data', function (chunk) { body += chunk });
	req.addListener('end', function () { 
		var post = JSON.parse(body);
		if (post.email && post.datetime && post.location.lat && post.location.lng && post.notify) {  
			var message = 'We\'re lookin\' out for ya... check-in soon!  Mahalo'; 
			message += '<br/>&nbsp;&nbsp;&nbsp;(to create another, just refresh the page)';
  		res.end(JSON.stringify({ 'info': message }));
			handle_event(post);
		} else if (post.email && post.datetime && post.location.lat && post.location.lng) {
			var message = 'A hui hou... Until we meet again!  Mahalo'; 
			message += '<br/>&nbsp;&nbsp;&nbsp;(to check-in afresh, just refresh .. the page)';
  		res.end(JSON.stringify({ 'info': message }));
			handle_checkin(post);
		} else {
  		res.end(JSON.stringify({ 'error': 'Unknown data format!' }));
		}
	});
}

function confirm(req,res) {
	if (req.method === 'GET') { 
  	res.writeHead(200, {'Content-Type': 'text/html'});
	} else if (req.method === 'PUT') {
  	res.writeHead(200, {'Content-Type': 'application/json'});
	}	else { 
  	res.writeHead(404);
	}
}

function delete(req,res) {
	if (req.method === 'GET') { 
  	res.writeHead(200, {'Content-Type': 'text/html'});
	} else if (req.method === 'DELETE') {
  	res.writeHead(200, {'Content-Type': 'application/json'});
	}	else { 
  	res.writeHead(404);
	}
}

function checkin(checkin) {
	var couchdb = http_mod.createClient(5984, 'localhost');
	var request = couchdb.request('GET', '/events/_design/byAuth/_view/byAuthOnly');
	request.end();
	request.on('response', function (response) {
		console.log('STATUS: ' + response.statusCode);
		console.log('HEADERS: ' + JSON.stringify(response.headers));
		response.setEncoding('utf8');
		response.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
		});
	});
	console.log(JSON.stringify(checkin);
}
function event(event) {
	var couchdb = http_mod.createClient(5984, 'localhost');
	var request = couchdb.request('POST', '/events', {'Content-type': 'application/json'});
	request.write(JSON.stringify(event),encoding='utf-8');
	request.end();
	request.on('response', function (response) {
		console.log('STATUS: ' + response.statusCode);
		console.log('HEADERS: ' + JSON.stringify(response.headers));
		response.setEncoding('utf8');
		response.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
		});
	});
	console.log(JSON.stringify(event);
}
