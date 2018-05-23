var express = require('express'),
    AWS = require('aws-sdk');

var router = express.Router();
var amazon = require('../../config/config.json')
var s3 = new AWS.S3(amazon,{
  signatureVersion: 'v4'
});

/* ====================== Pagina Principal ================================= */
router.get('/', function(req, res, next) {
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

    var KeysArray = data.Contents.map(obj => {
      var params = {Bucket: 'photomaticmx', Key: obj.Key};
      var url = s3.getSignedUrl('getObject', params);
      var Fotos = {};
      Fotos={'nombre':obj.Key, 'url':url};
      return Fotos
    });
      if (req.user) {
        return res.render('admin/home', {
          fotos : KeysArray
        });
      }else{
        return res.redirect('/');
      }
  });
});

router.get('/delete', function(req, res) {
  var params = {Bucket: 'photomaticmx', Key: req.query.key};
  s3.deleteObject(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    res.redirect('/admin/home');
  });
});

router.get('/presignedUrl', function(req, res) {
  var params = {Bucket: 'photomaticmx/carrousel-imgs', Key: req.query.name, ACL: 'authenticated-read', ContentType: 'binary/octet-stream'};
  s3.getSignedUrl('putObject', params, function (err, url) {
    res.json({url});
  });
});

module.exports = router;
