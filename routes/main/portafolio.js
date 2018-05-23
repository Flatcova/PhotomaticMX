var express = require('express');
var router = express.Router();
var Categorias = require('../../models/categorias');
var amazon = require('../../config/config.json');

var AWS = require('aws-sdk');
var s3 = new AWS.S3(amazon);


/* GET home page. */
router.get('/', function(req, res, next) {
  Categorias.find({}, function(err, categorias){
    var fullCategorias = categorias.map(obj => {
      var params = {Bucket: 'photomaticmx', Key: 'categorias/'+obj.nombreFoto};
      // console.log(params);
      var url = s3.getSignedUrl('getObject', params);
      var newObj = {};
      newObj={obj, 'link':url};
      return newObj
    });
    res.render('main/portafolio/categorias',{
      categorias: fullCategorias
    });
  });
});

router.get('/:categoria', function(req, res, next){
  res.render('main/portafolio/individuales', {
    titulo: "Maternidad"
  });
});

module.exports = router;
