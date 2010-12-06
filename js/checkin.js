$(document).ready(function() {
	var debug = true;
	var current_position = null;
	$('span#loading').hide();
	$('div#map').hide();
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {  
			$('div#loading').hide();
			current_position = position.coords.latitude + ',' + position.coords.longitude;
			$('div#map').html('<div><img src="http://maps.google.com/maps/api/staticmap?markers=size:mid|color:purple|label:!|'+current_position+'&size=350x300&sensor=false"></img></div>').show();
		}); 
	} 
	$('input#checkin').click(function(event) {
		if (current_position === null) {
			modal_error('Ah, shoots brah!  <strong>Unable to get da geo-coordinates</strong><br/>&nbsp;&nbsp;&nbsp;(please try again, at da kine time)');
			return;
		}
		var checkin = {
    	email: $('input#email').val(),
    	datetime: new Date().toUTCString(), // GMT!
    	location: {
				lat: current_position.split(',')[0],
				lng: current_position.split(',')[1]
			}
		}
		//if (debug) alert(JSON.stringify(checkin));
		if (validate(checkin)) post(checkin);
	});
	function modal_info(message) {
		$('div#modal').removeClass('error').addClass('info').html(message).show();
	}
	function modal_error(error) {
		// TODO: log errors
		$('div#modal').removeClass('info').addClass('error').html(error).show();
	}
	function validate(checkin) {
		$(':input').removeClass('invalid');
		var invalid_input = false;
		if (invalid(checkin.email) || !isEmail(checkin.email)) {
			$('input#email').addClass('invalid');
			invalid_input = true;
		}
		if (invalid_input) {
			modal_error('ERROR -- Invalid form input...<br/>&nbsp;&nbsp;&nbsp;(please update and try again)');
			return false;
		}
		return true;
	}
	function post(checkin) {
		$('input#checkin').attr('disabled','disabled');
		$('span#loading').show();
		$.ajax({
			data: JSON.stringify(checkin), 
			url: "http://safehonu.com/post", //TODO: HTTPS
			type: "POST",
			contentType: "application/json",
			timeout: 60000,
			dataType: "json",
			success: function(response) {
				(response.info) ? modal_info(response.info) : modal_error(response.error);
				$('span#loading').hide();
			},
			error: function(response) {
				modal_error('Ah, shoots brah!  <strong>Unable to log da check-in</strong><br/>&nbsp;&nbsp;&nbsp;(please try again, at da kine time)');
				$('span#loading').hide();
			}
		});
	}
	function invalid(input) {
		if (input === null || input === undefined || input === '') return true;
		return false;
	}
	function isEmail(input) {
 		if (String(input).search(/^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/) != -1) return true;
		return false;
	}
});
