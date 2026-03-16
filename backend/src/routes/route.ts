import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { prisma } from "../config/prisma";

export const router = Router();

router.use(authMiddleware);

router.post("/optimize", async (req: AuthRequest, res, next) => {
  try {
    const courierId = req.courierId!;
    const { current, orderIds } = req.body as {
      current: { lat: number; lng: number };
      orderIds: string[];
    };
    if (!current || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ message: "缺少必要参数" });
    }

    const orders = await prisma.deliveryOrder.findMany({
      where: { id: { in: orderIds }, courierId },
      include: { household: true },
    });

    let remaining = [...orders];
    const sequence: string[] = [];
    let curLat = current.lat;
    let curLng = current.lng;

    while (remaining.length > 0) {
      let bestIndex = 0;
      let bestDist = Number.MAX_VALUE;
      remaining.forEach((o, idx) => {
        const dLat = o.household.lat - curLat;
        const dLng = o.household.lng - curLng;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);
        if (dist < bestDist) {
          bestDist = dist;
          bestIndex = idx;
        }
      });
      const nextOrder = remaining.splice(bestIndex, 1)[0];
      sequence.push(nextOrder.id);
      curLat = nextOrder.household.lat;
      curLng = nextOrder.household.lng;
    }

    res.json({ sequence });
  } catch (err) {
    next(err);
  }
});

