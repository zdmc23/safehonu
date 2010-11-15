var http_mod = require('http');
var fs_mod = require('fs');
require('./underscore');

var debug = false;

if (debug) log('launched poll.js');
fs_mod.readFile('conf/props.js', encoding='utf-8', function (err, data) {
	if (err) throw err; 
	if (debug) log('sucessfully parsed "conf/props.js" at startup');
	props = JSON.parse(data);
	setInterval(function() {
		if (props === null || props === undefined || props === '') throw new Error('null properties');
		log('tick... tock...');
		var request = http_mod.createClient(5984, 'localhost').request('GET', '/events/_design/byActive/_view/byActiveWithDate');
		request.end();
		request.on('response', function (response) {
			response.setEncoding('utf8');
			var body = '';
			response.on('data', function (chunk) { body += chunk; });
			response.on('end', function () { 
				// TODO: determine if these are sorted properly and break?
				_.each(JSON.parse(body).rows, function(event) { 
					if (evaluate_datetime(event.value)) return;
					notify(event.value,props);
				});
			});
		});
	}, 5000);
});

function notify(event,props) {
	console.log(JSON.stringify(event));
	var location = event.location.lat + ',' + event.location.lng;
	var api_user = props.sendgrid.api_user;
	var api_key = props.sendgrid.api_key;
	var to = (isPhone(event.notify)) ? (event.notify.replace(/\(/g,'').replace(/\)/g,'').replace(/\-/g,'').replace(/\ /g,'').replace(/\./g,'') + '@phone') : event.notify;
	var subject = 'URGENT: Update about ' + event.name + ' from http://safehonu.com';
	var html = encodeURIComponent('<b>' + event.name + '</b> failed to show up for a meeting, and has specified you as an emergency contact.<br/><br/>Please follow-up with <b>' + event.name + '</b> (' + event.email + ') to ensure their safety. <b>Mahalo!</b><br/><br/><br/><i>MEETING DETAILS:</i><br/><br/><b>' + event.datetime + '</b><br/><br/><img src="http://maps.google.com/maps/api/staticmap?markers=size:mid|color:purple|label:!|'+location+'&size=350x300&sensor=false"></img>');
	var text = encodeURIComponent('Aloha!  URGENT update about ' + event.name + ' from safehonu.com. ' + event.name + ' failed to show up for a meeting, and has specified you as an emergency contact. Please follow-up with ' + event.name + ' to ensure their safety. Thanks! safehonu.com');
	var from = 'ninjaturtle@safehonu.com';
	var fromname = 'safehonu.com';
	var path_text = '/api/mail.send.json?api_user='+api_user+'&api_key='+api_key+'&to='+to+'&subject='+subject+'&text='+text+'&from='+from+'&fromname='+fromname;
	var path_html = '/api/mail.send.json?api_user='+api_user+'&api_key='+api_key+'&to='+to+'&subject='+subject+'&html='+html+'&from='+from+'&fromname='+fromname;
	var path = (isPhone(event.notify)) ? path_text : path_html;
	var request = http_mod.createClient(443, 'sendgrid.com', true).request('GET', path.replace(/\ /g,'%20'), { 'host': 'sendgrid.com' });
	request.end();
	request.on('response', function (response) {
		response.setEncoding('utf8');
		var body = '';
		response.on('data', function (chunk) { body += chunk; });
		response.on('end', function () { 
			console.log(body);
			var response = JSON.parse(body);
			if (response.message === 'success') {
				update(event);
			}
		});
	});
}

function update(event) {
	var record = event;
	record.log = {
		"created": record.log.created,
		"deleted": record.log.deleted,
		"confirmed": record.log.confirmed, 
		"notified": new Date().toUTCString()
	}
	var request = http_mod.createClient(5984, 'localhost').request('PUT', '/events/' + event._id);
	request.write(JSON.stringify(record),encoding='utf-8');
	request.end();
	request.on('response', function (response) {
		response.setEncoding('utf8');
		var body = "";
		response.addListener('data', function (chunk) { body += chunk });
		response.addListener('end', function () { 
			if (debug) console.log(body)
		});
	});
}

function evaluate_datetime(event) {
	var dt = new Date(event.datetime); 
	dt.setMinutes(dt.getMinutes()+Number(event.time));
	return (dt > new Date()) ? true : false;
}

function isEmail(input) {
	if (String(input).search(/^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/) != -1) return true;
	return false;
}

function isPhone(input) {
	if (String(input.replace(/\(/g,'').replace(/\)/g,'').replace(/\-/g,'').replace(/\ /g,'').replace(/\./g,'')).search(/^\s*\d{10}\s*$/) != -1) return true;
	return false;
}

function log(message) {
	console.log(new Date() + ' -- ' + message);
}
