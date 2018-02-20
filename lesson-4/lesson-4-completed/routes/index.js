const express = require('express');
const fetch = require('node-fetch');
const Chance = require('chance');
const User = require('../models/user');
const chance = new Chance();
const router = express.Router();


/* GET index page. */
router.get('/', (req, res, next) => {
  res.render('index');
});

/* GET home page. */
router.get('/home', (req, res) => {

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
      return res.render('home', { dogs });
    })
    .catch((error) => res.render('error', { error }));
});

router.get('/social', (req, res) => {
  User.find().then(users => res.render('social', { users }));
});

/* GET profile page. */
router.get('/users/:username', (req, res) => {
  const { username } = req.params;

  User.findOne({ username })
    .then(user => {
      if (user) {
        return res.render('user', { user });
      } else {
        throw `User ${username} does not exist.`;
      }
    })
    .catch(error => { console.log(error); res.render('error', { error })});
});

module.exports = router;
