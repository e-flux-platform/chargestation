// Performs a health check for Kubernetes/Google Cloud load balancers.

module.exports = function statusMiddleware(ctx, next) {
  if (ctx.path === '/status') {
    ctx.body = 'OK';
    return;
  }
  return next();
};
