import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index2.js";
// this is the second approach:
// run firstly the dotenv file import as per as possible :
// require('dotenv').config({path:'./env'})

// if we use import statement then all the things we have to do it else we can use require syntax in that we donot have to use that much
// or if we using import statement then we have to change the script as well
dotenv.config({
  path: "./env",
});


// sometimes express will also throw the errors
// connectDB is a async function
connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log(
        "ERrror: sometimes our express app  will not able to connect thats why it shows an error ",
        error
      );
      // optinally we throwing the error to the global error handler
      throw error;
    });
    app.listen(process.env.PORT || 8080, () => {
      console.log(`server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MONGO DB CONNECTION FAIELD !! ", error);
  });

// this is the first approach to connect with database:

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// import express from "express";

// const app = express();

// // function connectDB(){}
// // this is also the normal function but it run fastly or one line code;
// (async () => {
//   try {
//     // this is how we connect the expres or database
//     await mongoose.connect(`${process.env.MongoDB_URL}/${DB_NAME}`);
//     app.on("error", (error) => {
//       console.log(
//         "ERrror: sometimes our express app  will not able to connect thats why it shows an error ",
//         error
//       );
//       throw error;
//     });

//     app.listen(process.env.PORT, () => {
//       console.log(`APP IS LISTENING ON PART ${process.env.PORT}`);
//     });
//   } catch (err) {
//     console.error("Error", err);
//     throw err;
//   }
// })();
