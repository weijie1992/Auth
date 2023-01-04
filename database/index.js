import mongoose from 'mongoose'
const connectDB = async () => {
  try {
    await mongoose.connect(
      `${process.env.MONGO_URL}${process.env.MONGO_DB_NAME}`
    )
    console.log('========================MongoDB Connected====================')
  } catch (err) {
    console.log(
      '========================Error connecting to mongodb========================',
      err
    )
  }
}

export default connectDB
