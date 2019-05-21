var express = require("express");
var router = express.Router();

var Clients = require("../../../models/clients");
var Services = require("../../../models/services");

var moment = require("moment");
var async = require("async");
var crypto = require("crypto");

router.get("/", function(req, res, next) {
  Clients.find({})
    .populate("servicio")
    .lean()
    .exec(function(err, clients) {
      console.log("data: ", clients);
      if (req.user) {
        return res.render("admin/clients/main", {
          moment: moment,
          usuario: req.user,
          data: clients,
          avisos: req.flash("avisos")
        });
      } else return res.redirect("/");
    });
});

router.get("/delete", function(req, res) {
  Clients.findByIdAndRemove(req.query.id, function(err, doc) {
    if (err) return next(err);
    console.log("Doc of the remove by id", doc);
    return res.redirect("back");
  });
});

router.get("/edit", function(req, res, next) {
  Clients.findOne({ _id: req.query.id })
    .lean()
    .exec(function(err, doc) {
      if (err) return next(err);
      console.log("Doc fonud", doc);

      return res.render("admin/clients/editClient", {
        usuario: req.user,
        data: doc
      });
    });
});

router.post("/edit", function(req, res, next) {
  Clients.findByIdAndUpdate(req.query.id, {
    nombre: req.body.nombre,
    apellidos: req.body.apellidos,
    correo: req.body.correo,
    telefono: req.body.telefono
  })
    .lean()
    .exec(function(err, doc) {
      if (err) return next(err);
      console.log("Doc edited", doc);
      return res.redirect("/admin/clients");
    });
});

// New Add for the landing page

router.get("/newClient", function(req, res, next) {
  Services.find({})
    .lean()
    .exec(function(err, data) {
      console.log("data: ", data);
      if (req.user) {
        return res.render("admin/clients/newClient", {
          usuario: req.user,
          data: data,
          avisos: req.flash("avisos")
        });
      } else return res.redirect("/");
    });
});

router.post("/newClient", function(req, res) {
  async.waterfall(
    [
      function(done) {
        crypto.randomBytes(8, function(err, buf) {
          var token = buf.toString("hex");
          console.log("token de cliente", token);
          done(err, token);
        });
      },
      function(token, done) {
        Clients.findOne({ codigo_Acceso: token }, function(err, user) {
          if (user) {
            req.flash("error", "Algo surgio mal, intenta de nuevo");
            return res.redirect("back");
          }

          var newClient = new Clients(req.body);
          newClient.createdBy = req.user._id;
          newClient.created_At = moment(Date.now()).format();
          newClient.codigo_Acceso = token;
          newClient.photos_marker = token + "_" + newClient.created_At;

          console.log("newClient", newClient);
          newClient.save(function(err) {
            done(err, token, user);
          });
        });
      }
    ],
    function(err) {
      if (err) return next(err);
      res.redirect("/admin/clients");
    }
  );
});

module.exports = router;
