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
	if (hour === 0) {
		hour = '12';
	} else if (hour > 12) {
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
		var location = $('input#location').val();
		var src = 'http://maps.google.com/maps/api/staticmap?markers=size:mid|color:purple|label:!|'+location+'&size=350x300&sensor=false';
		$('img#map').attr('src', src).load(function() {
			$('div#map').show();
		}); 
	});
	$('input#create').click(function(event) {
		var lat_lng = null;
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({ 'address': $('input#location').val() }, function (results, status) {
			lat_lng = (status == google.maps.GeocoderStatus.OK) ?  results[0].geometry.location.sa + "," + results[0].geometry.location.ta : null;
			var location = lat_lng;
			var year = $('select#year').val();
			var month = $('select#month').val();
			var day = $('select#day').val();
			var hour = ($('select#ampm').val()=='PM') ? Number($('select#hour').val())+Number(12) : $('select#hour').val();
			if (hour == 12) hour = 00;
			if (hour == 24) hour = 12;
			var min = $('select#min').val();
			var notify = $('input#notify').val();
			var email = $('input#email').val();
			var name = $('input#name').val();
			var event = {
				email: email,
				name: name,
				location: {
					lat: (location != null && location != undefined && location != '') ? location.split(',')[0] : null,
					lng: (location != null && location != undefined && location != '') ? location.split(',')[1] : null
				},
				datetime: new Date(year, month, day, hour, min, 0, 0).toUTCString(),
				distance: '1.6',  // km
				time: '30', 			// min
				notify: notify,
				log: {
					created: new Date().toUTCString()
				}
			}   
			if (validate(event)) post(event);
		});
	});
	function modal_info(message) {
		$('div#modal').removeClass('error').addClass('info').html(message).show();
	}
	function modal_error(error) {
		$('div#modal').removeClass('info').addClass('error').html(error).show();
	}
	function validate(event) {
		$(':input').removeClass('invalid');
		var invalid_input = false;
		if (invalid(event.email) || !isEmail(event.email)) {
			$('input#email').addClass('invalid');
			invalid_input = true;
		}
		if (invalid(event.location.lat) || invalid(event.location.lng)) {
			$('input#location').addClass('invalid');
			invalid_input = true;
		}
		if (invalid(event.notify) || (!isPhone(event.notify) && !isEmail(event.notify))) {
			$('input#notify').addClass('invalid');
			invalid_input = true;
		}
		if (invalid(event.name)) {
			$('input#name').addClass('invalid');
			invalid_input = true;
		}
		if (invalid_input) {
			modal_error('ERROR -- Invalid form input...<br/>&nbsp;&nbsp;&nbsp;(please update and try again)');
			return false;
		}
		return true;
	}
	function post(event) {
		$('input#create').attr('disabled','disabled');
		$.ajax({
			data: JSON.stringify(event),
			url: "http://safehonu.com/post", //TODO: HTTPS
			type: "POST",
			contentType: "application/json",
			timeout: 60000,
			dataType: "json",
			success: function(response) {
				(response.info) ? modal_info(response.info) : modal_error(response.error);
			},
			error: function(response) {
				// TODO: log errors
				modal_error('ERROR -- Unable to create da event... please try again<br/>&nbsp;&nbsp;&nbsp;(at da kine time)');
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
	function isPhone(input) {
		if (String(input.replace(/\(/g,'').replace(/\)/g,'').replace(/\-/g,'').replace(/\ /g,'').replace(/\./g,'')).search(/^\s*\d{10}\s*$/) != -1) return true;
		return false;
	}
});
