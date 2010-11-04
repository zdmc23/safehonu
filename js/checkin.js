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
		//TODO: improve validation 
		var error = 'Ah, shoots brah!  <strong>Unable to get da geo-coordinates</strong>';
		error += '<br/>&nbsp;&nbsp;&nbsp;(please try again, at da kine time)';
		if (current_position === null) {
			modal_error(error);
			return;
		}
		var checkin = {
    	username: $('input#email').val(),
    	password: $('input#password').val(),
    	datetime: new Date().toUTCString(), // GMT!
    	location: {
				lat: current_position.split(',')[0],
				lng: current_position.split(',')[1]
			}
		}
		//if (debug) alert(JSON.stringify(checkin));
		$.ajax({
			data: JSON.stringify(checkin), 
			url: "http://localhost/post", 
			//url: "http://safehonu.com/post", //TODO: HTTPS
			type: "POST",
			contentType: "application/json",
			timeout: 60000,
			dataType: "json",
			success: function(response) {
				(response.info) ? modal_info(response.info) : modal_error(response.error);
				$('input#checkin').attr('disabled','disabled');
			},
			error: function(response) {
				// TODO: log errors
				var error = 'Ah, shoots brah!  <strong>Unable to log da check-in</strong>';
				error += '<br/>&nbsp;&nbsp;&nbsp;(please try again, at da kine time)';
				modal_error(error);
				$('input#checkin').attr('disabled','disabled');
			}
		});
	});
	function modal_info(message) {
		$('div#modal').addClass('info').html(message).show();//.fadeTo(60000,0);
	}
	function modal_error(error) {
		$('div#modal').addClass('error').html(error).show();//.fadeTo(60000,0);
	}
});
