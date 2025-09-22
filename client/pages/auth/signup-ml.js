import { useState } from "react";
import Router from "next/router";
import useRequest from "../../hooks/use-request";
import Link from "next/link";

const SignUpML = () => {
  const [email, setEmail] = useState("");
  const [loader, setLoader] = useState(false);
  const { doRequest, errors } = useRequest({
    url: "/api/users/signup-with-magic-links",
    method: "post",
    body: {
      email,
    },
    onSuccess: () => Router.push("/auth/email-sent"),
  });

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoader(true);
    try {
      await doRequest();
    } finally {
      setLoader(false);
    }
  };

  return (
    <>
      <div className="text-center">
        <h1 className="card-title h3">Sign Up</h1>
        <p className="card-text text-muted">
          Sign Up with Magic Links below to access your account
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
        {errors}
        <button
          type="submit"
          className="btn btn-login text-white"
          disabled={loader}
        >
          <span role="status">Verify</span>
          &nbsp;
          {loader && (
            <span
              className="spinner-border spinner-border-sm"
              aria-hidden="true"
            ></span>
          )}
        </button>
        <div className="register-link">
          if your email verified previously go to &nbsp;
          <Link href="/auth/signin-ml">signin now</Link>
        </div>
      </form>
    </>
  );
};
export default SignUpML;
