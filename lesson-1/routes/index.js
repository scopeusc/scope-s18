const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const host = 'http://138.68.240.16:3000';

const getAllDogs = async () => {
  const response = await fetch(`${host}/dogs/`);
  return response.json();
}

/* GET home page. */
router.get('/', async (req, res) => {
  try {
    const dogs = await getAllDogs();
    return res.render('index', {
      title: 'r/dogs',
      dogs,
    });
  } catch (e) {
    res.render('index', { title: 'r/dogs' });
  }
});

router.post(`/dogs/:name/vote`, async (req, res) => {
  const { name } = req.params;
  try {
    const response = await fetch(`${host}/dogs/${name}/vote`, { method: 'POST' });
    const dogs = await getAllDogs();
    return res.render('index', {
      title: 'r/dog',
      dogs,
    });
  } catch (e) {
    console.error(e);
    res.render('index', { title: 'r/dogs' });
  }
});

router.delete(`/dogs/:name/vote`, async (req, res) => {
  const { name } = req.params;
  try {
    const response = await fetch(`${host}/dogs/${name}/vote`, { method: 'DELETE' });
    const dogs = await getAllDogs();
    return res.render('index', {
      title: 'r/dog',
      dogs,
    });
  } catch (e) {
    res.render('index', { title: 'r/dogs' });
  }
});

module.exports = router;
