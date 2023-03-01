const Post = require('../models/postModel')
const ErrorHandler = require('../utils/errorhandler')
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const cloudinary = require("cloudinary");

exports.getAllPosts = catchAsyncErrors(async (req, res, next) => {
    const resultsPerPage = process.env.RESULTS_PER_PAGE;
    const postsCount = await Post.countDocuments();

    const apifeature = new ApiFeatures(Post.find(), req.query)
        .search()
        .filter();

    let posts = apifeature.query;

    let filteredPostsCount = posts.length;

    apifeature.pagination(resultsPerPage);

    posts = await apifeature.query;

    res.status(200).json({
        success: true,
        posts,
        postsCount,
        resultsPerPage,
        filteredPostsCount,
    });
})

exports.getUserPosts = catchAsyncErrors(async (req, res, next) => {
    let post = await Post.find();
    let userPosts = [];

    const filter = post.forEach((el)=>{
        if(el.user.toString()===req.user._id.toString()){
            userPosts.push(el)
        }
    });
    if(userPosts.length==0) userPosts = [];

    res.status(200).json({
        success:true,
        userPosts
    })
})

exports.createPost = catchAsyncErrors(async (req, res, next) => {
    let images = [];

    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "posts",
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
        });
    }

    req.body.images = imagesLinks;
    req.body.user = req.user.id;

    const post = await Post.create(req.body);

    res.status(201).json({
        success: true,
        post,
    });

});

exports.getPostDetails = catchAsyncErrors(async (req, res, next) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        return next(new ErrorHandler("Post not found", 404));
    }

    res.status(200).json({
        success: true,
        post,
    });
});

exports.deletePost = catchAsyncErrors(async (req, res, next) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        return next(new ErrorHandler("Post not found", 404));
    }

    // Deleting Images From Cloudinary
    for (let i = 0; i < post.images.length; i++) {
        await cloudinary.v2.uploader.destroy(post.images[i].public_id);
    }

    await post.remove();

        res.status(200).json({
            success: true,
            message: "Post Delete Successfully",
        });
});

exports.updatePost = catchAsyncErrors(async (req, res, next) => {
    let post = await Post.findById(req.params.id);

    if (!post) {
        return next(new ErrorHandler("Post not found", 404));
    }

    // Images Start Here
    let images = [];

    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    if (images !== undefined) {
        // Deleting Images From Cloudinary
        for (let i = 0; i < post.images.length; i++) {
            await cloudinary.v2.uploader.destroy(post.images[i].public_id);
        }

        const imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "Posts",
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }

        req.body.images = imagesLinks;
        req.body.updatedAt = Date.now()
    }

    post = await Post.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        Post,
    });
});

exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { comment, postId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        comment:req.body.comment
    };
    
    const post = await Post.findById(postId);
    
    const isReviewed = post.comments.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    if(isReviewed){
        post.comments.forEach((com)=>{
            if (com.user.toString() === req.user._id.toString())(com.comment = req.body.comment);
        })
    }else{
        post.comments.push(review);
        post.numOfComments = post.comments.length;
    }

    await post.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
    });
})

exports.createPostLike = catchAsyncErrors(async (req, res, next) => {
    const { like,postId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        like:like
    };
    
    const post = await Post.findById(postId);
    
    const isReviewed = post.likes.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    if(isReviewed){
        // post.likes.forEach((com)=>{
        //     if (com.user.toString() === req.user._id.toString())(com.like = req.body.like);
        // })
        let pos = post.likes.findIndex(e=>e.user.toString() === req.user._id.toString())
        if(pos!=-1){
            post.likes.splice(pos,1)
        }
        post.numOfLikes = post.likes.length;
    }else{
        post.likes.push(review);
        post.numOfLikes = post.likes.length;
    }

    await post.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
    });
})