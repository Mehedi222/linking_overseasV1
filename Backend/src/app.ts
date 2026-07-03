import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './app/modules/auth/auth'
import { globalErrorHandler } from './app/middlewares/globalErrorHandler'
import routes from './routes'

const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
)

app.all('/api/auth/*splat', toNodeHandler(auth))

app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/', routes)

app.use(globalErrorHandler)

export default app
