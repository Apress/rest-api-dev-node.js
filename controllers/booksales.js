const BaseController = require("./basecontroller"),
  swagger = require("swagger-node-restify")



class BookSales extends BaseController {

  constructor(lib) {
    super();
    this.lib = lib;
  }

  list(req, res, next) {

    let criteria = {}
    if(req.params.start_date)
      criteria.date = {$gte: req.params.start_date}
    if(req.params.end_date) 
      criteria.date = {$lte: req.params.end_date}
    if(req.params.store_id)
      criteria.store = req.params.store_id

    this.lib.db.model("Booksale")
      .find(criteria)
      .populate('books')
      .populate('client')
      .populate('employee')
      .populate('store')
      .exec((err, sales) => {
        if(err) return next(this.RESTError('InternalServerError', err))
        this.writeHAL(res, sales)
      })
  }

  create(req, res, next) {
    let body = req.body
    if(body) {
      let newSale = this.lib.db.model("Booksale")(body)
      newSale.save((err, sale) => {
        if(err) return next(ths.RESTError('InternalServerError', err))
        this.writeHAL(res, sale)
      })
    } else {
      next(this.RESTError('InvalidArgumentError', 'Missing json data'))
    }
  }
}


module.exports = function(lib) {
  let controller = new BookSales(lib);

  controller.addAction({
        'path': '/booksales',
        'method': 'GET',
        'summary': 'Returns the list of book sales',
        'params': [ swagger.queryParam('start_date', 'Filter sales done after (or on) this date', 'string'),
                    swagger.queryParam('end_date', 'Filter sales done on or before this date', 'string'),
                    swagger.queryParam('store_id', 'Filter sales done  on this store', 'string')
                  ],
        'responseClass': 'BookSale',
        'nickname': 'getBookSales'
      }, controller.list)

  controller.addAction({
        'path': '/booksales',
        'method': 'POST',
        'params': [ swagger.bodyParam('booksale', 'JSON representation of the new booksale','string') ],
        'summary': 'Records a new booksale',
        'responseClass': 'BookSale',
        'nickname': 'newBookSale'
      }, controller.create)

  return controller
}
