import { useState } from "react";
import Router from "next/router";
import useRequest from "../../hooks/use-request";
import SocialLoginButtons from "../../components/SocialLoginButtons";
import Link from "next/link";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { doRequest, errors } = useRequest({
    url: "/api/users/signin",
    method: "post",
    body: {
      email,
      password,
    },
    onSuccess: (res) => {
      if (res?.requires2FA) {
        localStorage.setItem("tempToken", res.tempToken);
        Router.push("/auth/2fa");
      } else {
        Router.push("/");
      }
    },
  });

  const onSubmit = async (event) => {
    event.preventDefault();

    await doRequest();
  };

  return (
    <>
      <div className="text-center">
        <h1 className="card-title h3">Sign in</h1>
        <p className="card-text text-muted">
          Sign in below to access your account
        </p>
      </div>
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Email address</label>
          <div className="input-group">
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
            />
            <span className="input-group-text">
              <i className="fas fa-envelope"></i>
            </span>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <div className="input-group">
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="input-group-text password-toggle">
              <i className="fas fa-eye"></i>
            </span>
          </div>
        </div>

        <div className="form-check">
          <div>
            <input type="checkbox" className="form-check-input" id="remember" />
            <label className="form-check-label" htmlFor="remember">
              Remember me
            </label>
          </div>
          <a href="#" className="text-decoration-none">
            Forgot password?
          </a>
        </div>

        <span className="d-block mb-2 text-dark">
          if you verified you email account you can signin using &nbsp;
          <Link href="/auth/signin-ml">magicLinks</Link>
        </span>

        <button type="submit" className="btn btn-login text-white">
          Sign In
        </button>

        <div className="divider">
          <span>or continue with</span>
        </div>

        <div className="social-login">
          <SocialLoginButtons />
        </div>

        <div className="register-link">
          Don't have an account? <Link href="/auth/signup">Register now</Link>
        </div>

        {errors}
      </form>
    </>
  );
};
export default SignIn;
