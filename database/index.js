import mongoose from 'mongoose'
mongoose.set('strictQuery', true)

let numOfRetries = 5

const connectDB = async () => {
  try {
    await mongoose.connect(
      `${process.env.MONGO_URL}${process.env.MONGO_DB_NAME}`
    )
    console.log('Auth DB Connected!')
  } catch (err) {
    if (numOfRetries === 0) process.exit()
    setTimeout(async () => {
      numOfRetries--
      await connectDB()
    }, 5000)
  }
}

export default connectDB
