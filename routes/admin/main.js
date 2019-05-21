var express = require("express");
var router = express.Router();
var passport = require("passport");

/* ====================== Inicio de sesion ================================= */
router.get("/", function(req, res, next) {
  if (req.user) {
    return res.redirect("/admin/home");
  } else {
    res.render("admin/login/login", {
      errors: req.flash("errors")
    });
  }
});
router.post(
  "/",
  passport.authenticate("local-login", {
    successRedirect: "/admin/home",
    failureRedirect: "/admin",
    failureFlash: true
  })
);

module.exports = router;
