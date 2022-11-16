require('dotenv').config()
require('colors').enable()
require('express-async-errors')
const express = require('express')
const app = express()

//! Security Packages
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')

const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')
const authRouter = require('./routes/auth')
const jobsRouter = require('./routes/jobs')

app.set('trust proxy', 1)
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
)
app.use(express.json())
app.use(helmet())
app.use(cors())
app.use(xss())

// Connect DB
const connectDB = require('./db/connect')
const authenticateUser = require('./middleware/authentication')

// * Routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/jobs', authenticateUser, jobsRouter)

// ? Middleware
app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

// ! Application
const port = process.env.PORT || 3000

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL)
    console.log('[MongoDB] started'.brightWhite)
    app.listen(port, console.log('Listening: http://localhost:3000/'.brightGreen.bold))
  } catch (error) {
    console.log(error.message)
  }
}

start()
