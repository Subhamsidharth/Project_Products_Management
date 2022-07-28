const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');


//authentication
const authentication = async function(req, res, next){
    try {
        let token = req.headers.authorization;  
        if(!token) return res.status(401).send({status:false, message: "token is missing"});
        token = token.substring(7); 

        const decode = jwt.verify(token, "secretCode70", {ignoreExpiration:true}, function(err, response){
            if(err) return null;
            if(response) return response;
        });
        if(!decode) return res.status(401).send({status:false, message:"invalid token"})
        if(Date.now() > decode.exp*1000) return res.status(401).send({status:false, message:"token has expired"})
        
        req.token = decode;
        next();
        
    } catch (err) {
        console.log(err);
        return res.status(500).send({status:false, message:err.message})
    }
}

const authorisation = async function(req, res, next){     //userId from params
    try{
        const userId = req.params.userId;
        if(!userId) return res.status(400).send({status:false, message:"enter user id in url"})// handled by postman as well
        if(!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).send({status:false, message:"enter a valid user id in url path"});

        const loggedInUserId = req.token.userId;
        if(loggedInUserId !== userId) return res.status(403).send({status:false, message:`user ${loggedInUserId} is not authorised to update profile of ${userId}`});
        next();

    }catch(err){
        console.log(err)
        return res.status(500).send({status:false, message:err.message})
    }
}



module.exports = {authentication, authorisation}

