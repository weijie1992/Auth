import bcrypt from 'bcrypt'
import { UncaughtError } from '../utils/custom-errors.js'
const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS))
  } catch (err) {
    throw new UncaughtError(err)
  }
}

const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (err) {
    throw new UncaughtError(err)
  }
}

export default { hashPassword, comparePassword }
