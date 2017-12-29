const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// const host = 'http://138.68.240.16:3000';
const host = 'http://localhost:3000/api';

/* GET home page. */
router.get('/', async (req, res) => {
  try {
    const response = await fetch(`${host}/dogs/`);
    const dogs = await response.json();
    return res.render('index', {
      title: 'r/dogs',
      dogs,
    });
  } catch (e) {
    console.log('asdf')
    res.render('error', { error: 'Unable to retrieve dogs!' });
  }
});

/* GET Dog detail page */
router.get('/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const response = await fetch(`${host}/dogs/${name}`);
    const dog = await response.json();
    console.log(dog);
    return res.render('dog', { dog });
  } catch (e) {
    res.render('error', { error: `Unable to retrieve information about ${name}!`});
  }
});

router.post(`/dogs/:name/vote`, async (req, res) => {
  const { name } = req.params;
  try {
    const response = await fetch(`${host}/dogs/${name}/vote`, { method: 'POST' });
  } catch (e) {
    res.render('error', { error: 'Unable to retrieve dogs!' });
  }
});

router.post(`/dogs/:name/comment`, async (req, res) => {
  const { comment } = req.body;
  const { name } = req.params;
  try {
    const response =  await fetch(`${host}/dogs/${name}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment }),
    });
  } catch (e) {
    res.render('error', { error: 'Unable to post comment!' });
  }
});

router.delete(`/dogs/:name/vote`, async (req, res) => {
  const { name } = req.params;
  try {
    const response = await fetch(`${host}/dogs/${name}/vote`, { method: 'DELETE' });
  } catch (e) {
    res.render('error', { error: 'Unable to retrieve dogs!' });
  }
});

module.exports = router;
