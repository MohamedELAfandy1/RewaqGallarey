const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

const User = require("../models/userModel");
const apiError = require("../Utils/apiError");
const createToken = require("../Utils/createToken");
const sendEmail = require("../Utils/sendEmail");

exports.register = asyncHandler(async (req, res, next) => {
  const { email, name, password } = req.body;

  const user = {
    name,
    email,
    password,
  };
  const otp = Math.floor(Math.random() * 1000000);

  const activationToken = jwt.sign(
    {
      user,
      otp,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "20m",
    }
  );

  await sendEmail({
    email: user.email,
    subject: "Your Verifiction Code(Valid For 2min)",
    message: `Hi ${user.name},\n
    We Received A Reequest To Verify Your Account.\n
    ${otp}\n 
    Enter This Code To Compelete Verifiction. \n`,
  });

  res.status(200).json({
    message: "OTP Send To Your Email",
    activationToken,
  });
});

exports.verifyUser = asyncHandler(async (req, res, next) => {
  const { otp } = req.body;
  activationToken = req.headers.authorization.split(" ")[1];

  const verify = jwt.verify(activationToken, process.env.JWT_SECRET_KEY);

  if (!verify)
    return res.status(400).json({
      message: "Otp Expired",
    });

  if (verify.otp != otp)
    return res.status(400).json({
      message: "Wrong Otp",
    });

  const user = await User.create({
    name: verify.user.name,
    email: verify.user.email,
    password: verify.user.password,
  });

  const token = createToken(user._id);
  res.status(201).json({ data: user, token });
});

exports.auth = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new apiError("You are Not Logging In", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const currentTimestamp = Math.floor(Date.now() / 1000);
  if (decoded.exp && currentTimestamp > decoded.exp) {
    return next(new apiError("Token has expired", 401));
  }

  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new apiError("The User Belong To This Token Is No Longer Exist", 401)
    );
  }

  if (currentUser.passwordChangedAt) {
    const passwordChangedTimeStamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    if (passwordChangedTimeStamp > decoded.iat) {
      return next(
        new apiError(
          "User Recently Change His Password Please Login Again...",
          401
        )
      );
    }
  }

  req.user = currentUser;
  next();
});

exports.login = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new apiError("Incorrect Email Or Password"), 401);
  }
  const token = createToken(user._id);
  res.status(200).json({ data: user, token });
});

exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new apiError("You Are Not Allowed To Access This Route", 403)
      );
    }
    next();
  });

exports.forgetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new apiError("No User For This Email", 404));
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  console.log(hashedResetCode);

  user.passwordResetCode = hashedResetCode;
  user.passwordResetCodeExpies = Date.now() + 2 * 60 * 1000;
  user.passwordResetVerified = false;
  await user.save();

  try {
    await sendEmail({
      email: user.email,
      subject: "Your Passsword Reset Code(Valid For 2min)",
      message: `Hi ${user.name},\n
      We Received A Reequest To Reset Password On Account.\n
      ${resetCode}\n 
      Enter This Code To Compelete Reset. \n`,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpies = undefined;
    user.passwordResetVerified = undefined;
    await User.save();
    return next(new apiError("There Is An Error In Sending Email", 500));
  }
  res
    .status(200)
    .json({ status: "SUCCESS", message: "Reset Code Sent To Email " });
});

exports.verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.passwordResetCode)
    .digest("hex");
  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetCodeExpies: { $gt: Date.now() },
  });
  if (!user) {
    return next(new apiError("Reset Code Invalid Or Expired"));
  }

  user.passwordResetVerified = true;
  await user.save();
  res.status(200).json({ status: "Success" });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new apiError("There Is No User For This Email", 404));
  }
  if (!user.passwordResetVerified) {
    return next(new apiError("Reset Code Not Verified", 400));
  }

  user.password = req.body.newPassword;
  user.passwordChangedAt = Date.now();

  user.passwordResetCode = undefined;
  user.passwordResetCodeExpies = undefined;
  user.passwordResetVerified = undefined;
  await user.save();

  const token = createToken(user._id);
  res.status(200).json({ token });
});
