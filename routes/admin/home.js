var express = require('express'),
    AWS = require('aws-sdk');

var router = express.Router();
var amazon = require('../../config/config.json')
var s3 = new AWS.S3(amazon,{
  signatureVersion: 'v4'
});

/* ====================== Pagina Principal ================================= */
router.get('/', function(req, res, next) {
  if (req.user) {
    return res.render('admin/home');
  }else{
    return res.redirect('/');
  }
});

router.get('/presignedUrl', function(req, res) {
  var params = {Bucket: 'photomaticmx/carrousel-imgs', Key: req.query.name, ACL: 'authenticated-read', ContentType: 'binary/octet-stream'};
  s3.getSignedUrl('putObject', params, function (err, url) {
    console.log('The URL is', url);
    res.json({url});
  });
});

module.exports = router;
