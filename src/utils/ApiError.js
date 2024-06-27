// this is nothing but we have to handle Api error
// when the error comes from Api

// node give us the Error class which we expend using super messages
class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something Went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
