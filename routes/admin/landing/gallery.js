var express = require("express");
var router = express.Router();

var Categorias = require("../../../models/categorias");

var moment = require("moment");
var AWS = require("aws-sdk");
var amazon = require("../../../config/config.json");
var s3 = new AWS.S3(amazon, {
  signatureVersion: "v4"
});

router.get("/", function(req, res, next) {
  if (req.user) {
    return res.render("admin/sites/gallery/main", {
      usuario: req.user
    });
  } else return res.redirect("/");
});

//-----------------------// PORTFOLIO SECTION //------------------------//

router.get("/portfolio", function(req, res, next) {
  Categorias.find({})
    .lean()
    .exec(function(err, categorias) {
      var data = categorias.map(obj => {
        if (!obj.img_name) {
          obj.img_URL = undefined;
          return obj;
        }
        var params = {
          Bucket: "photomaticmx",
          Key: "portfolio/" + obj.img_name
        };
        // console.log(params);
        var url = s3.getSignedUrl("getObject", params);
        obj.img_URL = url;
        return obj;
      });
      console.log("data being send: ", data);

      if (req.user) {
        return res.render("admin/sites/gallery/portfolio/portfolio", {
          usuario: req.user,
          data: data
        });
      } else return res.redirect("/");
    });
});
//-/\/\/\/\/\/\/\/\/\/\/\/\/\-// ADD PORTFOLIO \\-/\/\/\/\/\/\/\/\/\/\/\/\/\/-\\

router.get("/newPortfolio", function(req, res, next) {
  if (req.user) {
    return res.render("admin/sites/gallery/portfolio/newPortfolio", {
      usuario: req.user
    });
  } else {
    return res.redirect("/");
  }
});

router.get("/newPortfolio/Url", function(req, res) {
  var params = {
    Bucket: "photomaticmx/portfolio",
    Key: req.query.name,
    ACL: "authenticated-read",
    ContentType: "binary/octet-stream"
  };
  s3.getSignedUrl("putObject", params, function(err, url) {
    res.json({ url });
  });
});

router.post("/newPortfolio", function(req, res) {
  var newCategoria = new Categorias(req.body);
  newCategoria.createdBy = req.user._id;
  newCategoria.created_At = moment().format();

  return newCategoria
    .save()
    .then(categoria => {
      console.log(categoria);
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

//-/\/\/\/\/\/\/\/\/\/\/\/\/\-// EDIT PORTFOLIO \\-/\/\/\/\/\/\/\/\/\/\/\/\/\-\\

router.get("/portfolioEdit", function(req, res, next) {
  Categorias.findOne({ _id: req.query.id })
    .lean()
    .exec(function(err, doc) {
      if (err) return next(err);
      console.log("Doc fonud", doc);

      var params = {
        Bucket: "photomaticmx",
        Key: "portfolio/" + doc.img_name
      };
      var url = s3.getSignedUrl("getObject", params);
      doc.link = url;

      return res.render("admin/sites/gallery/portfolio/editPortfolio", {
        usuario: req.user,
        data: doc
      });
    });
});

router.post("/portfolioEdit", function(req, res, next) {
  Categorias.findByIdAndUpdate(req.query.id, {
    descripcion: req.body.descripcion
  })
    .lean()
    .exec(function(err, doc) {
      if (err) return next(err);
      console.log("Doc edited", doc);
      return res.redirect("/admin/gallery/portfolio");
    });
});

//-/\/\/\/\/\/\/\/\/\/\/\/\-// DELITE PORTFOLIO \\-/\/\/\/\/\/\/\/\/\/\/\/\/\-\\

router.get("/portfolioDelete", function(req, res) {
  Categorias.findByIdAndRemove(req.query.id, function(err, doc) {
    if (err) return next(err);
    console.log("Doc of the remove by id", doc);

    var params = {
      Bucket: "photomaticmx",
      Key: "portfolio/" + doc.img_name
    };
    s3.deleteObject(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      console.log("Info de S3:" + data);
      return res.redirect("back");
    });
  });
});

//-----------------------// END PORTFOLIO SECTION //------------------------//

//-----------------------// PORTFOLIO PHOTOS SECTION //------------------------//

router.get("/photos", function(req, res, next) {
  Categorias.find({})
    .lean()
    .exec(function(err, categorias) {
      var data = categorias.map(obj => {
        if (!obj.img_name) {
          obj.img_URL = undefined;
          return obj;
        }
        var params = {
          Bucket: "photomaticmx",
          Key: "portfolio/" + obj.img_name
        };
        // console.log(params);
        var url = s3.getSignedUrl("getObject", params);
        obj.img_URL = url;
        return obj;
      });
      console.log("data being send: ", data);

      if (req.user) {
        return res.render("admin/sites/gallery/gallery/main", {
          usuario: req.user,
          data: data
        });
      } else return res.redirect("/");
    });
});
//-/\/\/\/\/\/\/\/\/\/\/\/\/\-// ADD PHOTOS \\-/\/\/\/\/\/\/\/\/\/\/\/\/\/-\\

router.get("/photos-:category", function(req, res, next) {
  var params = {
    Bucket: "photomaticmx" /* required */,
    Delimiter: "photos",
    EncodingType: "url",
    Prefix: "portfolio/" + req.params.category + "/",
    Marker: "portfolio/" + req.params.category + "/",
    MaxKeys: 100
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
    console.log(KeysArray);
    if (req.user) {
      return res.render("admin/sites/gallery/gallery/photos.ejs", {
        usuario: req.user,
        fotos: KeysArray
      });
    } else {
      return res.redirect("/");
    }
  });
});

router.get("/photoUrl", function(req, res) {
  var params = {
    Bucket: "photomaticmx/portfolio/" + req.query.category,
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

//-/\/\/\/\/\/\/\/\/\/\/\/\-// DELITE PHOTOS \\-/\/\/\/\/\/\/\/\/\/\/\/\/\-\\

router.get("/deletePhoto", function(req, res) {
  var params = { Bucket: "photomaticmx", Key: req.query.key };
  s3.deleteObject(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    res.redirect("back");
  });
});

//-----------------------// END PORTFOLIO PHOTOS SECTION //------------------------//

module.exports = router;
