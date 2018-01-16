const express = require('express');
const User = require('../models/user');
const router = express.Router();

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

router.post('/adopt/', (req, res) => {
  const { username, dog } = req.body;
  if (!username || !dog) {
    return res.status(400).send({ error: 'Username or dog not specified'});
  }
  const query = { username };
  const update = { $push: { dogs: dog } };
  const opts = { new: true };

  User.findOneAndUpdate(query, update, opts)
    .then(dog => {
      if (!dog) {
        return res.status(404).send({ error: 'Dog could not be found!'});
      } else {
        return res.status(204).send();
      }
    })
    .catch(error => res.status(400).send({ error }));
});



module.exports = router;
