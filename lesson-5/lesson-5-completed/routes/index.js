const express = require('express');
const passport = require('passport');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

router.post('/login',
  passport.authenticate('local', { failureRedirect: '/' }),
  (req, res) => {
    // User logged in successfully!
    res.redirect('/');
  }
);

router.post('/logout',
  (req, res) => {
    if(req.isAuthenticated()){
      req.logout();
    }

    res.redirect('/');
  }
)

module.exports = router;
