const mongoose = require("mongoose")

//--------------------------Validator------------------------------------------------------
const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
}
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}
// const isValidScripts = function (title) {c
//     const scriptRegex = /^(?![0-9]*$)[A-Za-z0-9\s\-_,\.;:()]+$/
//     return scriptRegex.test(title)
// }
// const isValidPincode = function (pincode) {
//     if (!pincode || pincode.toString().trim().length == 0 || pincode.toString().trim().length != 6) return false;
//     if (isNaN(Number(pincode.toString().trim()))) return false;
//     return true;

// }
//---------------------------Regex---------------------------------------------------------
let nameRegex = /^[.a-zA-Z\s,-]+$/
let emailRegex = /^[a-zA-Z]{1}[A-Za-z0-9._]{1,100}[@]{1}[a-z]{2,15}[.]{1}[a-z]{2,10}$/
let mobileRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/
let validateStreet = /^[a-zA-Z0-9]/
let validateCity = /^[a-zA-z',.\s-]{1,25}$/
let validatePincode = /^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/    //must not start with 0,6 digits and space(optional) gm
let priceRegex = /^[^\-]((\d+(\.\d*)?)|(\.\d+))$/
//------------------------------------------------------------------------------------------------------------------------
//image validation
function isImage(x){
    const regEx = /\.(apng|avif|gif|jpg|jpeg|jfif|pjpeg|pjp|png|svg|webp)$/;    //source:https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
    return x.match(regEx);
}


//validate fname & lname
function isFname(x){
    if(!x) return "mandatory fname is missing";
    if(typeof x !== "string") return "Data type Error : fname must be a string type";
    if(x.length > 64) return "fname exceeded maximum charaters limit which is 64";
    const regEx = /^\s*[a-zA-Z](\.[\sa-zA-Z0-9]+)*[\sa-zA-Z0-9]*\s*$/; 
    if(!regEx.test(x)) return "invalid format of fname"
    return true;
}


function isLname(x){
    if(!x) return "mandatory lname is missing";
    if(typeof x !== "string") return "Data type Error : fname must be a string type";
    if(x.length > 64) return "lname exceeded maximum charaters limit which is 64";
    const regEx = /^\s*[a-zA-Z](\.[\sa-zA-Z0-9]+)*[\sa-zA-Z0-9]*\s*$/; 
    if(!regEx.test(x)) return "invalid format of lname"
    return true;
}

//email
function isEmail(x){
    if(!x) return "mandatory email is missing";
    if(typeof x !== "string") return "Data type Error : email must be a string type";
    const regEx = /^\s*[a-zA-Z0-9]+([\.\-\_\+][a-zA-Z0-9]+)*@[a-zA-Z]+([\.\-\_][a-zA-Z]+)*(\.[a-zA-Z]{2,3})+\s*$/;
    if(!regEx.test(x)) return "invalid email format";
    x = x.split("@");
    if(x[0].length > 64) return "email exceeded the maximum characters in local part";
    if(x[1].length > 255) return "email exceeded the maximum characters in domain part";
    return true;
}


//profileImage : pending

//phone
function isPhone(x){
    if(!x) return "mandatory phone no. is missing";
    if(typeof x !== "string") return "Data type Error : phone no. must be a string type";
    const regEx = /^\s*(\+91)?[6789][0-9]{9}\s*$/;
    if(!regEx.test(x)) return "invalid phone number";
    return true;
}


//password
function isPassword(x){
    if(!x) return "mandatory password is missing";
    if(typeof x !== "string") return "Data type Error : password must be a string type";
    const regEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,15}$/;
    if(!regEx.test(x)) return "invalid password format : It must contains atleast one lowercase, uppercase, digit & special characters among [!@#$%^&*]";
    return true;
}


//address
function isStreet(x){
    if(!x) return "mandatory street is missing";
    if(typeof x !== "string") return "Data type Error : street must be a string type";
    const regEx = /^\s*[a-zA-Z0-9]+([\-\.\,]?\s*[\w\s]+)*\s*$/;
    if(!regEx.test(x)) return "invalid street format";
    return true;
}


function isCity(x){
    if(!x) return "mandatory city is missing";
    if(typeof x !== "string") return "Data type Error : city must be a string type";
    const regEx = /^\s*[a-zA-Z0-9]+([\-\.\,]?\s*[\w\s]+)*\s*$/;
    if(!regEx.test(x)) return "invalid city format";
    return true;
};

function isPincode(x){
    if(!x) return "mandatory pincode is missing";                                                             
    if(typeof x !== "number" && typeof x !=="string") return "Data type Error : pincode must be a number type";
    const regEx = /^[123456789][0-9]{5}$/;
    if(!regEx.test(x)) return "invalid pincode format";
    return true;
}

//romoveSpaces
function removeSpaces(x){
    // return x.split(" ").filter((y)=> y).join(" ");
    return x.split(" ").join(" ");
}


//trimAndUpperCase
function trimAndUpperCase(x){
    return x.split(" ").filter((y)=> y).map((z)=> z = z.charAt(0).toUpperCase() + z.slice(1)).join(" ");
}



module.exports = { 
    isValid, isValidObjectId, isValidRequestBody,isFname, isLname, isEmail, 
    isPhone, isPassword, isStreet, isCity, isPincode, removeSpaces, trimAndUpperCase, 
    isImage, nameRegex, emailRegex, mobileRegex,validateCity,validatePincode,validateStreet, priceRegex}