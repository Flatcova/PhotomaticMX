var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('main/index');
});

router.get('/bodas', function(req, res, next){
  res.render('layout.ejs')
});

module.exports = router;
