//auth-service/src/controllers/dataController.js
const { validateEmail } = require('../utils/validators');


exports.processData = (req, res) => {
  const { input } = req.body;

  // Validate input
  const validationError = validateEmail(input);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // Process input (example: reverse the string)
  const processed = input.split('').reverse().join('');

  res.json({ result: processed });
};
