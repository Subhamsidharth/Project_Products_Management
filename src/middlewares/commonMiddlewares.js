const userModel = require('../models/userModel.js');
const {isFname, isLname, isEmail, isPhone, isPassword, isStreet, isCity, isPincode, removeSpaces, trimAndUpperCase, isImage} = require('../validators/validateUser.js');


const validateUserPut = async function(req, res, next){
    try{
        let {fname, lname, email, phone, password, ...rest} = req.body;

        let address = rest['address'];      //address handliing in both ways
        try{address && (address = JSON.parse(address));                                            
        }catch(err){return res.status(400).send({status:false, message:"please send address in js object convertible format"})}
        let streetS     =     rest['address.shipping.street'];
        let cityS       =     rest['address.shipping.city'];
        let pincodeS    =     rest['address.shipping.pincode'];
        let streetB     =     rest['address.billing.street'];
        let cityB       =     rest['address.billing.city'];
        let pincodeB    =     rest['address.billing.pincode'];
        if(address){
            streetS     =     req.body['address.shipping.street']     =     address.shipping.street;
            cityS       =     req.body['address.shipping.city']       =     address.shipping.city;
            pincodeS    =     req.body['address.shipping.pincode']    =     address.shipping.pincode;
            streetB     =     req.body['address.billing.street']      =     address.shipping.street
            cityB       =     req.body['address.billing.city']        =     address.shipping.city;
            pincodeB    =     req.body['address.billing.pincode']     =     address.shipping.pincode;
        }                                                                                  
        
        const msg = {}; //validation of fields
        if(fname && isFname(fname) !== true) msg["fname error"] = isFname(fname);
        if(lname && isLname(lname) !== true) msg["lname error"] = isLname(lname);
        if(email && isEmail(email) !== true) msg["email error"] = isEmail(email);
        if(phone && isPhone(phone) !== true) msg["phone error"] = isPhone(phone);
        if(password && isPassword(password) !== true) msg["password error"] = isPassword(password);
                                                                                                        
        if(streetS && isStreet(streetS) !== true) msg["streetShipping error"] = isStreet(streetS);   //validation for address
        if(cityS && isCity(cityS) !== true) msg["cityShipping error"] = isCity(cityS);
        if(pincodeS && isPincode(pincodeS) !== true) msg["pincodeShipping error"] = isPincode(pincodeS);    
        if(streetB && isStreet(streetB) !== true) msg["streetBilling error"] = isStreet(streetB);
        if(cityB && isCity(cityB) !== true) msg["cityBilling error"] = isCity(cityB);
        if(pincodeB && isPincode(pincodeB) !== true) msg["pincodeBilling error"] = isPincode(pincodeB);
        if(Object.keys(msg).length > 0) return res.status(400).send({status:false, message:msg});

        const objUpdate = {};    // formatting data
        let arrKeys = ['fname', 'lname', 'email', 'phone', 'address.shipping.street', 'address.shipping.city',  'address.billing.street', 'address.billing.city',
                         'address.billing.pincode', 'address.shipping.pincode','password'];
        arrKeys.forEach((x,i)=>{
                        if(req.body[x]){
                            if(i<=1) objUpdate[x] = trimAndUpperCase(req.body[x]);
                            if(i>1 && i<=7) objUpdate[x] = removeSpaces(req.body[x]);
                            if(i>7) objUpdate[x] = req.body[x];
                        }
        });

        if(email){  //validation for uniqueness
            const emailDoc = await userModel.findOne({email: objUpdate.email.toLowerCase()}); 
            if(emailDoc) return res.status(409).send({status:false, message: "conflicting data: email already exists"});
        }else if(phone){
            const lastTenNum = objUpdate.phone.slice(objUpdate.phone.length - 10)     
            const phoneDoc = await userModel.findOne({phone: new RegExp(lastTenNum + '$')});
            if(phoneDoc) return res.status(409).send({status:false, message: "conflicting data: phone already exists"});
        }

        req.objUpdate = objUpdate; 
        next(); //validation for image >>
    }catch(err){
        console.log(err);
        return res.status(500).send({status:false, message:err.message});
    }  
}

module.exports = {validateUserPut};
//+91-8974569874, 8974569874


