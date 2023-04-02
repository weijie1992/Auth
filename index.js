import express from 'express'
const app = express()
import cors from 'cors'
import helmet from 'helmet'

import * as dotenv from 'dotenv'

//DOT ENV and CORS
if (process.env.NODE_ENV !== 'PROD') {
  app.use(
    cors({
      origin: 'http://localhost:5173',
      optionsSuccessStatus: 200,
      methods: 'GET,POST',
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )
  dotenv.config({ path: './.env' })
} else {
  dotenv.config()
}
app.use(helmet())
import connectDB from './database/index.js'
import authRouter from './routers/auth-secure-router.js'
import bodyParser from 'body-parser'

await connectDB()

app.use(bodyParser.json())

app.use('/auth', authRouter)

//catch all errors and format and report to logger,
//When throw statement or and catch statement is caught it will handle in this route
app.use((err, _req, res, _next) => {
  console.log('🚀 ~ file: index.js:26 ~ app.use ~ err', err)
  const statusCode = err.statusCode || 504
  const data = err.data || err.message
  return res.status(statusCode).json(data)
})

app.listen(3000, () => {
  console.log('Auth Api running on port 3000')
})
