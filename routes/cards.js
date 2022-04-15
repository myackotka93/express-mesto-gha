const cards = require('express').Router();
const {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
} = require('../controllers/cards');
const {
  cardValidation, idValidation,
} = require('../middlewares/validation');

cards.get('/', getCards);
cards.post('/', cardValidation, createCard);
cards.delete('/:id', idValidation, deleteCard);
cards.put('/:id/likes', idValidation, likeCard);
cards.delete('/:id/likes', idValidation, dislikeCard);

module.exports = cards;
