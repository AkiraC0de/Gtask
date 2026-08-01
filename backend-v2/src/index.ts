import express, {Request, Response} from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import initalizeDatabase from "./db/connect";

const app = express()

app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Gtask API.",
    endPoints: {
      auth: "/api/auth",
      users: "/api/users"
    }
  })
})

app.listen(process.env.PORT, async () => {
  try {
    await initalizeDatabase()
    console.log("Startup success. Server 2.0 is now running on port:", process.env.PORT)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message)
    } else {
      console.error('Cannot start the server. An unknown error occurred');
    }
  }
})