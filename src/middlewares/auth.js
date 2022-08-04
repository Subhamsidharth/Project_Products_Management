const jwt = require("jsonwebtoken");
const mongoose = require("mongoose")

module.exports.authentication= async function (req, res, next) {
  try {
    let token = req.headers["authorization"];
    if (!token) {
      return res.status(401).send({ status: false, message: "Missing authentication token in request ⚠️", });
    }
    token = token.substring(7);
    const decoded = jwt.decode(token);
    if (!decoded) {
      return res.status(401).send({ status: false, message: "Invalid authentication token in request headers." })
    }
    if (Date.now() > (decoded.exp) * 1000) {
      return res.status(440).send({ status: false, message: "Session expired! Please login again." })//​​440 Login Timeout
    }
    jwt.verify(token, "group70", function (err, decoded) {
      if (err) {
        return res.status(400).send({ status: false, message: "token invalid ⚠️" });
      }
      else {
        req.userId = decoded.userId;
        req.token = decoded
        return next();
      }
    });

  }
  catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//----------------------------------------------------------------------------------------------------
module.exports.authorisation = async function(req, res, next){     //userId from params
  try{
      const userId = req.params.userId;
      if(!userId) return res.status(400).send({status:false, message:"enter user id in url"})// handled by postman as well
      if(!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).send({status:false, message:"enter a valid user id in url path"});

      const loggedInUserId = req.token.userId;
      if(loggedInUserId !== userId) return res.status(403).send({status:false, message:`user ${loggedInUserId} is not authorised to make changes in ${userId}`});
      next();

  }catch(err){
      console.log(err)
      return res.status(500).send({status:false, message:err.message})
  }
}

 // "Bearer eyyyyyyyyyyyyyyyyyy";
   
    // token.split(" "); => ["Bearer", "eyyyyyyyyyyyyyyyyy"]
    // token = arr[1]