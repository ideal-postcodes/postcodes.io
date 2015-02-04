$(function () {
	// Remove footer
	$("#footer").remove();
	var startingCoordinates = [55, -2];
	var initialZoom = 6;
	var searchZoom = 13;
	$longitude = $("#longitude").html(startingCoordinates[1]);
	$latitude = $("#latitude").html(startingCoordinates[0]);

	function getPostcodesForLocation(location, success, error) {
		var longitude = location["lng"];
		var latitude = location["lat"];
		$.get("/postcodes", {
			lat: latitude,
			lon: longitude,
			radius: 1000
		})
		.done(success)
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
	}

	function roundCoord(coord) {
		return coord.toString().substring(0,6);
	}

	// Initialise MapBox
	L.mapbox.accessToken = 'pk.eyJ1IjoiY2FibGFuY2hhcmQiLCJhIjoibEF1SEUyNCJ9.jgoC-5g61IQobWff1f7i8A';
	var map = L.mapbox.map('map', 'examples.map-i86nkdio')
		.setView(startingCoordinates, initialZoom);

	var postcodesLayer = L.mapbox.featureLayer().addTo(map);

	var geojson = {
    type: 'FeatureCollection',
    features: []
	};

	postcodesLayer.setGeoJSON(geojson);


	map.on("click", function (event) {
		console.log(event);
		var geolocation = event.latlng;
		// Zoom exactly to each double-clicked point
		var zoom = map.getZoom();
		var newZoom = zoom > searchZoom ? zoom : searchZoom;
    map.setView(event.latlng, newZoom);
		getPostcodesForLocation(geolocation, function (data) {
			console.log(data);
			var postcodes = (data.result === null) ? [] : data.result;
			postcodesLayer.setGeoJSON(toGeoJson(postcodes));
		}, handleError)
	});
});