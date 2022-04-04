const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const INTERNAL_SERVER_ERROR = 500;

function errorOutput(err, res) {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    res.status(BAD_REQUEST).send({ message: 'Данные неверны' });
    return;
  }
  if (err.message === 'incorrectUserId') {
    res.status(NOT_FOUND).send({ message: 'Пользователь не найден' });
    return;
  }
  if (err.message === 'incorrectCardId') {
    res.status(NOT_FOUND).send({ message: 'Карточка не найдена' });
    return;
  } res.status(INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
}

module.exports = { errorOutput };