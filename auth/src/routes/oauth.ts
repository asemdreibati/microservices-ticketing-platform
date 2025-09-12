import express, { Request, Response } from "express";
import axios from "axios";
import { User } from "../models/user";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/api/users/github", (req: Request, res: Response) => {
  const redirectUri = "https://ticketing.dev/api/users/github/callback";
  const clientId = process.env.GITHUB_CLIENT_ID;

  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;

  res.redirect(url);
});

router.get(
  "/api/users/github/callback",
  async (req: Request, res: Response) => {
    const code = req.query.code;

    try {
      const tokenRes = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      const accessToken = tokenRes.data.access_token;

      const userRes = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const emailRes = await axios.get("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const email = emailRes.data.find(
        (e: any) => e.primary && e.verified
      )?.email;

      console.log("✅ GitHub user:", {
        name: userRes.data.name,
        email,
      });

      let user = await User.findOne({ email: userRes.data.email });
      if (!user) user = User.build({ email: userRes.data.email });

      user.save();

      // Generate JWT
      const userJwt = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        process.env.JWT_KEY!
      );

      // Store it on session object
      req.session = {
        jwt: userJwt,
      };

      res.status(201).redirect(process.env.OAUTH_VERIFICATION_REDIRECTION!);
    } catch (err) {
      console.error("Github OAuth Error:", err);
      res.send("Github login failed");
    }
  }
);

router.get("/api/users/google", (req: Request, res: Response) => {
  const redirectUri = "https://ticketing.dev/api/users/google/callback";
  const clientId = process.env.GOOGLE_CLIENT_ID;

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile&access_type=offline&prompt=consent`;

  res.redirect(url);
});

router.get(
  "/api/users/google/callback",
  async (req: Request, res: Response) => {
    const code = req.query.code;
    const redirectUri = "https://ticketing.dev/api/users/google/callback";

    try {
      const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      });

      const accessToken = tokenRes.data.access_token;

      const profileRes = await axios.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      console.log("🔗 Google User:", {
        name: profileRes.data.name,
        email: profileRes.data.email,
      });

      let user = await User.findOne({ email: profileRes.data.email });
      if (!user) user = User.build({ email: profileRes.data.email });

      user.save();

      // Generate JWT
      const userJwt = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        process.env.JWT_KEY!
      );

      // Store it on session object
      req.session = {
        jwt: userJwt,
      };

      res.status(201).redirect(process.env.OAUTH_VERIFICATION_REDIRECTION!);
    } catch (err) {
      console.error("Google OAuth Error:", err);
      res.send("Google login failed");
    }
  }
);

export { router as oauthRouter };
