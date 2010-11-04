var http_mod = require('http');
var url_mod = require('url');

http_mod.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
	var body = "";
	req.addListener('data', function (chunk) { body += chunk });
	req.addListener('end', function () { 
		var post = JSON.parse(body);
		if (post.username && post.password && post.datetime && post.location.lat && post.location.lng) {
			var message = 'A hui hou... Until we meet again!  Mahalo'; 
			message += '<br/>&nbsp;&nbsp;&nbsp;(to check-in afresh, just refresh .. the page)';
  		res.end(JSON.stringify({ 'info': message }));
			handle_checkin(post);
		} else if (false) {  // TODO: define event schema
			var message = 'Mahalo! We\'re lookin\' out for ya... check-in soon!'; 
			message += '<br/>&nbsp;&nbsp;&nbsp;(to create another, just refresh the page)';
  		res.end(JSON.stringify({ 'info': message }));
			handle_event(post);
		} else {
  		res.end(JSON.stringify({ 'error': 'Unknown data format!' }));
		}
	});
}).listen(8125, "localhost");
console.log('Server running at http://localhost:8125');

function handle_checkin(checkin) {
	console.log(checkin.username);
	console.log(checkin.password);
	console.log(checkin.datetime);
	console.log(checkin.location.lat);
	console.log(checkin.location.lng);
}
function handle_event(event) {
	/*
	console.log(checkin.username);
	console.log(checkin.password);
	console.log(checkin.datetime);
	console.log(checkin.location.lat);
	console.log(checkin.location.lng);
	*/
}
