const fs = require("fs");
const express = require("express");

const app = express();

app.use(express.json());

// app.get("/", (request, response) => {
//   response
//     .status(200)
//     .json({ message: "Hello from the server side!", app: "Natours" });
// });

// app.post("/", (request, response) => {
//   response.send("You can post to this endpoint");
// });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get("/api/v1/tours", (request, response) => {
  response.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
});

app.get("/api/v1/tours/:id", (request, response) => {
  console.log(request.params);
  const id = request.params.id * 1;
  const tour = tours.find((element) => element.id === id);

  if (!tour) {
    return response.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
  }

  response.status(200).json({
    status: "success",
    data: {
      tours: tour,
    },
  });
});

app.post("/api/v1/tours", (request, response) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, request.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      response.status(201).json({
        status: "success",
        data: {
          tour: newTour,
        },
      });
    }
  );
});

app.patch("/api/v1/tours/:id", (request, response) => {
  if (request.params.id * 1 > tours.length) {
    return response.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
  }

  response.status(200).json({
    status: "success",
    data: {
      tour: "<Updated tour here...",
    },
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
