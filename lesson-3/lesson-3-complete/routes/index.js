const express = require('express');
const Clarifai = require('clarifai');
const router = express.Router();

const apiKey = require('../config/clarifai.json').key;

// Initialize the API key (Fill out your API key in config/clarifai.json)
const app = new Clarifai.App({
    apiKey: apiKey
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
});

/* POST handle form input */
router.post('/predict', function(req, res, next) {
    const image = req.body.image;
    // Alternatively, const { image } = req.body;

    // Connect to the Clarifai API using the prediction feature then feed it the URL passed in through our form
    app.models.predict(Clarifai.GENERAL_MODEL, image)
        .then(
            function(response) {
                // If we get a successful response, we render the predict page

                // Get the concepts array from the response we're given (see Clarifai API reference)
                const concepts = response.outputs[0].data.concepts;

                // If any of the tagged concepts is 'dog' then we determine that the image is a dog (Simple logic for now)
                let verdict = false;

                for (const c of concepts) {
                    if (c.name === 'dog') {
                        verdict = true;
                        break;
                    }
                }

                // Render our predict page and send it the concepts array, the original image URL, and the final dog or not dog verdict
                res.render('predict', { concepts, image, verdict });
            },
            function(err) {
                // If we get an error, we render the error page with the following message
                res.render('error', { message: 'Error trying to process that image. Likely a bad URL'});
            }
        );
});

module.exports = router;
