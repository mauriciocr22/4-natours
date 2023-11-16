const express = require("express");
const morgan = require("morgan");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((request, response, next) => {
  request.requestTime = new Date().toISOString();
  next();
});

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (request, response, next) => {
  // response.status(404).json({
  //   status: "fail",
  //   message: `Can't find ${request.originalUrl} on this server!`,
  // });

  const err = new Error(`Can't find ${request.originalUrl} on this server!`);
  err.status = "fail";
  err.statusCode = 404;

  next(err);
});

app.use((err, request, response, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  response.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;
