var express = require("express");
var router = express.Router();

var Landing = require("../../../models/landing");

var moment = require("moment");
var AWS = require("aws-sdk");
var amazon = require("../../../config/config.json");
var s3 = new AWS.S3(amazon, {
  signatureVersion: "v4"
});

router.get("/", function(req, res, next) {
  Landing.find({})
    .lean()
    .exec(function(err, landing) {
      var data = landing.map(obj => {
        var params = {
          Bucket: "photomaticmx",
          Key: "landing/" + obj.img_URL
        };
        // console.log(params);
        var url = s3.getSignedUrl("getObject", params);
        obj.link = url;
        return obj;
      });
      console.log("data: ", data);
      if (req.user) {
        return res.render("admin/sites/principal/landing", {
          usuario: req.user,
          data: data,
          avisos: req.flash("avisos")
        });
      } else return res.redirect("/");
    });
});

router.get("/delete", function(req, res) {
  Landing.findByIdAndRemove(req.query.id, function(err, doc) {
    if (err) return next(err);
    console.log("Doc of the remove by id", doc);

    var params = {
      Bucket: "photomaticmx",
      Key: "landing/" + doc.img_URL
    };
    s3.deleteObject(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      console.log("Info de S3:" + data);
      return res.redirect("back");
    });
  });
});

router.get("/edit", function(req, res, next) {
  Landing.findOne({ _id: req.query.id })
    .lean()
    .exec(function(err, doc) {
      if (err) return next(err);
      console.log("Doc fonud", doc);

      var params = {
        Bucket: "photomaticmx",
        Key: "landing/" + doc.img_URL
      };
      var url = s3.getSignedUrl("getObject", params);
      doc.link = url;

      return res.render("admin/sites/principal/editAdd", {
        usuario: req.user,
        data: doc
      });
    });
});

router.post("/edit", function(req, res, next) {
  Landing.findByIdAndUpdate(req.query.id, {
    titulo: req.body.titulo,
    descripcion: req.body.descripcion
  })
    .lean()
    .exec(function(err, doc) {
      if (err) return next(err);
      console.log("Doc edited", doc);
      return res.redirect("/admin/landing");
    });
});

// New Add for the landing page

router.get("/newAdd", function(req, res, next) {
  if (req.user) {
    return res.render("admin/sites/principal/newAdd", {
      usuario: req.user
    });
  } else {
    return res.redirect("/");
  }
});

router.get("/newAdd/Url", function(req, res) {
  var params = {
    Bucket: "photomaticmx/landing",
    Key: req.query.name,
    ACL: "authenticated-read",
    ContentType: "binary/octet-stream"
  };
  s3.getSignedUrl("putObject", params, function(err, url) {
    res.json({ url });
  });
});

router.post("/newAdd", function(req, res) {
  var newLanding = new Landing(req.body);
  newLanding.createdBy = req.user._id;
  newLanding.created_At = moment(Date.now()).format();

  return newLanding
    .save()
    .then(landing => {
      console.log(landing);
      return res.redirect("back");
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

// Edit Add

// end-newAdd

module.exports = router;
