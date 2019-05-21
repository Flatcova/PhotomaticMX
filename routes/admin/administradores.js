var express = require("express");
var router = express.Router();
var passport = require("passport");
var passportConf = require("../../config/passport/Strategies/LocalStrategy");

var User = require("../../models/user");

/* ====================== Agregar Administradores ========================== */

router.get("/", function(req, res, next) {
  if (!req.user) {
    return res.redirect("/");
  } else {
    User.find({})
      .lean()
      .exec(function(err, data) {
        if (err) return next(err);
        console.log(data);
        res.render("admin/add-admin", {
          usuario: req.user,
          data: data,
          errors: req.flash("errors")
        });
      });
  }
});

router.post("/", function(req, res, next) {
  if (req.body.password === req.body.password_verf) {
    console.log("estoy dentro del if");
    // set the user's local credentials
    var newUser = new User();
    console.log(req.body.email);

    newUser.profile.local.username =
      req.body.firstName + " " + req.body.lastName;
    newUser.profile.local.firstName = req.body.firstName;
    newUser.profile.local.lastName = req.body.lastName;
    newUser.profile.local.email = req.body.email;
    newUser.profile.local.password = newUser.generateHash(req.body.password);

    console.log(newUser.profile.local);
    User.findOne({ "profile.local.email": req.body.email }, function(
      err,
      existingUser
    ) {
      console.log("err", err);
      console.log("existingUser", existingUser);
      if (existingUser) {
        req.flash(
          "errors",
          "El correo ya ha sido utilizado, intenta otro diferente."
        );
        return res.redirect("/admin/administradores");
      } else {
        // save the user
        newUser
          .save()
          .then(user => {
            console.log("usuario gravado", user);
            return res.redirect("/admin/administradores");
            // return res.redirect('/admin/servicios/categorias');
          })
          .catch(err => err);
      }
    });
  } else {
    req.flash("errors", "Favor de checar los datos.");
    return res.redirect("/admin/administradores");
  }
});

router.get("/delete", function(req, res) {
  User.findByIdAndRemove(req.query.id, function(err, doc) {
    if (err) return next(err);
    console.log("Doc of the remove by id", doc);
    return res.redirect("/admin/administradores");
  });
});

// async/ await
// router.get('/delete', async (req, res) => {
//   try {
//     const respuesta = await GuardarS3(req.query.id).exec();
//     const categoria = await Categoria(info).save();
//     return res.status(200).json(respuesta);
//   } catch (error) {
//     next(error);
//   }
// });

module.exports = router;
