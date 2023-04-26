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
  response.send('login api is working');
};
