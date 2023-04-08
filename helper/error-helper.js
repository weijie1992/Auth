import {
  UnAuthorizeError,
  UncaughtError,
  BaseError,
} from '../utils/custom-errors.js'

export default (err) => {
  if (err instanceof BaseError) {
    throw err
  } else if (
    err.name &&
    (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError')
  ) {
    throw new UnAuthorizeError(`${err.message || err}`)
  } else {
    throw new UncaughtError(err)
  }
}
