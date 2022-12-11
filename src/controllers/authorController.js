const authorModel = require('../model/authorModel');
const jwt = require('jsonwebtoken'); 

//regex 

let nameRegex = /^[a-zA-Z]{1,20}$/

let emailRegex = /^[a-z]{1}[a-z0-9._]{1,100}[@]{1}[a-z]{2,15}[.]{1}[a-z]{2,10}$/

let passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/

//1. Create author api

module.exports.createAuthor = async function(req, res){
    try{
        let data = req.body;
        let { fname, lname, title, password, email} = data;

        if(Object.keys(data).length === 0){
            return res.status(400).send({Status: false, msg:"Please enter all details"});
        }

        if(!fname || fname == ""){
            return res.status(400).send({Status:false, msg: "Please enter First name"});
        }
        fname=data.fname=fname.trim()

        if(!nameRegex.test(fname)){
            return res.status(400).send({Status:false, msg: "Please enter Valid First name"});
        }

        if(!lname || lname == ""){
            return res.status(400).send({Status:false, msg: "Please enter Last name"});
        }
        lname = data.lname = lname.trim()

        if(!nameRegex.test(lname)){
            return res.status(400).send({Status:false, msg: "Please enter Valid Last name"});
        }

        if(!title || title ==""){
            return res.status(400).send({Status:false, msg: "Please enter title"});
        }
        title = data.title = title.trim()
        if(title){
            if(!(["Mr", "Mrs", "Ms"].includes(title))){
                return res.status(400).send({Status:false, msg: "Please enter Valid title"});
            }
        }

        if(!emailRegex.test(email)){
            return res.status(400).send({Status:false, msg: "Please enter Valid email"});
        }

        if(email){
            let checkEmail = await authorModel.findOne({ email: email})

            if(checkEmail){
                return res.status(400).send({Status:false, msg: "Please enter another email"});
            }
        }

        if(!passwordRegex.test(password)){
            return res.status(400).send({Status:false, msg: "Please enter Valid password min charachter 8"});
        }

        let savedData = await authorModel.create(data)
        return res.status(201).send({msg: savedData})
    }
    catch(error){
        res.status(500).send({Status : false, error: error.message})
    }
}

module.exports.login = async function(req,res){
    try{
        let email = req.body.email;
        let password = req.body.password;

        if(!email || email == ""){
            return res.status(400).send({Status:false, msg: "Please enter email"});
        } else{
            email = email.trim()
        }

        if(!password || password == ""){
            return res.status(400).send({Status:false, msg: "Please enter password"});
        }

        let author = await authorModel.findOne({email : email, password: password});
        if(!author){
            return res.status(401).send({Status : false, msg: "email or password is not correct"});
        }

        let token = jwt.sign(
            {
                authorId : author._id
            },
            "project-1"
        );

        res.setHeader("x-api-key", token);
        res.status(200).send({Status: true,  Token: token});
    }
    catch(error){
        res.status(500).send({Status : false, error: error.message})
    }
}

module.exports.authors = async function(req, res){
    let all = await authorModel.find()
    res.send({msg:all})
}