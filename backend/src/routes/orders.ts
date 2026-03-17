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
        deletedAt: null,
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

router.get("/delivery-list", async (req: AuthRequest, res, next) => {
  try {
    const courierId = req.courierId!;
    const orders = await prisma.deliveryOrder.findMany({
      where: {
        courierId,
        // 前端自行按 status / deletedAt 分组，这里返回所有状态
      },
      include: {
        household: {
          include: {
            contact: true,
          },
        },
        notes: true,
      },
      orderBy: { createdAt: "asc" },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req: AuthRequest, res, next) => {
  try {
    const courierId = req.courierId!;
    const { householdId, gasQuantity, plannedTime, taskNote } = req.body;
    if (!householdId) {
      return res.status(400).json({ message: "householdId 必填" });
    }
    const household = await prisma.household.findUnique({
      where: { id: householdId },
      include: { contact: true },
    });
    if (!household) {
      return res.status(404).json({ message: "地址不存在" });
    }
    if (household.contact.courierId !== courierId) {
      return res.status(403).json({ message: "只能为自己的联系人创建配送任务" });
    }

    const order = await prisma.deliveryOrder.create({
      data: {
        courierId,
        householdId,
        gasQuantity: gasQuantity ?? null,
        plannedTime: plannedTime ? new Date(plannedTime) : null,
      },
    });

    if (taskNote != null && String(taskNote).trim()) {
      await prisma.deliveryNote.create({
        data: { orderId: order.id, content: String(taskNote).trim() },
      });
    }

    const created = await prisma.deliveryOrder.findUnique({
      where: { id: order.id },
      include: {
        household: { include: { contact: true } },
        notes: true,
      },
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/status", async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const courierId = req.courierId!;
    const { status, finishedAt } = req.body;
    const order = await prisma.deliveryOrder.findFirst({
      where: { id, courierId },
    });
    if (!order) {
      return res.status(404).json({ message: "订单不存在" });
    }
    const updated = await prisma.deliveryOrder.update({
      where: { id },
      data: {
        status,
        finishedAt: finishedAt ? new Date(finishedAt) : status === "done" ? new Date() : null,
      },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/note", async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const courierId = req.courierId!;
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: "备注内容不能为空" });
    }
    const order = await prisma.deliveryOrder.findFirst({
      where: { id, courierId, deletedAt: null },
    });
    if (!order) {
      return res.status(404).json({ message: "订单不存在" });
    }
    const note = await prisma.deliveryNote.create({
      data: { orderId: id, content },
    });
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const courierId = req.courierId!;
    const order = await prisma.deliveryOrder.findFirst({
      where: { id, courierId },
    });
    if (!order) {
      return res.status(404).json({ message: "订单不存在" });
    }
    const updated = await prisma.deliveryOrder.update({
      where: { id },
      data: {
        status: "canceled",
        deletedAt: new Date(),
      },
    });
    res.json({ success: true, order: updated });
  } catch (err) {
    next(err);
  }
});
