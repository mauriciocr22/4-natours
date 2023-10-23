const Tour = require("../models/tourModel");

exports.checkBody = (request, response, next) => {
  if (!request.body.name || !request.body.price) {
    return response.status(400).json({
      status: "fail",
      message: "Missing price or name",
    });
  }
  next();
};

exports.getAllTours = (request, response) => {
  response.status(200).json({
    status: "success",
    reuestedAt: request.requestTime,
    // results: tours.length,
    // data: {
    //   tours,
    // },
  });
};

exports.getTour = (request, response) => {
  const id = request.params.id * 1;
  // const tour = tours.find((element) => element.id === id);

  // response.status(200).json({
  //   status: "success",
  //   data: {
  //     tours: tour,
  //   },
  // });
};

exports.createTour = (request, response) => {
  response.status(201).json({
    status: "success",
    data: {
      tour: newTour,
    },
  });
};

exports.updateTour = (request, response) => {
  response.status(200).json({
    status: "success",
    data: {
      tour: "<Updated tour here...",
    },
  });
};

exports.deleteTour = (request, response) => {
  response.status(204).json({
    status: "success",
    data: null,
  });
};
