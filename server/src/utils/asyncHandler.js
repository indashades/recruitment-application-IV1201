/**
 * Wraps an async Express handler and forwards rejections to `next`.
 *
 * @param {(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => any|Promise<any>} fn
 * @returns {import("express").RequestHandler}
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };