const productModel = require('../models/productModel')
const mongoose = require("mongoose")
const { uploadFile } = require("../aws/aws")
const { isValid, isValidObjectId, isValidRequestBody, isImage, priceRegex } = require("../validators/validator");
const {isTitle, isDescription, isPrice, isCurrencyId, isCurrencyFormat, isBoolean, isStyle, isInstallments, isImageFile} = require('../validators/validateProduct')
// const {isFname, isLname, isEmail, isPhone, isPassword, isStreet, isCity, isPincode, removeSpaces, trimAndUpperCase} = require('../validators/validateUser')


/*-----------------------------------------------------1st product API : POST /products------------------------------------*/

const createProduct = async function(req, res){
    try {
        let {title, description, price, currencyId, currencyFormat, isFreeShipping,  style, availableSizes, installments} = req.body;

        const data = {title, description, price, currencyId, currencyFormat, availableSizes};
        isFreeShipping && (data.isFreeShipping = isFreeShipping);
        style && (data.style = style);
        installments && (data.installments = installments);

        const files = req.files; 
        const imageUrl = await uploadFile(files[0]);
        data.productImage = imageUrl

        const savedData = await productModel.create(data);
        return res.status(201).send({status:true, message:"Success", data:savedData});

    } catch (err) {
        console.log(err);
        return res.status(500).send({status:false, message:err.message});
    }
}


//------------------------------------------2nd product api : GET /products-----------------------------------------------------------//
const getProductsByQuery = async function(req, res){      
   try {
      let {size, name, priceGreaterThan, priceLessThan, priceSort} = req.query;

      const invalid = {};  //validations
      if(size) {   
               size = [...new Set(size.toUpperCase().split(",").map((s)=>s.trim()))]; 
               const _enum = ["S", "XS", "M", "X", "L", "XXL", "XL"];
               for(let i=0; i<size.length; i++){
               if(_enum.indexOf(size[i]) === -1){
                  invalid['size error'] = `enter size from these set of elements only : ${_enum}`;
                  break;
               }
      }};
      priceGreaterThan && (String(Number(priceGreaterThan)) === 'NaN') && (invalid["priceGreaterThan error"] = "invalid price format");   //ss
      priceLessThan && (String(Number(priceLessThan)) === 'NaN') && (invalid["priceLessThan error"] = "invalid price format");
      if(Object.keys(invalid).length > 0) return res.status(400).send({status:false, message:invalid});
      
      const filter = {isDeleted : false}; //contructing filter
      if(size) filter.availableSizes = {$all:size};   //find({sizes: {$all:["s", "L"]}})
      if(name) filter.title = name;
      filter.price = {};                                                       
      if(priceGreaterThan) filter.price['$gt'] = priceGreaterThan;
      if(priceLessThan) filter.price['$lt'] = priceLessThan //find(price: {$gt:500}), find(price:{$gt:500, $lt:7000}), {$and: [{price:{$gt:500}}, {price:{$lt:7000}}] }
      if(Object.keys(filter.price).length === 0) delete filter.price;   
                                                    
      if(priceSort != -1) priceSort = 1;

      const data = await productModel.find(filter).sort({price : priceSort});
      if(data.length === 0) return res.status(404).send({status:false, message:"product not available as per your query"});
      return res.status(200).send({status:true, message:`${data.length} match found`, data : data});

   } catch (err) {
      console.log(err);
      return res.status(500).send({status:false, message:err.message});
   }
}


