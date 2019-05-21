var express = require("express"),
  AWS = require("aws-sdk");

var Landing = require("../models/landing");
var Clients = require("../models/clients");

var router = express.Router();
var amazon = require("../config/config.json");
var s3 = new AWS.S3(amazon, {
  signatureVersion: "v4"
});

/* GET home page. */
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
      return res.render("main/index", {
        data: data
      });
    });
});

router.post("/", function(req, res, next) {
  console.log("este es mi codigo: ", req.body.client_code);
  req.session.code = req.body.client_code;
  res.redirect("/client_photos?=" + req.body.client_code);
});
module.exports = router;
