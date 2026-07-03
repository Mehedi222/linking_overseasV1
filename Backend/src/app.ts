import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { globalErrorHandler } from './app/middlewares/globalErrorHandler'

const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use(globalErrorHandler)

export default app
