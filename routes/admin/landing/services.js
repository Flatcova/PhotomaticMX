var express = require("express");
var router = express.Router();

var Service = require("../../../models/services");
var moment = require("moment");

router.get("/", function(req, res, next) {
  Service.find({})
    .lean()
    .exec(function(err, service) {
      var data = service.map(obj => {
        obj.fecha = moment(obj.created_At)
          .locale("es")
          .format("ll");
        return obj;
      });
      if (req.user) {
        return res.render("admin/sites/services/main", {
          usuario: req.user,
          data: data
        });
      } else return res.redirect("/");
    });
});

router.get("/newService", function(req, res, next) {
  if (req.user) {
    return res.render("admin/sites/services/newService", {
      usuario: req.user
    });
  } else {
    return res.redirect("/");
  }
});

router.post("/newService", function(req, res) {
  console.log("estoy dentro");

  console.log(req.body);

  var newService = new Service(req.body);
  newService.createdBy = req.user._id;
  newService.created_At = moment(Date.now()).format();

  console.log("info: ", newService);
  return newService
    .save()
    .then(service => {
      console.log(service);
      return res.redirect("/admin/services");
      // return res.redirect('/admin/servicios/categorias');
    })
    .catch(err => {
      if (err.code == "11000") {
        console.error(err);
        return res.status(404).json(err);
      }
      return res.status(404).json(err);
    });
});

router.get("/edit", function(req, res, next) {
  Service.findOne({ _id: req.query.id })
    .lean()
    .exec(function(err, service) {
      service.fecha = moment(service.created_At)
        .locale("es")
        .format("ll");

      console.log("data", service);
      if (req.user) {
        return res.render("admin/sites/services/editService", {
          usuario: req.user,
          data: service
        });
      } else return res.redirect("/");
    });
});

router.post("/edit", function(req, res, next) {
  Service.findByIdAndUpdate(req.query.id, {
    nombre: req.body.nombre,
    precio: req.body.precio,
    cambios: req.body.cambios,
    ubicaciones: req.body.ubicaciones,
    duracion: req.body.duracion,
    cant_fotos: req.body.cant_fotos,
    info: req.body.info
  })
    .lean()
    .exec(function(err, doc) {
      if (err) return next(err);
      console.log("Doc edited", doc);
      return res.redirect("/admin/services");
    });
});

router.get("/delete", function(req, res) {
  Service.findByIdAndRemove(req.query.id, function(err, doc) {
    if (err) return next(err);
    console.log("Doc of the remove by id", doc);

    res.redirect("back");
  });
});

module.exports = router;
