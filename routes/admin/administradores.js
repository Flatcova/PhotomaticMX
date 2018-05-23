var express = require('express');
var router = express.Router();
var passport = require('passport');
var passportConf = require('../../config/passport/Strategies/LocalStrategy');

var User = require('../../models/user');

/* ====================== Agregar Administradores ========================== */

router.get('/', function(req, res, next) {
  if (!req.user) {
    return res.redirect('/');
  }else{
    User.find({}, function(err, data){
      if (err) return next(err);
      console.log(data[0]);
      res.render('admin/add-admin', {
        data: data,
        errors: req.flash('errors')
      });
    });
  }
});

router.post('/', function(req, res, next){
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

router.get('/delete', function(req, res) {
  User.findByIdAndRemove(req.query.id, function(err, doc) {
    if (err) return next(err);
    console.log('Doc of the remove by id',doc);
    return res.redirect('/admin/administradores')
  });
});

module.exports = router;
