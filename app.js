const express = require('express');

const { PORT = 3000 } = process.env;

const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const helmet = require('helmet');
const cors = require('cors');
const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');
const NotFoundError = require('./errors/not-found-err');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { signinValidation, signupValidation } = require('./middlewares/validation');

const app = express();

app.use(cookieParser());
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.disable('x-powered-by');

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(requestLogger);

app.post('/signup', signupValidation, createUser);
app.post('/signin', signinValidation, login);

app.use(auth);
app.use('/users', auth, require('./routes/users'));
app.use('/cards', auth, require('./routes/cards'));

app.use(errorLogger);

app.use(errors());

app.use(() => {
  throw new NotFoundError('Запрашиваемый ресурс не найден');
});

app.use((err, req, res, next) => {
  res.status(err.statusCode).send({ message: err.message });
  next();
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(err.statusCode).send({ message: statusCode === 500 ? 'Что-то пошло не так' : message });
  next();
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`server started, Port: ${PORT}`);
});
