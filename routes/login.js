var express = require("express");
var router =express.Router();
var mysql = require("mysql2");
var Crypto = require("crypto");
require('dotenv').config();

var secretkey = process.env.secretkey;



var connection = mysql.createConnection({
    host : process.env.host, //or //127.0.0.1
    port : process.env.port,
    user : process.env.user,
    password : process.env.password,
    database : process.env.database
});

router.get("/", function(req, res, next){
    if(!req.session.logged){
        res.render("login",{
            name : "none"
        })
    }else{
        res.render("/login",{
            name : req.session.logged.name
        })
    }
    
})

router.post("/login", function(req, res, next){
    var post_id =req.body.post_id;
    var password =req.body.password;
    var crypto = Crypto.createHmac('sha256',secretkey ).update(password).digest('hex');
    console.log(post_id, crypto);
    connection.query(
        `select * from user_list where post_id = ? and password= ?`,
        [post_id, crypto],
        function(err, result){
            if(err){
                console.log(err);
                res.send("SQL login connection Error")
            }else{
                if(result.length > 0){
                    req.session.logged = result[0];
                    console.log(req.session.logged);
                    res.redirect("/main")
                }else{
                    res.render("error2",{
                        message : "아이디나 비밀번호가 틀립니다"
                    })
                        
                    
                }
            }
        }
    )
})

router.get("/signup", function(req, res, next){
    res.render("signup")
})

router.post("/signup2", function(req, res, next){
    var post_id = req.body.post_id;
    var password = req.body.password;
    var name = req.body.name;
    var division = req.body.division;
    var linkcode = req.body.linkcode;
    var crypto = Crypto.createHmac('sha256',secretkey ).update(password).digest('hex');
    console.log(post_id, password, name, division, linkcode);
    connection.query(
        `select * from user_list where post_id = ?`,
        [post_id],
        function(error, result){
            if(error){
                console.log(error);
                res.send("SQL connent Error")
            }else{
                if(result.length > 0){
                    res.send("이미 존재하는 아이디")
                }else{
                    connection.query(
                        `insert into user_list (post_id, password, name, division,
                             linkcode) values (?, ?, ?, ?, ?)`,
                             [post_id, crypto, name, division, linkcode],
                             function(error2, result){
                                 if(error2){
                                     console.log(error2);
                                     res.send("SQL insert Error")
                                 }else{
                                     
                                     res.redirect("/");
                                    
                                 }
                             }

                    )
                }
            }
        }
    )
})
router.get("/logout",function(req,res,next){
    req.session.destroy(function(err){
        if(err){
            console.log(err);
            res.send("Session destroy error");
            
        }else{
            res.redirect('/')
        }
    })
})

module.exports = router;