var express = require("express");
var router = express.Router();

var config = require("../../../config/database.js");
var User = require("../../../models/user");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");

/* ====================== Inicio de sesion ================================= */
router.get("/:token", function(req, res, next) {
  User.findOne(
    {
      "profile.local.resetPasswordToken": req.params.token,
      "profile.local.resetPasswordExpires": { $gt: Date.now() }
    },
    function(err, user) {
      if (!user) {
        req.flash("error", "El token es invalido o ya expiro");
        return res.redirect("/forgotPassword");
      }
      res.render("admin/login/reset", { token: req.params.token });
    }
  );
});

router.post("/:token", function(req, res, next) {
  async.waterfall(
    [
      function(done) {
        User.findOne(
          {
            "profile.local.resetPasswordToken": req.params.token,
            "profile.local.resetPasswordExpires": { $gt: Date.now() }
          },
          function(err, user) {
            if (!user) {
              req.flash("error", "El token es invalido o ya expiro");
              return res.redirect("back");
            }
            if (req.body.password == req.body.confirm) {
              console.log("antes", user.profile.local.password);
              user.profile.local.password = User().generateHash(
                req.body.password
              );
              user.profile.local.resetPasswordToken = undefined;
              user.profile.local.resetPasswordExpires = undefined;
              console.log("despues", user.profile.local.password);

              user.save(function(err) {
                req.logIn(user, function(err) {
                  done(err, user);
                });
              });

              // user.update({
              //   $set: {
              //     "profile.local.password": new User().generateHash(
              //       req.body.password
              //     ),
              //     "profile.local.resetPasswordToken": undefined,
              //     "profile.local.resetPasswordExpires": undefined
              //   }
              // });
              // user.profile.local.password = User().generateHash(
              //   req.body.password,
              //   function(err) {
              //
              //     user.profile.local.resetPasswordToken = undefined;
              //     user.profile.local.resetPasswordExpires = undefined;
              //
              //
              //   }
              // );
            } else {
              req.flash("error", "La contraseña no concuerda");
              return res.redirect("back");
            }
          }
        );
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: config.mail,
            pass: config.pws
          }
        });
        var mailOptions = {
          to: user.profile.local.email,
          from: "help@az_works.com",
          subject: "Contraseña Actualizada ✅🔑",
          text:
            `Hola ` +
            user.profile.local.username +
            `, \n\n Este es un mensaje confirmando el cambio de contraseña para ` +
            user.profile.local.email +
            `.\n\n Ahora sigue disfrutando de nuestro servicio.\n`
        };

        smtpTransport.sendMail(mailOptions, function(err) {
          console.log("confirmation sent");
          req.flash(
            "success",
            "Exito! Se actualizo tu contraseña correctamente"
          );
          done(err);
        });
      }
    ],
    function(err) {
      if (err) return next(err);
      res.redirect("/admin/home");
    }
  );
});

module.exports = router;
