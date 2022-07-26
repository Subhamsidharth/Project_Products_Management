const userModel = require('../models/userModel')
const validator = require("email-validator")
//const aws=require("../aws/aws")
const aws = require("aws-sdk");
aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile= async ( file) =>{
   return new Promise( function(resolve, reject) {
    // this function will upload file to aws and return the link
    let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws

    var uploadParams= {
        ACL: "public-read",
        Bucket: "classroom-training-bucket",  //HERE
        Key: "Group70/" + file.originalname, //HERE 
        Body: file.buffer
    }


    s3.upload( uploadParams, function (err, data ){
        if(err) {
            return reject({"error": err})
        }
        console.log(data)
        console.log("file uploaded succesfully")
        return resolve(data.Location)
    })


   })
}


const userRegistretion=async function(req,res){
    try{
        let files=req.files
        let uploadedFileURL
        if(files && files.length > 0){
             uploadedFileURL =await uploadFile( files[0] )
        }
        let userData=req.body
        let{fname, lname, email,profileImage,phone, password,address,shipping, street, city,pincode,billing, ...rest}=userData
        userData.profileImage=uploadedFileURL
        // check body is empty or not
        if(!Object.keys(userData)) return res.status(400).send({status:false,message:"please provide data in req body"})
        // check any unwanted keys present in body
        //if(Object.keys(rest).length > 0) return res.status(400).send({status:false,message:"Please Enter the Valid Attribute Field"})
        //checking presence of mandetory fields
        if(!fname)return res.status(400).send({status:false,message:"fname must be present"})
        
        if(!lname)return res.status(400).send({status:false,message:"lname must be present"})

        if(!email)return res.status(400).send({status:false,message:"email must be present"})
        
        //if(!profileImage)return res.status(400).send({status:false,message:"profileImage must be present"})
        
        if(!phone)return res.status(400).send({status:false,message:"phone must be present"})
    
        if(!password)return res.status(400).send({status:false,message:"password must be present"})
         
        var regName=/^[a-zA-Z]+/
        //checking format 
        if(!regName.test(fname)) return res.status(400).send({status:false,message:"fname is valid"})
         if(!regName.test(lname)) return res.status(400).send({status:false,message:"lname is valid"})
         
        if (!(validator.validate(email))) return res.status(400).send({ status: false, message: "email is invalid" })
        
        var regPhone = /^[6789]\d{9}$/;
       if (!regPhone.test(phone)) return res.status(400).send({ status: false, message: "phone is invalid"})
       
       var passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;
       if (!passwordReg.test(password)) return res.status(400).send({ status: false, message: "password is invalid" })
       
       if(address){
        if (Array.isArray(address)) return res.status(400).send({ status: false, message: "address must be object"})
        if(Array.isArray(address.shipping))return res.status(400).send({ status: false, message: "shipping must be object"})
      //check street,city and pincode is present or not
      if (!address.shipping.street || !address.shipping.city || !address.shipping.pincode)
        return res.status(400).send({ status: false, msg: " please enter street,city,pincode" })
    
      if (!/^[a-zA-Z0-9]+/.test(address.shipping.street)) return res.status(400).send({ status: false, msg: "strees is invalid" })
      
      if (!/^[a-zA-Z]{2,30}$/.test(address.shipping.city)) return res.status(400).send({ status: false, msg: "city is invalid" })
      if (!/^[1-9][0-9]{5}$/.test(address.shipping.pincode)) return res.status(400).send({ status: false, msg: "pincode is invalid" })
       
       //check billing is valid or not
       if(billing){
        if(Array.isArray(billing))return res.status(400).send({ status: false, message: "billing must be object" })
        //check street,city and pincode is present or not
      if (!address.billing.street || !address.billing.city || !address.billing.pincode)
      return res.status(400).send({ status: false, msg: " please enter street,city,pincode" })
    
    if (!/^[a-zA-Z0-9]+/.test(address.shipping.street)) return res.status(400).send({ status: false, msg: "strees is invalid" })
    
    if (!/^[a-zA-Z]{2,30}$/.test(address.shipping.city)) return res.status(400).send({ status: false, msg: "city is invalid" })
    if (!/^[1-9][0-9]{5}$/.test(address.shipping.pincode)) return res.status(400).send({ status: false, msg: "pincode is invalid" })
       }
    }
       //check email is unique or not
       let uniqueEmail=await userModel.findOne({email:email})
       if (uniqueEmail) return res.status(400).send({ status: false, msg: "E-mail is Already Present in DB" })
       //check phone number is unique or not
       let uniquePhone=await userModel.findOne({phone:phone})
       if (uniquePhone) return res.status(400).send({ status: false, msg: "phone number is Already Present in DB" })

        //resister user
        let data=await userModel.create(userData)
        res.status(201).send({status:true,message:"User created successfully",data:data})
  } catch (error) {
    console.log(error)
    return res.status(500).send({ status: false, msg: error.message})
  }

}
module.exports={userRegistretion}

// const key1 = '{"shipping": 23,"billing": 25}'
// console.log(JSON.parse(key1))