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
  console.log("requiest .com files outpput :", req.body);

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
export { registerUser, loginUser, logoutUser, refreshAccessToken };
