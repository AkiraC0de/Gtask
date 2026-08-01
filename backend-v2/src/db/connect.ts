import mongoose from "mongoose"
import dns from "node:dns"

export default async function initalizeDatabase(): Promise<void> {
  try {
      dns.setServers(['8.8.8.8', '1.1.1.1']) // fixed the connection error with mongoDB Server
      console.log("Connecting to database...")
      await mongoose.connect(process.env.MONGO_URI ?? "") // try establishing a connection
      console.log("Sucessfully connected to the DATABASE MongoDB");
  } catch (error: unknown) {
    if (error instanceof Error) {
        throw new Error(`Server had database connection error. Try checking the database for activity. Error message: ${error.message}`)
    } 
  }
}