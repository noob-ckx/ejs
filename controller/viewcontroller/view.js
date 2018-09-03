var express = require('express');
var router = express.Router();

//视图请求路径配置

//主页
router.get('/', function (req, res, next) {
  res.render('index');
});

//根节点管理
router.get('/management', function (req, res, next) {
  res.render('root/management');
});
router.get('/add', function (req, res, next) {
  res.render('root/add');
});
router.get('/edit', function (req, res, next) {
  res.render('root/edit',{id: req.query.id});
});

//树形图
router.get('/tree/index', function (req, res, next) {
  res.render('tree/tree-index');
});
router.get('/tree/add', function (req, res, next) {
  res.render('tree/tree-add',{id:req.query.id,rootid:req.query.rootid});
});


//表格
router.get('/table/list', function (req, res, next) {
  res.render('table/table-list');
});
router.get('/table/add', function (req, res, next) {
  res.render('table/table-add');
});
router.get('/table/view', function (req, res, next) {
  res.render('table/table-view',{id:req.query.id});
});
router.get('/table/insert', function (req, res, next) {
  res.render('table/table-insert',{id:req.query.id,pid:req.query.pid});
});
router.get('/table/changeImg', function (req, res, next) {
  res.render('table/table-changeImg',{id:req.query.id});
});

router.get('/search/img', function (req, res, next) {
  res.render('search/img');
});


module.exports = router;
