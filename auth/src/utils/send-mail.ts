import { InternalServerError } from "@aaticketsaa/common";
import nodemailer from "nodemailer";

export const sendMail = async (
  email: string,
  expirationMiutes: number | Date,
  redirectionLink: string
) => {
  // EMAIL CONFIGURATION
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST,
    port: +process.env.EMAIL_PORT!,
    secure: true,
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Your Login Link",
    text: `Hi ${email.split("@")[0]}!

            Click this link to log in: ${redirectionLink}

            This link expires in ${expirationMiutes} minutes.

            If you didn't request this, please ignore this email.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Magic link sent to ${email}`);
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new InternalServerError("Failed to send email");
  }
};
