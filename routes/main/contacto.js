var express = require("express");
var router = express.Router();
var config = require("../../config/database.js");
var nodemailer = require("nodemailer");
var async = require("async");
var fs = require("fs");
var ejs = require("ejs");
var path = require("path");

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("main/contacto");
  // res.render("email/notifyUser", { name: "miguel" });
});

router.post("/", function(req, res, next) {
  async.waterfall(
    [
      function(done) {
        var smtpTransport = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: config.mail,
            pass: config.pws
          }
        });

        ejs.renderFile(
          path.join(__dirname, "../../views/email/notifyUser.ejs"),
          { name: req.body.name },
          function(err, data) {
            if (err) {
              console.log("error de renderFile", err);
            } else {
              var mailOptions = {
                to: req.body.email,
                from: '"Informacion" info@az_works.com',
                subject: "Confirmación de Mensaje",
                html: data
              };
              // console.log("html: ", mailOptions.html);
              smtpTransport.sendMail(mailOptions, function(err) {
                if (err) {
                  console.log("error en email: ", err);
                }
                console.log("mail sent");
                req.flash(
                  "success",
                  "Se mando un correo a " + user.profile.local.email
                );
              });

              var secondMailOptions = {
                to: "m.covar20@gmail.com",
                from: req.body.email,
                subject: req.body.subject,
                text:
                  `Recibiste un correo de ` +
                  req.body.name +
                  `, \n\n el cuenta tiene como asunto ` +
                  req.body.subject +
                  `, con el siguiente contenido: \n\n` +
                  req.body.message
              };

              smtpTransport.sendMail(secondMailOptions, function(err) {
                console.log("2 mail sent");
                req.flash("success", "Se mando un correo de " + req.body.email);
                done(err, "done");
              });
            }
          }
        );
      }
    ],
    function(err) {
      if (err) return next(err);
      res.redirect("/contact");
    }
  );
});

module.exports = router;
