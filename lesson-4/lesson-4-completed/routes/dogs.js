const express = require('express');
const fetch = require('node-fetch');
const Chance = require('chance');
const chance = new Chance();
const router = express.Router();

router.get('/', (req, res) => {

  const breeds = [
    'maltese',
    'terrier',
    'pug',
    'akita',
    'labrador',
    'shihtzu',
    'pomeranian',
  ];

  const fetchPromises = breeds.map(breed => fetch(`https://dog.ceo/api/breed/${breed}/images/random`));

  Promise.all(fetchPromises)
    .then((bodies) => {
        const jsonPromises = bodies.map(body => body.json());
        return Promise.all(jsonPromises);
      })
    .then((dogs) => {
      dogs.forEach((dog) => {
        dog['name'] = chance.first();
        dog['gender'] = chance.gender();
        dog['birthday'] = chance.birthday();
      });
      return res.status(200).send(dogs)
    })
    .catch((error) => res.status(400).send({ error }));

});

module.exports = router;
