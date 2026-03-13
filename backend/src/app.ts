import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import { router as authRouter } from "./routes/auth";
import { router as contactsRouter } from "./routes/contacts";
import { router as ordersRouter } from "./routes/orders";
import { router as statsRouter } from "./routes/stats";
import { router as routeRouter } from "./routes/route";

dotenv.config();

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/contacts", contactsRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/stats", statsRouter);
  app.use("/api/route", routeRouter);

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ message: "服务器内部错误" });
  });

  return app;
};

