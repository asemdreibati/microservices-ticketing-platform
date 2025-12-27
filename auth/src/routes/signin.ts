import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { validateRequest, BadRequestError } from "@aaticketsaa/common";

import { Password } from "../services/password";
import { User } from "../models/user";
import { signTemp2FAToken } from "./auth2FA.routes";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("You must supply a password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser?.password) {
      throw new BadRequestError(
        "you can access your account using magic links only- enter your credentails (email/password) to access using them"
      );
    }
    if (!existingUser) {
      throw new BadRequestError("User Not Found");
    }

    if (existingUser.password) {
      const passwordsMatch = await Password.compare(
        existingUser.password,
        password
      );
      if (!passwordsMatch) {
        throw new BadRequestError(
          "Invalid Credentials (passwords don't Match)"
        );
      }
    }

    if (existingUser.twoFactorEnabled) {
      const tempToken = signTemp2FAToken(existingUser.id);
      return res.status(200).send({ requires2FA: true, tempToken });
    }

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
        twoFactorEnabled: existingUser.twoFactorEnabled,
        verified: existingUser.verified,
      },
      process.env.JWT_KEY!
    );

    // Store it on session object
    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(existingUser);
  }
);

export { router as signinRouter };