//-------------------------------------------upadteApi----------------------------------------
const updateProduct = async function (req, res) {
   try {
      let productId = req.params.productId;
      let reqData = req.body;
      let files = req.files;

      let { title, description, price, isFreeShipping, productImage, style, availableSizes, installments } = req.body;
      

      if (Object.keys(reqData).length === 0) return res.status(400).send({ status: false, message: "No Data For Update" });   //check body is empty or not
      if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "productId is invalid" })  //check id

      var regName = /^[a-zA-Z0-9]+/
      if (title && (!regName.test(title))) return res.status(400).send({ status: false, message: "title is invalid" })
      if (description && (!regName.test(description))) return res.status(400).send({ status: false, message: "description is invalid" })
      if (price && (!priceRegex.test(price))) return res.status(400).send({ status: false, message: "price should be valid format" })
      if (isFreeShipping && (isBoolean(isFreeShipping) !== true))  return res.status(400).send({ status: false, message: isBoolean(isFreeShipping) })
      if (style && (!regName.test(style))) return res.status(400).send({ status: false, message: "style is invalid" })
      if ( installments && (isInstallments(installments) !==true))  return res.status(400).send({ status: false, message: isInstallments(installments) })

      const isSizes = function(y){
         const _enum = ["S", "XS", "M", "X", "L", "XXL", "XL"];
         if(!y) return `please enter atleast one size from ${_enum}`;
         y =  [...new Set(y.toUpperCase().split(",").map((x)=>x.trim()))];
         for(let i=0; i<y.length; i++){
               if(!_enum.includes(y[i])) return `${y[i]} is not a valid size, valid size ref : ${_enum}`;
         }
         availableSizes = req.body.availableSizes = [...y];       
      }
      if(availableSizes && (isSizes(availableSizes) !==true)) return res.status(400).send({status:false, message:isSizes(availableSizes)})
      
      if (productImage) {
         if (!files || (files && files.length === 0)) { return res.status(400).send({ status: false, message: " Please Provide The Product Image ⚠️" });}
         if (!isImage(files[0].originalname)) return res.status(400).send({ status: false, message: "Please enter the Image in a Valid format. ⚠️" });
         productImage = await uploadFile(files[0])
      }
      //duplicate title
      let checkTitle = await productModel.findOne({ title: title });
      if (checkTitle) return res.status(400).send({ status: false, message: "This title is already used. ⚠️" });  //duplicate title
     
      let findProductId = await productModel.findById({ _id: productId })   //check product in DB
      if (!findProductId) return res.status(404).send({ status: false, message: "productId is not present in Db" })
      if (findProductId.isDeleted) return res.status(404).send({ status: false, message: "this product is already deleted" });

      let objUpdate = {};
      if(title)         objUpdate.title =          title;
      if(description)   objUpdate.description =    description;
      if(price)         objUpdate.price =          price;
      if(isFreeShipping)objUpdate.isFreeShipping = isFreeShipping;
      if(productImage)  objUpdate.productImage =   productImage;
      if(style)         objUpdate.style =          style;
      if(availableSizes)objUpdate.availableSizes = availableSizes;
      if(installments)  objUpdate.installments =   installments;
      

      let updatedData = await productModel.findByIdAndUpdate(productId, objUpdate, { new: true }) // update book
      res.status(200).send({ status: true, message: "upadated successfully", data: updatedData })
   } catch (error) {
      console.log(error)
      return res.status(500).send({ status: false, msg: error.message })
   }
}

//-------------------------------------------------------------getProduct---------------------------------
const getProductsById = async (req, res) => {
   try {
      let productId = req.params.productId

      if (!isValidObjectId(productId)) {
         return res.status(400).send({ status: false, message: "Please Provide a valid productId" });
      }

      let Product = await productModel.findOne({ _id: productId, isDeleted: false });
      if (!Product) {
         return res.status(404).send({ status: false, msg: "No Product Found" });
      }
      return res.status(200).send({ status: true, message: 'Product found successfully', data: Product });
   }
   catch (err) {
      return res.status(500).send({ status: false, msg: err.message });
   }
}
//-----------------------------------------------------DeleteApi--------------------------------------------------
const deleteProduct = async (req, res) => {
   try {
      let ProductId = req.params.productId;
      if (!isValidObjectId(ProductId)) {
         return res.status(400).send({ status: false, message: "Invalid ProductId. ⚠☣" })
      }
      let data = await productModel.findOne({ _id: ProductId, isDeleted: false });
      if (!data) {
         return res.status(404).send({ status: false, message: "This Product Data is already deleted Or Doesn't Exist" });
      }
      await productModel.findOneAndUpdate({ _id: ProductId }, { isDeleted: true, deletedAt: Date() }, { new: true });
      return res.status(200).send({ status: true, message: "Deleted Sucessfully. ♻✔" });

   } catch (err) {
      console.log(err)
      return res.status(500).send({ message: err.message });
   }
};

module.exports = { createProduct, getProductsById, deleteProduct, updateProduct, getProductsByQuery }

