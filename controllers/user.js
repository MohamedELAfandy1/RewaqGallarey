const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const userModel = require("../models/userModel");
const factory = require("./handlersFactory");
const apiError = require("../Utils/apiError");
const createToken = require("../Utils/createToken");
const { uploadSingleImage } = require("../middleware/imageUpload");

exports.uploadUserImage = uploadSingleImage("profileImage");

exports.resizeUserImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const filename = `User-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/users/${filename}`);

    req.body.profileImage = filename;
  }
  next();
});

exports.getAllUsers = factory.getAll(userModel);

exports.getUserById = factory.getOne(userModel);

exports.createUser = factory.createOne(userModel);

exports.deleteUser = factory.deleteOne(userModel);

exports.updateUser = asyncHandler(async (req, res, next) => {
  let document = await userModel.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      profileImage: req.body.profileImage,
      role: req.body.role,
      addresses: req.body.addresses,
    },
    {
      new: true,
    }
  );
  if (!document) return next(new apiError("No Document For This Id", 404));
  res.status(200).json({ data: document });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  let document = await userModel.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!document) return next(new apiError("No Document For This Id", 404));
  res.status(200).json({ data: document });
});

exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  let user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!user) return next(new apiError("No Document For This Id", 404));

  const token = createToken(user._id);
  res.status(200).json({ data: user, token });
});

exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updatedUser = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      phone: req.body.phone,
      profileImage: req.body.profileImage,
      addresses: req.body.addresses,
    },
    { new: true }
  );
  res.status(200).json({ data: updatedUser });
});

