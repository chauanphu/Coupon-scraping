import { PrismaClient } from "@prisma/client";
import express, { Express, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { fetchDataShopee } from "./crawl-data";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();
const app: Express = express();

app.use(express.json());
// Return with header allow COR
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  // Allow all methods
  res.header("Access-Control-Allow-Methods", "*");
  next();
});
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

// Define signup route
app.post("/signup", async (req: Request, res: Response) => {
  // Parse the form data
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "Missing username or password" });
  }
  // Check if the username is already taken
  try {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    // If it is, return a 409
    if (user) {
      res.status(409).json({ error: "Username already taken" });
    } else {
      // If not, create the user
      await prisma.user.create({
        data: {
          username,
          password,
        },
      });
      // Return a 201
      res.status(201).json({ message: "User created" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    console.error(error);
  }
});

app.get('/shopee', async (req, res) => {
  // Get page from query
  const result = await fetchDataShopee();
  if (result) res.json(result);
  else res.status(500).json({ error: "Internal server error" });
})
app.listen(process.env.APP_PORT, () => console.log(`Server started on port ${process.env.APP_PORT}`));
