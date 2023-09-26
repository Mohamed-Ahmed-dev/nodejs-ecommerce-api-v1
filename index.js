const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");

const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");
const dbConnection = require("./config/database");
const mountRoutes = require("./routes/mountRoutes");
const { webhookCheckout } = require("./services/orderService");

dotenv.config({ path: "config.env" });

// Connect with db
dbConnection();

// express app
const app = express();

// Enable other domains to access your application
app.use(cors());
app.options("*", cors());

// compress all responses
app.use(compression());

// checkout webhook ==> to get the event from stripe
app.post(
  "/checkout-webhook",
  express.raw({ type: "application/json" }),
  webhookCheckout
);

// Middlewares
app.use(express.json());
// sarve upload files👇👇
app.use(express.static(path.join(__dirname, "uploads")));

//? loging requests
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

//? Mount Routes
mountRoutes(app);

//  if the route not found up ==> do this middleware
app.all("*", (req, res, next) => {
  next(new ApiError(`can't find this route: ${req.originalUrl}`, 400));
});

// ! global error handling Middlewares for express errors
app.use(globalError);

// ? import port from config.env
const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

//? Event ==> to catch any rejection outside express .....
process.on("unhandledRejection", (err) => {
  console.error(`unhandled rejection: ${err.name} | ${err.message}`);
  server.close(() => {
    console.log("shutting down....");
    process.exit(1);
  });
});
