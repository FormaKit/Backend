import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "dotenv";
import path from "path";

const app = express();
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
config({ path: envFile });

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({ origin: [process.env.CLIENT_URL as string] }));
app.use(express.json());

app.get("/", (req: Request, res: Response, next) => {
  res.status(200).send({hello: "world"})
  next()
})

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
