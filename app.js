var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var session = require('express-session');
var flash = require('express-flash');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var lodash = require('lodash');

// Configuracion de las Rutas

var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');

// Configuracion de la Base de Datos
var configDB = require('./config/database.js')

var app = express();
var engine = require('ejs-mate');

// configuration ===============================================================
// 'mongodb://localhost/myapp' o configDB.url
mongoose.connect(configDB.url, function(err){
  if (!err)
    console.log('Se conecto la base de datos exitosamente');
}); // connect to our database

app.engine('ejs', engine);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUnitialized: true,
  saveUninitialized: true,
  secret: "T^!c4",
  store: new MongoStore({url: configDB.url, autoReconnect:true})
  // configDB.url
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next){
  res.locals.user = req.user;
  next();
});

// app.use(items);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(err.status);
  res.render('error');
});

module.exports = app;