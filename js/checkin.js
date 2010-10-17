$(document).ready(function() {
	var debug = true;
	var current_position = null;
	$('div#map').hide();
	// TODO: hide current position; show spinny wheel
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {  
			current_position = position.coords.latitude + ',' + position.coords.longitude;
			$('span#location').replaceWith(current_position);
			// TODO: hide spinny wheel; show current position
			if (debug) alert(current_position);
		}); 
	} 
	$('a#location').click(function(event) {
		var src = 'http://maps.google.com/maps/api/staticmap?markers=size:mid|color:purple|label:!|'+current_position+'&size=350x300&sensor=false';
		if (debug) alert('img#map.src: ' + src);
		$('img#map').attr("src", src).load(function() {
			$('div#map').show();
		});
	});
	$('input#checkin').click(function(event) {
		//if (debug) alert('current-position: ' + current_position);
		// TODO:
		// 1. grab username, password, current_position
		// 2. post to api (alert w/ json)
		// 3. display notification {success,failure}
		// 4. disable check-in button
	});
});
