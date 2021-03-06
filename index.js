var express = require('express');
var ejsLayouts = require('express-ejs-layouts');
var session = require('express-session');
var request = require('request');
var app = express();
var db = require('./models');
var bodyParser = require('body-parser');
var passport = require('passport');
var flash = require('connect-flash');
var strategies = require('./config/strategies');
app.use(express.static(__dirname + '/static'));

app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.use(bodyParser.urlencoded({extended:false}));
app.use(flash());

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
	res.render('index', {alerts: req.flash()});
});

app.get("/profile", function (req, res) {
  if(req.user) {
    db.user.findById(req.user.id, {include: db.event}).then(function(user) {
      res.render('profile', {user: user, alerts: req.flash()}); 
    });
  } else {
    req.flash('danger', 'You must be logged in');
    res.redirect('/');
  }
});

app.get("/search", function (req, res) {
	var zip = req.query.zip
	var topic = req.query.topic
	request('https://api.meetup.com/2/open_events?&sign=true&photo-host=public&sign=true&zip=' + zip + "&topic="+ topic + "&key=" + process.env.MEETUP_KEY, function(err, response, body) {
    if(!err && response.statusCode === 200) {
      var data = JSON.parse(body);
      if(data.results.length > 0) {
        res.render('searchResults', {data: data});
      }else {
        req.flash('danger', "Ain't got none of demz.");
        res.redirect('/profile');
      }
    } else {
      req.flash('danger', 'Error Getting Results');
      res.redirect('/profile');
    }
  });
});


app.post('/login', function(req, res) {
	passport.authenticate('local', function(err, user, info) {
		console.log('authenticated?');
		console.log(user);
	  if (user) {
	    req.login(user, function(err) {
	      if (err) throw err;
	      req.flash('success', 'Logged in');
	      res.redirect('/profile');
	    });
	  } else {
	    req.flash('danger', "Incorrect Password");
	    res.redirect('/');
	  }
	})(req, res);
});

app.get('/logout', function(req,res) {
  req.session.destroy();
  res.redirect('/');
});


app.get("/register", function (req, res) {
	res.render('register', {alerts: req.flash()});
});

app.post("/register", function (req, res) {
  if(req.body.password1 === req.body.password2 && req.body.password1.length > 4 && req.body.email.length > 5) {
    db.user.findOrCreate({
      where: {
        email: req.body.email
      },
      defaults: {
        password: req.body.password1
      }
    }).spread(function(user, created) {
      if (created) {
        req.flash('success', 'User created!');
        res.redirect('/');
      } else {
        req.flash('danger', 'That email already exists');
        res.redirect('/register');
      }
    }).catch(function(err) {
      req.flash('danger', 'Error:', err.message);
      res.redirect('/register');
    });
  } else {
    req.flash('danger', "Enter Valid Email and/or Password");
    res.redirect('/register');
  }
});

app.get("/showDetails/:id", function(req, res) {
  var url = "https://api.meetup.com/2/events?offset=0&format=json&limited_events=False&event_id="+ req.params.id +"&photo-host=public&page=20&fields=&order=time&desc=false&status=upcoming" + "&key=" + process.env.MEETUP_KEY
  request(url, function(err, response, body) {
    var data = JSON.parse(body);
    res.render('showDetails', {data: data.results[0]});
  })
});

app.post("/addToEvents/:id", function(req, res) {
  var url = "https://api.meetup.com/2/events?offset=0&format=json&limited_events=False&event_id="+ req.params.id +"&photo-host=public&page=20&fields=&order=time&desc=false&status=upcoming" + "&key=" + process.env.MEETUP_KEY
  request(url, function(err, response, body) {
    var data = JSON.parse(body);
    db.event.findOrCreate( { 
      where: {
        name: data.results[0].name,
        event_id: data.results[0].id
      }
    }).spread(function(newEvent, wasCreated) {
      db.user.findById(req.user.id).then(function(user) {
        user.addEvent(newEvent).then(function() {
          res.redirect("/profile");
        })  
      })
    })
  })
});

app.post('/delete/:id', function(req, res) {
  db.user.findById(req.user.id).then(function(user) {
    db.event.findOne({ 
      where: {
        event_id: req.params.id
      }
    }).then(function(eventToDelete) {
      user.removeEvent(eventToDelete).then(function(){
        res.redirect('/profile');
      })
    })
  })
});

app.listen(process.env.PORT || 3000);
