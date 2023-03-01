const Friend = require('../models/friendsModel');
const ErrorHandler = require('../utils/errorhandler')
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");

exports.createRequest = catchAsyncErrors(async (req, res, next) => {
    req.body.source_user = req.user._id;
    let isRequested = false;
    const requestCount = await Friend.countDocuments();
    if(requestCount>0){
        const post = await Friend.find()
        post.find((e)=>{
            if(e.source_user.toString()===req.user._id.toString()){
                isRequested =  true;
            }else isRequested = false
        });

        if(isRequested){
            return next(new ErrorHandler("Request is pending", 401));
        }
    }
    const friends = await Friend.create(req.body);
    res.status(201).json({
        success: true,
        friends,
    });
});

exports.listFriends = catchAsyncErrors(async (req, res, next)=>{
    
    let request = await Friend.find()
    let result = []
    
    const filter = request.forEach((el)=>{
        
        if(el.source_user.toString()===req.user._id.toString()&&el.is_accepted){
            result.push(el)
        }
    })
    
    if(result.length==0) result = []

    res.status(200).json({
        success: true,
        result,
    });
})

exports.findRequestById = catchAsyncErrors(async (req, res, next)=>{
    
    let request = await Friend.find()
    let result = []
    
    const filter = request.forEach((el)=>{
        
        if(el.source_user.toString()===req.user._id.toString()&&!el.is_accepted){
            result.push(el)
        }
    })
    
    if(result.length==0) result = []

    res.status(200).json({
        success: true,
        result,
    });
})

exports.acceptRequest = catchAsyncErrors(async (req, res, next) =>{
    let request = await Friend.findById(req.params.id);

    if(!request){
        return next(new ErrorHandler('Request not found', 404))
    };

    post = await Friend.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        Friend,
    });
})

exports.cancelRequest = catchAsyncErrors(async (req, res, next)=>{
    let request = await Friend.findById(req.params.id);

    if(!request){
        return next(new ErrorHandler('Request not found', 404))
    };

    await request.remove();

    res.status(200).json({
        success: true,
        message: "Request Cancelled Successfully",
    });
});