const Product= require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify= require("slugify");
const createProduct=asyncHandler(async ( req,res) => {
    try{
        if(req.body.title){
            req.body.slug =slugify(req.body.title);
        }
        const newProduct =await Product.create(req.body);
        res.json(newProduct);
    }catch (error) {
        throw new Error(error);
    }
});


const updateProduct = asyncHandler(async (req, res) => {
    const id = req.params.id; // Corrected parameter extraction
    const tit = req.body.title;
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const updateObject = { title: req.body.title, slug: req.body.slug }; // Updated update object
        const updateProduct = await Product.findOneAndUpdate({ _id: id }, updateObject, {
            new: true,
        });
        console.log(updateProduct, "tktk");
        res.json(updateProduct);
    } catch (error) {
        throw new Error(error);
    }
});

//delete product
const deleteProduct = asyncHandler(async (req,res) => {
    const id =req.params.id;
 try{
const deleteProduct =await Product.findOneAndDelete(id)
res.json(deleteProduct);
 }  catch (error){
    throw new Error(error);
 } 
});



const getaProduct =asyncHandler(async (req,res) => {
    const{ id }  =req.params;
    try{
        const findProduct =await Product.findById(id);
        res.json(findProduct);
    }
    catch (error){
        throw new Error (error);
    }

});

const getAllProduct = asyncHandler(async (req, res) => {
    try {
        //Filtering
        const queryObj = {...req.query};
        const exculdeFields = [ "page" ,"sort" , "limit", "fields"];
        exculdeFields.forEach((el) => delete queryObj[el]);

let querystr =JSON.stringify(queryObj);
querystr =querystr.replace(/\b(gte|gt|lte|lt)\b /g,match => `$${match}`);
  
let query = Product.find(JSON.parse(querystr));

//Sorting

if(req.query.sort){
    const sortBy= req.query.sort.split(',').join(" ");
        query= query.sort(sortBy);
}else{
    query =query.sort('-createdAt');
}

//limiting the fields

if(req.query.fields)
{
    const fields =req.query.fields.split(",").join(" ");
    query = query.select(fields);
}else{
    query= query.select('-__v');
}

//pagination 

const page= req.query.page;
const limit=req.query.limit;
const skip=(page -1) *limit;
query =query.skip(skip).limit(limit);
if(req.query.page){
    const productCount=await Product.countDocuments();
if(skip>= productCount) throw new Error ('This Page does not exists');
}
console.log(page,limit,skip);
const products = await query;
    
        res.json(products);
    } catch (error) {
        throw new Error(error);
    }
});







module.exports= {
    createProduct , 
    getaProduct, 
    getAllProduct,
    updateProduct,
deleteProduct};