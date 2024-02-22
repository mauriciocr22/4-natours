const multer = require("multer");
const sharp = require("sharp");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

// const multerStorage = multer.diskStorage({
//   destination: (request, file, cb) => {
//     cb(null, "public/img/users");
//   },
//   filename: (request, file, cb) => {
//     const ext = file.mimetype.split("/")[1]; 
//     cb(null, `user-${request.user.id}-${Date.now()}.${ext}`)
//   }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (request, file, cb) => {
  if(file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = catchAsync(async (request, response, next) => {
  if(!request.file) return next();

  request.file.filename = `user-${request.user.id}-${Date.now()}.jpeg`

  await sharp(request.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${request.file.filename}`);

  next();
});

const filterObj = (obj, ...alowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach(el => {
    if(alowedFields.includes(el)) newObj[el] = obj[el]
  })
return newObj;
}

exports.getMe = (request, response, next) => {
  request.params.id = request.user.id;
  next();
}

exports.updateMe = catchAsync(async (request, response, next) => {
  if(request.body.password || request.body.passwordConfirm) {
    return next(new AppError("This route is not for password updates. Please use the /updateMyPassword route.", 400))
  }
  
  const filteredBody = filterObj(request.body, "name", "email");
  if(request.file) filteredBody.photo = request.file.filename

  const updatedUser = await User.findByIdAndUpdate(request.user.id, filteredBody, {
    new: true,
    runValidators: true
  });
  
  response.status(200).json({
    status: "success",
    user: updatedUser
  });
})

exports.deleteMe = catchAsync(async (request, response, next) => {
  await User.findByIdAndUpdate(request.user.id, { active: false });
  
  response.status(204).json({
    status: "success",
    data: null
  })
})

exports.createUser = (request, response) => {
  response.status(500).json({
    status: "error",
    message: "This route is not yet defined! Please use /signup instead ",
  });
};

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
