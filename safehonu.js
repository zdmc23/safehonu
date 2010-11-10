var http_mod = require('http');
var url_mod = require('url');
var fs_mod = require('fs');

fs_mod.readFile('conf/props.js', encoding='utf-8', function (err, data) {
	if (err) throw err;
	//console.log(data);
	var props = JSON.parse(data);
	http_mod.createServer(function (req, res) {
		var url = url_mod.parse(req.url,true);
		//console.log(JSON.stringify(url));
		switch(url.pathname) {
			case '/confirm':
				confirm(req,res,url);
			break;
			case '/delete':
				delet(req,res,url);
			break;
			case '/post':
				post(req,res,props);
			break;
			case '/twilio':
				twilio(req,res);
			break;
			default:
				res.writeHead(404);
				console.log('oh dear, 404, but nginx should\'ve handled this!');
		}
	}).listen(8125, "localhost");
	console.log('Server running at http://localhost:8125');
});

function post(req,res,props) {
	res.writeHead(200, {'Content-Type': 'application/json'});
	var body = "";
	req.addListener('data', function (chunk) { body += chunk });
	req.addListener('end', function () { 
		var post = JSON.parse(body);
		if (post.email && post.datetime && post.location.lat && post.location.lng && post.notify) { 
			event(req,res,post,props);
		} else if (post.email && post.datetime && post.location.lat && post.location.lng) {
			checkin(req,res,post);
		} else {
			res.end(JSON.stringify({ 'error': 'Unknown data format!' }));
		}
	});
}

function event(req,res,post,props) {
	console.log(JSON.stringify(post));
	var request = http_mod.createClient(5984, 'localhost').request('POST', '/events', {'Content-type': 'application/json'});
	request.write(JSON.stringify(post),encoding='utf-8');
	request.end();
	request.on('response', function (response) {
		response.setEncoding('utf8');
		response.on('data', function (chunk) {
			console.log(chunk);
			var response = JSON.parse(chunk);
			var id = response.id;
			var rev = response.rev;
			var api_user = props.sendgrid.api_user;
			var api_key = props.sendgrid.api_key;
			var to = post.email;
			var subject = 'safehonu.com event confirmation';
			var html = encodeURIComponent('To Confirm: <a href=\"http://safehonu.com/confirm?id='+id+'\">http://safehonu.com/confirm?id='+id+'</a><p/>To Delete: <a href=\"http://safehonu.com/delete?id='+id+'&rev='+rev+'\">http://safehonu.com/delete?id='+id+'&rev='+rev+'</a>');
			var text = encodeURIComponent('To Confirm: http://safehonu.com/confirm?id='+id+'\nTo Delete: http://safehonu.com/delete?id='+id+'&rev='+rev);
			var from = 'ninjaturtle@safehonu.com';
			var fromname = 'safehonu.com';
			//var path = '/api/mail.send.json?api_user='+api_user+'&api_key='+api_key+'&to='+to+'&subject='+subject+'&html='+html+'&text='+text+'&from='+from+'&fromname='+fromname;
			var path = '/api/mail.send.json?api_user='+api_user+'&api_key='+api_key+'&to='+to+'&subject='+subject+'&html='+html+'&from='+from+'&fromname='+fromname;
			console.log('path: ' + path);
			var request = http_mod.createClient(443, 'sendgrid.com', true).request('GET', path.replace(/\ /g,'%20'), { 'host': 'sendgrid.com' });
			request.end();
			request.on('response', function (response) {
				response.setEncoding('utf8');
				response.on('data', function (chunk) {
					console.log(chunk);
					var response = JSON.parse(chunk);
					if (response.message === 'success') {
						var message = 'We\'re lookin\' out for ya... check-in soon!  Mahalo<br/>&nbsp;&nbsp;&nbsp;(to create another, just refresh the page)';
						res.end(JSON.stringify({ 'info': message }));
						return;
					}
					res.end(JSON.stringify({ 'error': 'Unable to create the event!'}));
				});
			});
		});
	});
}

function checkin(req,res,post) {
	// TODO: 
	// 1. get db record(s) -- algorithm
	// 2. update db record(s)
	var couchdb = http_mod.createClient(5984, 'localhost');
	var request = couchdb.request('GET', '/events/_design/byAuth/_view/byAuthOnly');
	request.end();
	request.on('response', function (response) {
		response.setEncoding('utf8');
		response.on('data', function (chunk) {
			console.log(chunk);
			/*
				var message = 'A hui hou... Until we meet again!  Mahalo<br/>&nbsp;&nbsp;&nbsp;(to check-in afresh, just refresh .. the page)';
				res.end(JSON.stringify({ 'info': message }));
				res.end(JSON.stringify({ 'error': 'Unable to check-in!'}));
			*/
		});
	});
	console.log(JSON.stringify(post));
}

function confirm(req,res,url) {
	if (!url.query) {
		res.writeHead(500)
		res.end();
		return;
	}
	var request = http_mod.createClient(5984, 'localhost').request('GET', '/events/' + url.query.id);
	request.end();
	request.on('response', function (response) {
		response.setEncoding('utf8');
		response.on('data', function (chunk) {
			console.log(chunk);
			var response = JSON.parse(chunk);
			if (response.error) { 
				res.writeHead(500)
				res.end();
				return;
			}
			var record = response;
			record.log = {
				"confirmed": new Date().toUTCString() 
			}
			var request = http_mod.createClient(5984, 'localhost').request('PUT', '/events/' + url.query.id);
			request.write(JSON.stringify(record),encoding='utf-8');
			request.end();
			request.on('response', function (response) {
				response.setEncoding('utf8');
				response.on('data', function (chunk) {
					console.log(chunk)
					if (req.method === 'GET') { 
						res.writeHead(200, {'Content-Type': 'text/html'});
						// TODO: better html responses (event info)
						res.end('<html><h1>confirmed!</h1></html>');
					} else if (req.method === 'PUT' || req.method === 'POST') {
						res.writeHead(200, {'Content-Type': 'application/json'});
						res.end(JSON.stringify(record));
					}	else { 
						res.writeHead(response.statusCode);
					}
				});
			});
		});
	});
}

function delet(req,res,url) {
	if (!url.query) { 
		res.writeHead(404);
		res.end();
		return;
	}
	var request = http_mod.createClient(5984, 'localhost').request('DELETE', '/events/' + url.query.id + '?rev=' + url.query.rev);
	request.end();
	request.on('response', function (response) {
		response.setEncoding('utf8');
		response.on('data', function (chunk) {
			console.log(chunk);
			if (req.method === 'GET') { 
				res.writeHead(200, {'Content-Type': 'text/html'});
				// TODO: html template with event info
				res.end('<html><h1>deleted!</h1></html>');
			} else if (req.method === 'DELETE') {
				res.writeHead(200, {'Content-Type': 'application/json'});
				// TODO: stringify a simple json response
				res.end(JSON.stringify({ 'info': 'success!' }));
			}	else { 
				res.writeHead(response.statusCode);
			}
		});
	});
}

function twilio(req,res) {
	res.writeHead(200, {'Content-Type': 'text/xml'});
	res.end('<?xml version="1.0" encoding="UTF-8" ?><Response><Say voice="woman" loop="2">Hello</Say></Response>');
}
