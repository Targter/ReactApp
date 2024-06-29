import multer from "multer";

// const upload = multer({ dest: "./public/data/uploads/" });
// app.post("/stats", upload.single("uploaded_file"), function (req, res) {
//   // req.file is the name of your file in the form above, here 'uploaded_file'
//   // req.body will hold the text fields, if there were any
//   console.log(req.file, req.body);
// });

const storage = multer.diskStorage({
  // cb is callback function which tell whether the file should be saved or not :
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // console.log(file)
    console.log(file);
    // cb(null, file.fieldname + "-" + uniqueSuffix);
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage: storage });
