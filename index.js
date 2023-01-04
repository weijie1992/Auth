import express from 'express'
import * as dotenv from 'dotenv'
import connectDB from './database/index.js'
import authRouter from './routers/auth-secure-router.js'

//DOT ENV
if (process.env.NODE_ENV !== 'PROD') {
  dotenv.config({ path: './.env' })
} else {
  dotenv.config()
}

connectDB()

const app = express()

app.get('/', (req, res) => {
  res.send('hello world22')
})

app.use('/auth', authRouter)

app.listen(3000)
