const checkEmptyFields = (fields, location = 'body') => (req, res, next) => {
    const data = req[location];
    const missingFields = [];
  
    fields.forEach(field => {
      if (!data[field] || data[field].trim() === '') {
        missingFields.push(field);
      }
    });
  
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing or empty fields',
        missingFields: missingFields
      });
    }
  
    next();
  };
  
  module.exports = checkEmptyFields;