// router:

import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

// middle ware of multer
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

// when we direct to this we automatically ivoked the registerUser and give the information:
// in this we sent the post request:
// we use middleware because of our cloudinary is not able to handle the files for this we are usuing the multer middlware:
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImg", maxCount: 1 },
  ]),
  registerUser
);
export default router;
