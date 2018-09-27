const BaseController = require("./basecontroller"),
  swagger = require("swagger-node-restify")



class Books extends BaseController {

  constructor(lib) {
    super();
    this.lib = lib;
  }

  /**
  Helper method for the POST action, it takes two lists of items with 
  properties calles "store" and "copies" and returns a signle list, with 
  "store" being a unique key
  */
  mergeStores(list1, list2) {
    let stores1 = {}
    let stores2 = {}

    let storesMap1 = list1.reduce( (theMap, theItem)  => {
      if(theItem.store) theMap[theItem.store] = theItem.copies;
      return theMap;
    }, {})

    let storesMap2 = list2.reduce( (theMap, theItem)  => {
      if(theItem.store) theMap[theItem.store] = theItem.copies;
      return theMap;
    }, {})
    
    let stores = Object.assign(storesMap1, storesMap2)
    return Object.keys().map( (k) => {
      return {store: k, copies: stores[k]}
    })
  }

  list(req, res, next) {
    let criteria = {}
    if(req.params.q) {
      let expr = new RegExp('.*' + req.params.q + '.*')
      criteria.$or = [
        {title: expr},
        {isbn_code: expr},
        {description: expr}
      ]
    }
    if(req.params.genre) {
      criteria.genre = req.params.genre
    }

    this.lib.db.model('Book')
      .find(criteria)
      .populate('stores.store')
      .exec((err, books) => {
        if(err) return next(err)
        this.writeHAL(res, books)
      })
  }

  details(req, res, next) {
    let id = req.params.id
    if(id) {
      this.lib.db.model("Book")
        .findOne({_id: id})
        .populate('authors')
        .populate('stores')
        .populate('reviews')
        .exec((err, book) => {
          if(err) return next(this.RESTError('InternalServerError', err))
          if(!book) {
            return next(this.RESTError('ResourceNotFoundError', 'Book not found'))
          }
          this.writeHAL(res, book)
        })
    } else {
      next(this.RESTError('InvalidArgumentError', 'Missing book id'))
    }
  }

  create(req, res, next) {
    let bookData = req.body 
    if(bookData) {
      let isbn = bookData.isbn_code
      this.lib.db.model("Book")
        .findOne({isbn_code: isbn})
        .exec((err, bookModel) => {
          if(!bookModel) {
            bookModel = this.lib.db.model("Book")(bookData)
          } else {
            bookModel.stores = this.mergeStores(bookModel.stores, bookData.stores) 
          }
          bookModel.save((err, book) => {
              if(err) return next(this.RESTError('InternalServerError', err))
              this.writeHAL(res, book)
            })
        })
      
    } else {
      next(this.RESTError('InvalidArgumentError', 'Missing content of book'))
    }
  }

  bookAuthors(req, res, next) {
    let id = req.params.id
    if(id) {
      this.lib.db.model("Book")
        .findOne({_id: id})
        .populate('authors')
        .exec((err, book) => {
          if(err) return next(this.RESTError('InternalServerError', err))
          if(!book) {
            return next(this.RESTError('ResourceNotFoundError', 'Book not found'))
          }
          thihs.writeHAL(res, book.authors)
        })
    } else {
      next(this.RESTError('InvalidArgumentError', 'Missing book id'))
    }
  }

  bookReviews(req, res,next) {
    let id = req.params.id
    if(id) {
      this.lib.db.model("Book")
        .findOne({_id: id})
        .populate('reviews')
        .exec((err, book) => {
          if(err) return next(this.RESTError('InternalServerError', err))
          if(!book) {
            return next(this.RESTError('ResourceNotFoundError', 'Book not found'))
          }
          this.writeHAL(res, book.reviews)
        })
    } else {
      next(this.RESTError('InvalidArgumentError', 'Missing book id'))
    }
  }

  update(req, res, next) {
    let data = req.body
    let id = req.params.id
    if(id) {
      this.lib.db.model("Book").findOne({_id: id}).exec((err, book) => {
      if(err) return next(this.RESTError('InternalServerError', err))
        if(!book) return next(this.RESTError('ResourceNotFoundError', 'Book not found'))
        book = Object.assign(book, data)
        book.save((err, data) => {
        if(err) return next(this.RESTError('InternalServerError', err))
         this.writeHAL(res, data.toJSON())
        })
      })
    } else {
      next(this.RESTError('InvalidArgumentError', 'Invalid id received'))
    }
  }
}

module.exports = function(lib) {
  let controller = new Books(lib);

  controller.addAction({
        'path': '/books',
        'method': 'GET',
        'summary': 'Returns the list of books',
        "params": [ swagger.queryParam('q', 'Search term', 'string'), swagger.queryParam('genre','Filter by genre', 'string')],
        'responseClass': 'Book',
        'nickname': 'getBooks'
  }, controller.list)

  controller.addAction({
        'path': '/books/{id}',
        'method': 'GET',
        'params': [ swagger.pathParam('id', 'The Id of the book','int') ],
        'summary': 'Returns the full data of a book',
        'responseClass': 'Book',
        'nickname': 'getBook'
      }, controller.details )

  controller.addAction({
        'path': '/books',
        'method': 'POST',
        'params': [ swagger.bodyParam('book', 'JSON representation of the new book','string') ],
        'summary': 'Adds a new book into the collectoin',
        'responseClass': 'Book',
        'nickname': 'newBook'
      }, controller.create)

  controller.addAction({
        'path': '/books/{id}/authors',
        'method': 'GET',
        'params': [ swagger.pathParam('id', 'The Id of the book','int') ],
        'summary': 'Returns the list of authors of one specific book',
        'responseClass': 'Author',
        'nickname': 'getBooksAuthors'
      }, controller.bookAuthors)

  controller.addAction({
        'path': '/books/{id}/reviews',
        'method': 'GET',
        'params': [ swagger.pathParam('id', 'The Id of the book','int') ],
        'summary': 'Returns the list of reviews of one specific book',
        'responseClass': 'BookReview',
        'nickname': 'getBooksReviews'
      }, controller.bookReviews)
  
  controller.addAction({
        'path': '/books/{id}',
        'method': 'PUT',
        'params': [ swagger.pathParam('id', 'The Id of the book to update','string'),
                   swagger.bodyParam('book', 'The data to change on the book', 'string') ],
        'summary': 'Updates the information of one specific book',
        'responseClass': 'Book',
        'nickname': 'updateBook'
      }, controller.update )
  return controller
}
