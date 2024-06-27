// now let see the syntax of promises
const asyncHandler = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => {
      next(error);
    });
  };
};

export default asyncHandler;

// const asyncHandler = ()=>{}
// const asyncHandler = ()=>{()=>{}}
// const asyncHandler = ()=>()=>{}

// this is the syntax of try catch :
// javascript can take the function as a parameter and return as well :
// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (error) {
//     res.status(err.code || 500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };
