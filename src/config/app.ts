import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "dotenv";
import path from "path";
import { errorHandler } from "../core/ErrorHandler";
import userRoutes from "../routes/user.routes";

const app = express();
config();

app.use(express.static(path.join(__dirname, "public")));
app.use(cors({ origin: [process.env.CLIENT_URL as string] }));
app.use(express.json());

//routes
app.get("/", (req: Request, res: Response, next) => {
    res.status(200).send({ hello: "world" });
    next();
});

app.use(userRoutes);

// Global error handler
app.use(errorHandler);

export default app;
