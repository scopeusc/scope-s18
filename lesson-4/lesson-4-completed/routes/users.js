const express = require('express');
const User = require('../models/user');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).send({ error: 'Username must be specified. '});
  }

  User.findOne({ username })
    .then(user => {
      if (user) {
        throw `${username} already exists.`;
      }
      const newUser = new User(req.body);
      return newUser.save();
    })
    .then(user => res.status(200).send(user))
    .catch(error => res.status(400).send({ error }));
});

module.exports = router;
