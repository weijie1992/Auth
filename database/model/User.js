import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    require: true,
    unique: true,
    lowercase: true,
  },

  username: {
    type: String,
    trim: true,
    require: true,
  },
  password: { type: String, require: true },
  salt: String,
  phone: Number,
  // address: [{
  //   type: Schema.Types.ObjectId, ref:'address',require:true
  // }],
})
export default mongoose.model('users', UserSchema)
