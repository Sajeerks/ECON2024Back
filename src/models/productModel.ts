import mongoose from "mongoose";



const productSchema = new mongoose.Schema({
    

    photo:{
        type:String, 
        required:[true, "please enter  product photo"]
    },


    name:{
        type:String,
        required:[true, "please enter  the  product name"]
    },


    price:{
        type:Number,
        required:[true, "please enter  the product price"]
    },

    stock:{
        type:Number,
        required:[true, "please enter  the product stock"]
    },
    category:{
        type:String,
        required:[true, "please enter  the product category"],
        trim:true
    },




}, {
    timestamps:true
})



export const productModel = mongoose.model("productModel", productSchema)