import bcrypt from 'bcrypt'
import { APIError } from '../utils/custom-errors.js'
const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS))
  } catch (err) {
    throw new APIError(err)
  }
}

export default { hashPassword }
