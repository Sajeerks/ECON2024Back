import mongoose from "mongoose";
import { InvalidateCacheProps, OrderItemsType } from "../types/types.js";
import { myCache } from "../app.js";
import { productModel } from "../models/productModel.js";
import { orderModel } from "../models/orderModel.js";
import { Document } from "mongoose";

export const connectDB =(uri:string) =>{
    mongoose.connect(uri, {
        dbName:"Ecom2024Type"
    }).then(c=>console.log(`mongoose connected to ${c.connection.host}`))
    .catch(e=>console.log(e))
}

export const invalidateCache =async({product, order, admin, userId,orderId,produtId}:InvalidateCacheProps)=>{

  if(product){
   const productKeys :string[]=["categories","allproductsAdmin","latestProducts",   ]
  if(typeof product === "string"){
    productKeys.push( `product-${produtId}`)
  }
if(typeof produtId  === "object" ){
  produtId.forEach(i => {
        productKeys.push(`product-${i}`)
        
    });
    // console.log("loggggggggggg");
}



   myCache.del(productKeys)




  }

  if(order){
    const orderKeys :string[]= ["allOrders",`myorders-${userId}`,`order-${orderId}`]
  


myCache.del(orderKeys)
  }
  if(admin){
    const adminKeys:string[] = ["admin-stats","admin-pie-charts",
  "admin-bar-charts","admin-line-charts"
  ]

  myCache.del(adminKeys)
  }
}


export const reduceStock =async(orderItems:OrderItemsType[])=>{
   for (let i = 0; i < orderItems.length; i++) {
    const order = orderItems[i]
    const product = await productModel.findById(order.productId.toString())
      if(!product) throw new Error("product not found")

      product.stock -= order.quantity

      await product.save()

    
   }
}


export const calculatePercentage =(thisMonth:number, lastMonth:number)=>{


   const percent:number =  ( (lastMonth-thisMonth )/ lastMonth)*100
  return  Number( percent.toFixed(0))

}


export const getInventories =async (categories:string[], productsCount:number)=>{
  const categoriesCountPromise = categories.map((category)=>productModel.countDocuments({category}))



const categoriesCount= await Promise.all(categoriesCountPromise)

const cartegoryCount:Record<string,number>[] =[]
categories.forEach((category,i)=>[
    cartegoryCount.push({
        [category]:Math.round((categoriesCount[i]/productsCount)*100)
    })
])

return   cartegoryCount
}


interface MyDocument extends Document{
  createdAt:Date;
  discount?:number;
  total?:number;
}

type Func1Type={
   length:number;
   docArr:MyDocument[];
   today:Date;
   property?:"discount" |  "total"
}

export const getChartData =({length,docArr, today ,property}:Func1Type)=>{
  const data = new Array(length).fill(0)
 
  docArr.forEach((i)=>{
    const creationDate = i.createdAt
    const monthDiff =( today.getMonth() - creationDate.getMonth() +12)%12
    // console.log({monthDiff});

    if(monthDiff< length){

      if(property){
        data[length-monthDiff-1] += i[property]
      }else{
        data[length-monthDiff-1] +=1
      }
    
      

    }
})

return data

}