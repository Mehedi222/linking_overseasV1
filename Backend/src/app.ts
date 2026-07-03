import 'dotenv/config'
import express from 'express'
import cors from 'cors'

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

export default app
