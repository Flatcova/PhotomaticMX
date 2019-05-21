var express = require("express");
var router = express.Router();

var Clients = require("../../../models/clients");

var moment = require("moment");
var AWS = require("aws-sdk");
var amazon = require("../../../config/config.json");
var s3 = new AWS.S3(amazon, {
  signatureVersion: "v4"
});

router.get("/", function(req, res, next) {
  Clients.find({})
    .populate("servicio")
    .lean()
    .exec(function(err, data) {
      console.log("data: ", data);
      if (req.user) {
        return res.render("admin/clients/photos/main", {
          moment: moment,
          usuario: req.user,
          data: data,
          avisos: req.flash("avisos")
        });
      } else return res.redirect("/");
    });
});

router.get("/photos-:id&:codigo", function(req, res, next) {
  var params = {
    Bucket: "photomaticmx" /* required */,
    Delimiter: "photos",
    EncodingType: "url",
    Prefix: "clients/" + req.params.codigo + "/",
    Marker: "clients/" + req.params.codigo + "/",
    MaxKeys: 200
  };
  s3.listObjects(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    var KeysArray = data.Contents.map(obj => {
      var params = { Bucket: "photomaticmx", Key: obj.Key };
      var url = s3.getSignedUrl("getObject", params);
      var Fotos = {};
      Fotos = { nombre: obj.Key.split("/").pop(), s3_key: obj.Key, url: url };
      return Fotos;
    });
    console.log("data S3: ", KeysArray);
    Clients.findOne({ _id: req.params.id })
      .populate("servicio")
      .lean()
      .exec(function(err, data) {
        console.log("data: ", data);
        if (req.user) {
          return res.render("admin/clients/photos/photos", {
            moment: moment,
            usuario: req.user,
            fotos: KeysArray,
            data: data,
            avisos: req.flash("avisos")
          });
        } else return res.redirect("/");
      });
  });
});

router.get("/photoUrl", function(req, res) {
  var params = {
    Bucket: "photomaticmx/clients/" + req.query.codigo,
    Key: req.query.name,
    ACL: "authenticated-read",
    ContentType: "binary/octet-stream"
  };
  console.log("params", params);
  s3.getSignedUrl("putObject", params, function(err, url) {
    console.log("url generado: ", url);
    res.json({ url });
  });
});

router.get("/deletePhoto", function(req, res) {
  var params = { Bucket: "photomaticmx", Key: req.query.key };
  s3.deleteObject(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    res.redirect("back");
  });
});

module.exports = router;
