var logger = require("commonlog-bunyan"),
		Pc = require("postcode"),
		Postcode = require("../models/postcode");

exports.show = function (request, response) {
	var postcode = new Pc(request.params.postcode);

	if (!postcode.valid()) {
		return response.jsonp(404, {
			status: 404,
			error: "Postcode not found"
		});
	}
	
	Postcode.find(postcode.normalise(), function (error, address) {
		if (address) {
			response.json(200, {
				status: 200,
				result: Postcode.toJson(address)
			});		
		} else {
			response.jsonp(404, {
				status: 404,
				error: "Postcode not found"
			});		
		}
	});
	
}

exports.valid = function (request, response) {
	var postcode = new Pc(request.params.postcode);

	if (!postcode.valid()) {
		return response.jsonp(200, {
			status: 200,
			result: false
		});
	}
	
	Postcode.find(postcode.normalise(), function (error, address) {
		if (address) {
			response.json(200, {
				status: 200,
				result: true
			});		
		} else {
			response.jsonp(200, {
				status: 200,
				result: false
			});		
		}
	});	
}