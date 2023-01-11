import * as dotenv from 'dotenv'
//DOT ENV
if (process.env.NODE_ENV !== 'PROD') {
  dotenv.config({ path: './.env' })
} else {
  dotenv.config()
}
import express from 'express'
import connectDB from './database/index.js'
import authRouter from './routers/auth-secure-router.js'
import bodyParser from 'body-parser'

await connectDB()

const app = express()
app.use(bodyParser.json())

app.use('/auth', authRouter)

//catch all errors and format and report to logger,
//When throw statement or and catch statement is caught it will handle in this route
app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 504
  const data = err.data || err.message
  return res.status(statusCode).json(data)
})

app.listen(3000, () => {
  console.log('Express App running on port 3000')
})
