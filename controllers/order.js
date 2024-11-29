const asyncHandler = require("express-async-handler");
const apiError = require("../Utils/apiError");
const factory = require("./handlersFactory");

const Order = require("../models/orderModel");
const cartModel = require("../models/cartModel");
const ProductModel = require("../models/productModel");

exports.createCashOrder = asyncHandler(async (req, res, next) => {
  let shippingPrice = 0;
  if (req.body.shippingMethod == "none") {
    shippingPrice = 0;
  } else if (req.body.shippingMethod == "home") {
    shippingPrice = 70;
  } else if (req.body.shippingMethod == "station") {
    shippingPrice = 35;
  } else {
    res.send("Invalid Shipping Type");
  }

  const cart = await cartModel.findOne({ user: req.user._id });
  if (!cart) {
    return next(new apiError("No Cart For This User", 404));
  }

  let cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;
  let totalOrderPrice = cartPrice + shippingPrice;

  let isFirstOrder = await Order.findOne({ user: req.user._id });
  if (!isFirstOrder) {
    totalOrderPrice -= (totalOrderPrice * 10) / 100;
  }

  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });
  order.isCreated = true;
  order.createdAt = Date.now();
  await order.save();

  await cartModel.findByIdAndDelete(req.params.cartId);

  res.status(201).json({ status: "Success", data: order });
});

exports.acceptOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.cartItems.map(async (item) => {
      await ProductModel.findByIdAndUpdate(
        item.product,
        { $inc: { quantity: -item.quantity, sold: +item.quantity } },
        { new: true }
      );
    });
  }
  order.isAccepted = true;
  order.acceptedAt = Date.now();
  await order.save();

  res.status(201).json({ status: "Success", data: order });
});

exports.createFilterObject = asyncHandler(async (req, res, next) => {
  if (req.user.role == "user") {
    req.filterObject = { user: req.user._id };
  }
  next();
});

exports.getAllOrders = factory.getAll(Order);

exports.getSpecificOrder = factory.getOne(Order);

exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new apiError("No Order For This User", 404));
  }
  order.isPaid = true;
  order.paidAt = Date.now();
  const updatedOrder = await order.save();
  res.status(200).json({ status: "Success", data: updatedOrder });
});

exports.updateOrderToDeliverd = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new apiError("No Order For This User", 404));
  }
  order.isDeliverd = true;
  order.deliverdAt = Date.now();
  const updatedOrder = await order.save();
  res.status(200).json({ status: "Success", data: updatedOrder });
});
