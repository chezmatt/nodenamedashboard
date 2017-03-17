/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var fs = require('fs');
var bodyParser = require('body-parser');

var routes = require('./routes/routes.js');
// var controllers = require('./controllers');

// Create express app
var app = express();

// add monoose stuff
mongoose.connect('mongodb://localhost/intro_to_mongoose');

var UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    favorite_dojo : String
  });

var PersonSchema = new mongoose.Schema({
    fname: String,
    lname: String,
  });

// this creates a user model using the user schema
mongoose.model('User', UserSchema);

mongoose.model('Person', PersonSchema);
// this is a getter
var User = mongoose.model('User');
var Person = mongoose.model('Person');
// results is a promisec
// a promise is like a callback with a back up plan...
// var new_user = new User();
// new_user.name = 'Matt';
// new_user.email = 'mlwilkinson@gmail.com';
// new_user.favorite_dojo = 'Berk';
// new_user.save(function(err, results) {
//     console.log(results);
//
// });





// Use bodyParser to parse form data sent via HTTP POST
app.use(bodyParser.urlencoded({extended: true}));

// use express static
app.use(express.static(path.join(__dirname, './static')));

// Tell server where views are and what templating engine, I'm using
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
// app.set('port', process.env.PORT || 3000);

app.get('/', function(req, res) {
    res.render('index', {people: ''});
  });

app.post('/new', function(req, res) {
    console.log(req.body);
    //res.end(); // the request object is a node object from thr browser http event.
    if (req.body.id) {
      Person.findByIdAndUpdate(
          req.body.id,
          {fname: req.body.fname, lname: req.body.lname},
          function(err, results) {
            if (err) {
              console.warn('error in back end');
              res.end();
            } else {
              res.redirect('/results');
            }
          });
    }else{
      var new_person = new Person(req.body);
      new_person.save(function(err, results) {
        if (err) {
          console.warn('error in back end');
          res.end();
        } else {
          res.redirect('/results');
        }
      });
    }
  });

//
app.get('/results', function(req, res) {
  Person.find({}, function(err, results) {
      if (err) {
        console.warn('error in back end');
        //send error to user up front if db failure
        res.end();
      } else {
        res.render('results', {people: results});
        // console.log(results);
      }
  });
});

app.get('/:id/edit/', function(req, res){
  Person.find({_id: req.params.id}, function(err, response) {
    if (err) { console.log(err); }
    res.render('index', {people: response[0]});
  });
});

app.get('/:id/delete/', function(req, res) {
    console.log(req.params.id);
    Person.findByIdAndRemove(req.params.id, function(err, result) {
        if (err) {console.log('delete error: ' + error);
        }
        console.log(result);// returns the object deleted...
    });
    res.redirect('/results');
});
// The "todo" in this callback function represents the document that was found.
// // It allows you to pass a reference back to the client in case they need a reference for some reason.
// Person.findByIdAndRemove(req.params.todoId, function (err, todo) {
//     // We'll create a simple object to send back with a message and the id of the document that was removed
//     // You can really do this however you want, though.
//     var response = {
//         message: "Todo successfully deleted",
//         id: todo._id
//     };
//     res.send(response);
// });
// //

app.listen(3000, function() {
    console.log('App listening on port 3000.');
  });
