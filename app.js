var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
var viewController = require('./controller/viewcontroller/view');
var dataController = require('./controller/datacontroller/data');
var ajaxController = require('./controller/viewcontroller/ajaxView');
//生成一个express实例 app。
var app = express();   

// view engine setup
//设置 views 文件夹为存放视图文件的目录, 即存放模板文件的地方,__dirname 为全局变量,存储当前正在执行的脚本所在的目录。
app.set('views', path.join(__dirname, 'views')); 
//设置视图模板引擎为 ejs
app.set('view engine', 'ejs');
//加载日志中间件。
app.use(logger('dev'));
//加载解析json的中间件
app.use(express.json());
//加载解析urlencoded请求体的中间件。
app.use(express.urlencoded({ extended: false }));
//加载解析cookie的中间件。
app.use(cookieParser());
//设置public文件夹为存放静态文件的目录。
app.use(express.static(path.join(__dirname, 'public')));
//路由控制器
// app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/', viewController);
app.use('/data', dataController);
app.use('/', ajaxController);

//捕获404错误，并转发到错误处理器。
app.use(function(req, res, next) {
  next(createError(404));
});

// 错误处理器
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  //设置本地环境下，仅在开发环境中提供错误
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  //渲染错误到界面
  console.log(err)
  res.status(err.status || 500);
  // res.render('error');
});

module.exports = app;
