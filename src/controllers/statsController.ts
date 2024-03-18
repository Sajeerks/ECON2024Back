
import { Response, Request, NextFunction, json } from "express";
import { userModel } from "../models/userModel.js";

import ErrorHandler from "../utils/utilityClass.js";
import { TryCatch } from "../midlleware/error.js";
import { myCache } from "../app.js";
import { productModel } from "../models/productModel.js";
import { orderModel } from "../models/orderModel.js";
import { calculatePercentage, getChartData, getInventories } from "../utils/features.js";


export const getDashboardStats = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let stats;
    const key  ="admin-stats"
    if (myCache.has(key)) {
      stats = JSON.parse(myCache.get(key) as string);
    } else {
      const today = new Date();
    const sixMontsAgo = new Date()
    sixMontsAgo.setMonth(sixMontsAgo.getMonth()-6)





      const thisMonth={
        start:new Date(
            today.getFullYear(),
            today.getMonth(),
            1
          ),
          end:today
      }

      const lastMonth={
        start:new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            1
          ),
          end:new Date(
            today.getFullYear(),
            today.getMonth() ,
            0
          )
      }

  


  const thisMonthProductsPromise =  productModel.find({
     createdAt:{
        $gte:thisMonth.start,
        $lte:thisMonth.end
     }
  })

  const lastMonthProductsPromise =  productModel.find({
    createdAt:{
       $gte:lastMonth.start,
       $lte:lastMonth.end
    }
 })


 const thisMonthUsersPromise =  userModel.find({
    createdAt:{
       $gte:thisMonth.start,
       $lte:thisMonth.end
    }
 })

 const lastMonthUsersPromise =  userModel.find({
   createdAt:{
      $gte:lastMonth.start,
      $lte:lastMonth.end
   }
})


const thisMonthOrdersPromise =  orderModel.find({
    createdAt:{
       $gte:thisMonth.start,
       $lte:thisMonth.end
    }
 })

 const lastMonthOrdersPromise =  orderModel.find({
   createdAt:{
      $gte:lastMonth.start,
      $lte:lastMonth.end
   }
})


const lastSixMonthsAgoPromise = orderModel.find({
    createdAt:{
       $gte:sixMontsAgo,
       $lte:today
    }
 })


const latestTransactionPromise = orderModel.find({}).select(["orderItems", "discount", "total","status"]).limit(4)


const [ 
    
    thisMonthProducts,
    lastMonthProducts,
    thisMonthUsers,
    lastMonthUsers,
    thisMonthOrders,
    lastMonthOrders,
    productsCount,
    usersCount,
   
    totalOrders,
    lastSixMonthOrders,
    categories,
    femaleUserCount,
    latestTransactions

] = await Promise.all([
    thisMonthProductsPromise,
    lastMonthProductsPromise,
    thisMonthUsersPromise,
    lastMonthUsersPromise,
    thisMonthOrdersPromise,
    lastMonthOrdersPromise,
    productModel.countDocuments(),
    userModel.countDocuments(),
    orderModel.find().select("total"),
    lastSixMonthsAgoPromise,
    productModel.distinct("category"),
    userModel.countDocuments({ gender: "female" }),

    latestTransactionPromise
])



const productsChnagePercentage = calculatePercentage(thisMonthProducts.length,lastMonthProducts.length)


const UsersChnagePercentage = calculatePercentage(thisMonthUsers.length,lastMonthUsers.length)


const OrdersChnagePercentage = calculatePercentage(thisMonthOrders.length,lastMonthOrders.length)
  
const thisMonthRevenue = thisMonthOrders.reduce((total, order)=>total+(order.total ||0 ),0)
const lastMonthRevenue = lastMonthOrders.reduce((total, order)=>total+(order.total ||0 ),0)

// console.log({thisMonthRevenue});
// console.log({lastMonthRevenue});

const revenueChangePercentage = calculatePercentage(thisMonthRevenue,lastMonthRevenue)


const changePercent ={
  products : productsChnagePercentage,
  users : UsersChnagePercentage,
  orders : OrdersChnagePercentage,
  revenue:revenueChangePercentage
  
}

