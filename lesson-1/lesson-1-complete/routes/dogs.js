const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const host = 'http://138.68.240.16:3000';
// const host = 'http://localhost:3000/api';


router.post(`/:name/vote`, (req, res) => {
  const { name } = req.params;
  const apiResponse = fetch(`${host}/dogs/${name}/vote`, { method: 'POST' })
    .then(result => {
      if (result.status === 200) {
        res.status(200).send('Succesful Upvote');
      } else {
        res.status(400).send('Error');
      }
    })
    .catch(error => res.render('error', { error: 'Unable to retrieve dogs! '}));
});

router.post(`/:name/comment`, (req, res) => {
  const { comment } = req.body;
  const { name } = req.params;

  const apiResponse =  fetch(`${host}/dogs/${name}/comment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ comment }),
  })
  .then(result => {
    if (result.status === 200) {
      res.status(200).send('Successful Post');
    } else {
      res.status(400).send('Error');
    }
  })
  .catch(error => res.render('error', { error: 'Unable to post comment! '}));
});

router.delete(`/:name/vote`, (req, res) => {
  const { name } = req.params;
  const apiResponse = fetch(`${host}/dogs/${name}/vote`, { method: 'DELETE' })
    .then(result => {
      if (result.status === 200) {
        res.status(200).send('Succesful Upvote');
      } else {
        res.status(400).send('Error');
      }
    })
    .catch(error => res.render('error', { error: 'Unable to retrieve dogs! '}));
});

module.exports = router;
