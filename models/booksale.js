const mongoose = require("mongoose"),
	jsonSelect = require('mongoose-json-select'),
	helpers = require("../lib/helpers");




module.exports = db => {
	let schema = require("../schemas/booksale.js")
	let modelDef = db.getModelFromSchema(schema)

	modelDef.schema.plugin(jsonSelect, '-store -employee -client -books')
	modelDef.schema.methods.toHAL = function() {
		let halObj = helpers.makeHAL(this.toJSON());

		['books', 'store', 'employee', 'client']
			.filter( prop => {
				if(Array.isArray(this[prop])) return this[prop][0].toString().length != 24;
				return this[prop].toString().length != 24
			})
			.map( prop => { 
				if(Array.isArray(this[prop])) halObj.addEmbed(prop, this[prop].map(p => { return p.toHAL()}))
				else halObj.addEmbed(prop, this[prop].toHAL())
			})

		return halObj
	}

	return mongoose.model(modelDef.name, modelDef.schema)
}