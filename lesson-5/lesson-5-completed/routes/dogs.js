const express = require('express');
const fetch = require('node-fetch');
const faker = require('faker');
const router = express.Router();


router.get('/', (req, res) => {
  fetch('https://dog.ceo/api/breeds/list/all')
    .then(body => body.json())
    .then(json => {
      const breeds = Object.keys(json.message);
      const promises = breeds.map(breed => fetch(`https://dog.ceo/api/breed/${breed}/images/random`));
      return Promise.all(promises)
    })
    .then(bodies => {
      const promises = bodies.map(body => body.json());
      return Promise.all(promises);
    })
    .then(values => {
      return res.status(200).send(values)
    })
    .catch(error => res.status(400).send({ error }));
});

module.exports = router;
