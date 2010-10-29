$(document).ready(function() {
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
	$('a#emerg').click(function(event) {
		$('a#emerg').replaceWith('Emergency Email (2):<br/><input id="emerg2" type="email"></input>');
	});
	$('a#meta').click(function(event) {
		$('div#meta').show();
		$('div#action').hide();
	});
});
