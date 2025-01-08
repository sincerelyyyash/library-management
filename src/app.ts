import express from 'express'
import cors from 'cors';
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit';

const app = express()


app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));


app.use(express.json({
  limit: "16kb"
}))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.use(express.urlencoded({
  extended: true,
  limit: "16kb"
}))

app.use(express.static("public"))

app.use(cookieParser())


export { app }
