var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var rsvp = require('rsvp');
var app = express();

const PORT = 8080;


//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'static')));

function makeTemplate(name) {
  if (!name.endsWith('.html')) {
    name = name + '.html';
  }
  return path.join(__dirname, 'templates', name);
}

app.use('/', function (req, res) {
  res.sendFile(makeTemplate('form'));
});

app.post('/submit', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var result = [];
  var name = req.body.name;
  var number = req.body.number;
  var email = req.body.email;
  var food = req.body.food;
  var drink = req.body.drink;
  var others = req.body.others;
  
  console.log("post request really coming through?", req.body);
});


module.exports = app;