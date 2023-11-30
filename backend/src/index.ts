import { PrismaClient } from "@prisma/client";
import express, { Express, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();
const app: Express = express();

app.use(express.json());

// Define the generateJWT function
function generateJWT(username: string): string {
  const secret = process.env.AUTH_SECRET as string;
  const token = jwt.sign(username , secret);
  return token;
}

app.post("/login", async (req: Request, res: Response) => {
  // Parse the form data
  const { username, password } = req.body;
  // Check if the username and password are correct in database
    try {
      const user = await prisma.user.findUnique({
        where: {
          username,
          password,
        },
      });
      // Check if the username and password are correct
      if (user) {
        // If they are, return a JWT
        const token = generateJWT(username);
        res.json({ token });
      } else {
        // If not, return a 401
        res.status(401).json({ error: "Invalid username or password" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
      console.error(error);
    }
});
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.listen(3000, () => console.log("Server started on port 3000"));
