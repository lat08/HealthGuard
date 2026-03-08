/**
 * Standardized API Response
 *
 * Usage:
 *   res.status(200).json(new ApiResponse(200, data, 'Thành công'));
 *   ApiResponse.success(res, data, 'OK');
 *   ApiResponse.created(res, data);
 *   ApiResponse.noContent(res);
 */
class ApiResponse {
  constructor(statusCode, data = null, message = 'Success') {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  // ── Helpers ──────────────────────────────────────────────
  static success(res, data = null, message = 'Thành công') {
    return res.status(200).json(new ApiResponse(200, data, message));
  }

  static created(res, data = null, message = 'Tạo thành công') {
    return res.status(201).json(new ApiResponse(201, data, message));
  }

  static noContent(res) {
    return res.status(204).send();
  }

  /**
   * Paginated list response
   * @param {Response} res - Express response
   * @param {Array} data - Array of items
   * @param {number} total - Total count
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   */
  static paginated(res, data, total, page, limit) {
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Thành công',
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
}

module.exports = ApiResponse;
