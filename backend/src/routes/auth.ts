import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";
import { authMiddleware, AuthRequest } from "../middleware/auth";

export const router = Router();

router.post("/login", async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: "手机号和密码必填" });
    }

    const courier = await prisma.courier.findUnique({ where: { phone } });
    if (!courier) {
      return res.status(401).json({ message: "用户不存在" });
    }

    const skipPasswordCheck = process.env.DEV_SKIP_PASSWORD_CHECK === "true";
    if (!skipPasswordCheck) {
      const ok = await bcrypt.compare(password, courier.password);
      if (!ok) {
        return res.status(401).json({ message: "密码错误" });
      }
    }

    const secret = process.env.JWT_SECRET || "dev-secret";
    const token = jwt.sign(
      { courierId: courier.id, phone: courier.phone },
      secret,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      courier: {
        id: courier.id,
        name: courier.name,
        phone: courier.phone,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const { phone, password, name } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "手机号和密码必填" });
    }

    const existed = await prisma.courier.findUnique({ where: { phone } });
    if (existed) {
      return res.status(400).json({ message: "该手机号已注册" });
    }

    const hash = await bcrypt.hash(password, 10);
    const courier = await prisma.courier.create({
      data: {
        phone,
        password: hash,
        name: name || phone,
      },
    });

    res.status(201).json({
      id: courier.id,
      name: courier.name,
      phone: courier.phone,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/me", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.courierId) {
      return res.status(401).json({ message: "未授权" });
    }
    const courier = await prisma.courier.findUnique({
      where: { id: req.courierId },
      select: { id: true, name: true, phone: true, createdAt: true },
    });
    if (!courier) {
      return res.status(404).json({ message: "用户不存在" });
    }
    res.json(courier);
  } catch (err) {
    next(err);
  }
});

router.put("/me", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.courierId) {
      return res.status(401).json({ message: "未授权" });
    }
    const { name, phone } = req.body as { name?: string; phone?: string };

    const data: { name?: string; phone?: string } = {};
    if (typeof name === "string" && name.trim()) {
      data.name = name.trim();
    }
    if (typeof phone === "string" && phone.trim()) {
      data.phone = phone.trim();
    }

    if (!data.name && !data.phone) {
      return res.status(400).json({ message: "没有需要更新的字段" });
    }

    if (data.phone) {
      const existed = await prisma.courier.findUnique({
        where: { phone: data.phone },
      });
      if (existed && existed.id !== req.courierId) {
        return res.status(400).json({ message: "该手机号已被其他账号使用" });
      }
    }

    const updated = await prisma.courier.update({
      where: { id: req.courierId },
      data,
      select: { id: true, name: true, phone: true, createdAt: true },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.post("/change-password", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.courierId) {
      return res.status(401).json({ message: "未授权" });
    }

    const { oldPassword, newPassword } = req.body as { oldPassword?: string; newPassword?: string };

    if (!newPassword) {
      return res.status(400).json({ message: "新密码必填" });
    }

    const courier = await prisma.courier.findUnique({ where: { id: req.courierId } });
    if (!courier) {
      return res.status(404).json({ message: "用户不存在" });
    }

    const skipPasswordCheck = process.env.DEV_SKIP_PASSWORD_CHECK === "true";
    if (!skipPasswordCheck) {
      if (!oldPassword) {
        return res.status(400).json({ message: "旧密码必填" });
      }
      const ok = await bcrypt.compare(oldPassword, courier.password);
      if (!ok) {
        return res.status(400).json({ message: "旧密码不正确" });
      }
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.courier.update({
      where: { id: req.courierId },
      data: { password: hash },
    });

    res.json({ message: "密码修改成功" });
  } catch (err) {
    next(err);
  }
});

