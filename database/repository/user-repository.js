import User from '../model/User.js'

const findById = async (id) => {
  return await User.findById(id)
}
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
export default { findById, findOne, save, activateEmail }
