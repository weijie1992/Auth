import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  salt: String,
  phone: String,
  // address: [{
  //   type: Schema.Types.ObjectId, ref:'address',require:true
  // }],
})
export default mongoose.model('users', UserSchema)
