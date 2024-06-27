import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// most of the place we use this only :
// app.use((cors))
// but we can do configuration as well
// origin: it tell use the request is come from : we can define our url in that
const app = express();

// for json data from the form
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
// take data from the url
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
// to uploas the data public it can use by all:
app.use(express.static("public"));
//
app.use(cookieParser());

// we use
app.use(express.json({ limit: "20kb" }));
export default app;
