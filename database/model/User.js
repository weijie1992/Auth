import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      require: true,
      unique: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      trim: true,
      require: true,
    },
    password: { type: String, require: true },
    salt: String,
    phone: Number,
    activated: false,
    activatedTime: Date,
    // address: [{
    //   type: Schema.Types.ObjectId, ref:'address',require:true
    // }],
  },
  { timestamps: true }
)
export default mongoose.model('users', UserSchema)
