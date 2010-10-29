$(document).ready(function() {
	$('div#map').hide();
	$('div#meta').hide();
	var dd = new Date();
  $('select#year').val(dd.getFullYear());
	var month = dd.getMonth()+1;
  var fmt_month = (month < 10) ? '0' + month : month;
	$('select#month').val(fmt_month);
  $('select#day').val(dd.getDate());
	var hour = dd.getHours();
  var fmt_hour = ((hour % 12) > 1) ? '0' + (hour % 12) : hour;
  $('select#hour').val(fmt_hour);
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
	var hour = dd.getHours();
  var ampm = ((hour % 12) > 1) ? 'PM' : 'AM';
  $('select#ampm').val(ampm);
	// 
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
		var year = validate($('select#year').val());
		var month = validate($('select#month').val());
		var day = validate($('select#day').val());
		var hour = validate($('select#hour').val());
		var min = validate($('select#min').val());
		var ampm= validate($('select#ampm').val());
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
    	location : location,
    	datetime : (year + "-" + month + "-" + day + " " + hour + ":" + min + " " + ampm),
			notify : {
				email : emerg,
				email2 : emerg2
			},
			email : email,
			password : password,
			metadata : {
				url : meta_url,
				name : meta_name,
				phone : meta_phone,
				email : meta_email,
				anything : meta_any
			}
		}   
		alert(JSON.stringify(create))
		//window.location = 'http://safehonu.com/create';
	});
	function validate(input) {
		return input;
	}
});
