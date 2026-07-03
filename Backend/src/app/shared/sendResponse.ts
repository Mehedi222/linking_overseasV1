import { Response } from 'express'

interface ISendResponse<T> {
  statusCode: number
  success: boolean
  message: string
  data?: T
}

export const sendResponse = <T>(res: Response, payload: ISendResponse<T>) => {
  res.status(payload.statusCode).json({
    success: payload.success,
    message: payload.message,
    data: payload.data ?? null,
  })
}

export default sendResponse
