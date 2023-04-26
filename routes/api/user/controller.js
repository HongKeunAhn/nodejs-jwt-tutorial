const User = require('../../../models/user');

exports.list = (request, response) => {
  if (!request.decoded.admin) {
    return response.status(403).json({
      message: 'you are not an admin',
    });
  }

  User.find({}).then((users) => {
    response.json({ users });
  });
};

exports.assignAdmin = (request, response) => {
  if (!request.decoded.admin) {
    return response.status(403).json({
      message: 'you are not an admin',
    });
  }

  User.findOneByUsername(request.params.username)
    .then((user) => user.assignAdmin)
    .then(response.json({ success: true }));
};
