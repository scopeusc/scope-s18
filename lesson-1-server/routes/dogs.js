const express = require('express');
const router = express.Router();
const Dog = require('../models/dog.js');

/* GET list of dogs */
router.get('/', async (req, res) => {
  const dogs = await Dog.find({});
  res.status(200).send(dogs);
});

// GET one dog by name
router.get('/:name', async (req, res) => {
  const { name } = req.params;
  if (!name) {
    res.status(400).send({ error: 'Name attribute must be provided and cannot be empty.'});
  } else {
    const dog = await Dog.findOne({ name: { $regex: new RegExp(name, 'i') } });
    res.status(200).send(dog);
  }
});

// Callback to be passed
const vote = async (req, res, rating) => {
  const { name } = req.params;
  if (!name) {
    res.status(400).send({ error: 'Name attribute must be provided and cannot be empty.'});
  } else {
    try {
      const query = { name: { $regex: new RegExp(name, 'i') } };
      const update = { $inc: { rating } };
      const opts = { new: true };
      const dog = await Dog.findOneAndUpdate(query, update, opts);
      if (!dog) {
        res.status(404).send({ error: `Dog ${name} could not be found :(`});
      } else {
        res.status(200).send(dog);
      }
    } catch (error) {
      res.status(400).send({ error });
    }
  }
};

// Post = upvote
router.post('/:name/vote', (req, res) => vote(req, res, 1));

// Delete = downvote
router.delete('/:name/vote', (req, res) => vote(req, res, -1));

// Post a comment abotu a dog
router.post('/:name/comment', async (req, res) => {
  const { name } = req.params;
  const { comment } = req.body
  console.log(req.body);
  if (!name) {
    res.status(400).send({ error: 'Name attribute must be provided and cannot be empty.'});
  } else if (!comment) {
    res.status(400).send({ error: 'Comment attribute must be provided and cannot be empty.'});
  } else {
    try {
      const dog = await Dog.findOne({ name: { $regex: new RegExp(name, 'i') } });
      if (!dog) {
        res.status(404).send({ error: `Dog ${name} could not be found :(`});
      } else {
        dog.comments.push(comment);
        await dog.save();
        res.status(200).send(dog);
      }
    } catch (error) {
      res.status(400).send({ error });
    }
  }
});

module.exports = router;
