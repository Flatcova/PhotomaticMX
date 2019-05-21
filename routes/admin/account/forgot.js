var express = require("express");
var router = express.Router();

var config = require("../../../config/database.js");
var User = require("../../../models/user");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");

/* ====================== Inicio de sesion ================================= */
router.get("/", function(req, res, next) {
  if (req.user) {
    return res.redirect("/admin/home");
  } else {
    res.render("admin/login/forgot", {
      errors: req.flash("errors")
    });
  }
});
router.post("/", function(req, res, next) {
  async.waterfall(
    [
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString("hex");
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ "profile.local.email": req.body.email }, function(
          err,
          user
        ) {
          if (!user) {
            req.flash("error", "No existe una cuenta con este correo");
            return res.redirect("/forgotPassword");
          }

          user.profile.local.resetPasswordToken = token;
          user.profile.local.resetPasswordExpires = Date.now() + 3600000; //1hora

          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
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
          subject: "Recuperacion de Contraseña 🔑",
          text:
            `Hola ` +
            user.profile.local.username +
            `, \n\n Hemos notado que has solicitado un cambio de contraseña para ` +
            user.profile.local.email +
            `.\n\n
    Si tu solicitaste este cambio, da click en este link para cambiar tu contraseña.\n
    ` +
            `https://` +
            req.headers.host +
            `/reset/` +
            token +
            `\n\n
    Si tu no solicitaste el cambio de contraseña, simplemente ignora este correo.`
        };

        smtpTransport.sendMail(mailOptions, function(err) {
          console.log("mail sent");
          req.flash(
            "success",
            "Se mando un correo a " + user.profile.local.email
          );
          done(err, "done");
        });
      }
    ],
    function(err) {
      if (err) return next(err);
      res.redirect("/forgotPassword");
    }
  );
});

module.exports = router;
