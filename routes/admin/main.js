var express = require('express');
var router = express.Router();
var passport = require('passport');
var passportConf = require('../../config/passport/Strategies/LocalStrategy');
var amazon = require('../../config/config.json')

var AWS = require('aws-sdk');
var s3 = new AWS.S3(amazon);

var User = require('../../models/user');
var Categorias = require('../../models/categorias');


/* ====================== Inicio de sesion ================================= */
router.get('/', function(req, res, next) {
  	if (req.user) {
		return res.redirect('/admin/home');
	}else{
  		res.render('admin/login', {
  		errors: req.flash('errors')
  		});
  	}
});
router.post('/', passport.authenticate('local-login', {
	successRedirect: '/admin/home',
	failureRedirect: '/admin',
	failureFlash: true
}));

/* ========================= Cerrar Sesion ================================= */

router.get('/home/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

/* ======================== Principal de Servicios ========================= */

// router.get('/servicios', function(req, res, next) {
//   if (req.user) {
//     return res.render('admin/servicios-menu');
//   }else{
//     return res.redirect('/');
//   }
// });
router.get('/servicios', function(req, res, next) {
  // var params = {Bucket: 'photomaticmx', Key: 'carrousel-imgs'};
  //   var url = s3.getSignedUrl('getObject', params);
  //   res.json({url});
  //   console.log('The URL is', url);

    var params = {
      Bucket: 'photomaticmx', /* required */
      Delimiter: 'photos',
      EncodingType: 'url',
      Prefix: 'carrousel-imgs/',
      Marker: 'carrousel-imgs/',
      MaxKeys: 10,
    };
    s3.listObjects(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);          // successful response

      var params = {Bucket: 'photomaticmx', Key: data.Contents[5].Key};
        var url = s3.getSignedUrl('getObject', params);
        console.log('The URL is', url);
        if (req.user) {
          return res.render('admin/servicios-menu', {
            img : url
          });
        }else{
          return res.redirect('/');
        }
    });
});

/* ========================= Actualizar Categorias ========================= */

router.get('/servicios/categorias', function(req, res, next) {
	Categorias.find({}, function(err, categorias){
	  	if (err) return next(err);
	  	res.render('admin/servicios/categorias', {
	  		categorias: categorias,
        avisos: req.flash('avisos')
		  });
	  });
});

router.post('/servicios/categorias', (req, res) => {
    var newCategoria = new Categorias(req.body);

    return newCategoria.save()
        .then((categoria) => {
		      return res.redirect('/admin/servicios/categorias');
        })
        .catch((err) => {
            if(err.code == '11000'){
		    	      return res.redirect('/admin/servicios/categorias');
            }
            return res.redirect('/admin/servicios/categorias');
        })
});

/* ====================== Agregar Administradores ========================== */

router.get('/administradores', function(req, res, next) {
  if (!req.user) {
    return res.redirect('/');
  }else{
    res.render('admin/add-admin', {
      errors: req.flash('errors')
    });
  }
});

router.post('/administradores', function(req, res, next){
  var newUser = new User();

			// set the user's local credentials
			newUser.profile.local.name = req.body.name;
			newUser.profile.local.email    = req.body.email;
			newUser.profile.local.password = newUser.generateHash(req.body.password);

			User.findOne({ 'profile.local.email' : req.body.email }, function(err, existingUser){
				if (existingUser) {
					req.flash('errors', 'El correo ya ha sido utilizado, intenta otro diferente.');
					return res.redirect('/admin/home/new-admin');
				}else{
					// save the user
					newUser.save(function(err, user) {
				    	if (err) next(err);
              return res.redirect('/admin/home');
					});
				}
			});
});
/* ====================== Testing de subir fotos =========================== */
//
//
// router.get('/upload-img', function(req, res) {
//   var params = {Bucket: 'photomaticmx', Key: 'x-test.jpg'};
//   s3.getSignedUrl('putObject', params, function (err, url) {
//     console.log('The URL is', url);
//     res.json({url});
//   });
// });


module.exports = router;
