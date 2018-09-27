const mongoose = require("mongoose"),
	jsonSelect = require('mongoose-json-select'),
	helpers = require("../lib/helpers");



module.exports = db => {
	let schema = require("../schemas/client.js")
	let modelDef = db.getModelFromSchema(schema)

	modelDef.schema.methods.toHAL = function() {
		return helpers.makeHAL(this.toJSON())
	}
	
	return mongoose.model(modelDef.name, modelDef.schema)
}