$(document).ready(function() {
	var debug = true;
	var current_position = null;
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {  
			current_position = position;
			$('span#location').replaceWith(position.coords.latitude + ', ' + position.coords.longitude);
			if (debug) alert(position.coords.latitude + ', ' + position.coords.longitude);
		}); 
	} 
	$('input#checkin').click(function(event) {
		if (debug) alert('current-position: ' + current_position);
	});
});
