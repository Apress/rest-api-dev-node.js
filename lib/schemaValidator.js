const tv4 = require("tv4"),
	formats = require("tv4-formats"),
	schemas = require("../request_schemas/")


module.exports = {
	validateRequest: validate
}


function validate (req) {
	let res = {valid: true}
	tv4.addFormat(formats)
	let schemaKey = req.route ? req.route.path.toString().replace("/", "") : ''
	let actionKey = req.route.name
	let mySchema = null,
		myData = null;
	if(schemas[schemaKey])	{
		mySchema = schemas[schemaKey][actionKey]
		data = null
		if(mySchema) {
			switch(mySchema.validate) {
				case 'params':
					data = req.params
				break
			}
			res = tv4.validateMultiple(data, mySchema.schema)
		}
	}

	return res
}


