import { PrismaClient } from "@prisma/client";
import express, { Express, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { fetchDataShopee } from "./crawl-data";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const prisma = new PrismaClient();
const app: Express = express();

app.use(express.json());
// Return with header allow COR
app.use(cors());
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
  // Get sortOrder from query string
  const { sortOrder, page, limit } = req.query;
  const _sortOrder = sortOrder || "asc";
  const _page = page || 1;
  // Get page from query
  const result = await fetchDataShopee();
  // Sort result by name descending or ascending
  if (_sortOrder === "asc") {
    result.sort((a, b) => a.name.localeCompare(b.name));
  } else if (_sortOrder === "desc") {
    result.sort((a, b) => b.name.localeCompare(a.name));
  } else {
    res.status(400).json({ error: "Invalid sortOrder" });
    return
  }

  // Paginate result
  const perPage = Number(limit) || 10;
  const start = (Number(_page) - 1) * perPage;
  const end = start + perPage;
  const paginatedResult = result.slice(start, end);

  const finalData = paginatedResult.map((item) => {
    return {
      ...item,
      image: `https://cf.shopee.vn/file/${item.image}`
    }
  })
  if (finalData) res.json(finalData);
  else res.status(500).json({ error: "Internal server error" });
})
app.listen(process.env.APP_PORT, () => console.log(`Server started on port ${process.env.APP_PORT}`));
