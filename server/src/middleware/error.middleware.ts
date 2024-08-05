import { NextFunction, Request, Response } from 'express'
import { logEvents } from './logger.middleware'
import HttpException from '../exceptions/root'

type ErrorResponse = {
  success: boolean
  message: string
  stack?: string
}

export default (error: HttpException, req: Request, res: Response, _next: NextFunction) => {
  if (process.env.NODE_ENV === 'test')
    logEvents(
      `${error.name}: ${error.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
      'testLog.log',
    )
  else
    logEvents(
      `${error.name}: ${error.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
      'errLog.log',
    )

  console.log(error.stack)

  const statusCode = error.statusCode || 500
  const errorResponse: ErrorResponse = {
    success: false,
    message: error.isOperational ? error.message : 'Something went wrong!',
  }

  if (process.env.NODE_ENV === 'development' && error.isOperational) {
    errorResponse.stack = error.stack
  }

  res.status(statusCode).json(errorResponse)
}