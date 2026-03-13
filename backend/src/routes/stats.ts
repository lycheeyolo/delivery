import { Router } from "express";
import { prisma } from "../config/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth";

export const router = Router();

router.use(authMiddleware);

router.get("/daily", async (req: AuthRequest, res, next) => {
  try {
    const dateStr = (req.query.date as string) || new Date().toISOString().slice(0, 10);
    const courierId = req.courierId!;
    const start = new Date(dateStr + "T00:00:00");
    const end = new Date(dateStr + "T23:59:59");

    const total = await prisma.deliveryOrder.count({
      where: {
        courierId,
        createdAt: { gte: start, lte: end },
      },
    });

    const done = await prisma.deliveryOrder.count({
      where: {
        courierId,
        status: "done",
        createdAt: { gte: start, lte: end },
      },
    });

    const pending = await prisma.deliveryOrder.count({
      where: {
        courierId,
        status: "pending",
        createdAt: { gte: start, lte: end },
      },
    });

    res.json({ date: dateStr, total, done, pending });
  } catch (err) {
    next(err);
  }
});

