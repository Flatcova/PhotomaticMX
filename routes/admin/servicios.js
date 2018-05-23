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

/* ========================= Actualizar Fotos en categorias ========================= */

router.get('/fotos-categorias', function(req, res, next) {
  Categorias.find({}, function(err, categorias){
    var fullCategorias = categorias.map(obj => {
      var params = {Bucket: 'photomaticmx', Key: 'categorias/'+obj.nombreFoto};
      // console.log(params);
      var url = s3.getSignedUrl('getObject', params);
      var newObj = {};
      newObj={obj, 'link':url};
      return newObj
    });
    if (req.user) {
      return res.render('admin/servicios/cate-select',{
        categorias: fullCategorias
      });
    }
    else return res.redirect('/');
  });
});

router.get('/fotos', function(req, res, next) {
  var params = {
    Bucket: 'photomaticmx', /* required */
    Delimiter: 'photos',
    EncodingType: 'url',
    Prefix: 'categorias/'+req.query.categoria,
    Marker: 'categorias/'+req.query.categoria,
    MaxKeys: 100,
  };
  s3.listObjects(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred

    var KeysArray = data.Contents.map(obj => {
      var params = {Bucket: 'photomaticmx', Key: obj.Key};
      var url = s3.getSignedUrl('getObject', params);
      var Fotos = {};
      Fotos={'nombre':obj.Key, 'url':url};
      return Fotos
    });
    console.log(KeysArray);
      if (req.user) {
        return res.render('admin/servicios/cate-pics', {
          fotos : KeysArray
        });
      }else{
        return res.redirect('/');
      }
  });
});

router.get('/delete', function(req, res) {
  var params = {Bucket: 'photomaticmx', Key: req.query.key};
  s3.deleteObject(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    res.redirect('back');
  });
});

router.get('/portfolio', function(req, res) {
  var params = {Bucket: 'photomaticmx/categorias/'+req.query.categoria, Key: req.query.name, ACL: 'authenticated-read', ContentType: 'binary/octet-stream'};
  s3.getSignedUrl('putObject', params, function (err, url) {
    res.json({url});
  });
});

/* ========================= Actualizar Categorias ========================= */

router.get('/categorias', function(req, res, next) {
	Categorias.find({}, function(err, categorias){
	  	if (err) return next(err);
	  	res.render('admin/servicios/categorias', {
	  		categorias: categorias,
        avisos: req.flash('avisos')
		  });
	  });
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
          console.log(categoria);
          return res.status(201).json(categoria)
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
