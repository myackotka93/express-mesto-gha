const Card = require('../models/card');
const { errorOutput } = require('../utils/utils');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((err) => errorOutput(err, res));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => errorOutput(err, res));
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(() => new Error('incorrectCardId'))
    .then((card) => res.send({ data: card }))
    .catch((err) => errorOutput(err, res));
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true })
    .orFail(() => new Error('incorrectCardId'))
    .then((card) => res.send({ data: card }))
    .catch((err) => errorOutput(err, res));
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true })
    .orFail(() => new Error('incorrectCardId'))
    .then((card) => res.send({ data: card }))
    .catch((err) => errorOutput(err, res));
};