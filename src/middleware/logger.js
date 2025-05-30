const logger = (req, res, next) => {
  const ignoredPaths = [
    /^\/\.well-known\//, // Ignore /.well-known/*
    /\.(js|css|ico|png|jpg|jpeg|svg)$/, // Ignore static assets
  ];

  const shouldIgnore = ignoredPaths.some((pattern) => pattern.test(req.url));

  if (!shouldIgnore) {
    console.log(`${req.method} ${req.url}`);
  }

  next();
};

module.exports = logger;
