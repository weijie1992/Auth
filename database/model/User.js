import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      required: [true,'Email is required'],
      unique: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      trim: true,
      required: [true, 'Fullname is required'],
    },
    password: { type: String, required: [true,'Password is required'] },
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
