const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const host = 'http://138.68.240.16:3000';
// const host = 'http://localhost:3000/api';

/* GET home page. */
router.get('/', (req, res) => {
  const apiResponse = fetch(`${host}/dogs`)
    .then(result => result.json())
    .then(dogs => res.render('index', { dogs }))
    .catch(error => res.render('error', { error }));
});

/* GET Dog detail page */
router.get('/:name', (req, res) => {
  const { name } = req.params;
  const apiResponse = fetch(`${host}/dogs/${name}`)
    .then(result => result.json())
    .then(dog => res.render('dog', { dog }))
    .catch(error => res.render('error', { error: `Unable to retrieve information about ${name}! `}));
});

module.exports = router;
