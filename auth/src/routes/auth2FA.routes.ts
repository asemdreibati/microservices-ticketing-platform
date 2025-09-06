import { NextFunction, Request, Response, Router } from "express";

import {
  setup2FA,
  confirm2FASetup,
  complete2FALogin,
  disable2FAController,
} from "../controllers/2fa.controller";
import jwt from "jsonwebtoken";
import { currentUser, requireAuth } from "@aaticketsaa/common";
import { User } from "../models/user";
export interface AuthedRequest extends Request {
  userId?: string;
}

export const signTemp2FAToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.TEMP_2FA_TOKEN_SECRET!, {
    expiresIn: "5m",
  });
};

export const verifyTemp2FAToken = (token: string) => {
  console.log(
    "process.env.TEMP_2FA_TOKEN_SECRET",
    process.env.TEMP_2FA_TOKEN_SECRET
  );
  return jwt.verify(token, process.env.TEMP_2FA_TOKEN_SECRET!) as {
    userId: string;
  };
};
// 🔑 For users in 2FA flow (temp token after password login)
const requireTempToken = (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): void => {
  const tempToken = req.body.tempToken;

  try {
    const payload = verifyTemp2FAToken(tempToken);
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired temp token" });
  }
};

const router = Router();

// router.post("/signup", signup);
// router.post("/login", login);
// router.post("/logout", logout);
// router.post("/refresh-token", refreshToken);
// router.post("/forgot-password", forgotPassword);
// router.post("/reset-password", resetPassword);

// router.get("/protected", requireAuth, (req, res) => {
//   res.json({
//     status: "success",
//     message: "You accessed a protected route",
//     data: { user: (req as any).user },
//   });
// });
router.get(
  "/api/users/me",
  currentUser,
  async (req: Request, res: Response) => {
    const user = await User.findOne({ _id: req?.currentUser?.id });
    res.send({ currentUser: user });
  }
);

router.post("/api/users/2fa/setup", currentUser, requireAuth, setup2FA);
router.post(
  "/api/users/2fa/verify-setup",
  currentUser,
  requireAuth,
  confirm2FASetup
);
router.post("/api/users/2fa/login", requireTempToken, complete2FALogin);
router.post(
  "/api/users/2fa/disable",
  currentUser,
  requireAuth,
  disable2FAController
);

export { router as auth2FA };
