$(document).ready(function() {
	$('div#map').hide();
	$('div#meta').hide();
	var dd = new Date();
  $('select#year').val(dd.getFullYear());
	var month = dd.getMonth()+1;
  var fmt_month = (month < 10) ? '0' + month : month;
	$('select#month').val(fmt_month);
	var day = dd.getDate();
  var fmt_day = (day < 10) ? '0' + day : day;
  $('select#day').val(fmt_day);
	$('input#date').val($('select#year').val()+'-'+$('select#month').val()+'-'+$('select#day').val());
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
	$('input#time').val($('select#hour').val()+':'+$('select#min').val()+' '+$('select#ampm').val());
	// 
	$('select#year,select#month,select#day').change(function(event) {
		$('input#date').val($('select#year').val()+'-'+$('select#month').val()+'-'+$('select#day').val());
	});
	$('select#hour,select#min,select#ampm').change(function(event) {
		$('input#time').val($('select#hour').val()+':'+$('select#min').val()+' '+$('select#ampm').val());
	});
	$('input#map').click(function(event) {
		var location = validate($('input#location').val());
		var src = 'http://maps.google.com/maps/api/staticmap?markers=size:mid|color:purple|label:!|'+location+'&size=350x300&sensor=false';
		$('img#map').attr('src', src).load(function() {
			$('div#map').show();
		}); 
	});
	$('a#emerg').click(function() {
		$('a#emerg').replaceWith('Emergency Email (2):<br/><input id="emerg2" type="email"></input>');
		return false;
	});
	$('a#meta').click(function() {
		$('div#meta').show();
		$('div#action').hide();
		return false;
	});
	$('input#create').click(function(event) {
		var location = validate($('input#location').val());
		var year = $('select#year').val();
		var month = $('select#month').val();
		var day = $('select#day').val();
		var hour = ($('select#ampm').val()=='PM') ? parseInt($('select#hour').val())+12 : $('select#hour').val();
		var min = $('select#min').val();
		var emerg = validate($('input#emerg').val());
		var emerg2 = validate($('input#emerg2').val());
		var email = validate($('input#email').val());
		var password = validate($('input#password').val());
		var meta_url = validate($('input#meta-url').val());
		var meta_name = validate($('input#meta-name').val());
		var meta_phone = validate($('input#meta-phone').val());
		var meta_email = validate($('input#meta-email').val());
		var meta_any = validate($('textarea#meta-any').val());
		var create = {
    	location: location,
    	datetime: new Date(year + "-" + month + "-" + day + " " + hour + ":" + min).toUTCString(),
			notify: {
				email: emerg,
				email2: emerg2
			},
			username: email,
			password: password,
			metadata : {
				url : meta_url,
				name : meta_name,
				phone : meta_phone,
				email : meta_email,
				anything : meta_any
			}
		}   
		alert(JSON.stringify(create))
		$.ajax({
			//username: create.username,
			//password: create.password,
			data: create,
			//url: "http://safehonu.com/post", //TODO: HTTPS
			url: "http://localhost/post", //TODO: HTTPS
			type: "POST",
			contentType: "application/json",
			timeout: 60000,
			dataType: "json",
			success: function(response) {
				// TODO: notification = success
				//if (debug) alert('Success: ' + response);
			},
			error: function(response) {
				// TODO: notification = error
				//if (debug) alert('Error: ' + response);
			}
		});
	});
	function validate(input) {
		return input;
	}
});
