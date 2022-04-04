const User = require('../models/user');
const { errorOutput } = require('../utils/utils');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => errorOutput(err, res));
};

module.exports.getUser = (req, res) => {
  User.findById(req.params._id)
    .orFail(() => new Error('incorrectUserId'))
    .then((user) => res.send({ data: user }))
    .catch((err) => errorOutput(err, res));
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => errorOutput(err, res));
};

module.exports.updateUserInfo = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, {
    new: true,
    runValidators: true,
  })
    .orFail(() => new Error('incorrectUserId'))
    .then((user) => res.send({ data: user }))
    .catch((err) => errorOutput(err, res));
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, {
    new: true,
    runValidators: true,
  })
    .orFail(() => new Error('incorrectUserId'))
    .then((user) => res.send({ data: user }))
    .catch((err) => errorOutput(err, res));
};