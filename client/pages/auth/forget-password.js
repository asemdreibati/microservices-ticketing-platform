import { useState } from "react";
import Router from "next/router";
import useRequest from "../../hooks/use-request";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [loader, setLoader] = useState(false);
  const { doRequest, errors } = useRequest({
    url: "/api/users/forgot-password",
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
        <h1 className="card-title h3">Forget Password</h1>
        <p className="card-text text-muted">
          Enter Your Email below to send an email to you
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
          <span role="status">Send</span>
          &nbsp;
          {loader && (
            <span
              className="spinner-border spinner-border-sm"
              aria-hidden="true"
            ></span>
          )}
        </button>
      </form>
    </>
  );
};
export default ForgetPassword;
