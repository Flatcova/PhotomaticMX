var express = require('express');
var router = express.Router();
var Categorias = require('../../models/categorias');

/* GET home page. */
router.get('/', function(req, res, next) {
  Categorias.find({}, function(err, categorias){
    res.render('main/portafolio/categorias',{
      categorias: categorias
    });
  });
});

router.get('/bodas', function(req, res, next){
  res.render('main/portafolio/individuales', {
    titulo: "Maternidad"
  });
});

module.exports = router;
