var express = require('express');
var router = express.Router();
var amazon = require('../../config/config.json');

var AWS = require('aws-sdk');
var s3 = new AWS.S3(amazon);

var Categorias = require('../../models/categorias');

/* ======================== Principal de Servicios ========================= */

router.get('/', function(req, res, next) {
        if (req.user) {
          return res.render('admin/servicios-menu');
        }else{
          return res.redirect('/');
        }
});

/* ========================= Actualizar Categorias ========================= */

router.get('/categorias', function(req, res, next) {
	Categorias.find({}, function(err, categorias){
	  	if (err) return next(err);
      console.log(categorias);
	  	res.render('admin/servicios/categorias', {
	  		categorias: categorias,
        avisos: req.flash('avisos')
		  });
	  });
});

router.get('/delete', function(req, res) {

});

router.get('/categorias/delete', function(req, res) {
  Categorias.findByIdAndRemove(req.query.id, function(err, doc) {
    if (err) return next(err);
    console.log('Doc of the remove by id',doc);

    var params = {Bucket: 'photomaticmx', Key: 'categorias/'+doc.nombreFoto};
    s3.deleteObject(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      console.log('Info de S3:'+data);
      return res.redirect('/admin/servicios/categorias')
    });
  });
});

router.get('/fotoUpload', function(req, res) {
  var params = {Bucket: 'photomaticmx/categorias', Key: req.query.name, ACL: 'authenticated-read', ContentType: 'binary/octet-stream'};
  s3.getSignedUrl('putObject', params, function (err, url) {
    res.json({url});
  });
});

router.post('/categorias', (req, res) => {
    var newCategoria = new Categorias(req.body);

    return newCategoria.save()
        .then((categoria) => {
          console.log(categoria)
          return res.status(201).json(categoria);
		      // return res.redirect('/admin/servicios/categorias');
        })
        .catch((err) => {
            if(err.code == '11000'){
                console.error(err);
		    	      return res.status(404).json(err);
            }
            return res.status(404).json(err);
        })
});


module.exports = router;
