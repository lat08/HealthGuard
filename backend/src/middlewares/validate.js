const ApiError = require('../utils/ApiError');
const sanitizeHtml = require('sanitize-html');

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
 *       email:     { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
 *       full_name: { required: true, type: 'string', sanitize: true },
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
      let value = data[field];

      // Required check
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({ field, message: `${field} là bắt buộc` });
        continue;
      }

      // Skip optional fields that are not provided
      if (value === undefined || value === null || value === '') continue;

      // Type check
      if (rule.type && typeof value !== rule.type) {
        errors.push({ field, message: `${field} phải có kiểu ${rule.type}` });
        continue;
      }

      // Sanitize string if requested
      if (rule.sanitize && typeof value === 'string') {
        value = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {}
        }).trim();
        req[source][field] = value;
      }

      // Pattern check (Regex)
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        errors.push({ field, message: `${field} không đúng định dạng` });
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
