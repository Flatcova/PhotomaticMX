var express = require("express"),
  AWS = require("aws-sdk");

var Landing = require("../../models/landing");
var Clients = require("../../models/clients");

var router = express.Router();
var amazon = require("../../config/config.json");
var s3 = new AWS.S3(amazon, {
  signatureVersion: "v4"
});

/* GET home page. */
router.get("/", function(req, res, next) {
  var session = req.session.code;
  console.log("sesion: ", session);
  console.log(req.params.code);
  var params = {
    Bucket: "photomaticmx" /* required */,
    Delimiter: "photos",
    EncodingType: "url",
    Prefix: "clients/" + session + "/",
    Marker: "clients/" + session + "/",
    MaxKeys: 200
  };

  console.log("params: ", params);

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
    Clients.findOne({ codigo_Acceso: session })
      .populate("servicio")
      .lean()
      .exec(function(err, data) {
        console.log("data: ", data);
        return res.render("main/sesiones", {
          fotos: KeysArray,
          data: data
        });
      });
  });
});

module.exports = router;
