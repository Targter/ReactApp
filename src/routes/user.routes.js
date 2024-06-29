// router:

import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

// when we direct to this we automatically ivoked the registerUser and give the information:
router.route("/register").post(registerUser);
export default router;
