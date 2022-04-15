const Card = require('../models/card');
const BadRequestError = require('../errors/bad-request-err');
const ForbiddenError = require('../errors/forbidden-err');
const NotFoundError = require('../errors/not-found-err');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((data) => res
      .status(200)
      .send({ data }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((data) => res.status(200).send({ data }))
    .catch((err) => {
      throw new BadRequestError(err.message);
    })
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.id)
    .orFail(() => {
      throw new Error('invalidUserId');
    })
    .then((data) => {
      if (data.owner._id.toString() !== req.user._id.toString()) {
        throw new ForbiddenError('Чужие карточки нельзя удалять');
      }
      Card.findByIdAndRemove(req.params.id)
        .then((newCard) => res.status(200).send({ data: newCard }))
        .catch((err) => {
          throw new NotFoundError(err.message);
        })
        .catch(next);
    })
    .catch((err) => {
      throw new NotFoundError(err.message);
    })
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new Error('NotFound');
    })
    .then((data) => res.status(200).send({ data }))
    .catch((err) => {
      if (err.message === 'NotFound') {
        throw new NotFoundError(err.message);
      }
      throw new BadRequestError('Переданы неверные данные при лайке карточки');
    })
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new Error('NotFound');
    })
    .then((data) => res
      .status(200)
      .send({ data }))
    .catch((err) => {
      if (err.message === 'NotFound') {
        throw new NotFoundError(err.message);
      }
      throw new BadRequestError('Переданы неверные данные при дизлайке карточки');
    })
    .catch(next);
};
