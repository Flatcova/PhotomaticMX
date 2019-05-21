var express = require("express");
var router = express.Router();
var Categorias = require("../../models/categorias");
var amazon = require("../../config/config.json");
var moment = require("moment");
var AWS = require("aws-sdk");
var s3 = new AWS.S3(amazon);

/* GET home page. */
router.get("/", function(req, res, next) {
  Categorias.find({})
    .lean()
    .exec(function(err, categorias) {
      var fullCategorias = categorias.map(obj => {
        var params = {
          Bucket: "photomaticmx",
          Key: "portfolio/" + obj.img_name
        };
        // console.log(params);
        var url = s3.getSignedUrl("getObject", params);
        obj.link = url;
        return obj;
      });
      res.render("main/portafolio/categorias", {
        categorias: fullCategorias
      });
    });
});

router.get("/gallery", function(req, res, next) {
  var params = {
    Bucket: "photomaticmx" /* required */,
    Delimiter: "photos",
    EncodingType: "url",
    Prefix: "portfolio/" + req.query.cat + "/",
    Marker: "portfolio/" + req.query.cat + "/",
    MaxKeys: 100
  };
  console.log(params);
  s3.listObjects(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    console.log(data);
    var allFotos = data.Contents.map(obj => {
      var params = { Bucket: "photomaticmx", Key: obj.Key };
      var url = s3.getSignedUrl("getObject", params);
      var Fotos = {};
      Fotos = { url: url };
      return Fotos;
    });

    console.log(allFotos);

    res.render("main/portafolio/individuales", {
      titulo: req.query.cat.split("_").join(" "),
      allFotos: allFotos
    });
  });
});

module.exports = router;
