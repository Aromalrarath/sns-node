const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {getAllPosts, 
        createPost,
        getPostDetails,
        deletePost,
        updatePost,
        createProductReview,
        createPostLike,
        getUserPosts} = require('../controllers/postController')

const router = express.Router();

router.route('/lists').get(isAuthenticatedUser,getAllPosts);
router.route('/user').get(isAuthenticatedUser,getUserPosts);
router.route('/new').post(isAuthenticatedUser,createPost);
router.route('/:id').get(isAuthenticatedUser,getPostDetails);

router
  .route("/:id")
  .put(isAuthenticatedUser, updatePost)
  .delete(isAuthenticatedUser, deletePost);

router.route('/comment').post(isAuthenticatedUser,createProductReview)
router.route('/like').post(isAuthenticatedUser,createPostLike)

module.exports = router;