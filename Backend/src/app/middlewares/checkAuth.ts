import { NextFunction, Request, Response } from 'express'
import { fromNodeHeaders } from 'better-auth/node'
import { auth } from '../modules/auth/auth'
import { AppError } from '../errorHelpers/AppError'

declare global {
  namespace Express {
    interface Request {
      session?: Awaited<ReturnType<typeof auth.api.getSession>>
    }
  }
}

export const checkAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) })
    if (!session) {
      throw new AppError(401, 'You must be signed in to do that.')
    }
    req.session = session
    next()
  } catch (error) {
    next(error)
  }
}

export default checkAuth
