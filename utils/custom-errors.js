const STATUS_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
  UN_AUTHORISED: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
  UNCAUGHT_ERROR: 503,
}

class BaseError extends Error {
  constructor(name, statusCode, description) {
    //calls Error class and pass in the description
    super(description)
    //Dont think this line is needed later try removing
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = name
    this.statusCode = statusCode
    //return Strings that represents the location of the particular error in the call.
    Error.captureStackTrace(this)
  }
}

//500 internal uncaught error
class UncaughtError extends Error {
  constructor(description = 'uncaught error') {
    super(description)
    this.name = 'Uncaught Errors'
    this.statusCode = STATUS_CODES.UNCAUGHT_ERROR
  }
}
//500 internal error
class APIError extends BaseError {
  constructor(description = 'api error') {
    super('api internal server error', STATUS_CODES.INTERNAL_ERROR, description)
  }
}
//400 bad request
class ValidationError extends BaseError {
  constructor(description = 'bad request') {
    super('bad request', STATUS_CODES.BAD_REQUEST, description)
  }
}

// 403 Authorize error
class AuthorizeError extends BaseError {
  constructor(description = 'access denied') {
    super('access denied', STATUS_CODES.UN_AUTHORISED, description)
  }
}

//404
class NotFoundError extends BaseError {
  constructor(description = 'not found') {
    super('not found', STATUS_CODES.INTERNAL_ERROR, description)
  }
}

export {
  BaseError,
  UncaughtError,
  APIError,
  ValidationError,
  AuthorizeError,
  NotFoundError,
}
