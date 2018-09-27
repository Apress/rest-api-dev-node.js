const BaseController = require("./basecontroller"),
  	swagger = require("swagger-node-restify")



class ClientReviews extends BaseController {

  constructor(lib) {
    super();
    this.lib = lib;
  }

  create(req, res, next) {
    let body = req.body
    if(body) {

      let newReview = this.lib.db.model('ClientReview')(body)
      newReview.save((err, rev) => {
        if(err) return next(this.RESTError('InternalServerError', err))
        this.writeHAL(res, rev)
      })
    }
  }
}

module.exports = function(lib) {
  let controller = new ClientReviews(lib);

  controller.addAction({
  	'path': '/clientreviews',
  	'method': 'POST',
  	'summary': 'Adds a new client review to a book',
  	'params': [swagger.bodyParam('review', 'The JSON representation of the review',  'string')],
  	'responseClass': 'ClientReview',
  	'nickname': 'addClientReview'
  }, controller.create)

  return controller
}