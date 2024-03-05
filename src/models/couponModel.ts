import mongoose from "mongoose";


const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required:  [true, "Please enter the Discount Coupon"],
        unique: true,
      },
      amount: {
        type: Number,
        required: [true, "Please enter the Discount Amount"],
      },


})



export const couponModel = mongoose.model("couponModel", couponSchema)


