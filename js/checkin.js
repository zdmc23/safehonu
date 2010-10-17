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
	$('a#location').click(function(event) {
		$('div#map').replaceWith('<iframe src="http://maps.google.com/maps/api/staticmap?markers=size:mid|color:purple|label:!|'+current_position+'&size=500x200&sensor=false"');// width="400" height="300" frameborder="0"></iframe>');
	});
	$('input#checkin').click(function(event) {
		if (debug) alert('current-position: ' + current_position);
	});
});
