var http_mod = require('http');
var url_mod = require('url');
var fs_mod = require('fs');
require('./underscore');

fs_mod.readFile('conf/props.js', encoding='utf-8', function (err, data) {
	if (err) throw err;
	//console.log(data);
	var props = JSON.parse(data);
	http_mod.createServer(function (req, res) {
		var url = url_mod.parse(req.url,true);
		//console.log(JSON.stringify(url));
		switch(url.pathname) {
			case '/confirm':
				confirm_delete(req,res,url,true);
			break;
			case '/delete':
				confirm_delete(req,res,url,false);
			break;
			case '/post':
				post(req,res,props);
			break;
			default:
				res.writeHead(404);
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
		if (post.email && post.datetime && post.location.lat && post.location.lng && post.distance && post.time && post.notify && post.log) { 
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
	var validated_post = validate(post);
	// TODO: validate for api (i.e., notify phone, email)
	var request = http_mod.createClient(5984, 'localhost').request('POST', '/events', {'Content-type': 'application/json'});
	request.write(JSON.stringify(validated_post),encoding='utf-8');
	request.end();
	request.on('response', function (response) {
		response.setEncoding('utf8');
		var body = '';
		response.on('data', function (chunk) { body += chunk; });
		response.on('end', function () { 
			var response = JSON.parse(body);
			console.log(JSON.stringify(response));
			var id = response.id;
			var rev = response.rev;
			var api_user = props.sendgrid.api_user;
			var api_key = props.sendgrid.api_key;
			var to = post.email;
			var subject = 'safehonu.com event confirmation';
			var html = encodeURIComponent('To Confirm: <a href=\"http://safehonu.com/confirm?id='+id+'\">http://safehonu.com/confirm?id='+id+'</a><p/>To Delete: <a href=\"http://safehonu.com/delete?id='+id+'\">http://safehonu.com/delete?id='+id+'</a>');
			var text = encodeURIComponent('To Confirm: http://safehonu.com/confirm?id='+id+'\nTo Delete: http://safehonu.com/delete?id='+id);
			var from = 'ninjaturtle@safehonu.com';
			var fromname = 'safehonu.com';
			var path = '/api/mail.send.json?api_user='+api_user+'&api_key='+api_key+'&to='+to+'&subject='+subject+'&html='+html+'&text='+text+'&from='+from+'&fromname='+fromname;
			//var path = '/api/mail.send.json?api_user='+api_user+'&api_key='+api_key+'&to='+to+'&subject='+subject+'&html='+html+'&from='+from+'&fromname='+fromname;
			var request = http_mod.createClient(443, 'sendgrid.com', true).request('GET', path.replace(/\ /g,'%20'), { 'host': 'sendgrid.com' });
			request.end();
			request.on('response', function (response) {
				response.setEncoding('utf8');
				var body = '';
				response.on('data', function (chunk) { body += chunk; });
				response.on('end', function () { 
					var response = JSON.parse(body);
					console.log(JSON.stringify(response));
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
	console.log(JSON.stringify(post));
	var request = http_mod.createClient(5984, 'localhost').request('GET', '/events/_design/byAuth/_view/byAuthAndActive?key="' + post.email + '"');
	request.end();
	request.on('response', function (response) {
		response.setEncoding('utf8');
		var body = '';
		response.on('data', function (chunk) { body += chunk; });
		response.on('end', function () { 
			var response = JSON.parse(body);
			var events = _.select(response.rows, function(row) { return evaluate_checkin(post,row.value); });
			_.each(events, function(event) { 
				var record = event.value;
				record.checkin = { "datetime": post.datetime, "location": post.location };
				console.log(JSON.stringify(record));
				var request = http_mod.createClient(5984, 'localhost').request('PUT', '/events/' + event.id);
				request.write(JSON.stringify(record),encoding='utf-8');
				request.end();
				request.on('response', function (response) {
					response.setEncoding('utf8');
					var body = "";
					response.addListener('data', function (chunk) { body += chunk });
					response.addListener('end', function () { 
						var response = JSON.parse(body);
						console.log(JSON.stringify(response));
						if (response.message === 'success') {
							var message = 'A hui hou... Until we meet again!  Mahalo<br/>&nbsp;&nbsp;&nbsp;(to check-in afresh, just refresh .. the page)';
							res.end(JSON.stringify({ 'info': message }));
							return;
						}
						// TODO: figure out why this triggered on a successful check-in...
						res.end(JSON.stringify({ 'error': 'Unable to check-in!'}));
					});
				});
			});
		});
	});
}

function evaluate_checkin(checkin, event) {
	var d1 = new Date(event.datetime); 
	var d2 = new Date(event.datetime);
	d1.setMinutes(d1.getMinutes()-Number(event.time));
	d2.setMinutes(d2.getMinutes()+Number(event.time));
	var lat1 = checkin.location.lat;
	var lng1 = checkin.location.lng;                
	var lat2 = event.location.lat;
	var lng2 = event.location.lng;
	var distance = event.distance;
	return ((new Date(checkin.datetime) >= d1) && (new Date(checkin.datetime) <= d2) && (distanceTo(lat1,lng1,lat2,lng2) <= distance)) ? true : false;
}

function confirm_delete(req,res,url,confirm) {
	if (!url.query) { res.writeHead(500); res.end(); return; }
	var request = http_mod.createClient(5984, 'localhost').request('GET', '/events/' + url.query.id);
	request.end();
	request.on('response', function (response) {
		response.setEncoding('utf8');
		var body = "";
		response.addListener('data', function (chunk) { body += chunk });
		response.addListener('end', function () { 
			var response = JSON.parse(body);
			if (response.error) { 
				res.writeHead(500)
				res.end();
				return;
			}
			var record = response;
			record.log = {
				"created": record.log.created,
				"deleted": (confirm) ? record.log.deleted : new Date().toUTCString(),
				"confirmed": (confirm) ? new Date().toUTCString() : record.log.confirmed, 
				"notified": record.log.notified
			}
			var request = http_mod.createClient(5984, 'localhost').request('PUT', '/events/' + url.query.id);
			request.write(JSON.stringify(record),encoding='utf-8');
			request.end();
			request.on('response', function (response) {
				response.setEncoding('utf8');
				var body = "";
				response.addListener('data', function (chunk) { body += chunk });
				response.addListener('end', function () { 
					var response = JSON.parse(body);
					console.log(JSON.stringify(response));
					if (req.method === 'GET') { 
						res.writeHead(200, {'Content-Type': 'text/html'});
						// TODO: better html responses (event info)
						(confirm) ? res.end('<html><h1>confirmed!</h1></html>') : res.end('<html><h1>deleted!</h1></html>');
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

// TODO: actually do some validation
function validate(post) {
	return post;
}

// spherical law of cosines
function distanceTo(lat1,lng1,lat2,lng2) {
	var R = 6371; // km (3959 for mi)
	return Math.acos(Math.sin(lat1.toRad())*Math.sin(lat2.toRad()) + Math.cos(lat1.toRad())*Math.cos(lat2.toRad()) * Math.cos(lng2.toRad()-lng1.toRad())) * R;
}

Object.prototype.toRad = function() {
  return this * Math.PI / 180;
}
