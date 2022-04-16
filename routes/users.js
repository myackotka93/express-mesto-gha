const users = require('express').Router();
const {
  getUsers, getUser, createUser, getUserInfo, updateAvatar, updateUserInfo,
} = require('../controllers/users');

const {
  idValidation, userInfoValidation, userAvatarValidation,
} = require('../middlewares/validation');

users.get('/', getUsers);
users.post('/', createUser);
users.get('/me', idValidation, getUserInfo);
users.get('/:id', getUser);
users.patch('/me', userInfoValidation, updateUserInfo);
users.patch('/me/avatar', userAvatarValidation, updateAvatar);

module.exports = users;
