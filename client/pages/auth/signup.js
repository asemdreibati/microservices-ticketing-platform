import { useState } from "react";
import Router from "next/router";
import useRequest from "../../hooks/use-request";
import SocialLoginButtons from "../../components/SocialLoginButtons";
import Link from "next/link";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { doRequest, errors } = useRequest({
    url: "/api/users/signup",
    method: "post",
    body: {
      email,
      password,
    },
    onSuccess: () => Router.push("/"),
  });

  const onSubmit = async (event) => {
    event.preventDefault();

    await doRequest();
  };

  return (
    <>
      <div className="text-center">
        <h1 className="card-title h3">Sign Up</h1>
        <p className="card-text text-muted">
          Sign Up below to access your account
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
          <span className="d-block mb-2 text-dark">
            verify your email using &nbsp;
            <Link href="/auth/signup-ml">magicLinks</Link>
          </span>
        </div>

        <button type="submit" className="btn btn-login text-white">
          Sign Up
        </button>

        <div className="divider">
          <span>or continue with</span>
        </div>

        <div className="social-login">
          <SocialLoginButtons />
        </div>

        <div className="register-link">
          Don You have an account? &nbsp;
          <Link href="/auth/signin">signin now</Link>
        </div>

        {errors}
      </form>
    </>
  );
};
export default SignUp;
