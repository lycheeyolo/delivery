import { Router } from "express";
import { prisma } from "../config/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth";

export const router = Router();

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const courierId = req.courierId!;
    const phone = (req.query.phone as string) || "";
    const contacts = await prisma.contact.findMany({
      where: {
        courierId,
        ...(phone ? { phone: { contains: phone } } : {}),
      },
      include: {
        households: true,
      },
      take: 50,
    });
    res.json(contacts);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const courierId = req.courierId!;
    if (!id) {
      return res.status(400).json({ message: "无效的联系人 ID" });
    }
    const contact = await prisma.contact.findFirst({
      where: { id, courierId },
      include: { households: true },
    });
    if (!contact) {
      return res.status(404).json({ message: "联系人不存在" });
    }
    res.json(contact);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req: AuthRequest, res, next) => {
  try {
    const courierId = req.courierId!;
    const { phone, displayName, remark, household } = req.body as {
      phone?: string;
      displayName?: string;
      remark?: string;
      household?: { addressText?: string; lat?: number; lng?: number; doorplate?: string; note?: string };
    };
    if (!phone || !displayName) {
      return res.status(400).json({ message: "手机号和姓名必填" });
    }
    const contact = await prisma.contact.create({
      data: {
        courierId,
        phone: phone.trim(),
        displayName: displayName.trim(),
        remark: remark != null && String(remark).trim() ? String(remark).trim() : undefined,
      },
    });
    if (household && typeof household === "object" && household.lat != null && household.lng != null) {
      const addressText = household.addressText != null ? String(household.addressText).trim() : "";
      await prisma.household.create({
        data: {
          contactId: contact.id,
          addressText: addressText || `${household.lat}, ${household.lng}`,
          lat: Number(household.lat),
          lng: Number(household.lng),
          doorplate: household.doorplate != null ? String(household.doorplate).trim() || null : null,
          note: household.note != null ? String(household.note).trim() || null : null,
        },
      });
    }
    const created = await prisma.contact.findUnique({
      where: { id: contact.id },
      include: { households: true },
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.post("/households", async (req: AuthRequest, res, next) => {
  try {
    const courierId = req.courierId!;
    const { contactId, addressText, lat, lng, doorplate, note } = req.body;
    if (!contactId || !addressText || lat == null || lng == null) {
      return res.status(400).json({ message: "缺少必要参数" });
    }
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, courierId },
    });
    if (!contact) {
      return res.status(404).json({ message: "联系人不存在或无权操作" });
    }
    const household = await prisma.household.create({
      data: {
        contactId,
        addressText,
        lat,
        lng,
        doorplate,
        note,
      },
    });
    res.status(201).json(household);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const courierId = req.courierId!;
    if (!id) {
      return res.status(400).json({ message: "无效的联系人 ID" });
    }
    const contact = await prisma.contact.findFirst({
      where: { id, courierId },
    });
    if (!contact) {
      return res.status(404).json({ message: "联系人不存在或无权操作" });
    }
    await prisma.contact.delete({ where: { id } });
    res.json({ message: "已删除联系人" });
  } catch (err) {
    next(err);
  }
});
