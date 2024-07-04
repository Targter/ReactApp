// import { User } from "../models/user.model";
import { User } from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import { trycatchhandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
// Desiging authentication middlware

// this middle will verify if theere is user or not:

// my strategy: at the time of login we add the accesstoken and refresh token now i am directly verify that which tell me this is work or not :

export const verifyJWT = trycatchhandler(async (req, res, next) => {
  try {
    // we have token in this we have cookies: whihc contain the refresh and acces token :

    // .cookie("AccessToken", AccessToken, options)
    // we check if we have accessToken then or we have header in the mobile case we can take the value of AccessToken by this : replace if nothing just it have value in the format of Bearer <valueofauthorization> we need only value thats why we do this:
    const token =
      req.cookies?.AccessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    // console.log("check the cookie", req.cookies);
    // console.log("calling2344");
    // console.log("i am the token ", token);
    if (!token) throw new ApiError(401, "Unauthorized request");

    // console.log("calling2344");
    //   if we have tokens then
    // while we makeing the access token with jwt we have extra details we have to decode that:
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // console.log(decodedToken);
    // _id we make while making the method:
    const user = await User.findById(decodedToken?._id).select(
      " -password -refreshToken"
    );

    // console.log("calling2344");
    // console.log(user);
    if (!user) throw new ApiError(401, "Invalid Access Token");
    // console.log("calling2344");
    // console.log("userdata", user);
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access Token ");
  }
});
