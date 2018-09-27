const BaseController = require("./basecontroller"),
  swagger = require("swagger-node-restify")



class  BookSales extends BaseController {

  constructor(lib) {
    super();
    this.lib = lib;
  }

  queryAuthors(res, next, criteria, bookIds) {
    if(bookIds) {
      criteria.books = {$in: bookIds}
    }

    this.lib.db.model('Author')
      .find(criteria)
      .exec((err, authors) =>  {
        if(err) return next(this.RESTError('InternalServerError', err))
        this.writeHAL(res, authors)
      })
  }

  list(req, res, next) {
    let criteria = {}
    if(req.params.q) {
      let expr = new RegExp('.*' + req.params.q + '.*', 'i')
      criteria.$or = [
        {name: expr},
        {description: expr}
      ]
    }
    let filterByGenre = false || req.params.genre

    if(filterByGenre) {
      this.lib.logger.debug("Filtering by genre: " + filterByGenre)
      this.lib.db.model('Book')
        .find({genre: filterByGenre})
        .exec((err, books) => {
          if(err) return next(this.RESTError('InternalServerError', err))
          this.queryAuthors(res, next, criteria, _.pluck(books, '_id'))
        })
    } else {
      this.queryAuthors(res, next, criteria)
    }
  }

  details(req, res, next) {
    let id = req.params.id

    if(id) {
      this.lib.db.model('Author')
        .findOne({_id: id})
        .exec((err, author) => {
          if(err) return next(this.RESTError('InternalServerError', err))
          if(!author) {
            return next(this.RESTError('ResourceNotFoundError', 'Author not found'))
          }
          this.writeHAL(res, author)
        })
    } else {
      next(this.RESTError('InvalidArgumentError', 'Missing author id'))
    }
  }

  create(req, res, next) {
    let body = req.body

    if(body) {
      let newAuthor = this.lib.db.model('Author')(body)
      newAuthor.save((err, author) => {
        if(err) return next(this.RESTError('InternalServerError', err))
        this.writeHAL(res, author)
      })
    } else {
      next(this.RESTError('InvalidArgumentError', 'Missing author id'))
    }
  }

  update(req, res, next) {
    let data = req.body
    let id = req.params.id
    if(id) {
      
      this.lib.db.model("Author").findOne({_id: id}).exec((err, author) => {
      if(err) return next(this.RESTError('InternalServerError', err))
          if(!author) return next(this.RESTError('ResourceNotFoundError', 'Author not found'))
          author = Object.assign(author, data)
          author.save((err, data) => {
            if(err) return next(this.RESTError('InternalServerError', err))
            this.writeHAL(res, data)
          })
      })
    } else {
      next(this.RESTError('InvalidArgumentError', 'Invalid id received'))
    }
  }

  authorBooks(req, res, next) {
    let id = req.params.id

    if(id) {
      this.lib.db.model('Author')
        .findOne({_id: id})
        .populate('books')
        .exec((err, author) => {
          if(err) return next(this.RESTError('InternalServerError', err))
          if(!author) {
            return next(this.RESTError('ResourceNotFoundError', 'Author not found'))
          }
          this.writeHAL(res, author.books)
        })
    } else {
      next(this.RESTError('InvalidArgumentError', 'Missing author id'))
    }
  }
}


module.exports = function(lib) {
  let controller = new BookSales(lib)

  //list
  controller.addAction({
  	'path': '/authors',
  	'method': 'GET',
  	'summary' :'Returns the list of authors across all stores',
  	'params': [ swagger.queryParam('genre', 'Filter authors by genre of their books', 'string'),
  				swagger.queryParam('q', 'Search parameter', 'string')],
  	'responseClass': 'Author',
  	'nickname': 'getAuthors'
  }, controller.list)
  //get
  controller.addAction({
  	'path': '/authors/{id}',
  	'summary': 'Returns all the data from one specific author',
  	'method': 'GET',
    'params': [swagger.pathParam('id','The id of the author','string')],
  	'responseClass': 'Author',
  	'nickname': 'getAuthor'
  }, controller.details )

  //post

  controller.addAction({
  	'path': '/authors',
  	'summary': 'Adds a new author to the database',
  	'method': 'POST',
  	'params': [swagger.bodyParam('author', 'JSON representation of the data', 'string')],
  	'responseClass': 'Author',
  	'nickname': 'addAuthor'
  }, controller.create )

  //put

  controller.addAction({
  	'path': '/authors/{id}',
  	'method': 'PUT',
  	'summary': "UPDATES an author's information",
  	'params': [swagger.pathParam('id','The id of the author','string'), 
  				swagger.bodyParam('author', 'The new information to update', 'string')],
  	'responseClass': 'Author',
  	'nickname': 'updateAuthor'
  }, controller.update)

  // /books
  controller.addAction({
  	'path': '/authors/{id}/books',
  	'summary': 'Returns the data from all the books of one specific author',
  	'method': 'GET',
  	'params': [ swagger.pathParam('id', 'The id of the author', 'string')],
  	'responseClass': 'Book',
  	'nickname': 'getAuthorsBooks'
  }, controller.authorBooks )

  return controller
}
