var express = require('express');
var ejsLayouts = require('express-ejs-layouts');
var session = require('express-session');
var request = require('request');
var app = express();
var db = require('./models');
var bodyParser = require('body-parser');
var passport = require('passport');
var strategies = require('./config/strategies');
app.use(express.static(__dirname + '/static'));

app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.use(bodyParser.urlencoded({extended:false}));

app.use(session({
  secret: 'foobarbazzyyoo',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(strategies.serializeUser);
passport.deserializeUser(strategies.deserializeUser);
passport.use(strategies.localStrategy);


app.get("/", function (req, res) {
	res.render('index');
});

app.get("/profile", function (req, res) {
	res.render('profile');
});

app.get("/search", function (req, res) {
	res.render('searchResults');
});

app.post('/login', function(req, res) {
	passport.authenticate('local', function(err, user, info) {
		console.log('authenticated?');
		console.log(err);
		console.log(user);
	  if (user) {
	    req.login(user, function(err) {
	      if (err) throw err;
	      // req.flash('success', 'Logged in');
	      res.redirect('/profile');
	    });
	  } else {
	    // req.flash('danger', 'Error');
	    res.redirect('/');
	  }
	})(req, res);
});


app.get("/register", function (req, res) {
	res.render('register');
});

app.post("/register", function (req, res) {
  db.user.findOrCreate({
    where: {
      email: req.body.email
    },
    defaults: {
      password: req.body.password1
    }
  }).spread(function(user, created) {
    if (created) {
      // req.flash('success', 'User created!');
      res.redirect('/');
    } else {
      // req.flash('danger', 'That email already exists');
      res.redirect('/register');
    }
  }).catch(function(err) {
    // req.flash('danger', 'Error:', err.message);
    res.redirect('/register');
  });
});

app.listen(3000);
