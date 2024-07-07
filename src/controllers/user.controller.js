import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ApiError from "../utils/apiError.js";
import { trycatchhandler } from "../utils/asyncHandler.js";
import { UploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
// with the use of helper file :from this we have a try catch

// controller data we post to the database:

//      Generate Access and refresh token:

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const AccessToken = await user.GenerateAccesToken();
    const RefreshToken = await user.GenerateRefreshToken();

    user.refreshToken = RefreshToken;

    // this validatebeforesave because of the save if we save this to our database its again require password to remove this we do this
    await user.save({ validateBeforeSave: false });

    // returning access and refreshToken

    return { AccessToken, RefreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generationg refresh and access token"
    );
  }
};

const registerUser = trycatchhandler(async (req, res) => {
  // lets break this :
  // res.status(200).json({
  //   message: "ok",
  // });

  // CHECK POINTS WHILE WE FETCHING THE DATA FROM FRONTEND
  //    STEPS WE TAKE IN MIND WHEN WE REGISTER THE USER:

  // GET USER DETAILS FROM THE FRONTEND:
  // VALIDATION -= NOT EMPTY
  // CHECK IF USER ALREDAY EXIST OR NOT
  // CHECK FOR IMAGES. CHECK FOR AVATAR
  // UPLOAD THEM TO CLOUDINARY:
  // CREATE USE OBJECT ->CREATE ENTRY IN DB
  // REMOVE PASSOWRD AND REFRESH TOKEN FIELD FROM RESPONSE
  // CHECK FOR USER CREATION
  // RETURN RESPONSE ELSE SEND THE ERROR:

  // START:

  // we have request
  const { fullname, email, username, password } = req.body;
  console.log("Email", password);
  // validatioN
  // if (fullname === "") {
  //   throw new ApiError(400, "fullName is required");
  // }
  // above the way do by beginners : in this we have to check if the fullNmae is not empty similarly we hvae to check many this

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  // validation checkdone

  // check if useExists or not:

  // here User is from user.models.js: which we import: this will contact with our database on the behalf of this we can perform find operations:
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser)
    throw new ApiError(409, "User with email or userName already exists");

  // ApiError : is from : ApiError.js helper file

  // Handle files
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // console.log("requiest .com files outpput :", req.body);

  // const coverImgLocalPath = req.files?.coverimg[0]?.path;
  // if we are not sending the coverimg it shows me an error -> because of the above url so to fix the code we have to cheeck

  let coverImgLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverimg) &&
    req.files.coverimg.length > 0
  ) {
    coverImgLocalPath = req.files.coverimg[0].path;
  }

  if (!avatarLocalPath) throw new ApiError(400, "Avatar files are required:");

  //create database entry: upload them to cloudinarY:

  const avatar = await UploadOnCloudinary(avatarLocalPath);
  const coverImg = await UploadOnCloudinary(coverImgLocalPath);

  if (!avatar) throw new ApiError(400, "Avatar is required");

  // object and entry in database:
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverimg: coverImg?.url || "",
    email,
    username: username.toLowerCase(),
    password,
  });

  // check user Is there or Not
  const createdUser = await User.findById(user._id).select(
    " -password -refreshToken "
  );

  if (!createdUser)
    throw new ApiError(500, "Something went wrong while registering the user");

  // now take the response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registerd Sucessfully"));
});

// ***********************************              **************************************

// now we have to make loginUser
const loginUser = trycatchhandler(async (req, res) => {
  // MAKE ALGO OR STEPS WHICH I HAVE TO PERFORM
  // req body --> data
  // username or email
  // find the user
  // password check
  // access and refresh token
  // send cookies :

  const { email, username, password } = req.body;

  // in this both email and password both will needed: or we can do : !(usename || email)
  if (!username && !email) {
    throw new ApiError(400, "username or email is required:");
  }

  // in this we have to find username or email: for this we can use
  // User.findOne({username}) ;
  //  User.findOne({username})
  // this will check either we have usename or email
  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (!user) throw new ApiError(404, "user does not exist");

  // check password:
  // we make a method to check the password isPassword check :which take two parameter first one is database password which is original another one is userPassword

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) throw new ApiError(401, "Invalid user credentials");

  // making refresh and access token :

  const { AccessToken, RefreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // updating the userInfo in this we call the database again : its depend on you > you want to call the database again or just update the object: totally depend on you--->
  const loggedInUser = await User.findById(user._id).select(
    " -password -refreshToken"
  );

  // now sent it to the cookies;
  // when we httpOnly is true it would not modifideable by server; it only modified by http only:
  const options = {
    httpOnly: true,
    secure: true,
  };

  // in this we return the cookies;
  return res
    .status(200)
    .cookie("AccessToken", AccessToken, options)
    .cookie("RefreshToken", RefreshToken)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          AccessToken,
          RefreshToken,
        },
        "User Logged In Succesfully"
      )
    );
});

// ******************               *********************************            ***********

const logoutUser = trycatchhandler(async (req, res) => {
  // req.user._id

  // we have multiple problem while logged out how can be : we donot have user details while loggedOut
  // we donot have user data : so we try it to fetch from teh cookies : thats why i make the middleware:
  // which fetch the userLogged out data and clear the tokens refresh Token and accessToken:
  //
  // console.log(req.user);
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        RefreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  // console.log("thsi are the details: ", details);
  // console.log("i am calling 1");
  // cookie clear
  const options = {
    httpOnly: true,
    secure: true,
  };
  // console.log("i am calling 2");
  // console.log("this are the optionsvalue", options);
  // console.log(res, "this is res");
  return res
    .status(200)
    .clearCookie("AccessToken", options)
    .clearCookie("RefreshToken", options)
    .json(new ApiResponse(200, {}, "UserLoggedout succesfully"));

  // response sent
});

