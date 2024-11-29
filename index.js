const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const compression = require("compression");

const mountRoutes = require("./routes/indexRoute.js");
const dbConnection = require("./config/db.js");
const globalError = require("./Middleware/error.js");
const apiError = require("./Utils/apiError.js");

const app = express();

app.use(cors());
app.options("*", cors());
app.use(compression()); 

dotenv.config({ path: "config.env" });

dbConnection();

app.use(express.json());

app.use(express.static(path.join(__dirname, "uploads")));

mountRoutes(app);

app.all("*", (req, res, next) => {
  next(new apiError(`Cannot Find This Route: ${req.originalUrl}`, 400));
});

app.use(globalError);


const port = process.env.PORT;
app.listen(port || 6000, () => {
  console.log(`Server Is Running On http://localhost:${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(`Unhandled Rejection Error: ${err.name} | ${err.message}`);
  server.close(() => {
    console.log("Shuting Down....");
    process.exit(1);
  });
});
