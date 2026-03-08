/**
 * Wrap async controller functions to automatically catch errors.
 * Eliminates the need for try/catch in every controller.
 *
 * Usage:
 *   const getUsers = catchAsync(async (req, res) => {
 *     const users = await userService.findAll();
 *     ApiResponse.success(res, users);
 *   });
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
