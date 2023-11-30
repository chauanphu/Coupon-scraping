import { PrismaClient } from '@prisma/client'
import express from 'express'

const prisma = new PrismaClient()
const app = express()

app.use(express.json())

// ... your REST API routes will go here

app.listen(process.env.APP_PORT, () =>
  console.log('REST API server ready at: http://localhost:'+process.env.APP_PORT),
)