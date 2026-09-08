function responseWrapper(req, res, next) {
  res.success = (data = {}, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  };

  res.error = (message = 'Error', errors = {}, statusCode = 400) => {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  };

  next();
}

module.exports = { responseWrapper };