const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const host = 'http://138.68.240.16:3000';
// const host = 'http://localhost:3000/api';


router.post(`/:name/vote`, (req, res) => {

});

router.post(`/:name/comment`, (req, res) => {


});

router.delete(`/:name/vote`, (req, res) => {

});

module.exports = router;
