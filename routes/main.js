var express = require("express");
var router = express.Router();
var mysql = require("mysql2");
var moment = require('moment');
var Crypto = require("crypto");
// const { resolveSoa } = require("dns");
require('dotenv').config();

var secretkey = process.env.secretkey;

var connection = mysql.createConnection({
    host : process.env.host, //or //127.0.0.1
    port : process.env.port,
    user : process.env.user,
    password : process.env.password,
    database : process.env.database
});


router.get("/",function(req,res,next){
    if(!req.session.logged){
        res.redirect('/')
    }else{
         connection.query(
                `select * from board`,
                function(err,result){
                    if(err){
                        console.log(err);
                        res.send("SQL login connection Error")
                    }else{
                        res.render("write",{
                            content : result,
                            name : req.session.logged.name
                        })
                        }
                    }
                
            )
    }
   
   
})

router.get("/board", function(req, res, next){
    if(!req.session.logged){
        res.redirect('/')
    
    }else{
         res.render("board",{
            name : req.session.logged.name
         })
    }
   
})
router.post("/board2",function(req,res,next){
    // var No = req.body.No;
    var title = req.body.title;
    var content = req.body.content;
    var img = req.body.img;
    var post_id = req.session.logged.post_id;
    var date = moment().format("YYYYMMDD")
    var time = moment().format("hhmmss")
   
    console.log(title, content,img,post_id,date,time);
    
    connection.query(
        `insert into board (title,content,img,date,time,post_id    
            ) values (?, ?, ?, ?,?,?)`,
                [title,content,img,date,time,post_id],
                function(error2, result){
                    if(error2){
                        console.log(error2);
                        res.send("SQL insert Error")
                    }else{
                        res.redirect('/main');
                    }
                }

            )   
                
})

            
router.get("/info", function(req, res, next){
    var no = req.query.no;///json.json.json
    
    console.log(no);

    console.log(req.session.logged.post_id);
    if(!req.session.logged){
        res.redirect('/')
    }else{
        connection.query(
        `select * from board where No = ?`,
        [no],
        function(err,result){
            if(err){
                console.log(err)
                res.send("info select Error")
            }else{
                connection.query(
                    `select * from comment where parent_num =?`,
                    [no],
                    function(err2,result2){
                        if(err2){
                            console.log(err2);
                            res.render("error",{
                                message : "게시글의 댓글출력에러"
                            })
                        }else{
                            res.render('info',{
                   
                            content: result,
                            opinion : result2,
                            post_id : req.session.logged.post_id,
                            
                            name : req.session.logged.name
                            })
                        }
                    }
                )
                
            }
        }
    
    )
    
    }
    
    
})

router.get('/del', function(req,res,next){
    var no = req.query.no;
    console.log(no);
    connection.query(
        `delete from board where No = ?`,
        [no],
        function(err,result){
            if(err){
                console.log(err);
                res.send("delete Error");
            }else{
                res.redirect('/main')
            }

        }
    )
})


router.get('/update', function(req,res,next){
    var no = req.query.no;
    console.log(no);
    if(!req.session.logged){
        res.redirect('/')
    }else{
        connection.query(
        `select * from board where No = ?`,
        [no],
        function(err, result){
            if(err){
                console.log(err);
                // res.render('update')
            }else{
                res.render('update',{
                    content :result,
                    name : req.session.logged.name
                })
            }
        }
    )
    }
    
})

router.post('/update2', function(req, res, next){
    var no = req.body.no;
    var post_id = req.body.post_id;
    var title = req.body.title;
    var content = req.body.content;
    var img = req.body.img;
    console.log(no, title, content, img);
    connection.query(
        `update board set title = ?, content = ?, img = ? where No  = ?`,
        [title,content,img,no],
        function(err,result){
            if(err){
                console.log(err)
                res.send('update2 update error')
            }else{
                res.redirect('/main')
            }
        }
    )


})



router.get('/data_list', function(req,res,next){
    if(!req.session.logged){
        res.redirect('/')
    }else{
        connection.query(
                `select * from board`,
                function(err,result){
                    if(err){
                        console.log(err);
                        res.send("SQL login connection Error")
                    }else{
                        res.render("data_list",{
                            content : result,
                            name : req.session.logged.name
                        })
                        }
                    }
                
            )
    
    }
    
})

router.post("/add_comment", function(req,res,next){
    if(!req.session.logged){
        res.redirect("/")

    }else{
        var no = req.body.no;
        var comment = req.body.comment;
        var post_id = req.session.logged.post_id;
        var name = req.session.logged.name;
        var date = moment().format("YYMMDD");
        var time = moment().format("HHmmss");
       
        connection.query(
            `insert into comment (parent_num,opinion,post_id,name,date,time) values (?,?,?,?,?,?)`,
            [no, comment, post_id, name, date, time],
            function(err, result){
                if(err){
                    console.log(err);
                    res.render("error",{
                        message : "댓글추가 실패"
                    })
                }else{
                    res.redirect("/main/info?no="+no);
                }
            }
        )
    }
    
})

router.get("/comment_del/:no/:parent_num",function(req,res,next){
    var no = req.params.no;
    var parent_num = req.params.parent_num;
    console.log(no,parent_num);
    connection.query(
        `delete from comment where No = ?`,
        [no],
        function(err,result){
            if(err){
                console.log(err);
                res.render('error',{
                    message : "댓글삭제 에러"
                })
            }else{
                res.redirect('/main/info?no='+parent_num);
            }
        }

    )
})


router.get("/comment_like",function(req,res,next){
    var no = req.query.no;
    var parent_num = req.query.parent_num;
    console.log(parent_num);
    var like = parseInt(req.query.like) +1;
    console.log(no,parent_num,like);

    connection.query(
        `update comment SET up = ? where No = ?`,
        [like,no],
        function(err,result){
            if(err){
                console.log(err);
                res.render("error",{
                    message : "좋아요 추가 실패"
                })
            }else{
                res.redirect("/main/info?no="+parent_num);
            }
        }
    )
  

})

router.get("/comment_hate",function(req,res,next){
    var no = req.query.no;
    var parent_num = req.query.parent_num;
    var hate = parseInt(req.query.hate) +1;
    var title = req.query.title;
    console.log(no,parent_num,hate);
    connection.query(
        `update comment SET down = ? where No = ?`,
        [hate,no],
        function(err,result){
            if(err){
                console.log(err);
                res.render("error",{
                    message : "싫어요 추가 실패"
                })
            }else{
                res.redirect("/main/info?no="+parent_num);
            }
        }
    )
  

})



module.exports = router;