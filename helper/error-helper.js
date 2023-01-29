import {
  ValidationError,
  UncaughtError,
  BaseError,
} from '../utils/custom-errors.js'

export default (err) => {
  console.log('🚀 ~ file: error-helper.js:8 ~ err', JSON.stringify(err))
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
