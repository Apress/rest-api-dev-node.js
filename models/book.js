const mongoose = require("mongoose"),
	jsonSelect = require('mongoose-json-select'),
	helpers = require("../lib/helpers")



module.exports = function(db) {
	let schema = require("../schemas/book.js")
	let modelDef = db.getModelFromSchema(schema)


	modelDef.schema.plugin(jsonSelect, '-stores -authors')
	modelDef.schema.methods.toHAL = function() {
		let halObj = helpers.makeHAL(this.toJSON(), 
						[{name: 'reviews', href: '/books/' + this.id + '/reviews', title: 'Reviews'}])

		if(this.stores.length > 0) {
			if(this.stores[0].store.toString().length != 24) {
				halObj.addEmbed('stores', this.stores.map(s => { return { store: s.store.toHAL(), copies: s.copies } } ))
			}
		} 	

		if(this.authors.length > 0) {
			if(this.authors[0].toString().length != 24) {
				halObj.addEmbed('authors', this.authors)
			}
		}

		return halObj
	}

	return mongoose.model(modelDef.name, modelDef.schema)
}