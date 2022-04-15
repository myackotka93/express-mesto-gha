const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');
const ConflictError = require('../errors/conflict-err');
const AuthorizedError = require('../errors/auth-err');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((data) => res
      .status(200)
      .send({ data }))
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  User.findById(req.params.id)
    .orFail(() => {
      throw new Error('NotFound');
    })
    .then((data) => res.status(200).send({ data }))
    .catch((err) => {
      if (err.message === 'NotFound') {
        throw new NotFoundError(err.message);
      } else if (err.kind === 'ObjectId') {
        throw new BadRequestError('Неверный id пользователя');
      }
    })
    .catch(next);
};

module.exports.getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      throw new Error('Такого пользователя не существует');
    })
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Некорректный Id');
      }
      throw new NotFoundError(err.message);
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!email || !password) {
    throw new NotFoundError('Неверная почта или пароль');
  }

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res
      .status(200)
      .send({ data: { _id: user._id, email: user.email } }))
    .catch((err) => {
      if (err.name === 'MongoError' || err.code === 11000) {
        throw new ConflictError('Пользователь с таким email уже существует');
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new BadRequestError('Пароль или почта некорректны');
      }
    })
    .catch(next);
};

module.exports.updateUserInfo = (req, res, next) => {
  const { name, about } = req.body;

  if (!name || !about) {
    throw new BadRequestError('Введенные данные о пользователе некорректны');
  }

  User.findByIdAndUpdate(req.user._id, { name, about }, {
    new: true,
    runValidators: true,
  })
    .orFail(() => {
      throw new Error('invalidUserId');
    })
    .then((data) => res.status(200).send({ data }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new BadRequestError('Введенные данные некорректны');
      }
      throw new NotFoundError(err.message);
    })
    .catch(next);
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  if (!avatar) {
    throw new BadRequestError('Введенные данные о пользователе некорректны');
  }

  User.findByIdAndUpdate(req.user._id, { avatar }, {
    new: true,
    runValidators: true,
  })
    .orFail(() => {
      throw new Error('invalidUserId');
    })
    .then((data) => res.status(200).send({ data }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new BadRequestError('Введенные данные некорректны');
      }
      throw new NotFoundError(err.message);
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Введенные данные о пользователе некорректны');
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'super-secret', { expiresIn: '7d' });
      const data = {
        _id: user._id,
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
      };
      res
        .status(200)
        .send({ data, token });
    })
    .catch((err) => {
      throw new AuthorizedError(err.message);
    })
    .catch(next);
};
