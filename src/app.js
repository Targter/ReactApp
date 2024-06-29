import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

//              ImPortant::
// we use app.use when we have to work with middleware and confidential: 


// most of the place we use this only :
// app.use((cors))
// but we can do configuration as well
// origin: it tell use the request is come from : we can define our url in that
const app = express();

// baiscally cors works as middleware that can be used to enable cors with various options
// he cors middleware for Express simplifies enabling and configuring CORS, allowing you to control resource sharing with fine-grained policies.
// in this we have to define cors_origin that where from our request is come from : we define it in .env file : 
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
// app.use(cors) it covnert json data :->  for json data from the form
app.use(express.json({ limit: "20kb" }));
// take data from the url
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
// to upload the data public it can use by all:
app.use(express.static("public"));
//
app.use(cookieParser());

// we use
export default app;
