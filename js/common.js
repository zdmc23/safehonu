$(document).ready(function() {
	$('a#video').click(function(event) {
		$('div#video').replaceWith('<div id="caro-bg"><div id="caro-fg"><iframe src="http://player.vimeo.com/video/2613544?byline=0&amp;portrait=0&amp;color=c9ffff" width="400" height="300" frameborder="0"></iframe></div></div><br/>');
	});
	/*
	var current_location = ''; // detect?
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {  
			alert(position.coords.latitude + ", " + position.coords.longitude);
		}); 
	} 
	$('input#location').val('1136 Piikoi Place, Honolulu');
	$('div#meta').hide();
	$('input#find').click(function(event) {
		var location = $('input#location').val();
		if (location != current_location) { 
			$('div#map').hide('slow', function() {
				var src = 'http://maps.google.com/maps/api/staticmap?markers=size:mid|color:purple|label:!|'+location+'&size=500x200&sensor=false';
				$('img#map').attr("src", src).load(function() {
					current_location = location;
					$('div#map').show('slow');
				});
			});
		}
	});
	$('a#add-meta').click(function() {
		$('div#action').hide();
		$('div#meta').show();
	});
	*/
});