const refreshAccessToken = trycatchhandler(async (req, res) => {
  const incomingRefreshToken =
    (await req.cookies.RefreshToken) || req.body.RefreshToken;
  // this or because of both the cases for mobile which doesnot save the req or second one is web

  if (!incomingRefreshToken)
    return new ApiError(401, "unauthorizedReq while incomingRefreshToken");

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  // in my refreshToken i have userId with the help of this id I can call to the database and access the UserData
  const user = await User.findById(decodedToken?._id);
  if (!user) throw new ApiError(401, "Invalid RefreshToken");

  //i am comparing the both incomingRefreshtoken and the userRefreshToken from the databse if they will match then you can able to regerate the req else not:
  if (incomingRefreshToken !== user?.refreshToken)
    throw new ApiError(
      401,
      "Refresh token is expired or used: please login Again"
    );

  //
  const options = {
    httpOnly: true,
    secure: true,
  };

  // generate
  const { AccessToken, RefreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  return res
    .status(200)
    .cookie("AccessToken", AccessToken)
    .cookie("RefreshToken", RefreshToken)
    .json(
      new ApiResponse(200, AccessToken, RefreshToken, "AccesToken Refreshed")
    );
});

const changeCurrentPassword = trycatchhandler(async (req, res) => {
  // console.log("requersuer checking", req.user);
  // console.log("userBody", req.user);
  // in this i have to check the oldPassword: and we know if we are able to change the password:
  // console.log()
  //i have to chagne the current password i can take the userId by passing it by the auth middle ware and take the data from the cookie: which gives me the req.uesr
  //
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);

  // i am already makign a function to check the password:

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) throw new ApiError(400, "Invalid Old Password");

  //
  user.password = newPassword;

  // if password will change our function automatically bcrypt it because we make it hook run always wheen pasword will change:
  // we donot want to run other validation:
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password change succesfullY"));
});

//
const getCurrentUser = trycatchhandler(async (req, res) => {
  return res.status(200).json(200, req.user, "current user Fetch Sucessfully");
});

//
const updateAccountDetails = trycatchhandler(async (req, res) => {
  const { fullname, email } = req.body;
  if (!fullname || !email) throw new ApiError(400, "All field are required");
  // new:true will return the updated information
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email,
      },
    },
    { new: true }
  ).select(" -password");

  //
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account Details Updated Succesfully"));
});

// to change the avatar:
// in this we use the two middleware

const updateUserAvatar = trycatchhandler(async (req, res) => {
  // this will get from multer middleware:
  // fiels for multiple and file for single:
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) new ApiError(400, "Avatar file is missing");

  const avatar = await UploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) throw new ApiError(400, "Error while uplaoding on avatar: ");

  // update the avatar:
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar: avatar.url } },
    { new: true }
  ).select(" -password");

  //
  res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated succesfully"));
});

//

const updateUserCoverImg = trycatchhandler(async (req, res) => {
  // this will get from multer middleware:
  // fiels for multiple and file for single:
  const coverImgLocalPath = req.file?.path;
  if (!coverImgLocalPath) new ApiError(400, "cover img file is missing");

  const coverImage = await UploadOnCloudinary(coverImgLocalPath);

  if (!coverImage.url)
    throw new ApiError(400, "Error while uplaoding on avatar: ");

  // update the avatar:
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { coverimg: coverImage.url } },
    { new: true }
  ).select(" -password");

  res
    .status(200)
    .json(new ApiResponse(200, user, "coverImg updated succesfully"));
});

// Start the use of Aggregation Pipeline:
const getUserChannelProfile = trycatchhandler(async (req, res) => {
  // get the user so it will come from params; means url
  const { username } = req.params;
  if (!username?.trim()) throw new ApiError(401, "UserName is Missing: ");

  // we can find : username from the document by : User.find({username}) but we can use directly aggregation pipleline which automatically take the

  const channel = await User.aggregate([
    {
      // match field is to find the match from the database:
      // $match Filters the documents to pass only the documents that match the specified condition(s) to the next pipeline stage.
      $match: {
        username: username?.toLowerCase(),
      },
    },
    // we know that all field in the model will in lowercase with s in their name:
    // it give the total subscriber of you channel

    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    // to find the total subscribed channel:
    // foreign field is subscriber we have to find my id in the channels
    // we found the total subscribered channel through other channel and find my id: thats why i search for subscriber:
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    // to add the totalfield:
    {
      $addFields: {
        subsribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        // this field is for is user subscried the channel or not : if true else false:
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },

    // this will see what we have to pass to the user:
    {
      $project: {
        fullname: 1,
        username: 1,
        subsribersCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverimg: 1,
        email: 1,
      },
    },

    // channel have total subscribers

    // console.log(channel),
    // what type of aggregate return : array:
  ]);
  if (!channel?.length) throw new ApiError(404, "Channel doesnot Exist");

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel Fetched sucessfullyf")
    );
});

// get Watch History:
const getWatchHistory = trycatchhandler(async (req, res) => {
  const user = await User.aggregate([
    {
      // mongodb: when we give the userId to the mongoose it automatically convert it into the mongooseObject Id but mongodb gives userId in string format:
      // but in this case we have to find the use > till now we pass the string directly mongodb will handle it:
      // but in thsi we have to convert the userId because aggregate is the concept of mongodb this will nto handle it:
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    // from in short form : with s in their name;
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "WatchHistory",
        // subpipline to find the watch history and owner details:
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  // return

  return res
    .status(200)
    .json(200, user[0].WatchHistory, "This is the watch History DAta");
});
export {
  registerUser,
  loginUser,
  getUserChannelProfile,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserCoverImg,
  updateUserAvatar,
  getWatchHistory,
};
