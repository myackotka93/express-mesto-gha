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
    .then((data) => {
      if (!data) {
        throw new NotFoundError('Запрашиваемый пользователь не найден');
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.message === 'NotFound') {
        next(new NotFoundError(err.message));
      } if (err.kind === 'ObjectId') {
        next(new BadRequestError('Неверный id пользователя'));
      } else {
        next(err);
      }
    });
};

module.exports.getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .then((data) => {
      if (!data) {
        throw new NotFoundError('Запрашиваемый пользователь не найден');
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Введены некорректные данные'));
      } else {
        next(err);
      }
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Неверная почта или пароль');
  }

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res
      .status(200)
      .send({ data: { _id: user._id, email: user.email } }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('Пароль или почта некорректны'));
      } else if (err.name === 'MongoError' || err.code === 11000) {
        next(new ConflictError('Пользователь с таким email уже существует'));
      }
      next(err);
    });
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
    .then((data) => {
      if (!data) {
        throw new NotFoundError('Запрашиваемый пользователь не найден');
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('Введены некорректные данные'));
      } else {
        next(err);
      }
    });
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
    .then((data) => {
      if (!data) {
        throw new NotFoundError('Запрашиваемый пользователь не найден');
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
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
