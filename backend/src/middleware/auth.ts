import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  courierId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "未授权" });
  }
  const token = header.slice(7);

  try {
    const secret = process.env.JWT_SECRET || "dev-secret";
    const payload = jwt.verify(token, secret) as { courierId: string };
    req.courierId = payload.courierId;
    next();
  } catch {
    return res.status(401).json({ message: "令牌无效或过期" });
  }
};

