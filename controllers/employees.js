const BaseController = require("./basecontroller"),
  	swagger = require("swagger-node-restify")


class Employees extends BaseController {

  constructor(lib) {
    super();
    this.lib = lib;
  }

  list(req, res, next) {
    this.lib.db.model('Employee').find().exec((err, list) => {
      if(err) return next(this.RESTError('InternalServerError', err))
      this.writeHAL(res, list)
    })
  }

  details(req, res, next) {
    let id = req.params.id  
    if(id) {
      this.lib.db.model('Employee').findOne({_id: id}).exec((err, empl) => {
        if(err) return next(err)
        if(!empl) {
          return next(this.RESTError('ResourceNotFoundError', 'Not found'))
        }
        this.writeHAL(res, empl)
      })
    } else  {
      next(this.RESTError('InvalidArgumentError', 'Invalid id'))
    }
  }

  create(req, res, next) {
    let data = req.body
    if(data) {
      let newEmployee = this.lib.db.model('Employee')(data)
      console.log(newEmployee)
      newEmployee.save((err, emp) => {
        if(err) return next(this.RESTError('InternalServerError', err))
        this.writeHAL(res, emp)
      })
    } else {
      next(this.RESTError('InvalidArgumentError', 'No data received'))
    }
  }

  update(req, res, next) {
    let data = req.body
    let id = req.params.id
    if(id) {
      
      this.lib.db.model("Employee").findOne({_id: id}).exec((err, emp) => {
        if(err) return next(this.RESTError('InternalServerError', err))
        emp = Object.assign(emp, data)
        emp.save((err, employee) => {
          if(err) return next(this.RESTError('InternalServerError', err))
          this.writeHAL(res, employee)
        })
      })
    } else {
      next(this.RESTError('InvalidArgumentError','Invalid id received'))
    }
  }
}

module.exports = function(lib) {
  let controller = new Employees(lib);

  controller.addAction({
  	'path': '/employees',
  	'method': 'GET',
  	'summary': 'Returns the list of employees across all stores',
  	'responseClass': 'Employee',
  	'nickname': 'getEmployees'
  }, controller.list)


  controller.addAction({
  	'path': '/employees/{id}',
  	'method': 'GET',
  	'params': [swagger.pathParam('id','The id of the employee','string')],
  	'summary': 'Returns the data of an employee',
  	'responseClass': 'Employee',
  	'nickname': 'getEmployee'
  }, controller.details)


  controller.addAction({
  	'path': '/employees',
  	'method': 'POST',
  	'params': [swagger.bodyParam('employee', 'The JSON data of the employee', 'string')],
  	'summary': 'Adds a new employee to the list',
  	'responseClass': 'Employee',
  	'nickname': 'newEmployee'
  }, controller.create)

  controller.addAction({
  	'path': '/employees/{id}',
  	'method': 'PUT',
  	'summary': "UPDATES an employee's information",
  	'params': [swagger.pathParam('id','The id of the employee','string'), swagger.bodyParam('employee', 'The new information to update', 'string')],
  	'responseClass': 'Employee',
  	'nickname': 'updateEmployee'
  }, controller.update)

  return controller
}