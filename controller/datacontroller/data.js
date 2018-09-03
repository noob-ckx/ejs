var express = require('express');
var ejsExcel = require("ejsExcel");
var fs = require("fs");
var router = express.Router();
var db = require('./mysql');

//返回数据格式待优化
function resTable(res,code,msg,total){
  return {
     data:res,
     code:code,
     msg:msg,
     total:total
  }
}
function timetrans(d){
  var date = new Date(d*1000);//如果date为10位不需要乘1000
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
  var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
  var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
  var m = (date.getMinutes() <10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
  var s = (date.getSeconds() <10 ? '0' + date.getSeconds() : date.getSeconds());
  return Y+M+D+h+m+s;
}

//根节点管理

//添加根
//发送：JSON.stringify(data)
//获取：req.body.xxx
router.post('/addRoot', function(req, res) {
  db("INSERT INTO child(title,pid) VALUES('" + req.body.title + "','ROOT')",function(result){
    res.send(result); 
  })  
});


//获取根列表
//发送： xxx?xx=&xx=
//获取：req.query.xx
router.get('/rootList', function(req, res) {
  let page = req.query.page;
  let size = req.query.size;
  db("SELECT * FROM child WHERE pid = 'ROOT'",function(result){
      let len = result.length;
      let r = result;
      if(page && size){
        r = result.splice((page-1)*size,size);
      }
      res.send(resTable(r,200,'',len)); 
  })  
});
//根据Id查找根
//发送：xxx?xx=&xx=
//获取：req.query.xx
router.get('/getInfobyId', function(req, res) {
  db("SELECT * FROM child WHERE id = " + req.query.id,function(result){
    res.send(resTable(result[0],200,'',result.length))
  })  
});
//根据Id删除根
//发送：xxx?xx=&xx=
//获取：req.query.xx
router.get('/deleteInfobyId', function(req, res) {
  db("DELETE FROM child WHERE id = " + req.query.id,function(result){
    res.send(result)
  })  
});
//根据Id更新根
//发送：JSON.stringify(data)
//获取：req.body.xxx
router.post('/upDateInfobyId', function(req, res) {
  db("UPDATE child SET title = '" + req.body.title +"' WHERE id = " + req.body.id,function(result){
    res.send(result)
  })  
});



//树形图
//根据ID查找对应的树
router.get('/rootchild', function(req, res) {
  db("SELECT * FROM child WHERE rootid = " +  req.query.id,function(result){
  
    function findchild(id){
      var childList = [];
      result.forEach(element => {
        if(element.pid == id) {
          childList.push(element)
        }
      });
      return childList;
    }
    function tree(id){
      var self = [];
      var list = findchild(id);
      if(list.length != 0){
        list.forEach(element => {
          var child = findchild(element.id);
          if(child.length != 0){
            tree(element.id);
            element.children = child;
          }
          self.push(element);
        });
      }
      return self;
    }
    db("SELECT * FROM child WHERE id = " + req.query.id,function(r){
      var n = tree(req.query.id);
      if(n.length != 0){
        r[0].children = n;
        res.send(r[0])
      }else{
        res.send(r[0])
      }
      
    })
  })
   

});

// 根据ID添加下级
router.post('/addNext', function(req, res) {
  if(req.body.rootid == 'null'){
    db("INSERT INTO child(title,pid,rootid) VALUES('" + req.body.title + "','" + req.body.id + "','" + req.body.id + "')",function(result){
      res.send(result); 
    })
  }else{
    db("INSERT INTO child(title,pid,rootid) VALUES('" + req.body.title + "','" + req.body.id + "','" + req.body.rootid + "')",function(result){
      res.send(result); 
    })
  }
});


//台账管理
//获取台账列表
router.get('/tableList', function(req, res) {
  let page = req.query.page;
  let size = req.query.size;
  db("SELECT * FROM list ",function(result){
      let len = result.length;
      let r = result;
      if(page && size){
        r = result.splice((page-1)*size,size);
      } 
      r.forEach(item => {
        item.time = timetrans(item.time)
      })
      res.send(resTable(r,200,'',len)); 
  }) ;
  
});
router.get('/checkboxTree', function(req, res) {
  db("SELECT c.id,c.pid,c.title,c.rootid,if(c.id in (select i.linkId from info i WHERE pid = " + req.query.activeId +"),1,0) as 'checked' FROM child c WHERE rootid = " +  req.query.id,function(result){
    function findchild(id){
      var childList = [];
      result.forEach(element => {
        if(element.pid == id) {
          childList.push(element)
        }
      });
      return childList;
    }
    function tree(id){
      var self = [];
      var list = findchild(id);
      if(list.length != 0){
        list.forEach(element => {
          var child = findchild(element.id);
          if(child.length != 0){
            tree(element.id);
            element.children = child;
          }
          self.push(element);
        });
      }
      return self;
    }
    db("SELECT * FROM child WHERE id = " + req.query.id,function(r){
      var n = tree(req.query.id);
      if(n.length != 0){
        r[0].children = n;
        res.send(r[0])
      }else{
        res.send(r[0])
      }
      
    })
  })
})


//新增台账
router.post('/addTable', function(req, res) {
  // var timestamp2 = (req.body.time).valueOf();
  var dates = new Date(req.body.time);
  var time = dates.getTime()/1000;

  db("INSERT INTO list(name,time) VALUES('" + req.body.name + "','" + time +"')",function(result){
    res.send(result); 
  }) 
});
//获取台账详情
router.get('/vList', function(req, res) {
  let page = req.query.page;
  let size = req.query.size;
  console.log(req.query)
  db("SELECT * FROM info WHERE pid = '" + req.query.id  + "' order by sort",function(result){
      let len = result.length;
      let r = result;
      if(page && size){
        r = result.splice((page-1)*size,size);
        res.send(resTable(r,200,'',len)); 
      }else{
        res.send(resTable(r,200,'',len)); 
      }
  })  
});
//添加一条台账信息
router.get('/addvList', function(req, res) {
  db("SELECT title FROM child WHERE id = '" + req.query.childId + "'",function(result){
    db("SELECT * FROM info WHERE pid = '" + req.query.id + "'order by sort",function(resa){
      if(resa.length != 0){
        var sort = parseInt(resa[resa.length-1].sort) + 1;
        db("INSERT INTO info(sort,pid,img,name,linkId) VALUES('" + sort +"','" + req.query.id +"','','" + result[0].title +"','" + req.query.childId +"')",function(r){
          res.send(r); 
        })
      }else{
        db("INSERT INTO info(sort,pid,img,name,linkId) VALUES('1','" + req.query.id +"','','" + result[0].title +"','" + req.query.childId +"')",function(r){
          res.send(r); 
        })
      }
      
    })
  })

});

//删除台账
router.post('/deleteTable', function(req, res) {
  db("DELETE FROM info where id = " +  req.query.id + " AND pid = " +  req.query.pid,function(result){
    db("SELECT * FROM info WHERE pid = " + req.query.pid + " order by sort",function(resa){
      if(resa.length != 0){
        if(mer(resa,0)){
          res.send(result)
        }
      }else{
        res.send(result);
      }
    })
  })
  function mer(arr,n){
    if(n < arr.length){
      db("UPDATE info SET sort = '" + n +"' WHERE id = " + arr[n++].id,function(r){
        mer(arr,n);
      })
      return true;
    }else{
      return true;
    }
    
  } 
});
//向上插入一条数据
router.post('/insertUp', function(req, res) {
  // console.log(req.body)
  db("SELECT title FROM child WHERE id = '" + req.body.insertId + "'",function(resOne){
      db("SELECT a.id,a.sort FROM info a WHERE a.sort >= (SELECT b.sort from info b where b.id="+ req.body.id +" AND b.pid=" +  req.body.pid+")",function(result){
        // console.log(result)
        if(mers(result, parseInt(result[0].sort)+1,0)){
          db("INSERT INTO info(sort,pid,img,name,linkId) VALUES('" + parseInt(result[0].sort) +"','" + req.body.pid +"','','" + resOne[0].title +"','" + req.body.insertId +"')",function(a){
              res.send(a)
          })
        }
      })
  });
  function mers(arr,n,i){
    if(i < arr.length){
      db("UPDATE info SET sort = '" + n++ +"' WHERE id = " + arr[i++].id,function(r){
        mers(arr,n,i);
      })
      return true;
    }else{
      return true;
    } 
    
  }
})

//导出excle
router.get('/export', function(req, res) {
  // console.log('/public/file/template.xlsx');
  db("SELECT name FROM list WHERE id = " + req.query.id,function(resa){
    db("SELECT * FROM info WHERE pid = " + req.query.id + " order by sort",function(result){
      var exlBuf = fs.readFileSync("./public/file/template.xlsx");
      ejsExcel.renderExcel(exlBuf, result).then(function(exlBuf2) {
        fs.exists("./public/file/" + resa[0].name +".xlsx", function(exists) {
          if(exists){
            fs.unlinkSync("./public/file/" + resa[0].name +".xlsx");
          }
          fs.writeFileSync("./public/file/" + resa[0].name +".xlsx", exlBuf2);
          res.send("/file/" + resa[0].name + ".xlsx");
        });        
      }).catch(function(err) {
        console.error(err);
      });
    })
  })
})

router.post('/changeName', function(req, res) {
  // console.log("./public/images/" + req.query.path);
  //拼接图片所在路径
  var path = "./public/images/" + req.query.path;
  //读取出文件夹下所有图片,list[]
  try {
    fs.readdirSync(path);
  } catch (error) {
    console.log("A");
    res.send({err:"图片路径不存在，请检查文件是否存放在正确位置"})
    return ;
  }
  var imgList = fs.readdirSync(path);
  //存储所有图片路径
  var imgListArr = [];
  //存储排序后的图片[{path:'',date:''}]
  var sortArr = [];

  //处理图片
  imgList.forEach(element => {
    imgListArr.push(path +  "/" +element)
  })
  imgListArr.forEach(element => {
    let d = new Date(fs.statSync(element).mtime).getTime();
    sortArr.push({path:element,date:d});
  })
  sortArr.sort((a,b) => {return a.date-b.date})


  db("SELECT * FROM info WHERE pid = " + req.query.id + " order by sort",function(result){
    if(result.length == sortArr.length ){
      result.forEach((element,index) => {
        fs.rename(sortArr[index].path,path + "/" + result[index].name+'.jpg',function(err){
          if(err){
            console.log(err);
            return ;
          }else{
            db("UPDATE info SET img = '/images/"  + req.query.path + "/"+ result[index].name +".jpg' WHERE id = " + element.id,function(result){
              
            })
          }
        })
      })
      res.send("success")
    }else{
      res.send({err:"图片与列表数量不一致，无法上传"})
    }
  })
})

router.get('/searchImg', function(req, res) {
  var page = req.query.page;
  var size = req.query.size;
  db("SELECT c.*,b.time,b.name as pname FROM info c,list b WHERE c.name like '%" + req.query.name + "%' AND c.pid = b.id",function(result){
    let len = result.length;
    var r = result.splice((page-1)*size,size);

    r.forEach(item => {
      item.time = timetrans(item.time)
    })
    res.send(resTable(r,200,'',len)); 
    // console.log(r)
    // res.send(resTable(r,200,'',len)); 
  });

})

router.get('/loadImg', function(req, res) {
  res.sendFile("." + req.query.img,function(err){
    console.log(err)
  })
})

module.exports = router;
