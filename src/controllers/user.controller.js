import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ApiError from "../utils/apiError.js";
import { trycatchhandler } from "../utils/asyncHandler.js";
import { UploadOnCloudinary } from "../utils/cloudinary.js";
// with the use of helper file :from this we have a try catch

// controller data we post to the database:
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
  // CHECK FOR IMAES. CHECK FOR AVATAR
  // UPLOAD THEM TO CLOUDINARY:
  // CREATE USE OBJECT ->CREATE ENTRY IN DB
  // REMOVE PASSOWRD AND REFRESH TOKEN FIELD FROM RESPONSE
  // CHECK FOR USER CREATION
  // RETURN RESPONSE ELSE SEND THE ERROR:

  // START:

  // we have request
  const { fullname, email, username, password } = req.body;
  // console.log("Email", password);
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
  const existedUser = User.findOne({ $or: [{ username }, { email }] });
  if (existedUser)
    throw new ApiError(409, "User with email or userName already exists");

  // ApiError : is from : ApiError.js helper file

  // Handle files
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImgLocalPath = req.files?.coverImg[0]?.path;

  if (!avatarLocalPath) throw new ApiError(400, "Avatar files are required:");

  //create database entry: upload them to cloudinarY:

  const avatar = await UploadOnCloudinary(avatarLocalPath);
  const coverImage = await UploadOnCloudinary(coverImgLocalPath);

  if (!avatar) throw new ApiError(400, "Avatar is required");

  // object and entry in database:
  User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || " ",
    email,
    username: username.toLowerCase(),
    password,
  });

  // check user Is there or Not
  const createdUser = User.findById(user._id).select(
    " -password -refreshToken "
  );

  if (!createdUser)
    throw new ApiError(500, "Something went wrong while registering the user");

  // now take the response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registerd Sucessfully"));
});

export { registerUser };
