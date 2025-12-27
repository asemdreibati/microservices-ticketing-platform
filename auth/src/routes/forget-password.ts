import { Request, Response } from "express";
import express from "express";
import {
  forgotPassword,
  resetPassword,
} from "../services/forget-password.service";
import { body } from "express-validator";
import { validateRequest } from "@aaticketsaa/common";

const router = express.Router();

router.post(
  "/api/users/forgot-password",
  [body("email").isEmail().withMessage("Valid email is required")],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email } = req.body as { email: string };
    const token = await forgotPassword(email);

    // For now, just return token so you can test
    res.json({
      message: "If the user exists, a reset link has been sent.",
      token,
    });
  }
);

router.post(
  "/api/users/reset-password",
  async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body as {
        token: string;
        newPassword: string;
      };
      await resetPassword(token, newPassword);
      res.json({ message: "Password reset successful" });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

export { router as forgotPasswordRouter };
