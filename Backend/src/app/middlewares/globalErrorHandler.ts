import { NextFunction, Request, Response } from 'express'
import { AppError } from '../errorHelpers/AppError'

export const globalErrorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('[globalErrorHandler]', error)

  if (error instanceof AppError) {
    res.status(error.statusCode).json({ success: false, message: error.message, data: null })
    return
  }

  if (error instanceof Error) {
    res.status(500).json({ success: false, message: error.message, data: null })
    return
  }

  res.status(500).json({ success: false, message: 'Something went wrong.', data: null })
}

export default globalErrorHandler
