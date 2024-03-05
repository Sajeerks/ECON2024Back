import { Response, Request, NextFunction, json } from "express";


import ErrorHandler from "../utils/utilityClass.js";
import { TryCatch } from "../midlleware/error.js";
import { productModel } from "../models/productModel.js";
import { rm } from "fs";
import {faker} from '@faker-js/faker'
import { myCache } from "../app.js";
import { invalidateCache, reduceStock } from "../utils/features.js";
import { NewOrderRequestBody } from "../types/types.js";
import { orderModel } from "../models/orderModel.js";



export const createNewOrder = TryCatch(
  async (req: Request<{}, {}, NewOrderRequestBody>, res: Response, next: NextFunction) => {
    // console.log(req.query);
    console.log(req.body);
    let {shippingInfo,
      subTotal,
      tax,
      shippingCharges,
      discount,
      total,
      // status,
      orderItems,
      user
      } = req.body 

         if(!shippingInfo ||
           !subTotal ||
           !tax ||
          //  !shippingCharges ||
          //  !discount ||
           !total ||
          //  !status ||
           !orderItems ||
           !user
            ){
            return next(new ErrorHandler('please enter all fildss', 400))
           }

  const order = await  orderModel.create({
    shippingInfo,
    subTotal,
    tax,
    shippingCharges,
    discount,
    total,
    // status,
    orderItems,
    user
    
  })

 await  reduceStock(orderItems)

  await invalidateCache({product:true , order:true, admin:true , userId:user,  produtId:order.orderItems.map(i=>String(i.productId))})

    return res.status(201).json({
      success: true,
      order,
      message: `new order Created  `,
  
    });
  }
);




export const myOrders = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.query);

    const {id:user} = req.query
console.log({user});
    let myOrders= []
    const key =`myorders-${user}`
    if(myCache.has(key)){
      myOrders = JSON.parse(myCache.get(key) as string)
    }else{
      myOrders =  await orderModel.find({user})
      myCache.set(key, JSON.stringify(myOrders))
    }
    
  
    return res.status(200).json({
      success: true,
      myOrders,
      myordersLength:myOrders.length,
      message: `my orders fetched  `,
  
    });
  }
);







export const allOrders = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.query);


    let allOrders= []
    const key =`allOrders`
    if(myCache.has(key)){
      allOrders = JSON.parse(myCache.get(key) as string)
    }else{
      allOrders =  await orderModel.find().populate("user", "name")
      myCache.set(key, JSON.stringify(allOrders))
    }
    

    return res.status(200).json({
      success: true,
      allOrders,
      totalNoOfOrders:allOrders.length,
      message: `allorders fetched  `,
  
    });
  }
);




export const singleOrder = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.query);

 const  {id} = req.params
    let singleOrder
    const key =`order-${id}`
    if(myCache.has(key)){
      singleOrder = JSON.parse(myCache.get(key) as string)
    }else{
      singleOrder =  await orderModel.findById(id).populate("user", "name")
      if(!singleOrder){
        return next (new ErrorHandler(`order with id-${id} not found`, 400))
      }
      myCache.set(key, JSON.stringify(singleOrder))
    }
    
    // await invalidateCache({product:true , order:true, admin:true , userId:singleOrder.user})
    return res.status(200).json({
      success: true,
      singleOrder,
   
      message: `allorders fetched  `,
  
    });
  }
);

export const processOrder = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
  
    const order = await orderModel.findById(req.params.id)

    if(!order){
      return next(new ErrorHandler(`order with id- ${req.params.id} not found`, 404))
    }
  switch (order.status) {
    case "Processing":
       order.status = "Shipped"
      break;
      case "Shipped":
        order.status = "Delivered"
       break;
    default:
      order.status= "Delivered"
      break;
  }

  await order.save()


  await invalidateCache({product:true , order:true, admin:true , userId:order.user,orderId: order._id.toString()})

    return res.status(200).json({
      success: true,
     order,
      message: `order processing successfully  `,
  
    });
  }
);


export const deleteOrder = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.query);

 const  {id} = req.params
   
 
      let singleOrder =  await orderModel.findById(id).populate("user", "name")
      if(!singleOrder){
        return next (new ErrorHandler(`order with id-${id} not found`, 400))
 
      }
 await singleOrder.deleteOne()

 await invalidateCache({product:true , order:true, admin:true , userId:singleOrder.user,orderId: singleOrder._id.toString(), })
    return res.status(200).json({
      success: true,
 
   
      message: `roder with id-${id} was deleted successfully   `,
  
    });
  }
);
