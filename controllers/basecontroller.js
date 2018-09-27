const restify = require("restify"),
	errors = require("restify-errors"),
	halson = require("halson"),
	logger = require("../lib/logger")


class BaseController {
	constructor() {
		this.actions = []
		this.server = null
	}

	setUpActions(app ,sw) {
		this.server = app
		this.actions.forEach(act => {
			let method = act['spec']['method']
			logger.info(`Setting up auto-doc for (${method} ) - ${act['spec']['nickname']}`)
			sw['add' + method](act)
			app[method.toLowerCase()](act['spec']['path'], act['action'])
		})
	}


	addAction(spec, fn) {
		let newAct = {
			'spec': spec,
			action: fn.bind(this)
		}
		this.actions.push(newAct)
	}


	RESTError(type, msg) {
		logger.error("Error of type " + type + " found: " + msg.toString());
		if(errors[type]) {
			return new errors[type](msg.toString())
		} else {
			return {
				error: true, 
				type: type,
				msg: msg
			}
		}
	}


	writeHAL(res, obj) {
		if(Array.isArray(obj)) {
			let newArr = obj.map( item => {
				return item.toHAL();
			})
	        obj = halson(newArr) 
		} else {
			if(obj && obj.toHAL) {
				obj = obj.toHAL()
			}
		}
		if(!obj) {
			obj = {}
		}
	  	res.json(obj) 
	}


}

module.exports = BaseController