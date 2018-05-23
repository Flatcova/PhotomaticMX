var express = require('express'),
    AWS = require('aws-sdk');

var router = express.Router();
var amazon = require('../config/config.json')
var s3 = new AWS.S3(amazon,{
  signatureVersion: 'v4'
});

/* GET home page. */
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

    var urls = data.Contents.map(obj => {
      var params = {Bucket: 'photomaticmx', Key: obj.Key};
      var url = s3.getSignedUrl('getObject', params);
      var Fotos = {};
      Fotos={'url':url};
      return Fotos
    });

    res.render('main/index', {
      fotos: urls
    });
  });
});

module.exports = router;
