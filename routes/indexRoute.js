const authRoute = require("./authRoute");
const userRoute = require("./userRoute");
const categoryRoute = require("./categoryRoute");
const subCategoryRoute = require("./subCategoryRoute");
const productRoute = require("./productRoute");
const wishlistRoute = require("./wishlistRoute");
const addressRoute = require("./addressRoute");
const couponRoute = require("./couponRoute");
const cartRoute = require("./cartRoute");
const orderRoute = require("./orderRoute");

const mountRoutes = (app) => {
  app.use("/auth", authRoute);
  app.use("/user", userRoute);
  app.use("/category", categoryRoute);
  app.use("/subcategory", subCategoryRoute);
  app.use("/product", productRoute);
  app.use("/wishlist", wishlistRoute);
  app.use("/address", addressRoute);
  app.use("/coupon", couponRoute);
  app.use("/cart", cartRoute);
  app.use("/order", orderRoute);

  app.use("/", (req, res, next) => {
    res.send("Server Is Running");
  });
};

module.exports = mountRoutes;
