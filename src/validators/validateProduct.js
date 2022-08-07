//title validation
function isTitle(x){
    if(!x) return "mandatory title is missing";
    if(typeof x !== "string") return "title should be written in string only";
    const regEx = /^\s*[a-zA-Z0-9]+([\.\-\_]?[a-zA-Z0-9\s]+)*$/;
    if(!regEx.test(x)) return "title is not in meaningful format";
    return true;
}


//description
function isDescription(x){
    if(!x) return "mandatory Description is missing";
    if(typeof x !== "string") return "Description should be written in string only";
    if(x.trim().length === 0) return "Description is not in meaningful format";
    return true;
}


//price
function isPrice(x){
    if(!x) return "mandatory price is missing";
    if(!(Number(x) >= 0)) return "enter a valid price";
    return true;
}


//currencyId
function isCurrencyId(x){
    if(!x) return "mandatory CurrencyId is missing";
    if(x !== "INR") return "we accept price in 'The Indian  Rupee' Only, so choose <currencyId : 'INR' >only";
    return true;
}


function isCurrencyFormat(x){
    if(!x) return "mandatory CurrencyFormat is missing";
    if(x !== "₹") return "we accept price in INR Only, so choose <CurrencyFormat : '₹' >only";
    return true;
}


//isFreeShipping
function isBoolean(x){
    // if(x===undefined || x===null || x==="") return "mandatory FreeisFreeShipping is missing";
    if(x!= 'true' && x!= 'false' && typeof x !== "boolean") return "invalid isFreeShipping value, it must be a Boolean";
    return true;
}


//styles
function isStyle(x){
    if(typeof x !== "string" || x.trim().length===0) return "invalid style value";
    return true
}


//availableSizes => in handler only

//installments
function isInstallments(x){
    if(!(Number(x) >= 0)) return "installments value must be a number type or convertible to a number && should not be -ve"
    if(parseInt(x) != x) return "installments value should be an integer";
    return true;
}



//image files = req.files
function isImageFile(x){
    if(x === undefined || x === null || x.length===0) return "mandatory Image is missing"; //rectified after test
    const name = x[0].originalname;
    const regEx = /\.(apng|avif|gif|jpg|jpeg|jfif|pjpeg|pjp|png|svg|webp)$/;    //source:https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
    const checkImage = name.match(regEx);
    if(checkImage === null) return "provided image is not an image file";
    return true;
}

module.exports = {isTitle, isDescription, isPrice, isCurrencyId, isCurrencyFormat, isBoolean, isStyle, isInstallments, isImageFile};