function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = {};
      error.details.forEach((detail) => {
        // Error level-object (mis. .min(1) di doctorUpdateSchema) tidak punya path spesifik
        const key = detail.path.length ? detail.path[0] : 'general';
        errors[key] = detail.message;
      });
      return res.error('Validation Error', errors, 422);
    }

    next();
  };
}

module.exports = validate;