
var express = require('express');
var http = require('http');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var api = require('instagram-node').instagram();
api.use({ access_token: 'IGQVJWd3ZARdzFPdE9FdEx4VGM5eXZAPdmFMTnc4S3ItX2U5N0tudnFGY1drem13RC13cWdEUjFLR0lHeVlUekI0V0FxLWZAnT3prd2VmMGhKR3VzaWZAadFlsbWFBaEg3dkpMLURySlBrZA2ZAIYWpPenh0VAZDZD' });
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret:'secret',
  saveUninitialized: true,
  resave: true
}));

// Global vars
app.use(function(req, res, next){
  // Format date
  res.locals.formatDate = function(date){
    var myDate= new Date(date *1000);
    return myDate.toLocaleString();
  }

  // Is user logged in?
  if(req.session.accesstoken && req.session.accesstoken != 'undefined'){
    res.locals.isLoggedIn = true;
  } else {
    res.locals.isLoggedIn = false;
  }

  next();
});
// Index route
app.get('/', function(req, res, next){
  res.render('index', {
    title: 'Welcome'
  });
});


// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// INSTAGRAM STUFF
api.use({
  client_id:'575012907335584',
  client_secret:'3369d0d3a067f4267e827f1451480ca2'
});
 
var redirect_uri = 'https://hardik-demo-app.herokuapp.com/handleauth';

exports.authorize_user = function(req, res) {
  res.redirect(api.get_authorization_url(redirect_uri, { scope: ['likes'], state: 'a state' }));
};
 
exports.handleauth = function(req, res) {
  api.authorize_user(req.query.code, redirect_uri, function(err, result) {
    if (err) {
      console.log(err.body);
      res.send("Didn't work");
    } else {
      console.log('Yay! Access token is ' + result.access_token);
      res.send('You made it!!');
    }
  });
};
 
// This is where you would initially send users to authorize
app.get('/login', exports.authorize_user);
// This is your redirect URI
app.get('/handleauth', exports.handleauth);

  
// Logout route
app.get('/logout', function(req, res, next){
  req.session.accesstoken = false;
  req.session.uid = false;
  res.redirect('/');
});

// Main route
app.get('/main', function(req, res, next){
  api.user(req.session.uid, function(err, result, remaining, limit){
    if(err){
      res.send(err);
    }
    api.user_media_recent(req.session.uid, {}, function(err, medias, pagination, remaining, limit){
      if(err){
        res.send(err);
      }
      res.render('main', {
        title: 'My Instagram',
        user: result,
        medias: medias
      });
    });
  });
});

 
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

module.exports = app;
