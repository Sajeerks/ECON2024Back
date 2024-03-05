import { Response, Request, NextFunction } from "express";
import { userModel } from "../models/userModel.js";
import {
  BaseQueryType,
  NewProductRequestBody,
  NewUserRequestBody,
  SearchRequestQuery,
} from "../types/types.js";
import ErrorHandler from "../utils/utilityClass.js";
import { TryCatch } from "../midlleware/error.js";
import { productModel } from "../models/productModel.js";
import { rm } from "fs";
import {faker} from '@faker-js/faker'
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";



export const getAllProducts = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.query);
    let products 

    if(myCache.has("allproductsAdmin")){
      products = JSON.parse(myCache.get("allproductsAdmin") as string)
    }else{
      products = await productModel.find();
      myCache.set("allproductsAdmin", JSON.stringify(products))
    }

    if (!products) {
      return next(new ErrorHandler("users not found", 404));
    }
    return res.status(200).json({
      success: true,
      products,
      message: `all products fetched  `,
      totalNoOfProducts : products.length
    });
  }
);

export const createNewProduct = TryCatch(
  async (
    req: Request<{}, {}, NewProductRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    // console.log(req.query);
    const {
      name,

      price,
      stock,
      category,
    } = req.body;

    const photo = req.file;
    if (!photo) return next(new ErrorHandler("Please add Photo", 400));

    if (!name || !price || !stock || !category) {
      rm(photo.path, () => {
        console.log("Photo deleted");
      });
      return next(new ErrorHandler("please enter all fields", 400));
    }

    const product = await productModel.create({
      name,

      photo: photo?.path,
      price,
      stock,
      category: category.toLowerCase(),
    });

await invalidateCache({product:true, admin:true})

    return res.status(201).json({
      success: true,
      product,
      message: ` products created successfully  `,
    });
  }
);

export const getLatestProducts = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.query);

    let latestProducts
    
if(myCache.has("latestProducts")) {
  latestProducts = JSON.parse(myCache.get("latestProducts") as string)
}else{
  latestProducts = await productModel
  .find({})
  .sort({ createdAt: -1 })
  .limit(5);

myCache.set("latestProducts", JSON.stringify(latestProducts))
}




    // if (!latestProducts) {
    //   return next(new ErrorHandler("products not found", 404));
    // }
    return res.status(200).json({
      success: true,
      latestProducts,
      message: ` latestProducts  5 products fetched  `,
    });
  }
);

export const getAllCategories = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.query);
    let categories = await productModel.distinct("category");
   if(myCache.has("categories")){
    categories = JSON.parse(myCache.get("categories") as string)
   }else{
    categories = await productModel.distinct("category");
    myCache.set("categories" , JSON.stringify(categories))
   }



    if (!categories) {
      return next(new ErrorHandler("categoreies not found", 404));
    }
    return res.status(200).json({
      success: true,
      categories,
      message: ` categories fetched  `,
    });
  }
);

export const getSingleProduct = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.query);
    let product
    const id  = req.params.id

    if(myCache.has(`prodcut-${id}`)){

product =JSON.parse( myCache.get(`product-${id}`) as string)
    }else{
      product = await productModel.findById(id);
    if (!product) {
      return next(new ErrorHandler(`prodduct with id ${req.params.id} not found`, 404));
    }
     myCache.set(`product-${id}`, JSON.stringify(product))

    }

  


    return res.status(200).json({
      success: true,
      product,
      message: ` product fetched  `,
    });
  }
);

export const updateSingleProduct = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let product = await productModel.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler(`prodduct with id ${req.params.id}`, 404));
    }
    const {
      name,

      price,
      stock,
      category,
    } = req.body;

    console.log(req.body);
    const photo = req.file;
    //   if (!photo) return next(new ErrorHandler("Please add Photo", 400));

    //   if (!name || !price || !stock || !category) {
    //     rm(photo.path, () => {
    //       console.log("Photo deleted in update product");
    //     });
    //     return next(new ErrorHandler("please enter all fields", 400));
    //   }

    console.log(photo);
    if (photo) {
      rm(product.photo!, () => {
        console.log("OLd Photo deleted in update product");
      });

      product.photo = photo.path;
    }

    if (name) product.name = name;
    if (price) product.price = price;
    if (stock) product.stock = stock;
    if (category) product.category = category;

    await product.save();
    await invalidateCache({product:true, produtId:String(product._id),admin:true})
    return res.status(200).json({
      success: true,
      product,
      message: ` product updated successuly  `,
    });
  }
);

export const deleteSingleProduct = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.query);
    let product = await productModel.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler(`prodduct with id ${req.params.id} not found`, 404));
    }
    rm(product.photo!, () => {
      console.log("deleted photo  in deletesingle product ");
    });

    await product.deleteOne();

    await invalidateCache({product:true, produtId:String(product._id), admin:true})

    return res.status(200).json({
      success: true,

      message: ` product delted  `,
    });
  }
);

export const getFilteredRProducts = TryCatch(
  async (
    req: Request<{}, {}, {}, SearchRequestQuery>,
    res: Response,
    next: NextFunction
  ) => {
    // console.log(req.query);
    const { search, price, category, sort } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;

    const baseQuery: BaseQueryType = {};

    if (search) {
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };
    }
    if (price) {
      baseQuery.price = {
        $lte: Number(price),
      };
    }

    if (category) {
      baseQuery.category = category;
    }


    const productPromise =  productModel.find(baseQuery).sort(sort && {price:sort==="asc"?1:-1}).limit(limit).skip(skip)
const [ products, filteredOnlyProduct] = await Promise.all([

  productPromise,
productModel.find(baseQuery)
])

//     let products = await productModel.find(baseQuery).sort(sort && {price:sort==="asc"?1:-1}).limit(limit).skip(skip)

//  const filteredOnlyProduct = await productModel.find(baseQuery)

const totalPages = Math.ceil(filteredOnlyProduct.length/limit)

    if (!products) {
      return next(new ErrorHandler("products not found", 404));
    }
    return res.status(200).json({
      success: true,
      products,
      totalPages,
      message: ` filtered products fetched  `,
    });
  }
);


const generateRandomProducts = async (count: number = 10) => {
  const products = [];

  for (let i = 0; i < count; i++) {
    const product = {
      name: faker.commerce.productName(),
      photo: "uploads/65fe0822-c5a2-4b6c-8fc5-ed2dc18ca17f.jpg",
      price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
      stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
      category: faker.commerce.department(),
      createdAt: new Date(faker.date.past()),
      updatedAt: new Date(faker.date.recent()),
      __v: 0,
    };

    products.push(product);
  }

  await productModel.create(products);

  console.log({ succecss: true });
};

// generateRandomProducts(40)

// const deleteRandomsProducts = async (count: number = 10) => {
//   const products = await Product.find({}).skip(2);

//   for (let i = 0; i < products.length; i++) {
//     const product = products[i];
//     await product.deleteOne();
//   }

//   console.log({ succecss: true });
// };


