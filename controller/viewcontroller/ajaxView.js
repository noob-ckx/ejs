var express = require('express');
var router = express.Router();

//导航路由配置
router.get('/:id', function (req, res, next) {
    switch(req.params.id){
        case "a":
            res.redirect('/management');
            break;
        case "b":
            res.redirect('/tree/index');
            break;
        case "c":
            res.redirect('/table/list');
            break;
        case "d":
            res.redirect('/search/img');
            break;
    }
});

module.exports = router;