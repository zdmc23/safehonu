$(document).ready(function() {
	$('a#video').click(function(event) {
		$('div#video').replaceWith('<iframe src="http://player.vimeo.com/video/2613544?byline=0&amp;portrait=0&amp;color=c9ffff" width="400" height="300" frameborder="0"></iframe>');
	});
	$('input#try').click(function(event) {
		window.location = 'http://safehonu.com/create';
	});
});
