const BaseController = require("./basecontroller"),
  	swagger = require("swagger-node-restify")


class Stores extends BaseController {

  constructor(lib) {
    super();
    this.lib = lib;
  }

  list(req, res, next) {
    let criteria = {}
    if(req.params.state) {
      criteria.state = new RegExp(req.params.state,'i')
    }
    this.lib.db.model('Store')
      .find(criteria)
      .exec((err, list) =>  {
        if(err) return next(this.RESTError('InternalServerError', err))
        this.writeHAL(res, list)
    })
  }

  details(req, res, next) {
    let id = req.params.id  
    if(id) {
      this.lib.db.model('Store')
        .findOne({_id: id})
        .populate('employees')
        .exec((err, data) => {
        if(err) return next(this.RESTError('InternalServerError', err))
        if(!data) return next(this.RESTError('ResourceNotFoundError', 'Store not found'))

        this.writeHAL(res, data)
      })
    } else  {
      next(this.RESTError('InvalidArgumentError', 'Invalid id'))
    }  
  }

  storeBooks(req, res, next) {
    let id = req.params.id  
    if(id) { 

      let criteria = {stores: {$elemMatch: {"store": id}}}
      if(req.params.q) {
        let expr = new RegExp('.*' + req.params.q + '.*', 'i')
        criteria.$or = [
          {title: expr},
          {isbn_code: expr},
          {description: expr}
        ]
      }
      if(req.params.genre) {
        criteria.genre = req.params.genre
      }

      //even though this is the stores controller, we deal directly with books here
      this.lib.db.model('Book')
        .find(criteria)
        .populate('authors')
        .exec((err, data) =>  {
          if(err) return next(this.RESTError('InternalServerError', err))
          this.writeHAL(res, data)
        })
    } else  {
      next(this.RESTError('InvalidArgumentError', 'Invalid id'))
    }  
  }

  storeEmployees(req, res, next) {
    let id = req.params.id  
    if(id) { 
      this.lib.db.model('Store')
        .findOne({_id: id})
        .populate('employees')
        .exec((err, data) => {
          if(err) return next(this.RESTError('InternalServerError', err))
          if(!data) {
            return next(this.RESTError('ResourceNotFoundError', 'Store not found'))
          }
          console.log(data)
          this.writeHAL(res, data.employees)
        })
    } else  {
      next(this.RESTError('InvalidArgumentError', 'Invalid id'))
    }  
  }

  storeBooksales(req, res, next) {
    let id = req.params.id  
    if(id) { 
      //even though this is the stores controller, we deal directly with booksales here
      this.lib.db.model('Booksale')
        .find({store: id})
        .populate('client')
        .populate('employee')
        .populate('books')
        .exec((err, data) => {
          if(err) return next(this.RESTError('InternalServerError', err))
          this.writeHAL(res, data)
        })
    } else  {
      next(this.RESTError('InvalidArgumentError', 'Invalid id'))
    }  
  }

  create(req, res, next) {
    let data = req.body
    if(data) {
      let newStore = this.lib.db.model('Store')(data)
      newStore.save((err, store) => {
        if(err) return next(this.RESTError('InternalServerError', err))
        this.writeHAL(res, store)       
      })
    } else {
      next(this.RESTError('InvalidArgumentError', 'No data received'))
    }
  }

  update(req, res, next) {
    let data = req.body
    let id = req.params.id
    if(id) {
      
      this.lib.db.model("Store").findOne({_id: id}).exec((err, store) => {
      if(err) return next(this.RESTError('InternalServerError', err))
        if(!store) return next(this.RESTError('ResourceNotFoundError', 'Store not found'))
        store = Object.assign(store, data)
        store.save((err, data) => {
          if(err) return next(this.RESTError('InternalServerError', err))
          this.writeHAL(res, data);
        })
      })
    } else {
      next(this.RESTError('InvalidArgumentError', 'Invalid id received'))
    }
  }
}

module.exports = lib => {
  let controller = new Stores(lib);

  controller.addAction({
  	'path': '/stores',
  	'method': 'GET',
  	'summary': 'Returns the list of stores ',
    'params': [swagger.queryParam('state', 'Filter the list of stores by state', 'string')],
  	'responseClass': 'Store',
  	'nickname': 'getStores'
  }, controller.list);

  controller.addAction({
  	'path': '/stores/{id}',
  	'method': 'GET',
  	'params': [swagger.pathParam('id','The id of the store','string')],
  	'summary': 'Returns the data of a store',
  	'responseClass': 'Store',
  	'nickname': 'getStore'
  }, controller.details )

  controller.addAction({
    'path': '/stores/{id}/books',
    'method': 'GET',
    'params': [swagger.pathParam('id','The id of the store','string'), 
               swagger.queryParam('q', 'Search parameter for the books', 'string'),
               swagger.queryParam('genre', 'Filter results by genre', 'string')],
    'summary': 'Returns the list of books of a store',
    'responseClass': 'Book',
    'nickname': 'getStoresBooks'
  }, controller.storeBooks) 

  controller.addAction({
    'path': '/stores/{id}/employees',
    'method': 'GET',
    'params': [swagger.pathParam('id','The id of the store','string')],
    'summary': 'Returns the list of employees working on a store',
    'responseClass': 'Employee',
    'nickname': 'getStoresEmployees'
  }, controller.storeEmployees)

  controller.addAction({
    'path': '/stores/{id}/booksales',
    'method': 'GET',
    'params': [swagger.pathParam('id','The id of the store','string')],
    'summary': 'Returns the list of booksales done on a store',
    'responseClass': 'BookSale',
    'nickname': 'getStoresBookSales'
  }, controller.storeBooksales)

  controller.addAction({
  	'path': '/stores',
  	'method': 'POST',
  	'summary': 'Adds a new store to the list',
    'params': [swagger.bodyParam('store', 'The JSON data of the store', 'string')],
  	'responseClass': 'Store',
  	'nickname': 'newStore'
  }, controller.create)

  controller.addAction({
  	'path': '/stores/{id}',
  	'method': 'PUT',
  	'summary': "UPDATES a store's information",
  	'params': [swagger.pathParam('id','The id of the store','string'), swagger.bodyParam('store', 'The new information to update', 'string')],
  	'responseClass': 'Store',
  	'nickname': 'updateStore'
  }, controller.update)

  return controller
}