const toatalRevenue = totalOrders.reduce((total, order)=>total+(order.total ||0 ),0)
const count ={
    user:usersCount,
    product:   productsCount,
   orders:totalOrders.length
       
}

const orderMonthCounts = new Array(6).fill(0)
const orderMonthlyRevenue = new Array(6).fill(0)

lastSixMonthOrders.forEach((order)=>{
    const creationDate = order.createdAt
    const monthDiff =( today.getMonth() - creationDate.getMonth() +12)%12
    // console.log({monthDiff});

    if(monthDiff< 6){
        orderMonthCounts[6-monthDiff-1] +=1
        orderMonthlyRevenue[6-monthDiff-1] += order.total

    }
})


// const categoriesCountPromise = categories.map((category)=>productModel.countDocuments({category}))

// const categoriesCount = await Promise.all(categoriesCountPromise)

// const cartegoryCount:Record<string,number>[] =[]
// categories.forEach((category,i)=>[
//     cartegoryCount.push({
//         [category]:Math.round((categoriesCount[i]/productsCount)*100)
//     })
// ])


const cartegoryCount:Record<string, number>[] = await getInventories(categories, productsCount)


const modifiedLatestTransactions =latestTransactions.map((i)=>({
    _id:i._id,
    discount:i.discount,
    amount:i.total,
    quantity:i.orderItems.length,
    status:i.status,
}))

const userRatio ={
    male:usersCount-femaleUserCount,
    female:femaleUserCount
}
stats={
    cartegoryCount,
    changePercent,
    toatalRevenue,
    count,
    chart:{
        order:orderMonthCounts,
        revenue:orderMonthlyRevenue
},

userRatio,
latestTransactions:modifiedLatestTransactions
    

}


myCache.set(key, JSON.stringify(stats))

    } ///else ends here



    return res.status(200).json({
      success: true,
      stats,
     
      message: `stats fetched correctely  `,
    });
  }
);

export const getPieCharts = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.query);
let charts
const key ="admin-pie-charts"

if(myCache.has(key)){
  charts = JSON.parse(myCache.get(key) as string)
}else{

  const [
  
  processingOrder,
  shippedOrder,
  deliveredOrder,
  categories,
  productsCount, 
  ourOfStock, 
  allOrdersData ,
  allUsersDataDob,
  adminUsers,
  customerUsers

  ] = await Promise.all([
     orderModel.countDocuments({status:"Processing"}),
     orderModel.countDocuments({status:"Shipped"}),
     orderModel.countDocuments({status:"Delivered"}),
 productModel.distinct("category"),
 productModel.countDocuments(),
 productModel.countDocuments({stock:0}),
 orderModel.find({}).select(["total", "discount", "subtotal", "tax", "shippingCharges"]), 
 userModel.find({}).select(["dob"]),
 userModel.countDocuments({role:"admin"}),
 userModel.countDocuments({role:"user"}),

  ])


  const productCategories:Record<string, number>[] = await getInventories(categories, productsCount)

const orderFullFillment ={
  processing:  processingOrder,
  shipped:shippedOrder,
  delivered:deliveredOrder,
}



const stockAvaliability = {
  inStock:productsCount-ourOfStock, 
  ourOfStock
}


const grossIncome = allOrdersData.reduce((prev, order)=> prev+(order.total || 0), 0)
const discount = allOrdersData.reduce((prev, order)=> prev+(order.discount || 0), 0)

const burnt = allOrdersData.reduce((prev, order)=> prev+(order.tax || 0), 0)

const productionCost = allOrdersData.reduce((prev, order)=> prev+(order.shippingCharges || 0), 0)

const netMargin = grossIncome - productionCost  -burnt - discount

const marketingCost = Math.round((grossIncome*30)/100)
const revenueDistribution  ={
  netMargin ,
  discount,
  productionCost,
  burnt,
  marketingCost,
  grossIncome
}

const adminCustomers = {
  admin:adminUsers,
  customer:customerUsers
}



const usersAgeGroup = {
  teen:allUsersDataDob.filter(i=>i.age<20).length,
  adult:allUsersDataDob.filter(i=> i.age>=20 &&  i.age<40).length,
  old:allUsersDataDob.filter(i=> i.age>=40).length,
}


charts ={
  orderFullFillment,
  productCategories,
  stockAvaliability,
  revenueDistribution,
  adminCustomers,
  usersAgeGroup

}

myCache.set(key, JSON.stringify(charts))




} //else ends here




