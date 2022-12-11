const jwt = require("jsonwebtoken")

module.exports.tokenChecker = async function(req, res, next){
    try{
        let token = req.headers["x-api-key"];

        if(!token){
            return res.status(400).send({ Status: false, msg: "missing token"})
        }

        let decoded = jwt.verify(token, "project-1", function(err, decoded) {
            if(err){
                console.log(err)
                return res.status(400).send({Status: false, msg:"token invalid"});
            } else{
                req.authorId = decoded.authorId;
                return next();
            }
        });
    } catch(err){
        res.status(500).send({Status: false, msg:err.message});
    }
};