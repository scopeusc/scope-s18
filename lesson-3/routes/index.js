const express = require('express');
const Clarifai = require('clarifai');
const router = express.Router();


// Initialize the API key
const app = new Clarifai.App({
    apiKey: 'REPLACE WITH API KEY' // this is aliya's personal key plz don't use
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* POST handle form input */
router.post('/predict', function(req, res, next) {
  const image = req.body.image;

  app.models.predict(Clarifai.GENERAL_MODEL, image).then(
      function(response) {
        const concepts = response.outputs[0].data.concepts;

        res.render('predict', { concepts, image });
      },
      function(err) {
        console.log(err);

        res.redirect('/');
      }
  );
});

module.exports = router;
