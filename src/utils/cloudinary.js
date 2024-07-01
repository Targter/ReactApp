import { v2 as cloudinary } from "cloudinary";

import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUDNAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View Credentials' below to copy your API secret
});

// upload on cloudinary
const UploadOnCloudinary = async (filelocalPath) => {
  try {
    if (!filelocalPath) return null;
    //

    // upoad the file on cloudinary:
    const response = await cloudinary.uploader.upload(filelocalPath, {
      resource_type: "auto",
    });
    // file has been succesfullyLoaded
    // console.log("file uploaded on cloudinary:", response.url);
    fs.unlinkSync(filelocalPath);
    return response;
  } catch (error) {
    // we know our file is in localsystem now i have to unlink the file :
    // it remove the locally saved temporay file as the upload operations got failed
    fs.unlinkSync(filelocalPath);
    return null;
  }
};

export { UploadOnCloudinary };
