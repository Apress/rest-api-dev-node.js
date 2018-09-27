listing 3.1

  console.log("About to read the file")  
  let content = Fs.readFileSync("/path/to/file")  
  console.log("File content: ", content)   

 listing 3.2
   console.log("About to read the file")  
  let content = ""  
  fs.readFile("/path/to/file", (err, data) => {  
     content = data  
  })  
  console.log("File content: ", content)   


  listing 3.3

  console.log("About to read the file")  
  let content = ""  
  fs.readFile("/path/to/file", (err, data) => {  
     content = data  
     console.log("File content: ", content)  
  })   

  listing 3.4
    //functionX symbols are references to individual functions  
  parallel([function1, function2, function3, function4], data => {  
     ///do something with the combined output once they all finished  
  })   


  3.5
function parallel(funcs, callback) {  
   var results = [],  
       callsToCallback = 0  

   funcs.forEach( fn => { // iterate over all functions  
     setTimeout(fn(done), 200) // and call them with a 200 ms delay  
    })  

  function done(data) { // the functions will call this one when they finish and they’ll pass the results here  
     results.push(data)  
     if(++callsToCallback == funcs.length) {  
        callback(results)  
     }  
  }  
}   

3.6
  //request handling code
  //assume "db" is already initialized and provides an interface to the data base  
  db.query("books", {limit:1000, page: 1}, books => {  
    services.bookNews.getThisWeeksNews(news => {  
       services.logging.logRequest(request, () => { //nothing returned, but you need to call it so you know the logging finished  
         response.render({listOfBooks: books, bookNews: news})  
       })  
     })  
  })   

 3.7
   //request handling code...
  parallel([  
    callback => { db.query("books", {limit: 1000, page: 1}, callback) },  
    callback => { services.bookNews.getThisWeeksNews(callback) },  
    callback => { services.logRequest(request, callback) }  
   ], data => {  
       var books = findData("books", data)  
       var news = findData("news", data)  
       response.render({listOfBooks: books, bookNews: news})  
   })   

  3.8

  serial([  
   function1, function2, function3  
  ], data => {  
     //do something with the combined results  
  })   


  3.9
 function1(data1 => {  
    function2(data2 => {  
       function3(data3 => {  
        //do something with all the output  
      }  
    }  
  }   

3.10

function serial(functions, done) {  
  let fn = functions.shift() //get the first function off the list  
  let results = []  
  fn(next)  
  function next(result) {  
      results.push(result) //save the results to be passed into the final callback once you don’t have any more functions to execute.  
      let nextFn = functions.shift()  
      if (nextFn) nextFn(next)  
      else done(results)  
  }  
}   

3.11 -- repensar ejemplo y verificar benchmark sin vatican
//Async handler  
const fs = require("fs")  
class AsyncHdlr {
	constructor(_model) {
		this.model = _model;
	}

	index(req, res, next) {
		fs.readFile(__dirname + "/../file.txt", (err, content) => {
	      res.send({  
	          success: true  
	      })  
	  })  	
	}
}
module.exports = AsyncHdlr;  
 
//Sync handler  
const fs = require("fs")  

class SyncHdlr {

	constructor(_model) {
		this.model = _model;
	}

	index(req, res, next) {
		let content = fs.readFileSync(__dirname + "/../file.txt");
	  res.send({  
	      success: true  
	  });
	}
}

module.exports = SyncHdlr;  

3.12
  const http = require("http")  
  http.createServer((req, res) =>  { //create the server  
//request handler code here  
  });  
  http.listen(3000) //start it up on port 3000   


 3.17 = prototypal inheritance = cambiarlo por clases

 3.19
map([1,2,3,4], x => { return x * 2 }) //will return [2,4,6, 8]  
map(["h","e","l","l","o"], String.prototype.toUpperCase) //will return ["H","E","L","L","O"] 


3.20
function reduce(list, fn, init) {  
	if(list.length == 0) return init  
	let value = list[0]  
	init.push(fn.apply(value, [value])) //this will allow us to get both the functions that receive the value as parameters and the methods that use it from it’s context (like toUpperCase)  
	return reduce(list.slice(1), fn, init) //iterate over the list using it’s tail (everything but the first element)  
}  
function map(list, fn) {  
	return reduce(list, fn, [])  
}    


 == Modules ==

 'use strict';

const Hapi=require('hapi');

// Create a server with a host and port
const server=Hapi.server({
    host:'localhost',
    port:8000
});

// Add the route
server.route({
    method:'GET',
    path:'/hello',
    handler:function(request,h) {
        return'hello world';
    }
});

// Start the server
async function start() {
    try {
        await server.start();
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }
    console.log('Server running at:', server.info.uri);
};

start();



PAG 168
/*
  function libraryMethod(attr1, callback) {  
   asyncCall(attr1, function(response){  
       if(callback) callback(response)  
   })  
  }  
  var returnValue = libraryMethod('hello world')  
 */ 
  function libraryMethod(attr1, callback) {  
   asyncCall(attr1, response => {  
       if(callback) callback(response)  
   })  
  }  
  let returnValue = libraryMethod('hello world')  

  /*
    var myResponseValue = ''  
  asyncCall('hello', function(response) {  
     myResponseValue = response  
  })  
///some other code taking 30ms to execute  
  console.log(myResponseValue)  
  */

  let myResponseValue = ''  
  asyncCall('hello', response => {  
     myResponseValue = response  
  })  
///some other code taking 30ms to execute  
  console.log(myResponseValue)  


  