var http_mod = require('http');
require('./underscore');

poll();
setInterval(poll, 120000);

function poll() {
	console.log('tick.');
	var request = http_mod.createClient(5984, 'localhost').request('GET', '/events/_design/byActive/_view/byActiveWithDate');
	request.end();
	request.on('response', function (response) {
		response.setEncoding('utf8');
		var body = '';
		response.on('data', function (chunk) { body += chunk; });
		response.on('end', function () { 
			// TODO: determine if these are sorted properly
			_.each(JSON.parse(body).rows, function(event) { 
      	if (event.value.datetime > new Date()) return;
				notify(event.value);
			});
		});
	});
}

function notify(event) {
	console.log(JSON.stringify(event));
	var record = event;
	record.log = {
		"created": record.log.created,
		"deleted": record.log.deleted,
		"confirmed": record.log.confirmed, 
		"notified": new Date().toUTCString()
	}
	//console.log(JSON.stringify(record));
	console.log('event._id: ' + event._id);
	var request = http_mod.createClient(5984, 'localhost').request('PUT', '/events/' + event._id);
	request.write(JSON.stringify(record),encoding='utf-8');
	request.end();
	request.on('response', function (response) {
		response.setEncoding('utf8');
		var body = "";
		response.addListener('data', function (chunk) { body += chunk });
		response.addListener('end', function () { 
			console.log(body)
			// TODO: send email to or call emergency contact
		});
	});
}
