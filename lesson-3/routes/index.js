const express = require('express');
const Clarifai = require('clarifai');
const router = express.Router();


// Initialize the API key
const app = new Clarifai.App({
    apiKey: 'db50b744e1a647f99be4674ede034ad8' // this is aliya's personal key plz don't use
});
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

app.models.predict(Clarifai.GENERAL_MODEL, "https://cbsnews2.cbsistatic.com/hub/i/r/2015/02/27/dc63bf50-05ee-4733-9217-4718ee9c81fe/resize/620x465/cb60f988990627112be9a03525f66c34/labrador-retriever1istock.jpg").then(
    function(response) {
        // do something with response
    },
    function(err) {
        // there was an error
    }
);


module.exports = router;
