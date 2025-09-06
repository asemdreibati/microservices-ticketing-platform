import { Request, Response } from "express";
import * as twoFactorService from "../services/2fa.service";
import jwt from "jsonwebtoken";
import { BadRequestError } from "@aaticketsaa/common";

export const setup2FA = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const { qrCode } = await twoFactorService.generate2FASetup(userId);
  res.json({ qrCode });
};

export const confirm2FASetup = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { token: PIN_token } = req.body;

  await twoFactorService.verify2FASetup(userId, PIN_token);
  res.json({
    success: true,
  });
};

export const complete2FALogin = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { token } = req.body;

  let user = await twoFactorService.verify2FALogin(userId, token);
  if (user) {
    // Generate JWT token
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
        twoFactorEnabled: user.twoFactorEnabled,
        verified: true,
      },
      process.env.JWT_KEY!
    );

    // Store it on session object
    req.session = {
      jwt: userJwt,
    };
    res.json({
      success: true,
    });
  }
};

export const disable2FAController = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  await twoFactorService.disable2FA(userId);
  res.json({
    success: true,
  });
};
