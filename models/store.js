const mongoose = require("mongoose"),
	jsonSelect = require("mongoose-json-select"),
	helpers = require("../lib/helpers")	



module.exports = db => {
	let schema = require("../schemas/store.js")
	let modelDef = db.getModelFromSchema(schema)

	modelDef.schema.plugin(jsonSelect, '-employees')
	modelDef.schema.methods.toHAL = function() {
		let halObj = helpers.makeHAL(this.toJSON(), 
						[{name: 'books', href: '/stores/' + this.id + '/books', title: 'Books'},
						 {name: 'employees', href: '/stores/' + this.id + '/employees', title: 'Employees'},
      					 {name: 'booksales', href: '/stores/' + this.id + '/booksales', title: 'Book Sales'}])
		if(this.employees.length > 0) {
			if(this.employees[0].toString().length != 24) {
				halObj.addEmbed('employees', this.employees.map(e => { return e.toHAL() }))
			}
		}
		return halObj
	}

	return mongoose.model(modelDef.name, modelDef.schema);
}