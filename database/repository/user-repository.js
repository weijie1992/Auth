import User from '../model/User.js'

const findOne = async (email) => {
  return await User.findOne({ email })
}

const save = async (user) => {
  const saveUser = new User(user)
  return await saveUser.save()
}

export default { findOne, save }
