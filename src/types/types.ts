import { NextFunction, Request, Response } from "express";

export interface NewUserRequestBody {
  name: string;
  email: string;
  photo: string;
  gender: string;
  role: string;
  _id: string;
  dob: Date;
}




export interface NewProductRequestBody {
  name: string;


  price:number;
  stock:number;
  category: string;

 
 
}
export type ControllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>

export type SearchRequestQuery = {
  search?:string ;
  price?:number ;
  category?:string ;
  sort?:string ;
  page?:number;

}

export interface BaseQueryType{
  name?:{
  $regex:string,
  $options:string
  },
  price?:{
    $lte:number
  }, 
  category?:string
}



export type InvalidateCacheProps ={
  product?:boolean ;
  order?:boolean ;
  admin?:boolean ;
  userId?:string;
  orderId?:string;
  produtId?:string | string[];


}


export interface OrderItemsType {
  name: string;
  photo: string;
  price: number;
  quantity: number;
  productId: string;



  
}
export interface NewOrderRequestBody{
  shippingInfo:ShippingInfoType
  subTotal: number;
  tax: number;
  shippingCharges: number;
  discount: number;
  total: number;
  status: "Processing" | "Shipped" | "Delivered";
  orderItems:OrderItemsType[];
  user:string 

}

export type ShippingInfoType ={
  address:string 
city:string 
state:string 
country:string 
pinCode:number 

 


}




