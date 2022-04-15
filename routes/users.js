const users = require('express').Router();
const {
  getUsers, getUser, createUser, getUserInfo, updateAvatar, updateUserInfo,
} = require('../controllers/users');

const {
  idValidation, userInfoValidation, userAvatarValidation,
} = require('../middlewares/validation');

users.get('/', getUsers);
users.post('/', createUser);
users.get('/:id', idValidation, getUser);
users.get('/me', idValidation, getUserInfo);
users.patch('/me', userInfoValidation, updateUserInfo);
users.patch('/me/avatar', userAvatarValidation, updateAvatar);

module.exports = users;
