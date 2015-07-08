$(function () {
	$("#footer").remove();
	var startingCoordinates = [55.0932, -2.0472];
	var initialZoom = 6;
	var searchZoom = 16;
	$longitude = $("#longitude").html(startingCoordinates[1]);
	$latitude = $("#latitude").html(startingCoordinates[0]);
	$info = $("#info").hide();
	$spinner = $("#spinner");
	$nearestInstruction = $("#instructions");
	$postcodeQuery = $("#postcode_query");
	$postcodeLookup = $("#postcode_lookup");

	function indicateLoading () {
		return $spinner.show();
	}

	function indicateLoaded () {
		setTimeout(function () {
			return $spinner.hide();
		}, 500);
	}

	function getPostcodesForLocation(location, success, error) {
		var longitude = location["lng"];
		var latitude = location["lat"];
		return $.get("/postcodes", {
			lat: latitude,
			lon: longitude,
			radius: 1000
		})
		.done(success)
		.fail(error);
	}

	var simplePostcodeRegex = /(^[A-Z]{1,2}[0-9R][0-9A-Z]?[\s]?[0-9][ABD-HJLNP-UW-Z]{2}$)/i;

	var queryCache = {};

	function queryPostcode (postcode, success, error) {
		var postcode = postcode.replace(/\W/, "");
		if (queryCache[postcode]) {
			return success(queryCache[postcode]);
		}
		return $.get("/postcodes", {
				q: postcode
			})
			.done(function (data) {
				queryCache[postcode] = data;
				success(data);
			})
			.fail(error);
	}

	function postcodeToFeature(postcode) {
		return {
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates: [postcode.longitude, postcode.latitude]
			},
			properties: {
        "marker-symbol": "monument",
				postcode: postcode.postcode,
				quality: postcode.quality,
				eastings: postcode.eastings,
				northings: postcode.northings,
				country: postcode.country,
				nhs_ha: postcode.nhs_ha,
				admin_county: postcode.admin_county,
				admin_district: postcode.admin_district,
				admin_ward: postcode.admin_ward,
				longitude: postcode.longitude,
				latitude: postcode.latitude,
				parliamentary_constituency: postcode.parliamentary_constituency,
				european_electoral_region: postcode.european_electoral_region,
				primary_care_trust: postcode.primary_care_trust,
				region: postcode.region,
				parish: postcode.parish,
				ccg: postcode.ccg,
				distance: postcode.distance
			}
		};
	}

	function toGeoJson(postcodes) {
		// var output = 
		return {
			type: "FeatureCollection",
			features: postcodes.map(postcodeToFeature)
		}
	}

	function handleError(data) {
		console.log("An error occurred", data);
		indicateLoaded();
	}

	function roundCoord(coord) {
		return coord.toString().substring(0,8);
	}

	var markerProperties = {
		"postcode": "Postcode",
		"parish": "Parish",
		"longitude": "Longitude",
		"latitude": "Latitude",
		"northings": "Northings",
		"eastings": "Eastings",
		"admin_ward": "Ward",
		"admin_district": "District",
		"admin_county": "County",
		"region": "Region",
		"country": "Country",
		"parliamentary_constituency": "Constituency",
		"european_electoral_region": "European Electoral Region",
		"ccg": "Clinical Commissioning Group"
	};

	function generateTableRow(properties) {
		var result = [];
		for (var prop in markerProperties) {
			if (markerProperties.hasOwnProperty(prop) &&
											properties[prop] !== null && 
											properties[prop] !== "") {	
				result.push("<tr><td>" + markerProperties[prop] + "</td><td>" + properties[prop] + "</td></tr>");
			}
		}
		return result.join("");
	}

	function rebindTooltips(layers) {
		var layerDetails = {};
		layers.eachLayer(function (layer) {
			var properties = layer.feature.properties;
			layerDetails[properties["postcode"]] = generateTableRow(properties);
		});

		layers.on('mouseover', function(event) {
			var postcode = event.layer.feature.properties["postcode"];
			$info.html(layerDetails[postcode]).show();
		});
		layers.on('mouseout', function() {
			$info.html("").hide();
		});
	}

	// Initialise MapBox
	var map = L.mapbox.map('map', 'examples.map-i86nkdio', {
			zoomControl: false
		})
		.setView(startingCoordinates, initialZoom);

	new L.Control.Zoom({ position: 'bottomleft' }).addTo(map);

	var postcodesLayer = L.mapbox.featureLayer().addTo(map);

	var geojson = {
    type: 'FeatureCollection',
    features: []
	};

	postcodesLayer.setGeoJSON(geojson);

	$("#spinner").hide();

	map.on("mousemove", function (event) {
		$longitude.html(roundCoord(event.latlng["lng"]));
		$latitude.html(roundCoord(event.latlng["lat"]));
	});

	map.on("click", function (event) {
		$nearestInstruction.hide();
		var geolocation = event.latlng;
		// Zoom exactly to each double-clicked point
		var zoom = map.getZoom();
		var newZoom = zoom > searchZoom ? zoom : searchZoom;
    map.setView(event.latlng, newZoom);
    indicateLoading();
		getPostcodesForLocation(geolocation, function (data) {
			var postcodes = (data.result === null) ? [] : data.result;
			postcodesLayer.setGeoJSON(toGeoJson(postcodes));
			rebindTooltips(postcodesLayer);
			indicateLoaded();
		}, handleError)
	});

	var postcodeQueries = [];
	var DELAY = 200; // 200 ms

	$postcodeQuery.keyup(function (event) {
		// Clear request queues
		$postcodeLookup.removeClass("has-error");

		if (postcodeQueries.length > 0) {
			postcodeQueries.forEach(function (timeout) {
				clearTimeout(timeout);
			});
			postcodeQueries = [];
		}

		// Cancel request if query is too small
		var postcode = $postcodeQuery.val();
		if (postcode.length < 2) {
			return;
		} 

		var timeout = setTimeout(function () {
			var zoom = map.getZoom();
			var newZoom = zoom > searchZoom ? zoom : searchZoom;
			indicateLoading();
			queryPostcode(postcode, function (data) {
				var postcodes = (data.result === null) ? [] : data.result;
				if (postcodes.length > 0) {
					var totalLat = 0; 
					var totalLon = 0;
					for (var i = 0; i < postcodes.length; i++) {
						totalLat += postcodes[i].latitude;
						totalLon += postcodes[i].longitude;
					}
					map.setView({
						lat: totalLat / postcodes.length,
						lng: totalLon / postcodes.length
					}, newZoom);
				}
				if (postcodes.length === 0) {
					$postcodeLookup.addClass("has-error");
				}
				postcodesLayer.setGeoJSON(toGeoJson(postcodes));
				rebindTooltips(postcodesLayer);
				indicateLoaded();
			}, handleError)
		}, DELAY);
		postcodeQueries.push(timeout);
	});
});
