import { authenticator } from "otplib";
import qrcode from "qrcode";
import { User } from "../models/user";
import { BadRequestError } from "@aaticketsaa/common";

export const generate2FASetup = async (userId: string) => {
  console.log(userId, "userIduserId");
  const user = await User.findOne({ _id: userId });
  console.log(user, "user");

  if (!user) throw new BadRequestError("User not found");

  const secret = authenticator.generateSecret(); // generate a base32 TOTP secret
  const otpauth = authenticator.keyuri(
    user.email,
    "Ticketing Application",
    secret
  ); // otpauth:// URL format
  const qrCode = await qrcode.toDataURL(otpauth); // convert otpauth to base64 QR image

  await User.updateOne(
    { _id: userId },
    {
      tempTwoFactorSecret: secret, // not the final field used for login
      twoFactorEnabled: false,
    }
  );
  return { qrCode };
};

export const verify2FASetup = async (userId: string, PIN_token: string) => {
  const user = await User.findOne({ _id: userId });

  console.log(userId, user, "---------------------------------");
  if (!user?.tempTwoFactorSecret) throw new BadRequestError("2FA not enabled");

  const isValid = authenticator.verify({
    token: PIN_token,
    secret: user.tempTwoFactorSecret,
  });
  if (!isValid) {
    throw new BadRequestError("Invalid 2FA PIN_token");
  }
  user.twoFactorEnabled = true;
  user.twoFactorSecret = user.tempTwoFactorSecret;
  user.tempTwoFactorSecret = undefined;
  await user.save();

  return true;
};

export const verify2FALogin = async (userId: string, token: string) => {
  const user = await User.findOne({ _id: userId });
  console.log(
    user,
    userId,
    "-------------------2--------------",
    user?.twoFactorSecret
  );
  if (!user?.twoFactorSecret) throw new BadRequestError("2FA not enabled-----");

  const isValid = authenticator.verify({
    token,
    secret: user.twoFactorSecret,
  });

  if (!isValid) throw new BadRequestError("Invalid 2FA code");

  return user;
};

export const disable2FA = async (userId: string) => {
  try {
    await User.updateOne(
      { _id: userId },
      {
        twoFactorEnabled: false,
        twoFactorSecret: undefined,
      }
    );

    return true;
  } catch (e) {
    throw new BadRequestError("Failed disabling 2FA");
  }
};
