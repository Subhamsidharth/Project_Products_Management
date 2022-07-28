// const collegeModel = require('../models/collegeModel')
// const validator = require("../validators/validator")


// const isEmail =  async (x)=>{
//     return (typeof x !=='string' || x.trim()===0  || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(x))?"Inavlid Email":await isAllreadyPresent("email",x)?"Email Allready Used":"No Error";
// }
// const isMobile = (x)=>{
//     return (typeof x ==='null' || x.toString.trim()===""  || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(x.toString))?"Invalid Mobile No":"No Error";
// }
// const isName = (x)=>{
//     return (typeof x !=='string' || x.trim()===""  || !/^[A-Za-z ]{1,29}$/.test(x))?"Invalid Name":"No Error";
// }
// const isCollege = (x)=>{
//     return (typeof x !=='string' || x.trim()===""  || !/^\s*(?=[A-Za-z])[a-zA-Z\s\.\,]{2,}\s*$/.test(x))?"Invalid College Name":"No Error";
// }
// function isLinkValid(x) {
//    return (typeof x !=='string' || x.trim() === 0 || !(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|svg|jpeg)/.test(x)))?"Invalid LogoLink!":"No Error";
// }
// const isAllreadyPresent = async (atribute,value,req)=>{ 
//     let data = await collegeModel.findOne({ [atribute]: value });
//     req.headers.collegId = data._id;
//     return data?true:false;
// }




// /***************************************************************** COLLEGE VALIDATOR **************************************************************/



// const processCollegeRequest = async function (req, res, next) {
//     try {
        
//         if (Object.keys(req.body).length === 0) return res.status(400).send({ status: false, msg: "cannot create college with empty body" })
//         let errorMsg = {}

//         errorMsg.name = (req.body.name===undefined)?"College Name Required!":validator.isCollege(req.body.name) 
//         errorMsg.name==="No Error" && (errorMsg.name = await validator.isAllreadyPresent("name",req.body.name,req)?`College Allready Registered!`:"No Error");
//         errorMsg.fullName = req.body.fullName===undefined?"College FullName Required!":validator.isCollege(req.body.fullName);
//         errorMsg.logoLink = req.body.logoLink===undefined?"LogoLink Required!":validator.isLinkValid(req.body.logoLink);
//         Object.keys(errorMsg).forEach(key => errorMsg[key] === "No Error" && delete errorMsg[key])
        
//         return Object.keys(errorMsg).length!==0?res.status(400).send({status:false,message:errorMsg}):next()
        
//     } catch (err) {
//         return res.status(500).send({ status: false, msg: err.message })
//     }
// }










// /***************************************************************** INTERN VALIDATOR **************************************************************/





// const processInternRequest = async function (req, res, next) {
//     try {
//         if (Object.keys(req.body).length === 0) return res.status(400).send({ status: false, msg: "cannot create college with empty body" })
//         let errorMsg = {}
//         errorMsg.collegeName = req.body.collegeName===undefined?"Required!":validator.isCollege(req.body.CollegeName);
//         errorMsg.name===true && (errorMsg.name = validator.isAllreadyPresent("name",req.body.name,req)?true:`College Not Registered!`);
//         errorMsg.name = req.body.name===undefined?"Required!":validator.isName(req.body.name);
//         errorMsg.email = req.body.email===undefined?"Required!":validator.isEmail(req.body.email);
//         errorMsg.mobile = req.body.mobile===undefined?"Required":validator.isMobile(req.body.mobile);
//         Object.keys(errorMsg).forEach(key => errorMsg[key] === true && delete errorMsg[key])
//         return Object.keys(errorMsg).length!==0?res.status(400).send({status:false,message:errorMsg}):next()
//     } catch (err) {
//         return res.status(500).send({ status: false, msg: err.message })
//     }
// }



// /***************************************************************** INTERN VALIDATOR **************************************************************/




// const processGetRequest = async (req,res,next)=>{
     
//     try {
//         if(!req.query.name) return res.status(400).send({status:false, message: "enter the abbreviated name of a college in a collegeName key at query params"});
//         let college = await validator.nearestCollege(req.query.name.toLowerCase())
//         if(college.length===0) return res.status(404).send({status:false, message:"no college found"}); 
//         req.headers.data = college;
//         next()    
//     } catch (error) {
//         return res.status(500).send({ status: false, msg: error.message })
//     }
// }






// module.exports.processCollegeRequest = processCollegeRequest
// module.exports.processInternRequest = processInternRequest
// module.exports.processGetRequest = processGetRequest