// myCache.del("admin-pie-charts")

    return res.status(200).json({
      success: true,
charts,
      message: `pie chart data fetched succesfully   `,
    });
  }
);



export const getBarCharts = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const key ="admin-bar-charts"
 let charts 
  if(myCache.has(key)){
    charts =JSON.parse(myCache.get(key) as string)
  }else{
    const today = new Date()
    const sixMonthsAgo  = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth()-6)

    console.log({sixMonthsAgo});


     const twelveMonthAgo  = new Date()
    twelveMonthAgo.setMonth(twelveMonthAgo.getMonth()-12)

    const lastSixMonthsAgoProductsPromise = productModel.find({
      createdAt:{
         $gte:sixMonthsAgo,
         $lte:today
      }
   }).select("createdAt")

   const lastSixMonthsAgoUsersPromise = userModel.find({
    createdAt:{
       $gte:sixMonthsAgo,
       $lte:today
    }
 }).select("createdAt")


   const lastTwelveMonthsAgoOrdersPromise = orderModel.find({
    createdAt:{
       $gte:twelveMonthAgo,
       $lte:today
    }
 }).select("createdAt")

    const [ sixMonthsProducts, sixMonthUsers,twelveMonthOrders] = await Promise.all([
      lastSixMonthsAgoProductsPromise,
      lastSixMonthsAgoUsersPromise,
      lastTwelveMonthsAgoOrdersPromise
      
    ])
    
    const productCounts = getChartData({length:6,today,docArr:sixMonthsProducts})
    const userCounts = getChartData({length:6,today,docArr:sixMonthUsers})
    const orderCounts = getChartData({length:12,today,docArr:twelveMonthOrders})



  charts={
      users:userCounts, 
      product:productCounts,
      order:orderCounts
  }
    myCache.set(key, JSON.stringify(charts))
  }  // end of eelse
    return res.status(200).json({
      success: true,
      charts,
      message: `bar chart data fetched successfully   `,
    });
  }
);



export const getLineCharts = TryCatch(
  
    async (req: Request, res: Response, next: NextFunction) => {
      const key ="admin-line-charts"
   let charts 
    if(myCache.has(key)){
      charts =JSON.parse(myCache.get(key) as string)
    }else{
      const today = new Date()
      const sixMonthsAgo  = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth()-6)
  
       const twelveMonthAgo  = new Date()
      twelveMonthAgo.setMonth(twelveMonthAgo.getMonth()-12)
  
   const baseQuery ={ createdAt:{
    $gte:twelveMonthAgo,
    $lte:today
 }}
  
     const lastTwelveMonthsAgoOrdersPromise = orderModel.find(baseQuery).select(["createdAt", "total","discount"])
     const lastTwelveMonthsAgoUsersPromise = userModel.find(baseQuery).select("createdAt")
     const lastTwelveMonthsAgoProuctssPromise = productModel.find(baseQuery).select("createdAt")

  
      const [ orders, users,products] = await Promise.all([

        lastTwelveMonthsAgoOrdersPromise,lastTwelveMonthsAgoUsersPromise,lastTwelveMonthsAgoProuctssPromise
        
      ])
      
  
      const userCounts = getChartData({length:12,today,docArr:users})
      const productCounts = getChartData({length:12,today,docArr:products})
      const orderCounts = getChartData({length:12,today,docArr:orders})

      const total = getChartData({length:12,today,docArr:orders, property:"total"})
      const discount = getChartData({length:12,today,docArr:orders, property:"discount"})


  
  
  
    charts={
  users:userCounts,
  products:productCounts,
        order:orderCounts,
        total,
        discount
    }
      myCache.set(key, JSON.stringify(charts))
    }  // end of eelse
      return res.status(200).json({
        success: true,
        charts,
        message: `line chart data fetched successfully   `,
      });
    }
  );
  