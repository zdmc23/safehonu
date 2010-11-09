$(document).ready(function() {
	$('div#map').hide();
	var dd = new Date();
  $('select#year').val(dd.getFullYear());
	var month = dd.getMonth()+1;
  var fmt_month = (month < 10) ? '0' + month : month;
	$('select#month').val(fmt_month);
	var day = dd.getDate();
  var fmt_day = (day < 10) ? '0' + day : day;
  $('select#day').val(fmt_day);
	var hour = dd.getHours();
	if (hour > 12) {
		if ((hour % 12) > 9) {
			hour = (hour % 12);
		} else {
			hour = '0' + (hour % 12);
		}
	} else {
		if (hour > 9 && hour <= 12)  {
			hour = hour;
		} else {
			hour = '0' + hour;
		}
	}
  $('select#hour').val(hour);
	var minutes = dd.getMinutes();
	if (minutes > 45) {
		$('select#min').val('45');
	} else if (minutes > 30) {
		$('select#min').val('30');
	} else if (minutes > 15) {
		$('select#min').val('15');
	} else {
		$('select#min').val('00');
	}
  var ampm = (dd.getHours() > 11) ? 'PM' : 'AM';
  $('select#ampm').val(ampm);
	// functions
	$('input#map').click(function(event) {
		var location = validate($('input#location').val());
		var src = 'http://maps.google.com/maps/api/staticmap?markers=size:mid|color:purple|label:!|'+location+'&size=350x300&sensor=false';
		$('img#map').attr('src', src).load(function() {
			$('div#map').show();
		}); 
	});
	$('a#emerg').click(function() {
		//$('a#emerg').replaceWith('Emergency Contact (2):<br/><input id="emerg2" type="text"></input>');
		$('a#emerg').hide();
		$('input#emerge2').show();
		return false;
	});
	$('input#create').click(function(event) {
		var location = null;
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({ 'address': $('input#location').val() }, function (results, status) {
			 location = (status == google.maps.GeocoderStatus.OK) ?  results[0].geometry.location.b + "," + results[0].geometry.location.c : null;
			var year = $('select#year').val();
			var month = $('select#month').val();
			var day = $('select#day').val();
			var hour = ($('select#ampm').val()=='PM') ? parseInt($('select#hour').val())+12 : $('select#hour').val();
			var min = $('select#min').val();
			var emerg = validate($('input#emerg').val());
			var email = validate($('input#email').val());
			var event = {
				email: email,
				location: {
					lat: (location != null && location != undefined && location != '') ? location.split(',')[0] : null,
					lng: (location != null && location != undefined && location != '') ? location.split(',')[1] : null
				},
				datetime: new Date(year + "-" + month + "-" + day + " " + hour + ":" + min).toUTCString(),
				notify: emerg
			}   
			alert(JSON.stringify(event))
			$.ajax({
				data: JSON.stringify(event),
				url: "http://localhost/post", 
				//url: "http://safehonu.com/post", //TODO: HTTPS
				type: "POST",
				contentType: "application/json",
				timeout: 60000,
				dataType: "json",
				success: function(response) {
					(response.info) ? modal_info(response.info) : modal_error(response.error);
					$('input#create').attr('disabled','disabled');
				},
				error: function(response) {
					// TODO: log errors
					modal_error('ERROR -- Unable to create da event... please try again<br/>&nbsp;&nbsp;&nbsp;(at da kine time)');
					$('input#create').attr('disabled','disabled');
				}
			});   
		});
	});
	function modal_info(message) {
		$('div#modal').addClass('info').html(message).show();
	}
	function modal_error(error) {
		$('div#modal').addClass('error').html(error).show();
	}
	function validate(input) {
		return input;
	}
});
