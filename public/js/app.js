$(function () {
	$(".rest-resource").focus(function () {
		$(this).val("");
	});

	$("pre.code-box").hide();

	$("#single-postcode").click(function (event) {
		event.preventDefault();
		var $result = $("#single-postcode-result").slideUp(),
				postcode = $("#single-postcode-input").val();
		$.get(encodeURI("/postcodes/" + postcode), function (data) {
			$("#single-postcode-result").html(JSON.stringify(data, null, 4)).slideDown();
		});
	});

	$("#random-postcode").click(function (event) {
		event.preventDefault();
		var $result = $("#random-postcode-result").slideUp();
		$.get(encodeURI("/random/postcodes"), function (data) {
			$result.html(JSON.stringify(data, null, 4)).slideDown();
		});
	});

	$("#validate-postcode").click(function (event) {
		event.preventDefault();
		var $result = $("#validate-postcode-result").slideUp(),
				postcode = $("#validate-postcode-input").val();
		$.get(encodeURI("/postcodes/" + postcode + "/validate"), function (data) {
			$result.html(JSON.stringify(data, null, 4)).slideDown();
		});
	});

	$("#autocomplete-postcode").click(function (event) {
		event.preventDefault();
		var $result = $("#autocomplete-postcode-result").slideUp(),
				postcode = $("#autocomplete-postcode-input").val();
		$.get(encodeURI("/postcodes/" + postcode +"/autocomplete"), function (data) {
			$result.html(JSON.stringify(data, null, 4)).slideDown();
		});
	});

	$("#geocode-postcode").click(function (event) {
		event.preventDefault();
		var $result = $("#geocode-postcode-result"),
				lon = $("#lon-input").val(),
				lat = $("#lat-input").val();
		$.get(encodeURI("postcodes/lon/" + lon +"/lat/" + lat), function (data) {
			$result.html(JSON.stringify(data, null, 4)).slideDown();
		});
	});

	$("#query-postcode").click(function (event) {
		event.preventDefault();
		var $result = $("#query-postcode-result"),
				postcode = $("#query-postcode-input").val();
		$.get(encodeURI("/postcodes?q=" + postcode), function (data) {
			$result.html(JSON.stringify(data, null, 4)).slideDown();
		});
	});

  
});
