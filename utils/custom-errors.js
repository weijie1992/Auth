const STATUS_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
  UN_AUTHORISED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER: 500,
  UNCAUGHT: 503,
}

class BaseError extends Error {
  constructor(name, statusCode, description) {
    console.log(
      '🚀 ~ file: custom-errors.js:13 ~ BaseError ~ constructor ~ description:',
      description
    )
    console.log(
      '🚀 ~ file: custom-errors.js:13 ~ BaseError ~ constructor ~ statusCode:',
      statusCode
    )
    console.log(
      '🚀 ~ file: custom-errors.js:13 ~ BaseError ~ constructor ~ name:',
      name
    )
    //calls Error class and pass in the description
    super(description)
    //Dont think this line is needed later try removing
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = name
    this.statusCode = statusCode
    console.log(
      '🚀 ~ file: custom-errors.js:22 ~ BaseError ~ constructor ~ this:',
      this
    )
    console.log(
      '🚀 ~ file: custom-errors.js:22 ~ BaseError ~ constructor ~ this:Keys',
      Object.keys(this)
    )
    console.log(
      '🚀 ~ file: custom-errors.js:22 ~ BaseError ~ constructor ~ this:',
      typeof this
    )
    console.log(
      '🚀 ~ file: custom-errors.js:22 ~ BaseError ~ constructor ~ this:',
      JSON.stringify(this)
    )
    //return Strings that represents the location of the particular error in the call.
    Error.captureStackTrace(this)
  }
}

//500 internal uncaught error
class UncaughtError extends BaseError {
  constructor(description) {
    super('uncaught error', STATUS_CODES.UNCAUGHT, description)
  }
}
//500 internal error
class InternalServerError extends BaseError {
  constructor(description) {
    super('internal server error', STATUS_CODES.INTERNAL_SERVER, description)
  }
}
//400 bad request
class BadRequest extends BaseError {
  constructor(description) {
    super('bad request', STATUS_CODES.BAD_REQUEST, description)
  }
}

// 401 Authorize error
class UnAuthorizeError extends BaseError {
  constructor(description) {
    console.log(
      '🚀 ~ file: custom-errors.js:46 ~ UnAuthorizeError ~ constructor ~ description',
      description
    )
    super('unauthorized', STATUS_CODES.UN_AUTHORISED, description)
  }
}

// 403 Authorize error
class ForbiddenError extends BaseError {
  constructor(description) {
    super('forbidden', STATUS_CODES.FORBIDDEN, description)
  }
}

//404
class NotFoundError extends BaseError {
  constructor(description) {
    super('not found', STATUS_CODES.NOT_FOUND, description)
  }
}

export {
  BaseError,
  UncaughtError,
  InternalServerError,
  BadRequest,
  UnAuthorizeError,
  ForbiddenError,
  NotFoundError,
}
