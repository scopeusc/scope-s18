const express = require('express');
const passport = require('passport');
const fetch = require('node-fetch');
const Chance = require('chance');
const User = require('../models/user');
const chance = new Chance();
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index');
});

// Login Logic
router.post('/login', passport.authenticate('local'), (req, res, next) => {
  res.status(200).send();
});

router.get('/logout', (req, res) => {
  if(req.isAuthenticated()){
    req.logout();
  }

  res.redirect('/');
});

// Views
router.get('/home', isLoggedIn, (req, res) => {
  if(req.isUnauthenticated()) {
    return res.render('error', {
      message: 'Unauthorized Access',
      error: { status: 401 },
    });
  }

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

router.get('/social', isLoggedIn, (req, res) => {
  User.find().then(users => res.render('social', { users }));
});

/* GET profile page. */
router.get('/users/:username', isLoggedIn, (req, res) => {
  const { username } = req.params;

  User.findOne({ username })
    .then(user => {
      if (user) {
        return res.render('user', { user });
      } else {
        throw `User ${username} does not exist.`;
      }
    })
    .catch(error => res.render('error', { error }));
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.render('error', {
    message: 'Unauthorized Access',
    error: { status: 401 },
  });
}

module.exports = router;
