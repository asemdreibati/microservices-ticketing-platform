import { User } from "../models/user";
import { sendMail } from "../utils/send-mail";
import crypto from "crypto";
import { Password } from "./password";
import { NotFoundError } from "@aaticketsaa/common";

const generateResetToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes from now
  return { token, expiry };
};
export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new NotFoundError("No account found with this email");

  const { token, expiry } = generateResetToken();
  console.log(token, expiry, "token, expiry ");

  await User.updateOne(
    { email },
    {
      resetToken: token,
      resetTokenExp: expiry,
    }
  );

  // In real app: send email here
  console.log(
    `🔗 Password reset link: ${process.env.RESET_PASSWORD_REDIRECTION}?token=${token}`
  );
  await sendMail(
    email,
    expiry,
    `${process.env.RESET_PASSWORD_REDIRECTION}?token=${token}`
  );
};

export const resetPassword = async (token: string, newPassword: string) => {
  const user = await User.findOne({
    resetToken: token,
    resetTokenExp: { $gte: new Date() },
  });
  if (!user) throw new Error("Invalid or expired reset token");

  user.password = newPassword;
  user.resetToken = undefined;
  user.resetTokenExp = undefined;
  user.save();
};
