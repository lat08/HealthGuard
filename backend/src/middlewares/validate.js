const ApiError = require('../utils/ApiError');

/**
 * Request validation middleware.
 * Validates body, params, or query against a rules object.
 *
 * Usage:
 *   router.post('/', validate(createUserRules), userController.create);
 *
 * Rules format:
 *   {
 *     body: {
 *       email:     { required: true, type: 'string' },
 *       full_name: { required: true, type: 'string' },
 *       role:      { required: false, type: 'string', enum: ['patient','caregiver','admin'] },
 *     }
 *   }
 */
const validate = (rules) => (req, _res, next) => {
  const errors = [];

  for (const source of ['body', 'params', 'query']) {
    if (!rules[source]) continue;

    const data = req[source] || {};
    const fields = rules[source];

    for (const [field, rule] of Object.entries(fields)) {
      const value = data[field];

      // Required check
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({ field, message: `${field} là bắt buộc` });
        continue;
      }

      // Skip optional fields that are not provided
      if (value === undefined || value === null) continue;

      // Type check
      if (rule.type && typeof value !== rule.type) {
        errors.push({ field, message: `${field} phải có kiểu ${rule.type}` });
      }

      // Enum check
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push({ field, message: `${field} phải là một trong: ${rule.enum.join(', ')}` });
      }

      // Min length
      if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
        errors.push({ field, message: `${field} phải có ít nhất ${rule.minLength} ký tự` });
      }
    }
  }

  if (errors.length > 0) {
    return next(ApiError.badRequest('Dữ liệu không hợp lệ', errors));
  }

  next();
};

module.exports = validate;
