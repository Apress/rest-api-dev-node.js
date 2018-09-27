const mongoose = require("mongoose"),
	jsonSelect = require('mongoose-json-select'),
	helpers = require("../lib/helpers");




module.exports = db => {
	let schema = require("../schemas/employee.js")
	let modelDef = db.getModelFromSchema(schema)


	modelDef.schema.methods.toHAL = function() {
		let json = JSON.stringify(this) //toJSON()
		return helpers.makeHAL(json);
	}
	
	return mongoose.model(modelDef.name, modelDef.schema)
}