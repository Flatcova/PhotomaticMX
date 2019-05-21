var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var favicon = require("serve-favicon");
var bodyParser = require("body-parser");
var morgan = require("morgan");
var mongoose = require("mongoose");
var session = require("express-session");
var flash = require("express-flash");
var MongoStore = require("connect-mongo")(session);
var passport = require("passport");
var lodash = require("lodash");

// Configuracion de las Rutas

var homeRouter = require("./routes/index");
var clientRouter = require("./routes/main/sesion-fotos");
var servicesRouter = require("./routes/main/servicios");
var portfolioRouter = require("./routes/main/portafolio");
var contactRouter = require("./routes/main/contacto");
var aboutRouter = require("./routes/main/about");
var sessionRouter = require("./routes/main/sesion-fotos");

var adminRouter = require("./routes/admin/main");
var forgotPassword = require("./routes/admin/account/forgot");
var resetPassword = require("./routes/admin/account/reset");
var adminOutRouter = require("./routes/admin/account/logout");

var adminHome = require("./routes/admin/home");
var adminLanding = require("./routes/admin/landing/home");
var adminGallery = require("./routes/admin/landing/gallery");
var adminServices = require("./routes/admin/landing/services");

var adminClients = require("./routes/admin/clients/main");
var adminClientPhotos = require("./routes/admin/clients/clientPhotos");

var adminAddRouter = require("./routes/admin/administradores");

// Configuracion de la Base de Datos
var configDB = require("./config/database.js");

var app = express();
var engine = require("ejs-mate");

// configuration ===============================================================
// 'mongodb://localhost/myapp' o configDB.url
mongoose.connect(
  configDB.url,
  err => {
    if (!err) console.log("Se conecto la base de datos exitosamente");
  }
);

app.engine("ejs", engine);
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    resave: true,
    saveUnitialized: true,
    saveUninitialized: true,
    secret: "T^!c4",
    store: new MongoStore({ url: configDB.url, autoReconnect: true })
    // configDB.url
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});

// app.use(items);

app.use(express.static(path.join(__dirname, "public")));

app.use("/", homeRouter);
app.use("/client_photos", clientRouter);
app.use("/services", servicesRouter);
app.use("/portfolio", express.static(__dirname + "/public"), portfolioRouter);
app.use("/contact", contactRouter);
app.use("/about", aboutRouter);
app.use("/session", sessionRouter);

app.use("/admin", express.static(__dirname + "/public"), adminRouter);
app.use("/forgotPassword", forgotPassword);
app.use("/reset", express.static(__dirname + "/public"), resetPassword);
app.use("/logout", adminOutRouter);

app.use("/admin/home", express.static(__dirname + "/public"), adminHome);
app.use("/admin/landing", express.static(__dirname + "/public"), adminLanding);
app.use("/admin/gallery", express.static(__dirname + "/public"), adminGallery);
app.use(
  "/admin/services",
  express.static(__dirname + "/public"),
  adminServices
);

app.use("/admin/clients", express.static(__dirname + "/public"), adminClients);
app.use(
  "/admin/clientPhotos",
  express.static(__dirname + "/public"),
  adminClientPhotos
);

app.use(
  "/admin/administradores",
  express.static(__dirname + "/public"),
  adminAddRouter
);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(err.status);
  res.render("error");
});

module.exports = app;
