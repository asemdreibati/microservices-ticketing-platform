import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import express, { Request, Response } from "express";
import { User } from "../models/user";
import { body } from "express-validator";
import {
  BadRequestError,
  DuplicateResourceCreation,
  NotFoundError,
  validateRequest,
  InternalServerError,
} from "@aaticketsaa/common";

if (!process.env.EMAIL_FROM) {
  throw new Error("EMAIL_FROM must be defined");
}
if (!process.env.EMAIL_PASS) {
  throw new Error("EMAIL_PASS must be defined");
}
if (!process.env.FRONTEND_BASE_URL) {
  throw new Error("FRONTEND_BASE_URL must be defined");
}

const MINUTES_OF_EMAIL_EXPIRATION = 1; // expired magicLinks minutes

const router = express.Router();

// ==========================================
// EMAIL FUNCTION
// ==========================================

const sendMagicLinkEmail = async (email: string, token: string) => {
  // EMAIL CONFIGURATION
  const magicLinkUrl = `${process.env.FRONTEND_BASE_URL}?token=${token}`;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
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

            Click this link to log in: ${magicLinkUrl}

            This link expires in ${MINUTES_OF_EMAIL_EXPIRATION} minutes.

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
//TODO add new Types of Error
// ==========================================
// SIGNUP ENDPOINT
// ==========================================
router.post(
  "/api/users/signup-with-magic-links",
  [body("email").isEmail().withMessage("Valid email is required")],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email } = req.body;

    let user = await User.findOne({ email });

    if (user && user.verified) {
      throw new DuplicateResourceCreation(
        "Account already exists and verified"
      );
    }

    try {
      // Generate magic link token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(
        Date.now() + MINUTES_OF_EMAIL_EXPIRATION * 60 * 1000
      ); // 1 minutes

      if (user) {
        // Update existing unverified user
        user.magicLinkToken = token;
        user.magicLinkExpires = expiresAt;
        user.magicLinkUsed = false;
      } else {
        // Create new user
        user = new User({
          email,
          magicLinkToken: token,
          magicLinkExpires: expiresAt,
          magicLinkUsed: false,
          verified: false,
        });
      }

      await user.save();

      // Send magic link email
      await sendMagicLinkEmail(email, token);

      res.json({
        success: true,
        message: "Verification link sent to your email! Check your inbox.",
        data: {
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Signup error:", error);
      throw new InternalServerError(
        "Failed to create account. Please try again."
      );
    }
  }
);

// ==========================================
// SIGNIN ENDPOINT
// ==========================================

router.post(
  "/api/users/signin-with-magic-links",
  [body("email").isEmail().withMessage("Valid email is required")],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.verified) {
      throw new NotFoundError("No verified account found with this email");
    }

    try {
      // Generate new magic link token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(
        Date.now() + MINUTES_OF_EMAIL_EXPIRATION * 60 * 1000
      ); // 1 minutes

      //  Use Mongoose update syntax
      await User.updateOne(
        { email },
        {
          magicLinkToken: token,
          magicLinkExpires: expiresAt,
          magicLinkUsed: false,
        }
      );

      // Send magic link email
      await sendMagicLinkEmail(email, token);

      res.json({
        success: true,
        message: "Login link sent to your email! Check your inbox.",
        data: {
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      throw new InternalServerError(
        "Failed to send login link. Please try again."
      );
    }
  }
);

// ==========================================
// VERIFICATION ENDPOINT
// ==========================================

router.get(
  "/api/users/verify-magic-links",
  async (req: Request, res: Response) => {
    const { token } = req.query;
    console.log("---------token:", token);
    if (!token || typeof token !== "string") {
      throw new BadRequestError("Verification token is required");
    }

    // Find user with valid token
    const user = await User.findOne({
      magicLinkToken: token,
      magicLinkUsed: false,
      magicLinkExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestError("Invalid or expired verification link");
    }

    try {
      // Mark user as verified and clear magic link -  Direct assignment
      user.verified = true;
      user.magicLinkToken = undefined;
      user.magicLinkExpires = undefined;
      user.magicLinkUsed = true;

      await user.save();

      // Generate JWT token
      const userJwt = jwt.sign(
        {
          id: user.id,
          email: user.email,
          verified: true,
        },
        process.env.JWT_KEY!
      );

      // Store it on session object
      req.session = {
        jwt: userJwt,
      };

      res.status(201).send(user);
    } catch (error) {
      console.error("Verification error:", error);
      throw new InternalServerError("Verification failed. Please try again.");
    }
  }
);

// ==========================================
// RESEND VERIFICATION ENDPOINT
// ==========================================

router.post(
  "/api/users/resend-verification-magic-links",
  [body("email").isEmail().withMessage("Valid email is required")],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new NotFoundError("No account found with this email");
    }

    if (user.verified) {
      throw new BadRequestError("Account is already verified");
    }

    try {
      // Generate new magic link token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(
        Date.now() + MINUTES_OF_EMAIL_EXPIRATION * 60 * 1000
      ); // 1 minutes

      //  Direct assignment instead of set()
      user.magicLinkToken = token;
      user.magicLinkExpires = expiresAt;
      user.magicLinkUsed = false;

      await user.save();

      // Send magic link email
      await sendMagicLinkEmail(email, token);

      res.json({
        success: true,
        message: "New verification link sent to your email!",
        data: {
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Resend verification error:", error);
      throw new InternalServerError(
        "Failed to send verification link. Please try again."
      );
    }
  }
);

// ==========================================
// CLEANUP EXPIRED TOKENS
// ==========================================

const cleanupExpiredTokens = async () => {
  try {
    const result = await User.updateMany(
      {
        magicLinkExpires: { $lt: new Date() },
        magicLinkToken: { $ne: undefined },
      },
      {
        $set: {
          magicLinkToken: undefined,
          magicLinkExpires: undefined,
          magicLinkUsed: false,
        },
      }
    );

    if (result.nModified > 0) {
      console.log(`🧹 Cleaned up ${result.nModified} expired magic links`);
    }
  } catch (error) {
    console.error("Cleanup error:", error);
    throw new InternalServerError("cleanup while Expireing Tokens");
  }
};

// Run cleanup every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

export { router as magicLinkRouter };
