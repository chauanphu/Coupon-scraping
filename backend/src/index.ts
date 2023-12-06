import express, { Express, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { fetchDataShopee } from "./crawl-data";
import dotenv from "dotenv";
import cors from "cors";
import { prisma, addCoupon, getManyCoupon } from "./db";
dotenv.config();

const app: Express = express();

app.use(express.json());
// Return with header allow COR
app.use(cors());
// Define the generateJWT function
function generateJWT(username: string): string {
  const secret = process.env.AUTH_SECRET as string;
  const token = jwt.sign(username, secret);
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

app.get("/shopee", async (req, res) => {
  // Get sortOrder from query string
  try {
    const { sortOrder, page, limit } = req.query;
    const _sortOrder = sortOrder || "asc";
    const _page = Number(page) || 1;
    const _limit = Number(limit) || 8;
    // Get page from query
    let result = await getManyCoupon(_sortOrder as "asc" | "desc", Number(_page), Number(_limit));
    // If there is no result, crawl data
    if (!result || result.length === 0) {
      result = await fetchDataShopee();
      // Save data to database
      result?.forEach(async (item) => {
        await addCoupon({
          ...item,
          image: `https://cf.shopee.vn/file/${item.image}`,
        });
      });
    }
    // const result = await fetchDataShopee();
    if (!result || result.length === 0) {
      res.status(500).json({ error: "Internal server error", message: "No data found" });
      return;
    }

    res.json(result.map(item => ({
      ...item,
      product_id: Number(item.product_id), // Serialize BigInt to string
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error", message: error });
  }
});
app.listen(process.env.APP_PORT, () =>
  console.log(`Server started on port ${process.env.APP_PORT}`)
);
