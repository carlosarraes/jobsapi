require('dotenv').config();
require('colors').enable();
require('express-async-errors');
const express = require('express');
const app = express();
const path = require('path');

//! Security Packages
const helmet = require('helmet');
const xss = require('xss-clean');
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');

app.use(express.static(path.resolve(__dirname, './build')));
app.use(express.json());
app.use(helmet());
app.use(xss());

// Connect DB
const connectDB = require('./db/connect');
const authenticateUser = require('./middleware/authentication');

// * Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobsRouter);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './build', 'index.html'));
});

// ? Middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// ! Application
const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    console.log('[MongoDB] started'.brightWhite);
    app.listen(port, console.log('Listening: http://localhost:3000/'.brightGreen.bold));
  } catch (error) {
    console.log(error.message);
  }
};

start();
