const Tour = require("../models/tourModel");

exports.getAllTours = async (request, response) => {
  try {
    const queryObj = { ...request.query };
    const excludedFields = ["page", "sort", "limit", "fields"];

    excludedFields.forEach((el) => delete queryObj[el]);

    console.log(request.query, queryObj);

    const query = Tour.find(queryObj);

    // const query = Tour.find()
    //   .where("duration")
    //   .equals(5)
    //   .where("difficulty")
    //   .equals("easy");

    const tours = await query;

    response.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    response.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getTour = async (request, response) => {
  try {
    const tour = await Tour.findById(request.params.id);

    response.status(200).json({
      status: "success",
      data: {
        tours: tour,
      },
    });
  } catch (err) {
    response.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.createTour = async (request, response) => {
  try {
    const newTour = await Tour.create(request.body);

    response.status(201).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    response.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.updateTour = async (request, response) => {
  try {
    const tour = await Tour.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    });

    response.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (err) {
    response.status(400).json({
      status: "fail",
      message: "Invalid data sent!",
    });
  }
};

exports.deleteTour = async (request, response) => {
  try {
    await Tour.findByIdAndDelete(request.params.id);

    response.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    response.status(400).json({
      status: "fail",
      message: "Invalid data sent!",
    });
  }
};
