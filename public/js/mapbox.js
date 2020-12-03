// Add Object.assign polyfill just in case of IE 11
(function () {
  if (typeof Object.assign != "function") {
    Object.assign = function (target, varArgs) {
      // .length of function is 2
      "use strict";
      if (target == null) {
        // TypeError if undefined or null
        throw new TypeError("Cannot convert undefined or null to object");
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) {
          // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    };
  }
})();

$(function () {
  $("#footer").remove();
  var startingCoordinates = [-2.0472, 55.0932];
  var initialZoom = 6;
  var searchZoom = 16;
  $longitude = $("#longitude").html(startingCoordinates[0]);
  $latitude = $("#latitude").html(startingCoordinates[1]);
  $info = $("#info").hide();
  $spinner = $("#spinner");
  $nearestInstruction = $("#instructions");
  $postcodeQuery = $("#postcode_query");
  $postcodeLookup = $("#postcode_lookup");

  function indicateLoading() {
    return $spinner.show();
  }

  function indicateLoaded() {
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
      radius: 1000,
    })
      .done(success)
      .fail(error);
  }

  var simplePostcodeRegex = /^[a-z0-9]{1,4}\s*?\d[a-z]{2}$/i;

  var queryCache = {};

  function queryPostcode(postcode, success, error) {
    var postcode = postcode.replace(/\W/, "");
    if (queryCache[postcode]) {
      return success(queryCache[postcode]);
    }
    return $.get("/postcodes", {
      q: postcode,
    })
      .done(function (data) {
        queryCache[postcode] = data;
        success(data);
      })
      .fail(error);
  }

  function postcodeToFeature(postcode) {
    var result = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [postcode.longitude, postcode.latitude],
      },
      properties: {
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
        distance: postcode.distance,
      },
    };
    result.properties.description = generateTableRow(result.properties);
    return result;
  }

  function toGeoJson(postcodes) {
    return {
      type: "FeatureCollection",
      features: postcodes.map(postcodeToFeature),
    };
  }

  function handleError(data) {
    console.log("An error occurred", data);
    indicateLoaded();
  }

  function roundCoord(coord) {
    return coord.toString().substring(0, 8);
  }

  var markerProperties = {
    postcode: "Postcode",
    parish: "Parish",
    longitude: "Longitude",
    latitude: "Latitude",
    northings: "Northings",
    eastings: "Eastings",
    admin_ward: "Ward",
    admin_district: "District",
    admin_county: "County",
    region: "Region",
    country: "Country",
    parliamentary_constituency: "Constituency",
    european_electoral_region: "European Electoral Region",
    ccg: "Clinical Commissioning Group",
  };

  function generateTableRow(properties) {
    var result = [];
    result.push("<table>");
    for (var prop in markerProperties) {
      if (
        markerProperties.hasOwnProperty(prop) &&
        properties[prop] !== null &&
        properties[prop] !== ""
      ) {
        result.push(
          "<tr><td><strong>" +
            markerProperties[prop] +
            ":</strong></td><td>" +
            properties[prop] +
            "</td></tr>"
        );
      }
    }
    result.push("</table>");
    return result.join("");
  }

  // Initialise MapBox
  var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: startingCoordinates,
    zoom: initialZoom,
    scrollZoom: true,
  });
  // Add map controls
  map.addControl(
    new mapboxgl.NavigationControl({ showCompass: false }),
    "bottom-left"
  );

  map.on("load", addLayer);

  function addLayer() {
    map.loadImage("/images/marker-15.png", function (error, image) {
      if (error) throw error;
      map.addImage("postcodes-marker", image);
      map.addSource("markers", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "points",
        source: "markers",
        type: "symbol",
        layout: {
          "icon-image": "postcodes-marker",
        },
      });

      var popup;

      map.on("mouseenter", "points", function (e) {
        map.getCanvas().style.cursor = "pointer";
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties.description;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        popup = new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(description)
          .addTo(map);
      });

      map.on("mouseleave", "points", function () {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });
    });
  }

  $("#spinner").hide();

  map.on("mousemove", function (event) {
    if (event.lngLat) {
      $longitude.html(roundCoord(event.lngLat.lng));
      $latitude.html(roundCoord(event.lngLat.lat));
    }
  });

  map.on("click", function (event) {
    $nearestInstruction.hide();
    var location = Object.assign({}, event.lngLat);
    // Zoom exactly to each double-clicked point
    var zoom = map.getZoom();
    var newZoom = zoom > searchZoom ? zoom : searchZoom;
    map.setCenter(event.lngLat);
    map.setZoom(newZoom);
    indicateLoading();
    getPostcodesForLocation(
      location,
      function (data) {
        var postcodes = data.result === null ? [] : data.result;
        map.getSource("markers").setData(toGeoJson(postcodes));
        indicateLoaded();
      },
      handleError
    );
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
      queryPostcode(
        postcode,
        function (data) {
          var postcodes = data.result === null ? [] : data.result;
          if (postcodes.length > 0) {
            var totalLat = 0;
            var totalLon = 0;
            for (var i = 0; i < postcodes.length; i++) {
              totalLat += postcodes[i].latitude;
              totalLon += postcodes[i].longitude;
            }
            map.setCenter({
              lat: totalLat / postcodes.length,
              lng: totalLon / postcodes.length,
            });
            map.setZoom(newZoom);
          }
          if (postcodes.length === 0) {
            $postcodeLookup.addClass("has-error");
          }
          map.getSource("markers").setData(toGeoJson(postcodes));
          indicateLoaded();
        },
        handleError
      );
    }, DELAY);
    postcodeQueries.push(timeout);
  });
});
