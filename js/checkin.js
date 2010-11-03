$(document).ready(function() {
	var debug = true;
	var current_position = null;
	$('div#map').hide();
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {  
			$('div#loading').hide();
			current_position = position.coords.latitude + ',' + position.coords.longitude;
			var src = 'http://maps.google.com/maps/api/staticmap?markers=size:mid|color:purple|label:!|'+current_position+'&size=350x300&sensor=false';
			$('img#map').attr('src', src).load(function() {
				$('div#map').show();
			});
		}); 
	} 
	$('input#checkin').click(function(event) {
		//TODO: validate form data and current_position(!= null) 
		var checkin = {
    	username: $('input#email').val(),
    	password: $('input#password').val(),
    	datetime: new Date().toUTCString(), // GMT!
    	location: {
				lat: current_position.split(',')[0],
				lng: current_position.split(',')[1]
			}
		}
		if (debug) alert(JSON.stringify(checkin));
		$.ajax({
			data: checkin, 
			url: "http://safehonu.com/post", //TODO: HTTPS
			type: "POST",
			contentType: "application/json",
			timeout: 60000,
			dataType: "json",
			success: function(response) {
				// TODO: notification = success
			},
			error: function(response) {
				// TODO: notification = error
			}
		});
	});
});
