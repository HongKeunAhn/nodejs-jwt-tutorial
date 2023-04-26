const jwt = require('jsonwebtoken');
const User = require('../../../models/user');

exports.register = async (request, response) => {
  const { username, password } = request.body;
  let newUser = null;

  const create = (user) => {
    if (user) {
      throw new Error('username exists');
    } else {
      return User.create(username, password);
    }
  };

  const count = (user) => {
    newUser = user;
    return User.count({}).exec();
  };

  const assign = (count) => {
    if (count === 1) {
      return newUser.assignAdmin();
    } else {
      return Promise.resolve(false);
    }
  };

  const respond = (isAdmin) => {
    response.json({
      message: 'registered successfully',
      admin: isAdmin ? true : false,
    });
  };

  const onError = (error) => {
    response.status(409).json({
      message: error.message,
    });
  };

  User.findOneByUsername(username)
    .then(create)
    .then(count)
    .then(assign)
    .then(respond)
    .catch(onError);
};

exports.login = (request, response) => {
  const { username, password } = request.body;
  const secret = request.app.get('jwt-secret');

  const check = (user) => {
    if (!user) {
      throw new Error('login failed');
    } else {
      if (user.verify(password)) {
        const promise = new Promise((resolve, reject) => {
          jwt.sign(
            {
              _id: user._id,
              username: user.username,
              admin: user.admin,
            },
            secret,
            {
              expiresIn: '7d',
              issuer: 'keuni.com',
              subject: 'userInfo',
            },
            (error, token) => {
              if (error) reject(error);

              resolve(token);
            }
          );
        });

        return promise;
      } else {
        throw new Error('login failed');
      }
    }
  };

  const respond = (token) => {
    response.json({
      message: 'logged in successfully',
      token,
    });
  };

  const onError = (error) => {
    response.status(403).json({
      message: error.message,
    });
  };

  User.findOneByUsername(username).then(check).then(respond).catch(onError);
};

exports.check = (request, response) => {
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

  const respond = (token) => {
    response.json({
      success: true,
      info: token,
    });
  };

  const onError = (error) => {
    response.status(403).json({
      success: false,
      message: error.message,
    });
  };

  promise.then(respond).catch(onError);
};
