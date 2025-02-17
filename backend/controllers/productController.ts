import { NextFunction, Request, Response } from "express";
import asyncHandler from "../middlewares/asyancHandelr";
import Product from "../models/productModel";
import createError from "../utils/errorCreate";
import deleteFile from "./../utils/deleteFile";
import mongoose, { Types } from "mongoose";
import Category from "./../models/categoryModel";
import Order from "../models/orderModel";
const createProduct = asyncHandler(async (req: Request, res: Response) => {
  req.body.image = req.file?.path
    ? req.file?.path.replace(/\\/g, "/")
    : req.body.image[0].replace(/\\/g, "/");
  const { name, brand, category, price, description, image } = req.body;
  switch (true) {
    case !name?.trim() || !name:
      throw createError.createError(400, "Name Is Required", "Bad Request");
    case !brand?.trim() || !brand:
      throw createError.createError(400, "Brand Is Required", "Bad Request");
    case !category?.trim() || !category:
      throw createError.createError(400, "Category Is Required", "Bad Request");
    case !price || price <= 0:
      throw createError.createError(400, "Price Is Required", "Bad Request");
    case !description?.trim() || !description:
      throw createError.createError(
        400,
        "Description Is Required",
        "Bad Request"
      );
    case !image?.trim() || !image:
      throw createError.createError(400, "Image Is Required", "Bad Request");
    default: {
      const product = await Product.create(req.body);

      res.status(201).json({
        success: true,
        message: "Product Created Successfully",
        data: product,
      });
    }
  }
});

