const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {createRequest, cancelRequest,acceptRequest,findRequestById,listFriends} = require('../controllers/friendController')

const router = express.Router();

router.route('/create').post(isAuthenticatedUser,createRequest)
router.route('/pending-list').get(isAuthenticatedUser,findRequestById)
router.route('/list').get(isAuthenticatedUser,listFriends)
router.route('/cancel/:id').delete(isAuthenticatedUser,cancelRequest)
router.route('/accept/:id').put(isAuthenticatedUser,acceptRequest)

module.exports = router;