var express = require("express");
var router = express.Router();

var Service = require("../../models/services");

/* GET home page. */
router.get("/", function(req, res, next) {
  Service.find({})
    .lean()
    .exec(function(err, service) {
      res.render("main/servicios/paquetes", {
        usuario: req.user,
        data: service
      });
    });
});

module.exports = router;
