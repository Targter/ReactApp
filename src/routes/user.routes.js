// router:

import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImg,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";

// middle ware of multer
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/authentication.middleware.js";
const router = Router();

// when we direct to this we automatically ivoked the registerUser and give the information:
// in this we sent the post request:
// we use middleware because of our cloudinary is not able to handle the files for this we are usuing the multer middlware:
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverimg", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// secured routes
router.route("/logOut").post(verifyJWT, logoutUser);

// this is too hit the end point to regenerate the AccessToken
router.route("/refresh-token").post(refreshAccessToken);

//
router.route("/changePassword").post(verifyJWT, changeCurrentPassword);
// getCurrentUser
router.route("/currentUser").post(verifyJWT, getCurrentUser);
//in this i use Patch to modify value to the resource
router.route("/updateDetails").patch(verifyJWT, updateAccountDetails);
// update
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

// coverImg
router
  .route("/coverImg")
  .patch(verifyJWT, upload.single("coverimg"), updateUserCoverImg);

// update this is because i have to fetch data from the params:
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
// get watch history:
router.route("/history").get(verifyJWT, getWatchHistory);

//
export default router;
