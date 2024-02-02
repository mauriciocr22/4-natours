const express = require("express");
const path = require("path")
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp")

const AppError = require("./utils/appError");
const errorHandler = require("./controllers/errorController");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(helmet())

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour."
});

app.use("/api", limiter);

app.use(express.json({
  limit: "10kb"
}));

app.use(mongoSanitize());
app.use(xss())
app.use(hpp({
  whitelist: [
    "duration",
    "ratingsQuantity",
    "ratingsAverage",
    "maxGroupSize",
    "difficulty",
    "price"
  ]
}));
app.use((request, response, next) => {
  request.requestTime = new Date().toISOString();
  next();
});

app.get("/", (request, response) => {
  response.status(200).render("base")
})

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

app.all("*", (request, response, next) => {
  next(new AppError(`Can't find ${request.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

module.exports = app;
