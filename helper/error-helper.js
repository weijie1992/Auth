import {
  ValidationError,
  UncaughtError,
  BaseError,
} from '../utils/custom-errors.js'

export default (err) => {
  if (err instanceof BaseError) {
    if (
      err.name &&
      (err.name === 'TokenExpiredError' ||
        err.name === 'JsonWebTokenError' ||
        err.name === 'NotBeforeError')
    ) {
      throw new ValidationError(`${err}`)
    }
  } else {
    throw new UncaughtError(err)
  }
  throw err
}
