const restify = require("restify"),
	restifyPlugins = restify.plugins,
	colors = require("colors"),
	lib = require("./lib"),
	swagger = require("swagger-node-restify"),
	config = require("config");

const server = restify.createServer(config.get('server'))

server.use(restifyPlugins.queryParser({
	mapParams: true
}))
server.use(restifyPlugins.bodyParser())

restify.defaultResponseHeaders = data => {
  this.header('Access-Control-Allow-Origin', '*')
}

///Middleware to check for valid api key sent
server.use((req, res, next) => {
	//We move forward if we're dealing with the swagger-ui or a valid key
	if(req.url.indexOf("swagger-ui") != -1 || lib.helpers.validateKey(req.headers.hmacdata || '', req.params.api_key, lib)) {
		next()
	} else {
		res.send(401, { error: true, msg: 'Invalid api key sent'})
	}
})

/**
Validate each request, as long as there is a schema for it
*/
server.use((req, res, next) => {
	let results = lib.schemaValidator.validateRequest(req)
	if(results.valid) {
		return next()
	}
	res.send(400, results)
})

//the swagger-ui is inside the "swagger-ui" folder
server.get(/^\/swagger-ui(\/.*)?/, restifyPlugins.serveStatic({
 	directory: __dirname + '/',
 	default: 'index.html'
 }))


swagger.addModels(lib.schemas)
swagger.setAppHandler(server)
lib.helpers.setupRoutes(server, swagger, lib)

swagger.configureSwaggerPaths("", "/api-docs", "") //we remove the {format} part of the paths, to
swagger.configure('http://localhost:9000', '0.1')


server.listen(config.get('server.port'), () => {
	lib.logger.info("Server started succesfully...")	
	lib.db.connect( err => {
		if(err) lib.logger.error("Error trying to connect to database: ", err)
		else lib.logger.info("Database service successfully started")
	})
})