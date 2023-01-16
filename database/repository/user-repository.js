import User from '../model/User.js'

const findOne = async (email) => {
  return await User.findOne({ email })
}

const save = async (user) => {
  const saveUser = new User(user)
  return await saveUser.save()
}

const activateEmail = async (email) => {
  return await User.findOneAndUpdate(
    { email },
    { activated: true, activatedTime: new Date() }
  )
}
export default { findOne, save, activateEmail }
