$(function () {
	// Remove footer
	$("#footer").remove();
	var startingCoordinates = [55, -2];
	var initialZoom = 5;
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

	function displayResults (geolocation) {
		return function (data) {
			var zoom = map.getZoom();
			var newZoom = zoom > searchZoom ? zoom : searchZoom;
			var postcodes = (data.result === null) ? [] : data.result;
			console.log(postcodes);
			map.flyTo(geolocation, newZoom);
			markers.setData(toGeoJson(postcodes));
		}
	}

	function handleError(data) {
		console.log("An error occurred", data);
	}

	function roundCoord(coord) {
		return coord.toString().substring(0,6);
	}

	// Initialise MapBox
	mapboxgl.accessToken = 'pk.eyJ1IjoiY2FibGFuY2hhcmQiLCJhIjoibEF1SEUyNCJ9.jgoC-5g61IQobWff1f7i8A';
	var map, markers;
	var styleUrl = 'https://www.mapbox.com/mapbox-gl-styles/styles/outdoors-v6.json';
	mapboxgl.util.getJSON(styleUrl, function (error, style) {
	  if (error) throw error;

	  style.layers.push({
	    "id": "markers",
	    "type": "symbol",
	    "source": "markers",
	    "layout": {
	      "icon-image": "{marker-symbol}-12",
	      "text-field": "{postcode}",
	      "text-font": "Open Sans Semibold, Arial Unicode MS Bold",
	      "text-offset": [0, 0.6],
	      "text-anchor": "top"
	    },
	    "paint": {
	      "text-size": 12
	    }
	  });

	  map = new mapboxgl.Map({
		  container: 'map',
		  style: style,
		  center: startingCoordinates,
		  zoom: initialZoom // starting zoom
		});

	  markers = new mapboxgl.GeoJSONSource({
	    data: {
	      "type": "FeatureCollection",
	      "features": []
	    }
		});

		map.addSource('markers', markers);

		map.on('hover', function(event) {
	    var geolocation = map.unproject(event.point);
	    $longitude.html(roundCoord(geolocation['lng']));
	    $latitude.html(roundCoord(geolocation['lat']));
		});

		map.on("click", function (event) {
			var geolocation = map.unproject(event.point);
			getPostcodesForLocation(geolocation, displayResults(geolocation), handleError)
		});
	});
});