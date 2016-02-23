var express = require('express');
var ejsLayouts = require('express-ejs-layouts');
var request = require('request');
var app = express();
//var db = require('./models'); when db gets created, link in config too
var bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.use(bodyParser.urlencoded({extended:false}));


app.get("/", function (req, res) {
	res.render('index');
});

app.get("/profile", function (req, res) {
	res.render('profile');
});

app.get("/search", function (req, res) {
	res.render('searchResults');
});

app.get("/login", function (req, res) {
	res.render('login');
});

app.listen(3000);
