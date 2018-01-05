const express = require('express');
const Clarifai = require('clarifai');
const router = express.Router();

const apiKey = require('../config/clarifai.json').key;

// Initialize the API key
const app = new Clarifai.App({
    apiKey: apiKey // this is aliya's personal key plz don't use
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* POST handle form input */
router.post('/predict', function(req, res, next) {
  const image = req.body.image;

  app.models.predict(Clarifai.GENERAL_MODEL, image)
      .then(
        function(response) {
          const concepts = response.outputs[0].data.concepts;

          let verdict = false;

          for (var c of concepts) {
            if (c.name === 'dog') {
              verdict = true;
              break;
            }
          }

          res.render('predict', { concepts, image, verdict });
        },
        function(err) {
          res.render('error', { message: 'Error trying to process that image. Likely a bad URL'});
        }
      );
});

module.exports = router;
