const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const cloudinary = require("cloudinary");
const sendToken = require("../utils/jwtToken");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

exports.registerUser = catchAsyncErrors(async (req, res, next)=>{
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
    });

    const { name, email, password } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        },
    });
    sendToken(user, 201, res);
})

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    // checking if user has given password and email both

    if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email & Password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    sendToken(user, 200, res);
});

exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
  
    res.status(200).json({
      success: true,
      message: "Logged Out",
    });
  });

exports.getAllUsers =catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();
  
    res.status(200).json({
      success: true,
      users,
    });
  });

exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });
});

exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    if (req.body.avatar !== "") {
        const user = await User.findById(req.user.id);

        const imageId = user.avatar.public_id;

        await cloudinary.v2.uploader.destroy(imageId);

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150,
            crop: "scale",
        });

        newUserData.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        };
    }
    // console.log(req.body)
    if(req.body.userInfo){
        newUserData.userInfo = {
            address:req.body.userInfo.address,
            city:req.body.userInfo.city,
            state:req.body.userInfo.state,
            country:req.body.userInfo.country,
            pinCode:req.body.userInfo.pinCode,
            phoneNo:req.body.userInfo.phoneNo,
        }
    }
    
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});

exports.forgotpassword = catchAsyncErrors(async (req, res, next) => {
    
    const user = await User.findOne({email:req.body.email});
    
    if(!user){
        return next(ErrorHandler('User not found', 404))
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave: false});
    const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${resetToken}`;
  
  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;
  
  try {
    await sendEmail({
        email: user.email,
        subject: `Ecommerce Password Recovery`,
        message,
    });
    res.status(200).json({
        success: true,
        message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    console.log(error)
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

exports.resetPassword = catchAsyncErrors(async (req, res, next) =>{
    console.log(req.params.token)
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(
            new ErrorHandler(
                "Reset Password Token is invalid or has been expired",
                400
            )
        );
    }

    if(req.body.password !== req.body.confirmpassword){
        return next(new ErrorHandler("Passwords does not match", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);

});

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password")

    const isPasswordMatched = await user.comparePassword(req.body.oldpassword);

    if(!isPasswordMatched){
        return next(new ErrorHandler('Old password is incorrect',400));
    }

    if(req.body.password !== req.body.confirmpassword){
        return next(new ErrorHandler("Passwords does not match", 400));
    }

    user.password = req.body.newpassword;

    await user.save();

    sendToken(user, 200, res);
})