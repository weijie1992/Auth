import express from 'express'
import * as dotenv from 'dotenv'
import connectDB from './database/index.js'
import authRouter from './routers/auth-secure-router.js'
import bodyParser from 'body-parser'
//DOT ENV
if (process.env.NODE_ENV !== 'PROD') {
  dotenv.config({ path: './.env' })
} else {
  dotenv.config()
}

connectDB()

const app = express()
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('hello world22')
})

app.use('/auth', authRouter)

app.listen(3000)
