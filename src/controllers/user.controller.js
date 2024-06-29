import { trycatchhandler } from "../utils/asyncHandler.js";
// with the use of helper file :from this we have a try catch

export const registerUser = trycatchhandler(async (req, res) => {
  res.status(200).json({
    message: "ok",
  });
});

// export registerUser;