const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await Product.findByIdAndDelete(id);

  if (product) {
    deleteFile(product.image);
  }

  res.status(200).json({
    success: true,
    message: "Product Deleted Successfully",
    data: product,
  });
});
const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  req.body.image = req.file?.path
    ? req.file?.path.replace(/\\/g, "/")
    : req.body.image[0].replace(/\\/g, "/");
  const { name, brand, category, price, description, image } = req.body;
  const { id } = req.params;

  switch (true) {
    case !name?.trim() || !name:
      throw createError.createError(400, "Name Is Required", "Bad Request");
    case !brand?.trim() || !brand:
      throw createError.createError(400, "Brand Is Required", "Bad Request");
    case !category?.trim() || !category:
      throw createError.createError(400, "Category Is Required", "Bad Request");
    case !price || price <= 0:
      throw createError.createError(400, "Price Is Required", "Bad Request");
    case !description?.trim() || !description:
      throw createError.createError(
        400,
        "Description Is Required",
        "Bad Request"
      );
    case !image?.trim() || !image:
      throw createError.createError(400, "Image Is Required", "Bad Request");
    default: {
      const newProduct = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!newProduct) {
        throw createError.createError(404, "Product Not Found", "Not Found");
      }
      res.status(200).json({
        success: true,
        message: "Product Updated Successfully",
        data: newProduct,
      });
    }
  }
});
const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const productsCount = await Product.countDocuments();
  const products = await Product.find({})
    .populate("category reviews.user")
    .skip(skip)
    .limit(limit);
  res.status(200).json({
    success: true,
    message: "Products Found",
    data: products,
    count: productsCount,
    page: page,
    pages: Math.ceil(productsCount / limit),
  });
});
const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate("category reviews.user");
  if (!product) {
    throw createError.createError(404, "Product Not Found", "Not Found");
  }
  res.status(200).json({
    success: true,
    message: "Product Found",
    data: product,
  });
});
const addProductReview = asyncHandler(async (req: any, res: Response) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw createError.createError(404, "Product Not Found", "Not Found");
  }
  const alreadyReviewed = product.reviews.find(
    (r: any) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    throw createError.createError(
      400,
      "Product Already Reviewed",
      "Bad Request"
    );
  }

  const review = {
    name: req.user.username,
    rating: Number(rating),
    comment,
    user: req.user._id,
  };
  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc: any, item: any) => item.rating + acc, 0) /
    product.reviews.length;
  await product.save();
  res.status(200).json({
    success: true,
    message: "Review Added Successfully",
    data: {
      productId: product._id,
      ...review,
    },
  });
});
const getTopProducts = asyncHandler(async (req: Request, res: Response) => {
  const products = await Product.find({})
    .populate("category reviews.user")
    .sort({ rating: -1 })
    .limit(16);
  res.status(200).json({
    success: true,
    message: "Top Products Found",
    data: products,
  });
});
const getNewProducts = asyncHandler(async (req: Request, res: Response) => {
  const products = await Product.find({})
    .populate("category reviews.user")
    .sort({ createdAt: -1 })
    .limit(16);
  res.status(200).json({
    success: true,
    message: "New Products Found",
    data: products,
  });
});
const getProductsByCAtegory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (id) {
      const categoryId = new Types.ObjectId(id);
      const products = await Product.find({
        category: categoryId,
      });
      console.log("[200] get products by category success : ", id);
      res.status(200).json({
        success: true,
        message: "Products Found",
        data: products,
      });
    }
  }
);
const getFilterProducts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.query);
    const { category, brand, price } = req.query;

    let query: any = {};

    if (category) {
      const categoryStr = Array.isArray(category)
        ? category
        : (category as string).split(",");
      query.category = {
        $in: categoryStr,
      };
    }

    if (brand) {
      let brandStr = Array.isArray(brand)
        ? brand
        : (brand as string).split(",");
      brandStr = brandStr.map((brand: any) => {
        return brand.replace("%20", " ");
      });

      const brandConditions = brandStr.map((brand: any) => ({
        $or: [{ brand: brand }, { brand: { $regex: brand, $options: "i" } }],
      }));

      query.$or = brandConditions;
    }

    if (price) {
      query.price = { $lte: Number(price) };
    }

    try {
      const products = await Product.find(query).populate("category");

      res.status(200).json({
        success: true,
        message: "Products Found",
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }
);
const getBrandsByCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { category } = req.query;

    let query: any = {};

    if (category) {
      const categoryStr = Array.isArray(category)
        ? category
        : (category as string).split(",");
      query.category = {
        $in: categoryStr,
      };
    }
    const productsBrand = await Product.find(query)
      .select("brand -_id")
      .distinct("brand");

    if (productsBrand.length === 0) {
      throw createError.createError(404, "Brands Not Found", "Not Found");
    }
    console.log("[200] get brands by category success : ", category);

    res.status(200).json({
      success: true,
      message: "Brands Found",
      data: productsBrand,
    });
  }
);
const getTopProductsByQuarter = asyncHandler(
  async (req: Request, res: Response) => {
    const salesData = await Order.aggregate([
      {
        $match: {
          isPaid: true,
        },
      },
      { $unwind: "$orderItems" },

      {
        $group: {
          _id: {
            product: "$orderItems.product",
            year: { $year: "$createdAt" },
            quarter: {
              $cond: [
                { $lte: [{ $month: "$createdAt" }, 3] },
                1,
                {
                  $cond: [
                    { $lte: [{ $month: "$createdAt" }, 6] },
                    2,
                    {
                      $cond: [{ $lte: [{ $month: "$createdAt" }, 9] }, 3, 4],
                    },
                  ],
                },
              ],
            },
          },
          totalSales: { $sum: "$orderItems.qty" },
        },
      },

      {
        $sort: {
          totalSales: -1,
        },
      },
      {
        $group: {
          _id: "$_id.product",
          salesData: {
            $push: {
              quarter: "$_id.quarter",
              year: "$_id.year",
              totalSales: "$totalSales",
            },
          },
          totalSalesOverall: { $sum: "$totalSales" },
        },
      },
      {
        $sort: {
          totalSalesOverall: -1,
        },
      },
      { $limit: 4 },

      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          name: "$productDetails.name",
          totalSales: 1,
          salesData: 1,
          totalSalesOverall: 1,
        },
      },
    ]);

    res.json(salesData);
  }
);
export {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  addProductReview,
  getTopProductsByQuarter,
  getTopProducts,
  getNewProducts,
  getProductsByCAtegory,
  getFilterProducts,
  getBrandsByCategory,
};
