import { Router } from "express";
import { prisma } from "../config/prisma";
import { authMiddleware } from "../middleware/auth";

export const router = Router();

router.use(authMiddleware);

router.get("/", async (req, res, next) => {
  try {
    const phone = (req.query.phone as string) || "";
    const contacts = await prisma.contact.findMany({
      where: phone
        ? {
            phone: {
              contains: phone,
            },
          }
        : {},
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

router.post("/", async (req, res, next) => {
  try {
    const { phone, displayName } = req.body;
    if (!phone || !displayName) {
      return res.status(400).json({ message: "手机号和姓名必填" });
    }
    const contact = await prisma.contact.create({
      data: { phone, displayName },
    });
    res.status(201).json(contact);
  } catch (err) {
    next(err);
  }
});

router.post("/households", async (req, res, next) => {
  try {
    const { contactId, addressText, lat, lng, doorplate, note } = req.body;
    if (!contactId || !addressText || lat == null || lng == null) {
      return res.status(400).json({ message: "缺少必要参数" });
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

