// now let see the syntax of promises
// const trycatchhandler = (requestHandler) => {
//   return (req, res, next) => {
//     Promise.resolve(requestHandler(req, res, next)).catch((error) => {
//       next(error);
//     });
//   };
// };

// export default trycatchhandler;

// const asyncHandler = ()=>{}
// const asyncHandler = (fn)=>{()=>{}}
// const asyncHandler = (fn)=>()=>{}

// this is the syntax of try catch :
// javascript can take the function as a parameter and return as well :
export const trycatchhandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    res.status(err.code || 500).json({
      success: false,
      message: err.message,
    });
  }
};
