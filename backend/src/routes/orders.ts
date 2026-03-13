import { Router } from "express";
import { prisma } from "../config/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth";

export const router = Router();

router.use(authMiddleware);

router.get("/pending", async (req: AuthRequest, res, next) => {
  try {
    const courierId = req.courierId!;
    const orders = await prisma.deliveryOrder.findMany({
      where: {
        courierId,
        status: "pending",
      },
      include: {
        household: {
          include: {
            contact: true,
          },
        },
        notes: true,
      },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req: AuthRequest, res, next) => {
  try {
    const courierId = req.courierId!;
    const { householdId, gasQuantity, plannedTime } = req.body;
    if (!householdId) {
      return res.status(400).json({ message: "householdId 必填" });
    }

    const order = await prisma.deliveryOrder.create({
      data: {
        courierId,
        householdId,
        gasQuantity: gasQuantity ?? null,
        plannedTime: plannedTime ? new Date(plannedTime) : null,
      },
    });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/status", async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { status, finishedAt } = req.body;
    const order = await prisma.deliveryOrder.update({
      where: { id: Number(id) },
      data: {
        status,
        finishedAt: finishedAt ? new Date(finishedAt) : status === "done" ? new Date() : null,
      },
    });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/note", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: "备注内容不能为空" });
    }
    const note = await prisma.deliveryNote.create({
      data: {
        orderId: Number(id),
        content,
      },
    });
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
});

