const productModel = require('../models/productModel')

const mongoose = require("mongoose")
const {uploadFile} =require("../aws/aws")

const { isValid, isValidObjectId, isValidRequestBody, isImage, priceRegex} = require("../validators/validator")


//------------------------------------Post createProduct Api-------------------------------------------------
const createProduct = async (req, res) => {

    try {
        let files = req.files
        let data = req.body
        let {
            title, description, price, currencyId, currencyFormat, 
            isFreeShipping, style, availableSizes, installments } = data

        //---Mandatory_Field---\\
        if (!isValidRequestBody(data)){
        return res.status(400)
        .send({ status: false, message: "Bad Request, Please enter the details in the request body.❌🛑" });
        }
        if (!title) return res.status(400).send({ status: false, message: "Title is mandatory" })
        if (!description) return res.status(400).send({ status: false, message: "Description is mandatory" })
        if (!price) return res.status(400).send({ status: false, message: "Price is mandatory" })
        if (!currencyId) return res.status(400).send({ status: false, message: "CurrencyId is mandatory" })
        if (!currencyFormat) return res.status(400).send({ status: false, message: "CurrencyFormat is mandatory" })
        // if (!(files.productImage)) return res.status(400).send({ status: false, message: "ProductImage is mandatory" })
        
        //_Validation_\\
        if (!isValid(title))
            return res.status(400).send({ status: false, message: "Please enter valid Title. ⚠️" });

        if (!isValid(description))
            return res.status(400).send({ status: false, message: "Please enter valid description. ⚠️" });
            
        if(!priceRegex.test(price))
            return res.status(400).send({ status: false, message: "Please enter valid price. ⚠️" });

        if (currencyId !== "INR")
           return res.status(400).send({ status: false, message: "currencyId should be in INR. ⚠️" })

        if (currencyFormat !== "₹")
           return res.status(400).send({ status: false, message: "currencyFormat should be in ₹. ⚠️" })

        if (!isValid(style))
           return res.status(400).send({ status: false, message: "Please enter valid style. ⚠️"})
      
        if((availableSizes) == 0 ) {
            return res.status(400).send({status: false, message: "Please enter atleast one size. ⚠️"})
        }

        if(availableSizes[0]==="[") availableSizes = availableSizes.substring(1,availableSizes.length-1)
        availableSizes = availableSizes.toUpperCase().split(',').map(x=> x.trim())
        // availableSizes = JSON.parse(availableSizes)
        availableSizes = [...new Set(availableSizes)];
        let check = ["S", "XS", "M", "X", "L", "XXL", "XL"]
        for(let i=0;i<availableSizes.length; i++){ 
            if(!check.includes(availableSizes[i])){
                return res.status(400).send({status: false, message: 'Size should be only in uppercase - S, XS, M, X, L, XXL, XL. ⚠️'})
            
            }
        }
       //---Duplicate_Validation---\\
        let duplicateTitle = await productModel.findOne({ title: title })
        if(duplicateTitle) return res.status(409).send({ status: false, message: "This title already exist" })

        if (!files || (files && files.length === 0)) {
            return res.status(400).send({ status: false, message: " Please Provide The Profile Image ⚠️" });
        }
        if (!isImage(files[0].originalname))
        return res.status(400).send({ status: false, message: "Please enter the Image in a Valid format. ⚠️" });
        let productImage = await uploadFile(files[0])

        // console.log(profileImage)
        let sendData = {title, description, price, currencyId, currencyFormat, 
            productImage,isFreeShipping, style, availableSizes, installments }

        const createdDoc = await productModel.create(sendData)
        return res.status(201).send({ status: true, message: "Success", data: createdDoc })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


//------------------------------------------2nd product api : GET /products-----------------------------------------------------------//
 /*
- Returns all products in the collection that aren't deleted.
  - __Filters__
    - Size (The key for this filter will be 'size')
    - Product name (The key for this filter will be 'name'). You should return all the products with name containing the substring recieved in this filter
    - Price : greater than or less than a specific value. The keys are 'priceGreaterThan' and 'priceLessThan'. 
    
> **_NOTE:_** For price filter request could contain both or any one of the keys. For example the query in the request could look like { priceGreaterThan: 500, priceLessThan: 2000 } or just { priceLessThan: 1000 } )
    
  - __Sort__
    - Sorted by product price in ascending or descending. The key value pair will look like {priceSort : 1} or {priceSort : -1}
  _eg_ /products?size=XL&name=Nit%20grit
 */

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
 
       let productId = req.params.productId
       let reqData = req.body
 
       let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments, isDeleted } = req.body
 
       //check body is empty or not
       if (!Object.keys(reqData).length)
          return res.status(400).send({ status: false, message: "There is no data to update" })
 
       //check id
       if (!mongoose.Types.ObjectId.isValid(productId))
          return res.status(400).send({ status: false, message: "productId is invalid" })
 
       var regName = /^[a-zA-Z0-9]+/
       if (title && (!regName.test(title))) return res.status(400).send({ status: false, message: "title is invalid" })
 
       if (description && (!regName.test(description)))
          return res.status(400).send({ status: false, message: "description is invalid" })
       
       if (price && (!priceRegex.test(price)))
          return res.status(400).send({ status: false, message: "price should be valid format" })
 
       if (currencyId && (currencyId !== "INR"))
          return res.status(400).send({ status: false, message: "currencyId should be in INR. ⚠️" })
 
       if (currencyFormat && (currencyFormat !== "₹"))
          return res.status(400).send({ status: false, message: "currencyFormat should be in ₹. ⚠️" })
 
       if (isFreeShipping && (!typeof isFreeShipping === "boolean"))
          return res.status(400).send({ status: false, message: "isFreeeShopping shoud be true or false" })
 
       if (style && (!regName.test(style)))
          return res.status(400).send({ status: false, message: "style is invalid" })
       if (installments) {
          const num = String(Number(installments));
          if (num == 'NaN') {
             return res.status(400).send({ status: false, message: "Please enter valid installments. ⚠️" })
          }
       }
 
       if (isDeleted && (!typeof isDeleted === "boolean"))
          return res.status(400).send({ status: false, message: "isDeleted shoud be true or false" })//-----------------

       if (availableSizes) {
          if (availableSizes[0] === "[") availableSizes = availableSizes.substring(1, availableSizes.length - 1)
          availableSizes = availableSizes.toUpperCase().split(',').map(x => x.trim())
          // availableSizes = JSON.parse(availableSizes)
          availableSizes = [...new Set(availableSizes)];
          let check = ["S", "XS", "M", "X", "L", "XXL", "XL"]
          for (let i = 0; i < availableSizes.length; i++) {
             if (!check.includes(availableSizes[i])) {
                return res.status(400).send({ status: false, message: 'Size should be only in uppercase - S, XS, M, X, L, XXL, XL. ⚠️' })
 
             }
          }
       }
       let files = req.files
       if (productImage) {
          if (!files || (files && files.length === 0)) {
             return res.status(400).send({ status: false, message: " Please Provide The Product Image ⚠️" });
          }
 
          if (!isImage(files[0].originalname))
             return res.status(400).send({ status: false, message: "Please enter the Image in a Valid format. ⚠️" });
          productImage = await uploadFile(files[0])
       }
       let checkTitle = await productModel.findOne({ title: title });
       if (checkTitle) return res.status(400).send({ status: false, message: "This title is already used. ⚠️" });
       let findProductId = await productModel.findById({ _id: productId })
       if (!findProductId)
          return res.status(404).send({ status: false, message: "productId is not present in Db" })
 
       if (findProductId.isDeleted) return res.status(404).send({ status: false, message: "this product is already deleted" })
 
       // update book
       let updatedData = await productModel.findByIdAndUpdate(productId, reqData, { new: true })
       //console.log(updatedData)
       res.status(200).send({ status: true, message: "upadated successfully", data: updatedData })
    } catch (error) {
 
       return res.status(500).send({ status: false, msg: error })
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

module.exports={createProduct,getProductsById,deleteProduct,updateProduct, getProductsByQuery}

let size = "s, L, T, S,K, M";
size = 's,y'
const arr = ['S', 'M', 'L', 'XL', 'XXL', 'XXL']
size = [...new Set(size.toUpperCase().split(",").map((s)=>s.trim()))];
console.log(size)
{for(let i=0; i<size.length; i++){
   if(arr.indexOf(size[i]) === -1) return console.log("enum err")
}
}
