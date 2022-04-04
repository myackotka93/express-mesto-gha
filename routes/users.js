const users = require('express').Router();
const {
  getUsers, getUser, createUser, updateAvatar, updateUserInfo,
} = require('../controllers/users');

users.get('/', getUsers);
users.post('/', createUser);
users.get('/:_id', getUser);
users.patch('/me', updateUserInfo);
users.patch('/me/avatar', updateAvatar);

module.exports = users;
