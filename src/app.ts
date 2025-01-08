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

//Routes import 
import userRouter from "./routes/user.routes"
import authRouter from "./routes/auth.routes"
import bookRouter from "./routes/book.routes"
import paymentRouter from "./routes/payment.routes"
import analyticsRouter from "./routes/analytics.routes"

app.use("/api/v1/user", userRouter)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/book", bookRouter)
app.use("/api/v1/payment", paymentRouter)
app.use("/api/v1/analytics", analyticsRouter)

export { app }
