const jwt = require('jsonwebtoken');

const authMiddleware = (request, response, next) => {
  const token = request.headers['x-access-token'] || request.query.token;

  if (!token) {
    return response.status(403).json({
      success: false,
      message: 'not logged in',
    });
  }

  const promise = new Promise((resolve, reject) => {
    jwt.verify(token, request.app.get('jwt-secret'), (error, decoded) => {
      if (error) reject(error);

      resolve(decoded);
    });
  });

  const onError = (error) => {
    response.status(403).json({
      success: false,
      message: error.message,
    });
  };

  promise
    .then((decoded) => {
      request.decoded = decoded;

      next();
    })
    .catch(onError);
};

module.exports = authMiddleware;
