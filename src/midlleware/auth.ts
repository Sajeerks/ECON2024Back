import { userModel } from "../models/userModel.js";
import ErrorHandler from "../utils/utilityClass.js";
import { TryCatch } from "./error.js";



export const adminOnly= TryCatch(async(req, res, next)=>{
    const {id} = req.query
    // console.log("req.qeyr in auth", req.query);
    if(!id){
        return next(new ErrorHandler("please login frst",401),)
    }

    const user = await userModel.findById(id)
    if(!user) return next( new ErrorHandler("fake id", 404))

    if(user.role !== "admin") return next( new ErrorHandler(" only admin can access this resource", 404))
   next()
 
})