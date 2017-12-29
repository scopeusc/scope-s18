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

module.exports = router;
