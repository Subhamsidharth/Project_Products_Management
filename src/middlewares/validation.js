const userModel = require('../models/userModel.js');
const productModel = require('../models/productModel.js');
const {isFname, isLname, isEmail, isPhone, isPassword, isStreet, isCity, isPincode, removeSpaces, trimAndUpperCase, isImage} = require('../validators/validateUser.js');
const {isTitle, isDescription, isPrice, isBoolean, isStyle, isInstallments, isImageFile} = require('../validators/validateProduct.js');

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
            streetB     =     req.body['address.billing.street']      =     address.billing.street
            cityB       =     req.body['address.billing.city']        =     address.billing.city;
            pincodeB    =     req.body['address.billing.pincode']     =     address.billing.pincode;
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
//+91-8974569874, 8974569874


//====================================================Product Validation=====================================================//

//------------------------------create Product Validation --------------------------------//
const validateProduct = async function(req, res, next){
    try {
        let {title, description, price,  isFreeShipping,  style, availableSizes, installments} = req.body //productImage, from req.files
        const files = req.files;
        
        const isSizes = function(y){
            const _enum = ["S", "XS", "M", "X", "L", "XXL", "XL"];
            if(!y) return `please enter atleast one size from ${_enum}`;
            y =  [...new Set(y.toUpperCase().split(",").map((x)=>x.trim()))];
            for(let i=0; i<y.length; i++){
                if(!_enum.includes(y[i])) return `${y[i]} is not a valid size, valid size ref : ${_enum}`;
            }
            availableSizes = req.body.availableSizes = [...y];       
            return true;
        }

        const inputError = {};
        if(isTitle(title)                  !== true) inputError.title =          isTitle(title);
        if(isDescription(description)      !== true) inputError.description =    isDescription(description);
        if(isPrice(price)                  !== true) inputError.price =          isPrice(price);
        if(isFreeShipping && isBoolean(isFreeShipping)     !== true) inputError.isFreeShipping = isBoolean(isFreeShipping);
        if(isImageFile(files)              !== true) inputError.files =          isImageFile(files);
        if(style && isStyle(style)         !== true) inputError.style =          isStyle(style);
        if(installments && isInstallments(installments)    !== true) inputError.installments =   isInstallments(installments);
        if(isSizes(availableSizes)         !== true) inputError.availableSizes = isSizes(availableSizes);
        if(Object.keys(inputError).length > 0) return res.status(400).send({status:false, message:{inputError}});

        //format and add to request
        req.body.title = removeSpaces(title);
        req.body.description = removeSpaces(description);
        req.body.currencyId = "INR";
        req.body.currencyFormat = "₹";
    
        //duplicate
        const doc = await productModel.findOne({title:title});
        if(doc) return res.status(409).send({status:false, message:"conflicting data : title already exists"});
        next();

    } catch (err) {
        console.log(err);
        return res.status(500).send({status:false, message:err.message});
    }
}


module.exports = {validateUserPut, validateProduct};


