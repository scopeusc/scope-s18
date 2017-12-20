var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/', function (req, res, next) {
    var message = [1328, 1584, 1776, 1792, 1616, 512, 1328, 1792, 1824, 1680, 1760, 1648, 512, 800, 768, 784, 896];
    var hello = "";
    for (var letter of message) {
        hello += String.fromCharCode(letter >> 4);
    }
    console.log(hello);
    res.render('index', {title: hello});
});
module.exports = router;
